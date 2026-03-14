from datetime import date

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.restaurant_analytics import RestaurantAnalytics
from app.models.reservation import Reservation


def _get_or_create_daily(db: Session, restaurant_id: int, day: date) -> RestaurantAnalytics:
    analytics = (
        db.query(RestaurantAnalytics)
        .filter(
            RestaurantAnalytics.restaurant_id == restaurant_id,
            RestaurantAnalytics.date == day,
        )
        .first()
    )

    if analytics is None:
        analytics = RestaurantAnalytics(restaurant_id=restaurant_id, date=day)
        db.add(analytics)
        db.flush()

    return analytics


def track_profile_view(db: Session, restaurant_id: int) -> None:
    today = date.today()
    analytics = _get_or_create_daily(db, restaurant_id, today)
    analytics.profile_views = (analytics.profile_views or 0) + 1
    db.commit()


def track_search_impression(db: Session, restaurant_ids: list[int]) -> None:
    today = date.today()
    for rid in restaurant_ids:
        analytics = _get_or_create_daily(db, rid, today)
        analytics.search_appearances = (analytics.search_appearances or 0) + 1
    db.commit()


def track_click(db: Session, restaurant_id: int) -> None:
    today = date.today()
    analytics = _get_or_create_daily(db, restaurant_id, today)
    analytics.clicks = (analytics.clicks or 0) + 1
    db.commit()


def track_reservation(db: Session, restaurant_id: int) -> None:
    today = date.today()
    analytics = _get_or_create_daily(db, restaurant_id, today)
    analytics.reservations = (analytics.reservations or 0) + 1
    db.commit()


def calculate_ctr(analytics: RestaurantAnalytics) -> float:
    impressions = analytics.search_appearances or 0
    if impressions == 0:
        return 0.0
    return float((analytics.clicks or 0) / impressions)


def get_popular_hours(db: Session, restaurant_id: int) -> dict[str, int]:
    rows = (
        db.query(func.extract("hour", Reservation.reservation_time).label("hour"), func.count(Reservation.id))
        .filter(Reservation.restaurant_id == restaurant_id)
        .group_by("hour")
        .all()
    )

    result: dict[str, int] = {}
    for hour, count in rows:
        if hour is None:
            continue
        result[str(int(hour))] = int(count)

    return result
