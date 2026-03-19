"""
Auto-Cancellation Engine
Priority: reschedule → cancel (last resort only).

Flow for each low-priority reservation under overload:
  1. Try Smart Shift Engine (rescheduler) — find a nearby free slot
  2. If found  → execute_reschedule()
  3. If not    → execute_auto_cancel()

Safety guards are enforced at both evaluation and execution time.
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.reservation import Reservation
from app.services.notification_service import notify_auto_cancel
from app.services.intelligence.priority import rank_reservations
from app.services.intelligence.rescheduler import build_reschedule_action
from app.services.automation.reschedule_executor import execute_reschedule


# Safety constants
OCCUPANCY_THRESHOLD = 0.95
MIN_MINUTES_BEFORE_SLOT = 60
MAX_NOSHOW_RATE = 0.30
MAX_ACTIONS = 2             # cap total reschedules + cancels per cycle


def evaluate_auto_cancellation(
    reservations: list[dict],
    occupancy: float,
    waitlist_fillable: int,
    noshow_probs: list[float],
    threshold: float = OCCUPANCY_THRESHOLD,
) -> list[dict]:
    """
    Returns action dicts (type RESCHEDULE or AUTO_CANCEL) for low-priority
    reservations when ALL safety conditions are met.
    """
    actions = []

    if occupancy < threshold:
        return actions
    if waitlist_fillable > 0:
        return actions

    avg_noshow = sum(noshow_probs) / len(noshow_probs) if noshow_probs else 0.0
    if avg_noshow > MAX_NOSHOW_RATE:
        return actions

    now = datetime.utcnow()
    eligible = [
        r for r in reservations
        if not r.get("is_vip", False)
        and r.get("reservation_time")
        and (r["reservation_time"] - now) > timedelta(minutes=MIN_MINUTES_BEFORE_SLOT)
    ]

    if not eligible:
        return actions

    ranked = rank_reservations(eligible)

    for r in ranked[:MAX_ACTIONS]:
        actions.append({
            "type": "EVALUATE",          # resolved to RESCHEDULE or AUTO_CANCEL at execution
            "reservation_id": r["id"],
            "priority_score": r.get("priority_score", 0),
            "priority_label": r.get("priority_label", "low"),
            "reason": "Overcapacity — no optimization possible",
        })

    return actions


def execute_auto_cancel(action: dict, db: Session) -> dict:
    """Last-resort cancellation with safety re-checks."""
    reservation_id = action["reservation_id"]
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()

    if reservation is None:
        return {"reservation_id": reservation_id, "status": "skipped", "reason": "not_found"}

    if reservation.status != "confirmed":
        return {"reservation_id": reservation_id, "status": "skipped", "reason": f"status={reservation.status}"}

    if reservation.reservation_time:
        minutes_until = (reservation.reservation_time - datetime.utcnow()).total_seconds() / 60
        if minutes_until < MIN_MINUTES_BEFORE_SLOT:
            return {"reservation_id": reservation_id, "status": "skipped", "reason": "too_close_to_slot"}

    reservation.status = "cancelled_by_system"
    db.commit()

    notify_auto_cancel(db, reservation.restaurant_id, reservation_id)

    return {
        "reservation_id": reservation_id,
        "status": "cancelled",
        "restaurant_id": reservation.restaurant_id,
        "priority_score": action.get("priority_score"),
        "priority_label": action.get("priority_label"),
    }


def execute_action_with_fallback(action: dict, db: Session) -> dict:
    """
    Try to reschedule first. Only cancel if no alternative slot exists.
    This is the main execution entry point for the automation cycle.
    """
    reservation_id = action["reservation_id"]
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()

    if reservation is None:
        return {"reservation_id": reservation_id, "status": "skipped", "reason": "not_found"}

    # Attempt smart shift
    reschedule_action = build_reschedule_action(
        db=db,
        restaurant_id=reservation.restaurant_id,
        reservation_id=reservation_id,
        guests=reservation.guests or 2,
        reservation_time=reservation.reservation_time,
    )

    if reschedule_action:
        result = execute_reschedule(reschedule_action, db)
        result["fallback_used"] = False
        return result

    # No slot found — fall back to cancellation
    result = execute_auto_cancel(action, db)
    result["fallback_used"] = True
    return result
