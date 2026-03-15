"""
Table Optimization Engine v1
Assigns the best-fit table for a reservation using:
  - Smallest-fitting table (minimize seat waste)
  - Time-window overlap detection (not just exact slot match)
  - FOR UPDATE row locking to prevent race conditions
  - Utilization scoring to prefer tighter fits
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional

from app.models.reservation import Reservation
from app.models.restaurant_table import RestaurantTable

# Default dining duration in minutes
DEFAULT_DURATION_MINUTES = 90


def round_to_timeslot(dt: datetime, slot_minutes: int = DEFAULT_DURATION_MINUTES) -> datetime:
    """Round a datetime down to the nearest slot boundary."""
    total = dt.hour * 60 + dt.minute
    floored = (total // slot_minutes) * slot_minutes
    return dt.replace(hour=floored // 60, minute=floored % 60, second=0, microsecond=0)


def _utilization_score(guests: int, capacity: int) -> float:
    """
    Score how well a table fits the party (higher = better fit).
    A table of exactly the right size scores 1.0; larger tables score lower.
    """
    return guests / capacity


def find_best_table(
    db: Session,
    restaurant_id: int,
    guests: int,
    reservation_time: datetime,
    duration_minutes: int = DEFAULT_DURATION_MINUTES,
) -> Optional[RestaurantTable]:
    """
    Find the optimal table for a reservation using:
      1. Capacity filter  (capacity >= guests)
      2. Time-window overlap check  (no existing booking overlaps the window)
      3. FOR UPDATE lock  (prevents concurrent double-booking)
      4. Best-fit selection  (smallest table first, then highest utilization)

    Returns the best RestaurantTable or None if nothing is available.
    """
    slot_start = round_to_timeslot(reservation_time)
    slot_end = slot_start + timedelta(minutes=duration_minutes)

    # Pull candidate tables with sufficient capacity that have no overlapping
    # reservations, using a row-level lock to prevent concurrent conflicts.
    rows = db.execute(
        text("""
            SELECT rt.id, rt.table_number, rt.capacity
            FROM restaurant_tables rt
            WHERE rt.restaurant_id = :restaurant_id
              AND rt.capacity >= :guests
              AND rt.id NOT IN (
                  SELECT r.table_id
                  FROM reservations r
                  WHERE r.restaurant_id = :restaurant_id
                    AND r.table_id IS NOT NULL
                    AND r.status NOT IN ('cancelled')
                    AND r.reservation_time < :slot_end
                    AND (r.reservation_time + INTERVAL '1 minute' * :duration) > :slot_start
              )
            ORDER BY rt.capacity ASC
            FOR UPDATE OF rt SKIP LOCKED
        """),
        {
            "restaurant_id": restaurant_id,
            "guests": guests,
            "slot_start": slot_start,
            "slot_end": slot_end,
            "duration": duration_minutes,
        },
    ).fetchall()

    if not rows:
        return None

    # Among candidates, pick the one with the highest utilization score
    # (i.e. the tightest fit for the party size).
    best_row = max(rows, key=lambda r: _utilization_score(guests, r.capacity))

    return db.query(RestaurantTable).filter(RestaurantTable.id == best_row.id).first()


def auto_assign_and_create(
    db: Session,
    restaurant_id: int,
    user_id,
    reservation_time: datetime,
    guests: int,
    duration_minutes: int = DEFAULT_DURATION_MINUTES,
    special_requests: Optional[str] = None,
) -> Reservation:
    """
    Full optimized reservation creation:
      1. Find best-fit table (with locking)
      2. Create and persist the reservation
      3. Raise ValueError if no table is available

    Callers are responsible for committing the session after any
    post-creation side-effects (payments, analytics, etc.).
    """
    slot_time = round_to_timeslot(reservation_time)

    table = find_best_table(db, restaurant_id, guests, slot_time, duration_minutes)
    if table is None:
        raise ValueError(
            f"No available tables for {guests} guests at "
            f"{slot_time.strftime('%Y-%m-%d %H:%M')}"
        )

    reservation = Reservation(
        restaurant_id=restaurant_id,
        table_id=table.id,
        user_id=user_id,
        reservation_time=slot_time,
        guests=guests,
        status="pending",
    )

    db.add(reservation)
    db.flush()  # get reservation.id without committing yet
    return reservation


def get_table_utilization_report(
    db: Session,
    restaurant_id: int,
    from_time: datetime,
    to_time: datetime,
) -> list[dict]:
    """
    Returns per-table utilization stats for a given time window.
    Useful for owner analytics on seating efficiency.
    """
    rows = db.execute(
        text("""
            SELECT
                rt.id            AS table_id,
                rt.table_number,
                rt.capacity,
                COUNT(r.id)      AS total_reservations,
                COALESCE(SUM(r.guests), 0) AS total_guests_seated,
                ROUND(
                    COALESCE(SUM(r.guests), 0)::numeric /
                    NULLIF(COUNT(r.id) * rt.capacity, 0) * 100,
                    1
                )                AS avg_utilization_pct
            FROM restaurant_tables rt
            LEFT JOIN reservations r
                ON r.table_id = rt.id
               AND r.status NOT IN ('cancelled')
               AND r.reservation_time >= :from_time
               AND r.reservation_time < :to_time
            WHERE rt.restaurant_id = :restaurant_id
            GROUP BY rt.id, rt.table_number, rt.capacity
            ORDER BY rt.capacity ASC
        """),
        {
            "restaurant_id": restaurant_id,
            "from_time": from_time,
            "to_time": to_time,
        },
    ).fetchall()

    return [
        {
            "table_id": r.table_id,
            "table_number": r.table_number,
            "capacity": r.capacity,
            "total_reservations": r.total_reservations,
            "total_guests_seated": r.total_guests_seated,
            "avg_utilization_pct": float(r.avg_utilization_pct or 0),
        }
        for r in rows
    ]
