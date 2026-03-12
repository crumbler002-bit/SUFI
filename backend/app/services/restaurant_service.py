from sqlalchemy import func
from datetime import datetime, timedelta
from app.models.restaurant import Restaurant
from app.models.reservation import Reservation
import json

def get_trending_restaurants(db):
    last_week = datetime.utcnow() - timedelta(days=7)

    results = (
        db.query(
            Restaurant.id,
            Restaurant.name,
            Restaurant.rating,
            Restaurant.total_reviews,
            Restaurant.is_featured,
            func.count(Reservation.id).label("recent_reservations")
        )
        .outerjoin(
            Reservation,
            Reservation.restaurant_id == Restaurant.id
        )
        .filter(
            (Reservation.created_at == None) |
            (Reservation.created_at >= last_week)
        )
        .group_by(Restaurant.id)
        .all()
    )

    trending = []

    for r in results:
        reservations = r.recent_reservations or 0
        rating = r.rating or 0
        reviews = r.total_reviews or 0
        featured = 1 if r.is_featured else 0

        score = (
            reservations * 0.45 +
            rating * 0.30 +
            reviews * 0.20 +
            featured * 0.05
        )

        trending.append({
            "restaurant_id": r.id,
            "name": r.name,
            "trend_score": score
        })

    trending.sort(key=lambda x: x["trend_score"], reverse=True)

    return trending[:10]
