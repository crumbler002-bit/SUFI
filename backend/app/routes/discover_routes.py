from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.restaurant import Restaurant
from app.redis_client import redis_client
import json

router = APIRouter(prefix="/restaurants")

@router.get("/discover-legacy")
def discover(
    city: str = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    # Try to get from cache first
    cache_key = f"discover:{city or 'all'}:{page}:{limit}"
    cached_result = redis_client.get(cache_key)
    
    if cached_result:
        return cached_result

    # If not in cache, query database
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
            "id": r.id,
            "name": r.name,
            "city": r.city,
            "cuisine": r.cuisine,
            "rating": r.rating,
            "price_range": r.price_range,
            "description": r.description
        }
        for r in restaurants
    ]

    # Cache the result for 5 minutes (300 seconds)
    redis_client.set(cache_key, result, expire_seconds=300)

    return result
