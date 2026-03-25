"""
No-Show Engine
Computes historical no-show rate and derives:
  - Recommended overbooking buffer
  - Revenue at risk from expected no-shows
"""

from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.reservation import Reservation


def compute_noshow_rate(db: Session, restaurant_id: int, lookback_days: int = 30) -> float:
    """
    Historical no-show rate over the last N days.
    Returns a float between 0.0 and 1.0.
    """
    since = datetime.combine(date.today() - timedelta(days=lookback_days), datetime.min.time())

    total: int = (
        db.query(func.count(Reservation.id))
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.reservation_time >= since,
            Reservation.status.in_(["completed", "no_show"]),
        )
        .scalar()
        or 0
    )

    if total == 0:
        return 0.0

    no_shows: int = (
        db.query(func.count(Reservation.id))
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.reservation_time >= since,
            Reservation.status == "no_show",
        )
        .scalar()
        or 0
    )

    return round(no_shows / total, 3)


def get_noshow_insights(
    db: Session,
    restaurant_id: int,
    total_tables: int,
    avg_spend: int = 500,
    lookback_days: int = 30,
) -> dict:
    """
    Returns no-show rate, recommended overbooking buffer, and revenue at risk.
    """
    rate = compute_noshow_rate(db, restaurant_id, lookback_days)
    recommended_overbooking = max(0, round(rate * total_tables))
    revenue_at_risk = round(rate * total_tables * avg_spend)

    alerts = []
    if rate > 0.25:
        alerts.append("⚠️ High no-show rate — consider overbooking or deposit policy")
    elif rate > 0.10:
        alerts.append("📊 Moderate no-show rate — monitor closely")

    return {
        "noshow_rate": rate,
        "recommended_overbooking": recommended_overbooking,
        "revenue_at_risk": revenue_at_risk,
        "alerts": alerts,
    }
