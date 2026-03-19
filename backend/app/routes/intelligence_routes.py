"""
Intelligence Routes — Decision Engine API
Exposes the owner dashboard v2 powered by the intelligence layer.
"""

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.restaurant import Restaurant
from app.models.automation_action import AutomationAction
from app.services.intelligence.decision_engine import build_owner_dashboard
from app.services.intelligence.demand_engine import get_demand_snapshot
from app.services.intelligence.noshow_engine import get_noshow_insights
from app.services.intelligence.table_optimizer import get_table_efficiency
from app.services.intelligence.waitlist_optimizer import get_waitlist_stats
from app.services.ml.training_pipeline import train_and_save, predict_noshow, train_demand_and_save, train_all_models
from app.services.ml.demand_model import predict_demand_ml, forecast_demand_smart
from app.services.ml.revenue_optimizer import expected_revenue, optimal_overbooking
from app.services.automation.executor import run_automation_cycle
from app.services.intelligence.priority import build_reservation_priority_list
from app.services.intelligence.rescheduler import build_reschedule_action

router = APIRouter(prefix="/owner/intelligence", tags=["intelligence"])

from app.redis_client import redis_client as _cache

# ── Legacy automation stubs (called by frontend automation panel) ─────────────

_automation_router = APIRouter(tags=["automation"])

@_automation_router.get("/automation/planned")
def get_planned_actions(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns planned automation actions for the owner's restaurant."""
    from app.models.restaurant import Restaurant
    restaurant = db.query(Restaurant).filter(Restaurant.owner_id == current_user.id).first()
    if not restaurant:
        return []
    actions = (
        db.query(AutomationAction)
        .filter(AutomationAction.restaurant_id == restaurant.id, AutomationAction.status == "pending")
        .order_by(AutomationAction.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {"id": a.id, "type": a.action_type, "status": a.status,
         "metadata": a.get_metadata(), "created_at": a.created_at.isoformat()}
        for a in actions
    ]

@_automation_router.post("/automation/approve")
def approve_automation(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Approve all pending automation actions."""
    from app.models.restaurant import Restaurant
    restaurant = db.query(Restaurant).filter(Restaurant.owner_id == current_user.id).first()
    if not restaurant:
        return {"status": "ok", "approved": 0}
    updated = (
        db.query(AutomationAction)
        .filter(AutomationAction.restaurant_id == restaurant.id, AutomationAction.status == "pending")
        .update({"status": "approved"})
    )
    db.commit()
    return {"status": "ok", "approved": updated}

@_automation_router.post("/automation/apply")
def apply_automation(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Apply all approved automation actions."""
    from app.models.restaurant import Restaurant
    restaurant = db.query(Restaurant).filter(Restaurant.owner_id == current_user.id).first()
    if not restaurant:
        return {"status": "ok", "applied": 0}
    updated = (
        db.query(AutomationAction)
        .filter(AutomationAction.restaurant_id == restaurant.id, AutomationAction.status == "approved")
        .update({"status": "executed"})
    )
    db.commit()
    # Invalidate dashboard cache — automation changed state
    from app.redis_client import redis_client as _cache
    _cache.delete(f"dashboard:{restaurant.id}:today:500")
    _cache.delete(f"full:{restaurant.id}:500")
    return {"status": "ok", "applied": updated}

@_automation_router.get("/automation/status")
def get_automation_status():
    return {"auto_overbooking": True, "auto_reschedule": True, "auto_cancel": False}

@_automation_router.get("/automation/active")
def get_active_automations():
    return []


def _get_owned_restaurant(restaurant_id: int, current_user, db: Session) -> Restaurant:
    """Verify the restaurant belongs to the authenticated owner."""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if str(restaurant.owner_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Restaurant not found or access denied")
    return restaurant


@router.get("/dashboard/{restaurant_id}")
def get_intelligence_dashboard(
    restaurant_id: int,
    target_date: Optional[date] = Query(default=None, description="ISO date, defaults to today"),
    avg_spend: int = Query(default=500, description="Average spend per cover in ₹"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Full intelligence dashboard — cached 60s in Redis."""
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    _get_owned_restaurant(restaurant_id, current_user, db)

    cache_key = f"dashboard:{restaurant_id}:{target_date or 'today'}:{avg_spend}"
    cached = _cache.get(cache_key)
    if cached:
        background_tasks.add_task(run_automation_cycle, db, restaurant_id, cached)
        return cached

    dashboard = build_owner_dashboard(db, restaurant_id, target_date, avg_spend)
    _cache.set(cache_key, dashboard, expire_seconds=60)
    background_tasks.add_task(run_automation_cycle, db, restaurant_id, dashboard)
    return dashboard


@router.get("/full/{restaurant_id}")
def get_full_dashboard(
    restaurant_id: int,
    avg_spend: int = Query(default=500),
    sections: str = Query(default="", description="Comma-separated sections: metrics,predictions,optimization,waitlist,priority,insights,analytics"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Single endpoint replacing /dashboard + /demand + /noshow + /tables + /waitlist.
    5 requests → 1. Cached in Redis for 60s — cold ~300ms, warm ~10ms.
    Optional ?sections=metrics,predictions to get partial payload.
    """
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    _get_owned_restaurant(restaurant_id, current_user, db)

    requested = {s.strip() for s in sections.split(",") if s.strip()} if sections else set()

    cache_key = f"full:{restaurant_id}:{avg_spend}"
    cached = _cache.get(cache_key)
    if cached:
        background_tasks.add_task(run_automation_cycle, db, restaurant_id, cached)
        if requested:
            return {k: v for k, v in cached.items() if k in requested or k == "date"}
        return cached

    today = date.today()
    dashboard = build_owner_dashboard(db, restaurant_id, today, avg_spend)
    _cache.set(cache_key, dashboard, expire_seconds=60)
    background_tasks.add_task(run_automation_cycle, db, restaurant_id, dashboard)

    if requested:
        return {k: v for k, v in dashboard.items() if k in requested or k == "date"}
    return dashboard


@router.get("/demand/{restaurant_id}")
def get_demand(
    restaurant_id: int,
    target_date: Optional[date] = Query(default=None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Demand snapshot — fill ratio, demand level, analytics signals."""
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    _get_owned_restaurant(restaurant_id, current_user, db)
    return get_demand_snapshot(db, restaurant_id, target_date)


@router.get("/noshow/{restaurant_id}")
def get_noshow(
    restaurant_id: int,
    lookback_days: int = Query(default=30),
    avg_spend: int = Query(default=500),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """No-show rate, overbooking recommendation, revenue at risk."""
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    _get_owned_restaurant(restaurant_id, current_user, db)

    from sqlalchemy import func
    from app.models.restaurant_table import RestaurantTable

    total_tables: int = (
        db.query(func.count(RestaurantTable.id))
        .filter(RestaurantTable.restaurant_id == restaurant_id)
        .scalar()
        or 0
    )
    return get_noshow_insights(db, restaurant_id, total_tables, avg_spend, lookback_days)


@router.get("/tables/{restaurant_id}")
def get_table_optimization(
    restaurant_id: int,
    target_date: Optional[date] = Query(default=None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Table efficiency score, idle tables, and optimization suggestion."""
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    _get_owned_restaurant(restaurant_id, current_user, db)
    return get_table_efficiency(db, restaurant_id, target_date)


@router.get("/waitlist/{restaurant_id}")
def get_waitlist_intelligence(
    restaurant_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Waitlist depth, conversion rate, and fill potential."""
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    _get_owned_restaurant(restaurant_id, current_user, db)
    return get_waitlist_stats(db, restaurant_id)


# ── ML endpoints ──────────────────────────────────────────────────────────────

@router.post("/ml/train/{restaurant_id}")
def train_noshow_model(
    restaurant_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Train (or retrain) the no-show prediction model for a restaurant.
    Uses all historical completed/no-show reservations from DB.
    Saves model to disk — subsequent predictions load from disk, not DB.
    """
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    _get_owned_restaurant(restaurant_id, current_user, db)

    try:
        summary = train_and_save(db, restaurant_id)
        return {"status": "trained", **summary}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/ml/predict/{restaurant_id}")
def predict_reservation_noshow(
    restaurant_id: int,
    hour: int = Query(..., ge=0, le=23),
    day_of_week: int = Query(..., ge=0, le=6),
    party_size: int = Query(..., ge=1),
    lead_time_hrs: float = Query(default=24.0),
    user_noshow_history: float = Query(default=0.0, ge=0.0, le=1.0),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Predict P(no-show) for a single reservation using the trained ML model.
    Returns 0.0 if no model has been trained yet for this restaurant.
    """
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    _get_owned_restaurant(restaurant_id, current_user, db)

    prob = predict_noshow(restaurant_id, {
        "hour": hour,
        "day_of_week": day_of_week,
        "party_size": party_size,
        "lead_time_hrs": lead_time_hrs,
        "user_noshow_history": user_noshow_history,
    })

    return {
        "restaurant_id": restaurant_id,
        "noshow_probability": round(prob, 4),
        "risk_level": "high" if prob > 0.5 else "medium" if prob > 0.25 else "low",
    }


@router.post("/ml/train-demand/{restaurant_id}")
def train_demand_model_endpoint(
    restaurant_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Train (or retrain) the demand forecasting model for a restaurant.
    Uses 90 days of historical reservation data from DB.
    """
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    _get_owned_restaurant(restaurant_id, current_user, db)

    try:
        summary = train_demand_and_save(db, restaurant_id)
        return {"status": "trained", **summary}
    except (ValueError, ImportError) as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/ml/train-all/{restaurant_id}")
def train_all_models_endpoint(
    restaurant_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Train both no-show and demand models in one call.
    Skips a model gracefully if not enough data.
    """
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    _get_owned_restaurant(restaurant_id, current_user, db)
    return train_all_models(db, restaurant_id)


@router.get("/ml/recommend/{restaurant_id}")
def get_ml_recommendation(
    restaurant_id: int,
    hour: int = Query(..., ge=0, le=23, description="Hour of the reservation slot"),
    day_of_week: int = Query(..., ge=0, le=6, description="0=Mon, 6=Sun"),
    party_size: int = Query(..., ge=1),
    lead_time_hrs: float = Query(default=24.0),
    user_noshow_history: float = Query(default=0.0, ge=0.0, le=1.0),
    avg_spend: int = Query(default=500, description="Average spend per cover in ₹"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Unified ML recommendation endpoint — the core decision engine.

    Combines:
      1. No-show probability (LogisticRegression)
      2. Demand forecast (RandomForest, falls back to moving average)
      3. Revenue optimizer (expected revenue + overbooking)

    Returns: action (overbook / promote / normal), confidence, explanation,
             and full ML signal breakdown.
    """
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    restaurant = _get_owned_restaurant(restaurant_id, current_user, db)

    # ── Redis cache (5 min) ───────────────────────────────────────────────
    ml_cache_key = f"ml:recommend:{restaurant_id}:{hour}:{day_of_week}:{party_size}:{avg_spend}"
    cached_ml = _cache.get(ml_cache_key)
    if cached_ml:
        return cached_ml

    # ── 1. No-show probability ────────────────────────────────────────────
    noshow_prob = predict_noshow(restaurant_id, {
        "hour": hour,
        "day_of_week": day_of_week,
        "party_size": party_size,
        "lead_time_hrs": lead_time_hrs,
        "user_noshow_history": user_noshow_history,
    })

    # ── 2. Demand forecast ────────────────────────────────────────────────
    # Try ML model first, fall back to moving average
    demand_ml = predict_demand_ml(restaurant_id, hour, day_of_week)
    demand_source = "ml_model"
    if demand_ml is None:
        hourly_forecast = forecast_demand_smart(db, restaurant_id)
        demand_ml = hourly_forecast.get(str(hour), 0.0)
        demand_source = "moving_average"

    # ── 3. Revenue optimizer ──────────────────────────────────────────────
    from sqlalchemy import func
    from app.models.restaurant_table import RestaurantTable

    total_capacity: int = (
        db.query(func.sum(RestaurantTable.capacity))
        .filter(RestaurantTable.restaurant_id == restaurant_id)
        .scalar()
        or 20  # safe default
    )

    rev_data = expected_revenue(
        demand_per_hour={str(hour): demand_ml},
        noshow_probs={str(hour): noshow_prob},
        avg_spend=avg_spend,
    )
    overbook_count = optimal_overbooking(total_capacity, noshow_prob)

    # ── 4. Decision logic ─────────────────────────────────────────────────
    if demand_ml > 15 and noshow_prob > 0.3:
        action = "overbook"
        confidence = "high"
        explanation = (
            f"High demand ({demand_ml:.1f} expected bookings) combined with "
            f"{noshow_prob * 100:.0f}% no-show probability — "
            f"accept up to {overbook_count} extra reservations to protect revenue."
        )
    elif demand_ml < 8:
        action = "promote"
        confidence = "medium"
        explanation = (
            f"Low demand forecast ({demand_ml:.1f} bookings) for this slot — "
            "activate promotions or discounts to drive bookings."
        )
    elif noshow_prob > 0.4:
        action = "overbook"
        confidence = "medium"
        explanation = (
            f"No-show risk is elevated at {noshow_prob * 100:.0f}% — "
            f"consider accepting {overbook_count} buffer reservations."
        )
    else:
        action = "normal"
        confidence = "low"
        explanation = (
            f"Demand ({demand_ml:.1f}) and no-show risk ({noshow_prob * 100:.0f}%) "
            "are within normal range — no special action needed."
        )

    result = {
        "restaurant_id": restaurant_id,
        "slot": {"hour": hour, "day_of_week": day_of_week},
        "action": action,
        "confidence": confidence,
        "explanation": explanation,
        "signals": {
            "noshow_probability": round(noshow_prob, 4),
            "noshow_risk": "high" if noshow_prob > 0.5 else "medium" if noshow_prob > 0.25 else "low",
            "predicted_demand": round(demand_ml, 2),
            "demand_source": demand_source,
            "recommended_overbooking": overbook_count,
            "expected_revenue": rev_data["total_expected_revenue"],
            "effective_covers": rev_data["total_effective_covers"],
        },
    }
    _cache.set(ml_cache_key, result, expire_seconds=300)
    return result


# ── Automation endpoints ──────────────────────────────────────────────────────

@router.post("/automation/run/{restaurant_id}")
def trigger_automation(
    restaurant_id: int,
    background_tasks: BackgroundTasks,
    avg_spend: int = Query(default=500),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Manually trigger the automation cycle for a restaurant.
    Runs in background — returns immediately.
    """
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    _get_owned_restaurant(restaurant_id, current_user, db)
    dashboard = build_owner_dashboard(db, restaurant_id, avg_spend=avg_spend)
    background_tasks.add_task(run_automation_cycle, db, restaurant_id, dashboard)

    return {"status": "automation_started", "restaurant_id": restaurant_id}


@router.get("/priority/{restaurant_id}")
def get_reservation_priority(
    restaurant_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns today's reservations ranked by priority score (lowest first).
    Low-priority reservations are auto-cancel candidates.
    High/VIP reservations are protected.
    """
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    _get_owned_restaurant(restaurant_id, current_user, db)
    ranked = build_reservation_priority_list(db, restaurant_id)

    return {
        "restaurant_id": restaurant_id,
        "total": len(ranked),
        "at_risk": [r for r in ranked if r.get("priority_label") == "low"],
        "medium": [r for r in ranked if r.get("priority_label") == "medium"],
        "protected": [r for r in ranked if r.get("priority_label") in ("high", "vip")],
        "ranked": ranked,
    }


@router.get("/reschedule-preview/{restaurant_id}")
def get_reschedule_preview(
    restaurant_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    For each low-priority reservation today, shows what the Smart Shift Engine
    would do: reschedule (with new slot options) or cancel (no slot found).
    Owners can review this before automation fires.
    """
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    _get_owned_restaurant(restaurant_id, current_user, db)

    ranked = build_reservation_priority_list(db, restaurant_id)
    at_risk = [r for r in ranked if r.get("priority_label") == "low"]

    preview = []
    rescheduled_count = 0
    cancel_count = 0

    for r in at_risk:
        action = build_reschedule_action(
            db=db,
            restaurant_id=restaurant_id,
            reservation_id=r["id"],
            guests=r.get("guests", 2),
            reservation_time=r["reservation_time"],
        )
        if action:
            rescheduled_count += 1
            preview.append({
                "reservation_id": r["id"],
                "outcome": "reschedule",
                "priority_score": r["priority_score"],
                "old_time": r["reservation_time"].isoformat() if r.get("reservation_time") else None,
                "new_time": action["new_time"].isoformat(),
                "offset_minutes": action["offset_minutes"],
                "alternatives": action["alternatives"],
            })
        else:
            cancel_count += 1
            preview.append({
                "reservation_id": r["id"],
                "outcome": "cancel",
                "priority_score": r["priority_score"],
                "slot_time": r["reservation_time"].isoformat() if r.get("reservation_time") else None,
                "reason": "No alternative slot available in ±2h window",
            })

    return {
        "restaurant_id": restaurant_id,
        "at_risk_total": len(at_risk),
        "would_reschedule": rescheduled_count,
        "would_cancel": cancel_count,
        "cancellations_avoided": rescheduled_count,
        "preview": preview,
    }


@router.get("/automation/history/{restaurant_id}")
def get_automation_history(
    restaurant_id: int,
    limit: int = Query(default=50, le=200),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns the last N automation actions executed for a restaurant.
    Gives owners full visibility into what SUFI did automatically.
    """
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    _get_owned_restaurant(restaurant_id, current_user, db)

    actions = (
        db.query(AutomationAction)
        .filter(AutomationAction.restaurant_id == restaurant_id)
        .order_by(AutomationAction.created_at.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "id": a.id,
            "type": a.action_type,
            "status": a.status,
            "metadata": a.get_metadata(),
            "created_at": a.created_at.isoformat(),
            "executed_at": a.executed_at.isoformat() if a.executed_at else None,
        }
        for a in actions
    ]
