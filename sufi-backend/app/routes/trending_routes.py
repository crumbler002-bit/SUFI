from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.restaurant_service import get_trending_restaurants
from app.redis_client import redis_client

router = APIRouter()

@router.get("/restaurants/trending")
def trending(db: Session = Depends(get_db)):
    cache_key = "trending_restaurants"
    
    # Try to get from cache first
    cached_result = redis_client.get(cache_key)
    if cached_result:
        return cached_result

    # If not in cache, query database
    result = get_trending_restaurants(db)
    
    # Cache the result for 5 minutes (300 seconds)
    redis_client.set(cache_key, result, expire_seconds=300)
    
    return result
