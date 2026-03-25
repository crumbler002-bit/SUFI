"""
Demand Engine
Computes real-time demand level for a restaurant based on:
  - Reservation fill ratio vs total table capacity
  - Analytics signals: profile views, clicks, search appearances
  - Hourly demand heatmap + forward-looking predictions
"""

from collections import defaultdict
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.reservation import Reservation
from app.models.restaurant_table import RestaurantTable
from app.models.restaurant_analytics import RestaurantAnalytics


# Thresholds
LOW_DEMAND_MAX = 0.35
HIGH_DEMAND_MIN = 0.70
# Trend multiplier for next-hour prediction
DEMAND_TREND_FACTOR = 1.2


def get_demand_level(fill_ratio: float) -> str:
    if fill_ratio >= HIGH_DEMAND_MIN:
        return "high"
    if fill_ratio >= LOW_DEMAND_MAX:
        return "medium"
    return "low"


def compute_fill_ratio(db: Session, restaurant_id: int, target_date: date) -> float:
    """Ratio of reserved seats to total seat capacity for a given date."""
    total_capacity: int = (
        db.query(func.sum(RestaurantTable.capacity))
        .filter(RestaurantTable.restaurant_id == restaurant_id)
        .scalar()
        or 0
    )
    if total_capacity == 0:
        return 0.0

    day_start = datetime.combine(target_date, datetime.min.time())
    day_end = day_start + timedelta(days=1)

    reserved_guests: int = (
        db.query(func.coalesce(func.sum(Reservation.guests), 0))
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.status.notin_(["cancelled"]),
            Reservation.reservation_time >= day_start,
            Reservation.reservation_time < day_end,
        )
        .scalar()
        or 0
    )

    return min(reserved_guests / total_capacity, 1.0)


def get_hourly_demand(db: Session, restaurant_id: int, target_date: date) -> dict[str, int]:
    """
    Returns actual reservation counts bucketed by hour for a given date.
    Keys are hour strings ("11", "12", ..., "22").
    """
    day_start = datetime.combine(target_date, datetime.min.time())
    day_end = day_start + timedelta(days=1)

    rows = (
        db.query(
            extract("hour", Reservation.reservation_time).label("hour"),
            func.count(Reservation.id).label("count"),
        )
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.status.notin_(["cancelled"]),
            Reservation.reservation_time >= day_start,
            Reservation.reservation_time < day_end,
        )
        .group_by("hour")
        .all()
    )

    return {str(int(r.hour)): int(r.count) for r in rows if r.hour is not None}


def get_predicted_hourly_demand(hourly: dict[str, int]) -> dict[str, int]:
    """
    Simple trend projection: multiply each observed hour by DEMAND_TREND_FACTOR.
    Only projects hours that haven't passed yet relative to now.
    """
    current_hour = datetime.now().hour
    return {
        hour: int(count * DEMAND_TREND_FACTOR)
        for hour, count in hourly.items()
        if int(hour) > current_hour
    }


def get_demand_snapshot(db: Session, restaurant_id: int, target_date: date | None = None) -> dict:
    """
    Returns demand level + fill ratio + analytics signals + hourly heatmap.
    """
    if target_date is None:
        target_date = date.today()

    fill_ratio = compute_fill_ratio(db, restaurant_id, target_date)
    demand_level = get_demand_level(fill_ratio)
    hourly = get_hourly_demand(db, restaurant_id, target_date)
    predicted_hourly = get_predicted_hourly_demand(hourly)

    analytics = (
        db.query(RestaurantAnalytics)
        .filter(
            RestaurantAnalytics.restaurant_id == restaurant_id,
            RestaurantAnalytics.date == target_date,
        )
        .first()
    )

    return {
        "fill_ratio": round(fill_ratio, 3),
        "demand_level": demand_level,
        "hourly_demand": hourly,
        "predicted_hourly_demand": predicted_hourly,
        "profile_views": analytics.profile_views if analytics else 0,
        "clicks": analytics.clicks if analytics else 0,
        "search_appearances": analytics.search_appearances if analytics else 0,
        "reservations_today": analytics.reservations if analytics else 0,
    }
