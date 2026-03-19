"""
User Dashboard Routes
Gives customers a full view of their reservations with safe cancel/modify.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.reservation import Reservation
from app.models.restaurant import Restaurant
from app.services.waitlist_service import process_waitlist
from app.services.notification_service import notify_cancellation

router = APIRouter(prefix="/user/dashboard", tags=["user"])

TERMINAL_STATUSES = {"completed", "no_show"}
CANCELLABLE_STATUSES = {"pending", "confirmed"}


def _reservation_to_dict(r: Reservation) -> dict:
    restaurant = r.restaurant
    return {
        "id": r.id,
        "restaurant_id": r.restaurant_id,
        "restaurant_name": restaurant.name if restaurant else None,
        "restaurant_cuisine": restaurant.cuisine if restaurant else None,
        "restaurant_address": restaurant.address if restaurant else None,
        "table_id": r.table_id,
        "reservation_time": r.reservation_time.isoformat() if r.reservation_time else None,
        "guests": r.guests,
        "status": r.status,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "can_cancel": r.status in CANCELLABLE_STATUSES and (
            r.reservation_time is None or r.reservation_time > datetime.utcnow()
        ),
    }


# ── GET /user/dashboard/ ──────────────────────────────────────────────────────

@router.get("/")
def get_user_dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns upcoming and past reservations for the authenticated user.
    Upcoming = future reservations that are not cancelled.
    History  = past or terminal-status reservations.
    """
    reservations = (
        db.query(Reservation)
        .filter(Reservation.user_id == current_user.id)
        .order_by(Reservation.reservation_time.desc())
        .all()
    )

    now = datetime.utcnow()
    upcoming, history = [], []

    for r in reservations:
        data = _reservation_to_dict(r)
        is_future = r.reservation_time and r.reservation_time > now
        is_active = r.status not in ("cancelled", *TERMINAL_STATUSES)

        if is_future and is_active:
            upcoming.append(data)
        else:
            history.append(data)

    return {
        "user_id": str(current_user.id),
        "upcoming": upcoming,
        "history": history,
        "total_upcoming": len(upcoming),
        "total_history": len(history),
    }


# ── DELETE /user/dashboard/reservation/{id} ───────────────────────────────────

@router.delete("/reservation/{reservation_id}")
def cancel_reservation(
    reservation_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Cancel a reservation safely.
    Guards: ownership check, completed/no-show guard, past-time guard.
    Triggers waitlist processing after cancellation.
    """
    reservation = (
        db.query(Reservation).filter(Reservation.id == reservation_id).first()
    )
    if reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if str(reservation.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorised to cancel this reservation")

    if reservation.status in TERMINAL_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel a reservation with status '{reservation.status}'"
        )

    if reservation.status == "cancelled":
        raise HTTPException(status_code=400, detail="Reservation is already cancelled")

    if reservation.reservation_time and reservation.reservation_time <= datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="Cannot cancel a reservation that has already passed"
        )

    restaurant_id = reservation.restaurant_id
    reservation.status = "cancelled"
    db.commit()

    # Notify owner
    notify_cancellation(db, restaurant_id, current_user.name, reservation.guests, reservation.reservation_time)

    # Free slot → process waitlist
    process_waitlist(db, restaurant_id)

    return {
        "status": "cancelled",
        "reservation_id": reservation_id,
        "message": "Reservation cancelled successfully",
    }


# ── PATCH /user/dashboard/reservation/{id}/reschedule ────────────────────────

class RescheduleRequest(BaseModel):
    new_time: datetime
    guests: int | None = None


@router.patch("/reservation/{reservation_id}/reschedule")
def reschedule_reservation(
    reservation_id: int,
    data: RescheduleRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Reschedule a reservation to a new time.
    Validates ownership, status, and that the new time is in the future.
    Does NOT re-run table optimization — keeps the same table.
    For a full re-optimization, cancel + auto-create.
    """
    reservation = (
        db.query(Reservation).filter(Reservation.id == reservation_id).first()
    )
    if reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if str(reservation.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorised to modify this reservation")

    if reservation.status not in CANCELLABLE_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reschedule a reservation with status '{reservation.status}'"
        )

    if data.new_time <= datetime.utcnow():
        raise HTTPException(status_code=400, detail="New time must be in the future")

    reservation.reservation_time = data.new_time
    if data.guests is not None:
        reservation.guests = data.guests

    db.commit()
    db.refresh(reservation)

    return {
        "status": "rescheduled",
        "reservation_id": reservation_id,
        "new_time": reservation.reservation_time.isoformat(),
        "guests": reservation.guests,
    }


# ── GET /user/dashboard/reservation/{id} ─────────────────────────────────────

@router.get("/reservation/{reservation_id}")
def get_reservation_detail(
    reservation_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Single reservation detail with confirmation layer data."""
    reservation = (
        db.query(Reservation).filter(Reservation.id == reservation_id).first()
    )
    if reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if str(reservation.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")

    return _reservation_to_dict(reservation)
