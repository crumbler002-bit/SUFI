"""
Reschedule Executor
Applies a RESCHEDULE action to the DB and notifies the user.
Called by the auto-cancel pipeline before falling back to cancellation.
"""

from datetime import datetime
from sqlalchemy.orm import Session

from app.models.reservation import Reservation
from app.services.notification_service import create_notification


def execute_reschedule(action: dict, db: Session) -> dict:
    """
    Apply a RESCHEDULE action.

    action keys:
      reservation_id  int
      old_time        datetime
      new_time        datetime
      new_table_id    int
      alternatives    list[dict]  — passed through for user-facing response

    Returns result dict with status.
    """
    reservation_id = action["reservation_id"]
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()

    if reservation is None:
        return {"reservation_id": reservation_id, "status": "skipped", "reason": "not_found"}

    if reservation.status not in ("pending", "confirmed"):
        return {
            "reservation_id": reservation_id,
            "status": "skipped",
            "reason": f"status={reservation.status}",
        }

    old_time: datetime = action["old_time"]
    new_time: datetime = action["new_time"]

    # Apply the shift
    reservation.reservation_time = new_time
    reservation.table_id = action["new_table_id"]
    db.commit()
    db.refresh(reservation)

    # Notify owner
    old_fmt = old_time.strftime("%b %d, %I:%M %p")
    new_fmt = new_time.strftime("%b %d, %I:%M %p")
    create_notification(
        db,
        restaurant_id=reservation.restaurant_id,
        message=(
            f"Smart shift: reservation #{reservation_id} moved "
            f"from {old_fmt} → {new_fmt} to relieve overcapacity"
        ),
        notif_type="reschedule",
    )

    return {
        "reservation_id": reservation_id,
        "status": "rescheduled",
        "old_time": old_time.isoformat(),
        "new_time": new_time.isoformat(),
        "new_table_id": action["new_table_id"],
        "alternatives": action.get("alternatives", []),
        "user_message": (
            f"Due to high demand, your reservation has been moved from "
            f"{old_fmt} to {new_fmt}. You'll receive priority seating."
        ),
    }
