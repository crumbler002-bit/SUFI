"""
Smart Shift Engine — Dynamic Rescheduling

For a given reservation under pressure, searches a ±2h window for the
nearest available slot with a free table that fits the party size.

Flow:
  find_alternative_slots()  →  list of (datetime, table_id) candidates
  choose_best_slot()        →  closest viable option
  build_reschedule_action() →  action dict consumed by reschedule_executor
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.reservation import Reservation
from app.models.restaurant_table import RestaurantTable
from app.services.reservation_service import round_to_timeslot


# Search window offsets in minutes (closest first)
SEARCH_OFFSETS = [-30, 30, -60, 60, -90, 90, -120, 120]

# Restaurant operating hours guard (don't suggest 3 AM slots)
OPEN_HOUR = 10   # 10:00
CLOSE_HOUR = 23  # 23:00


def _is_operating_hour(dt: datetime) -> bool:
    return OPEN_HOUR <= dt.hour < CLOSE_HOUR


def _find_free_table(
    db: Session,
    restaurant_id: int,
    slot_time: datetime,
    guests: int,
    exclude_reservation_id: int,
) -> int | None:
    """
    Returns the id of the smallest available table that fits `guests`
    at `slot_time`, ignoring the reservation being rescheduled.
    """
    tables = (
        db.query(RestaurantTable)
        .filter(
            RestaurantTable.restaurant_id == restaurant_id,
            RestaurantTable.capacity >= guests,
        )
        .order_by(RestaurantTable.capacity.asc())
        .all()
    )

    booked_table_ids = {
        row[0]
        for row in db.query(Reservation.table_id)
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.reservation_time == slot_time,
            Reservation.status.in_(["pending", "confirmed"]),
            Reservation.id != exclude_reservation_id,
            Reservation.table_id.isnot(None),
        )
        .all()
    }

    for table in tables:
        if table.id not in booked_table_ids:
            return table.id

    return None


def find_alternative_slots(
    db: Session,
    restaurant_id: int,
    reservation_time: datetime,
    guests: int,
    exclude_reservation_id: int,
) -> list[dict]:
    """
    Returns up to len(SEARCH_OFFSETS) candidate slots, each with a free table.
    Sorted by absolute time distance from original slot (closest first).
    """
    candidates = []

    for offset in SEARCH_OFFSETS:
        candidate_time = round_to_timeslot(reservation_time + timedelta(minutes=offset))

        if candidate_time <= datetime.utcnow():
            continue
        if not _is_operating_hour(candidate_time):
            continue

        table_id = _find_free_table(
            db, restaurant_id, candidate_time, guests, exclude_reservation_id
        )
        if table_id is not None:
            distance = abs((candidate_time - reservation_time).total_seconds())
            candidates.append({
                "slot_time": candidate_time,
                "table_id": table_id,
                "offset_minutes": offset,
                "distance_seconds": distance,
            })

    # Deduplicate by slot_time (round_to_timeslot may collapse nearby offsets)
    seen: set[datetime] = set()
    unique = []
    for c in sorted(candidates, key=lambda x: x["distance_seconds"]):
        if c["slot_time"] not in seen:
            seen.add(c["slot_time"])
            unique.append(c)

    return unique


def choose_best_slot(candidates: list[dict]) -> dict | None:
    """Closest slot wins. List is already sorted by distance."""
    return candidates[0] if candidates else None


def build_reschedule_action(
    db: Session,
    restaurant_id: int,
    reservation_id: int,
    guests: int,
    reservation_time: datetime,
) -> dict | None:
    """
    High-level entry point: find the best alternative slot for a reservation.
    Returns an action dict or None if no slot is available.
    """
    candidates = find_alternative_slots(
        db, restaurant_id, reservation_time, guests, reservation_id
    )
    best = choose_best_slot(candidates)

    if best is None:
        return None

    return {
        "type": "RESCHEDULE",
        "reservation_id": reservation_id,
        "old_time": reservation_time,
        "new_time": best["slot_time"],
        "new_table_id": best["table_id"],
        "offset_minutes": best["offset_minutes"],
        "alternatives": [
            {
                "slot_time": c["slot_time"].isoformat(),
                "offset_minutes": c["offset_minutes"],
            }
            for c in candidates[:4]   # send top 4 to frontend for [Choose another time]
        ],
    }
