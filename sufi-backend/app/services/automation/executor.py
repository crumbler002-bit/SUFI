"""
Automation Executor
Translates decision engine insights into concrete actions,
persists them to the DB, and executes side-effects.

Action types:
  NOTIFY_WAITLIST  — notify top waitlist candidates that a slot opened
  OVERBOOK         — log an overbooking recommendation for the owner
  SEND_ALERT       — push an insight alert to the owner dashboard
"""

import json
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.automation_action import AutomationAction
from app.services.waitlist_service import process_waitlist
from app.services.automation.auto_cancel import execute_action_with_fallback


# ── Action builders ───────────────────────────────────────────────────────────

def _make_action(restaurant_id: int, action_type: str, metadata: dict) -> AutomationAction:
    action = AutomationAction(
        restaurant_id=restaurant_id,
        action_type=action_type,
        status="pending",
    )
    action.set_metadata(metadata)
    return action


# ── Executors ─────────────────────────────────────────────────────────────────

def _execute_notify_waitlist(action: AutomationAction, db: Session) -> None:
    assigned = process_waitlist(db, action.restaurant_id)
    action.set_metadata({**action.get_metadata(), "assigned_ids": assigned})


def _execute_overbook(action: AutomationAction, db: Session) -> None:
    print(
        f"[automation] Overbooking recommended for restaurant {action.restaurant_id}: "
        f"+{action.get_metadata().get('recommended_slots', 0)} slots"
    )


def _execute_send_alert(action: AutomationAction, db: Session) -> None:
    print(
        f"[automation] Alert for restaurant {action.restaurant_id}: "
        f"{action.get_metadata().get('message', '')}"
    )


def _execute_auto_cancel(action: AutomationAction, db: Session) -> None:
    """Try reschedule first, fall back to cancel."""
    meta = action.get_metadata()
    result = execute_action_with_fallback(
        {
            "reservation_id": meta["reservation_id"],
            "priority_score": meta.get("priority_score"),
            "priority_label": meta.get("priority_label"),
        },
        db,
    )
    action.set_metadata({**meta, "result": result})


_EXECUTORS = {
    "NOTIFY_WAITLIST": _execute_notify_waitlist,
    "OVERBOOK": _execute_overbook,
    "SEND_ALERT": _execute_send_alert,
    "AUTO_CANCEL": _execute_auto_cancel,
}


# ── Main entry point ──────────────────────────────────────────────────────────

def execute_action(action: AutomationAction, db: Session) -> AutomationAction:
    """Execute a single action and persist the result."""
    executor = _EXECUTORS.get(action.action_type)
    try:
        if executor:
            executor(action, db)
        action.status = "executed"
        action.executed_at = datetime.utcnow()
    except Exception as exc:
        action.status = "failed"
        action.set_metadata({**action.get_metadata(), "error": str(exc)})

    db.add(action)
    db.commit()
    db.refresh(action)
    return action


def run_automation_cycle(db: Session, restaurant_id: int, dashboard: dict) -> list[dict]:
    """
    Inspect a dashboard payload and fire the appropriate actions.
    Called as a FastAPI BackgroundTask after each dashboard fetch.

    Returns list of action summaries.
    """
    actions: list[AutomationAction] = []

    noshow_rate = dashboard.get("metrics", {}).get("noshow_rate", 0)
    waitlist_waiting = dashboard.get("waitlist", {}).get("waiting", 0)
    demand_level = dashboard.get("metrics", {}).get("demand_level", "low")
    recommended_overbooking = dashboard.get("predictions", {}).get("recommended_overbooking", 0)
    insights = dashboard.get("insights", [])

    # 1. High no-show → notify waitlist to fill gaps
    if noshow_rate > 0.15 and waitlist_waiting > 0:
        actions.append(_make_action(restaurant_id, "NOTIFY_WAITLIST", {
            "reason": "high_noshow_rate",
            "noshow_rate": noshow_rate,
            "waitlist_depth": waitlist_waiting,
        }))

    # 2. High demand + overbooking buffer available → log overbook recommendation
    if demand_level == "high" and recommended_overbooking > 0:
        actions.append(_make_action(restaurant_id, "OVERBOOK", {
            "recommended_slots": recommended_overbooking,
            "demand_level": demand_level,
        }))

    # 3. Each insight becomes a persisted alert
    for insight in insights:
        actions.append(_make_action(restaurant_id, "SEND_ALERT", {"message": insight}))

    # Execute all
    results = [execute_action(a, db) for a in actions]

    return [
        {
            "id": a.id,
            "type": a.action_type,
            "status": a.status,
            "metadata": a.get_metadata(),
            "executed_at": a.executed_at.isoformat() if a.executed_at else None,
        }
        for a in results
    ]
