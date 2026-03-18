from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.reservation import Reservation
from app.models.restaurant_table import RestaurantTable


def predict_demand(db: Session, restaurant_id: int, dt: datetime) -> float:
    """
    Compute demand ratio for a restaurant at a given datetime.
    Returns a float 0.0–1.0 based on reservation fill vs capacity.
    Falls back to weekday heuristic if no data exists.
    """
    total_capacity = (
        db.query(func.sum(RestaurantTable.capacity))
        .filter(RestaurantTable.restaurant_id == restaurant_id)
        .scalar()
    ) or 0

    if total_capacity == 0:
        # heuristic fallback: weekends are busier
        return 0.75 if dt.weekday() >= 5 else 0.45

    window_start = dt.replace(minute=0, second=0, microsecond=0)
    window_end = dt.replace(minute=59, second=59, microsecond=0)

    booked = (
        db.query(func.count(Reservation.id))
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.reservation_time >= window_start,
            Reservation.reservation_time <= window_end,
            Reservation.status != "cancelled",
        )
        .scalar()
    ) or 0

    return min(booked / total_capacity, 1.0)


def demand_label(ratio: float) -> str:
    if ratio < 0.3:
        return "low"
    if ratio < 0.7:
        return "medium"
    return "high"
