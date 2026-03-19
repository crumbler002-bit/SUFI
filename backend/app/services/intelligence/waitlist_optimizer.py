"""
Waitlist Optimizer (Intelligence Layer)
Computes waitlist fill potential and conversion probability.
Prioritizes waitlist entries by party size to maximize table utilization
(smaller parties fill gaps left by no-shows more efficiently).
"""

from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.waitlist_entry import WaitlistEntry


def get_waitlist_stats(db: Session, restaurant_id: int) -> dict:
    """
    Returns current waitlist depth, conversion rate, and
    prioritized list of entries to notify when a slot opens.
    """
    waiting_entries = (
        db.query(WaitlistEntry)
        .filter(
            WaitlistEntry.restaurant_id == restaurant_id,
            WaitlistEntry.status == "waiting",
        )
        .order_by(WaitlistEntry.created_at)
        .all()
    )

    assigned_count: int = (
        db.query(func.count(WaitlistEntry.id))
        .filter(
            WaitlistEntry.restaurant_id == restaurant_id,
            WaitlistEntry.status == "assigned",
        )
        .scalar()
        or 0
    )

    waiting_count = len(waiting_entries)
    total_processed = waiting_count + assigned_count
    conversion_rate = round(assigned_count / total_processed, 3) if total_processed > 0 else 0.0

    # Prioritize: smallest party first (fills gaps most efficiently), FIFO within same size
    prioritized = sorted(waiting_entries, key=lambda e: (e.guests, e.created_at))
    recommended_to_notify = [
        {
            "waitlist_id": e.id,
            "user_id": str(e.user_id),
            "guests": e.guests,
            "requested_time": e.requested_time.isoformat(),
            "waiting_since": e.created_at.isoformat(),
        }
        for e in prioritized[:10]  # top 10 candidates
    ]

    return {
        "waiting": waiting_count,
        "assigned_today": assigned_count,
        "conversion_rate": conversion_rate,
        "recommended_to_notify": recommended_to_notify,
    }


def compute_fill_potential(waiting: int, noshow_rate: float) -> int:
    """
    Estimate how many waitlist users can be filled by expected no-shows.
    """
    return min(waiting, max(0, round(waiting * noshow_rate)))
