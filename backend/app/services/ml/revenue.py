from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.reservation import Reservation
from app.models.restaurant_table import RestaurantTable


def predict_revenue(
    db: Session,
    restaurant_id: int,
    avg_spend_per_guest: float = 500.0,
) -> float:
    """
    Predict today's revenue based on confirmed reservations and avg spend.
    avg_spend_per_guest defaults to 500 (currency units).
    """
    total_guests = (
        db.query(func.coalesce(func.sum(Reservation.guests), 0))
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.status.in_(["confirmed", "pending"]),
        )
        .scalar()
    ) or 0

    return round(float(total_guests) * avg_spend_per_guest, 2)


def get_occupancy_rate(db: Session, restaurant_id: int) -> float:
    """
    Current occupancy: confirmed reservations / total table capacity.
    """
    total_capacity = (
        db.query(func.sum(RestaurantTable.capacity))
        .filter(RestaurantTable.restaurant_id == restaurant_id)
        .scalar()
    ) or 0

    if total_capacity == 0:
        return 0.0

    booked_guests = (
        db.query(func.coalesce(func.sum(Reservation.guests), 0))
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.status.in_(["confirmed", "pending"]),
        )
        .scalar()
    ) or 0

    return round(min(float(booked_guests) / float(total_capacity), 1.0), 3)
