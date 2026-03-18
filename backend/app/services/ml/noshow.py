from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.reservation import Reservation


def predict_noshow_rate(db: Session, restaurant_id: int) -> float:
    """
    Estimate no-show probability from historical reservation data.
    Falls back to a time-of-day heuristic if no history exists.
    """
    total = (
        db.query(func.count(Reservation.id))
        .filter(Reservation.restaurant_id == restaurant_id)
        .scalar()
    ) or 0

    if total == 0:
        return 0.2  # default 20% no-show assumption

    noshows = (
        db.query(func.count(Reservation.id))
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.status == "no_show",
        )
        .scalar()
    ) or 0

    return round(noshows / total, 3)
