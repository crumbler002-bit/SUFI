"""
Context Builder
Builds a personalized system prompt fragment for the AI agent
using the user's cuisine preferences and recent reservation history.
"""

from sqlalchemy.orm import Session

from app.models.user_preference import UserPreference
from app.models.reservation import Reservation
from app.models.restaurant import Restaurant


def build_user_context(db: Session, user) -> str:
    """
    Returns a natural-language context string describing the user's
    preferences and recent dining history.
    Injected into the agent's system prompt.
    """
    if user is None:
        return "Guest user — no preference history available."

    # Top cuisine preferences by weight
    prefs = (
        db.query(UserPreference)
        .filter(UserPreference.user_id == user.id)
        .order_by(UserPreference.weight.desc())
        .limit(5)
        .all()
    )
    fav_cuisines = [p.cuisine for p in prefs] if prefs else []

    # Last 5 reservations with restaurant names
    recent = (
        db.query(Reservation, Restaurant)
        .join(Restaurant, Reservation.restaurant_id == Restaurant.id)
        .filter(
            Reservation.user_id == user.id,
            Reservation.status.in_(["completed", "confirmed", "pending"]),
        )
        .order_by(Reservation.reservation_time.desc())
        .limit(5)
        .all()
    )
    history_lines = [
        f"  - {rest.name} ({rest.cuisine})"
        for _, rest in recent
    ]

    parts = [f"User: {getattr(user, 'name', 'Guest')}"]

    if fav_cuisines:
        parts.append(f"Favourite cuisines: {', '.join(fav_cuisines)}")
    else:
        parts.append("No cuisine preferences recorded yet.")

    if history_lines:
        parts.append("Recent visits:\n" + "\n".join(history_lines))
    else:
        parts.append("No recent dining history.")

    return "\n".join(parts)
