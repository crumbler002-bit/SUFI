"""
Decision Engine — Central Orchestration Layer
Aggregates signals from all intelligence sub-engines and produces
a unified dashboard payload for restaurant owners.

Replaces scattered analytics calls with a single authoritative view:
  demand → noshow → table efficiency → waitlist → insights → predictions
"""

from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.restaurant_table import RestaurantTable
from app.models.reservation import Reservation

from app.services.intelligence.demand_engine import (
    get_demand_snapshot,
    get_hourly_demand,
    get_predicted_hourly_demand,
)
from app.services.intelligence.noshow_engine import get_noshow_insights
from app.services.intelligence.table_optimizer import get_table_efficiency
from app.services.intelligence.waitlist_optimizer import get_waitlist_stats, compute_fill_potential
from app.services.intelligence.priority import build_reservation_priority_list


AVG_SPEND_DEFAULT = 500  # rupees per cover, configurable later


def build_owner_dashboard(
    db: Session,
    restaurant_id: int,
    target_date: date | None = None,
    avg_spend: int = AVG_SPEND_DEFAULT,
) -> dict:
    """
    Main entry point for the intelligence layer.
    Returns a fully computed dashboard payload for a restaurant owner.
    """
    if target_date is None:
        target_date = date.today()

    # ── 1. Table count ────────────────────────────────────────────────────
    total_tables: int = (
        db.query(func.count(RestaurantTable.id))
        .filter(RestaurantTable.restaurant_id == restaurant_id)
        .scalar()
        or 0
    )

    # ── 2. Reservation count (today) ──────────────────────────────────────
    from datetime import datetime, timedelta
    day_start = datetime.combine(target_date, datetime.min.time())
    day_end = day_start + timedelta(days=1)

    total_reservations: int = (
        db.query(func.count(Reservation.id))
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.reservation_time >= day_start,
            Reservation.reservation_time < day_end,
            Reservation.status.notin_(["cancelled"]),
        )
        .scalar()
        or 0
    )

    # ── 3. Sub-engine calls ───────────────────────────────────────────────
    demand = get_demand_snapshot(db, restaurant_id, target_date)
    noshow = get_noshow_insights(db, restaurant_id, total_tables, avg_spend)
    tables = get_table_efficiency(db, restaurant_id, target_date)
    waitlist = get_waitlist_stats(db, restaurant_id)

    # ── 4. Priority rankings ──────────────────────────────────────────────
    priority_list = build_reservation_priority_list(db, restaurant_id)
    at_risk = [r for r in priority_list if r.get("priority_label") == "low"]
    protected = [r for r in priority_list if r.get("priority_label") in ("high", "vip")]

    # ── 5. Predictions ────────────────────────────────────────────────────
    hourly = demand["hourly_demand"]
    predicted_hourly = demand["predicted_hourly_demand"]

    # Revenue projection: sum predicted future covers × avg spend
    predicted_revenue = sum(predicted_hourly.values()) * avg_spend if predicted_hourly else (
        round(total_reservations * 1.2) * avg_spend
    )
    expected_demand = sum(predicted_hourly.values()) if predicted_hourly else round(total_reservations * 1.2)

    waitlist_fill_potential = compute_fill_potential(
        waitlist["waiting"], noshow["noshow_rate"]
    )

    # ── 5. Insights ───────────────────────────────────────────────────────
    insights: list[str] = []
    insights.extend(noshow["alerts"])

    if waitlist["waiting"] > 0:
        insights.append(
            f"💡 {waitlist['waiting']} users on waitlist — "
            f"{waitlist_fill_potential} can likely be filled by no-show slots"
        )

    if demand["demand_level"] == "low":
        insights.append("📉 Low demand today — activate promotions or discounts to drive bookings")
    elif demand["demand_level"] == "high":
        insights.append("🔥 High demand — consider disabling discounts and enabling waitlist")

    if tables["idle_tables"] > 0:
        insights.append(f"🪑 {tables['idle_tables']} idle tables — {tables['suggestion']}")

    if predicted_revenue < 30_000:
        insights.append("📊 Predicted revenue below ₹30,000 — review pricing rules")

    return {
        "date": target_date.isoformat(),
        "metrics": {
            "total_reservations": total_reservations,
            "total_tables": total_tables,
            "noshow_rate": noshow["noshow_rate"],
            "fill_ratio": demand["fill_ratio"],
            "demand_level": demand["demand_level"],
        },
        "analytics": {
            "profile_views": demand["profile_views"],
            "clicks": demand["clicks"],
            "search_appearances": demand["search_appearances"],
        },
        "predictions": {
            "expected_demand": expected_demand,
            "predicted_revenue": predicted_revenue,
            "recommended_overbooking": noshow["recommended_overbooking"],
            "revenue_at_risk": noshow["revenue_at_risk"],
            "waitlist_fill_potential": waitlist_fill_potential,
            "hourly_demand": hourly,
            "predicted_hourly_demand": predicted_hourly,
        },
        "optimization": {
            "efficiency_score": tables["efficiency_score"],
            "active_tables": tables["active_tables"],
            "idle_tables": tables["idle_tables"],
            "avg_utilization_pct": tables["avg_utilization_pct"],
            "best_fit_score": tables["best_fit_score"],
            "table_suggestion": tables["suggestion"],
            "layout_suggestion": tables["layout_suggestion"],
        },
        "waitlist": {
            "waiting": waitlist["waiting"],
            "assigned_today": waitlist["assigned_today"],
            "conversion_rate": waitlist["conversion_rate"],
            "recommended_to_notify": waitlist["recommended_to_notify"],
        },
        "priority": {
            "ranked": [
                {
                    "id": r["id"],
                    "reservation_time": r["reservation_time"].isoformat() if r.get("reservation_time") else None,
                    "guests": r["guests"],
                    "priority_score": r["priority_score"],
                    "priority_label": r["priority_label"],
                    "noshow_probability": r.get("noshow_probability", 0.0),
                    "is_vip": r.get("is_vip", False),
                }
                for r in priority_list
            ],
            "at_risk_count": len(at_risk),
            "protected_count": len(protected),
        },
        "insights": insights,
    }
