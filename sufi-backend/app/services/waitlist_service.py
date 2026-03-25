"""
Waitlist Engine
Handles adding users to a waitlist when no table is available,
and automatically converting waitlist entries to reservations
when a slot opens (cancellation, expiry, new table added).

Notification stubs are included — wire up Firebase / Twilio / email later.
"""

from datetime import datetime
from sqlalchemy.orm import Session

from app.models.waitlist_entry import WaitlistEntry
from app.models.reservation import Reservation
from app.services.table_optimization_service import find_best_table


# ---------------------------------------------------------------------------
# Add to waitlist
# ---------------------------------------------------------------------------

def add_to_waitlist(
    db: Session,
    user_id,
    restaurant_id: int,
    guests: int,
    requested_time: datetime,
    duration_minutes: int = 90,
) -> WaitlistEntry:
    """
    Add a user to the waitlist for a specific restaurant / time / party size.
    Returns the new WaitlistEntry.
    """
    entry = WaitlistEntry(
        user_id=user_id,
        restaurant_id=restaurant_id,
        guests=guests,
        requested_time=requested_time,
        duration_minutes=duration_minutes,
        status="waiting",
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


# ---------------------------------------------------------------------------
# Process waitlist (called whenever a slot may have opened)
# ---------------------------------------------------------------------------

def process_waitlist(db: Session, restaurant_id: int) -> list[int]:
    """
    Walk the FIFO waitlist for a restaurant and convert any entries that now
    have an available table into confirmed reservations.

    Returns a list of WaitlistEntry IDs that were successfully assigned.
    """
    entries = (
        db.query(WaitlistEntry)
        .filter(
            WaitlistEntry.restaurant_id == restaurant_id,
            WaitlistEntry.status == "waiting",
        )
        .order_by(WaitlistEntry.created_at)
        .all()
    )

    assigned_ids: list[int] = []

    for entry in entries:
        table = find_best_table(
            db,
            restaurant_id=entry.restaurant_id,
            guests=entry.guests,
            reservation_time=entry.requested_time,
            duration_minutes=entry.duration_minutes,
        )

        if table is None:
            # No table available for this entry yet — keep waiting
            continue

        # Create the reservation
        reservation = Reservation(
            restaurant_id=entry.restaurant_id,
            table_id=table.id,
            user_id=entry.user_id,
            reservation_time=entry.requested_time,
            guests=entry.guests,
            status="pending",
        )
        db.add(reservation)

        entry.status = "assigned"
        db.flush()

        assigned_ids.append(entry.id)
        _notify_user(entry.user_id, reservation)

    if assigned_ids:
        db.commit()

    return assigned_ids


# ---------------------------------------------------------------------------
# Notification stub
# ---------------------------------------------------------------------------

def _notify_user(user_id, reservation: Reservation) -> None:
    """
    Stub — replace with Firebase push / Twilio SMS / email service.
    Called after a waitlist entry is converted to a reservation.
    """
    print(
        f"[waitlist] User {user_id} assigned table {reservation.table_id} "
        f"at restaurant {reservation.restaurant_id} "
        f"for {reservation.reservation_time} ({reservation.guests} guests)"
    )


# ---------------------------------------------------------------------------
# Helpers used by routes
# ---------------------------------------------------------------------------

def get_waitlist_for_restaurant(db: Session, restaurant_id: int) -> list[WaitlistEntry]:
    return (
        db.query(WaitlistEntry)
        .filter(
            WaitlistEntry.restaurant_id == restaurant_id,
            WaitlistEntry.status == "waiting",
        )
        .order_by(WaitlistEntry.created_at)
        .all()
    )


def cancel_waitlist_entry(db: Session, entry_id: int, user_id) -> WaitlistEntry:
    entry = db.query(WaitlistEntry).filter(WaitlistEntry.id == entry_id).first()
    if entry is None:
        raise ValueError("Waitlist entry not found")
    if str(entry.user_id) != str(user_id):
        raise PermissionError("Not authorised to cancel this waitlist entry")
    entry.status = "cancelled"
    db.commit()
    db.refresh(entry)
    return entry
