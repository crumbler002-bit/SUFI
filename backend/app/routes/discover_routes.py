from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.restaurant import Restaurant
from app.utils.redis_client import redis_client, REDIS_AVAILABLE
import json

router = APIRouter(prefix="/restaurants")

@router.get("/discover")
def discover(
    city: str = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):

    # Only use Redis if available
    if REDIS_AVAILABLE:
        cache_key = f"discover:{city}:{page}:{limit}"
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)

    query = db.query(Restaurant)

    if city:
        query = query.filter(Restaurant.city == city)

    restaurants = (
        query.order_by(Restaurant.is_featured.desc(), Restaurant.rating.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    result = [
        {
            "id": str(r.id),
            "name": r.name,
            "city": r.city,
            "cuisine": r.cuisine
        }
        for r in restaurants
    ]

    # Only cache if Redis is available
    if REDIS_AVAILABLE:
        redis_client.setex(cache_key, 300, json.dumps(result))

    return result
