from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.services.restaurant_service import get_trending_restaurants
from app.utils.redis_client import redis_client

router = APIRouter()


@router.get("/restaurants/trending")
def trending(db: Session = Depends(get_db)):
    cache_key = "trending_restaurants"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    result = get_trending_restaurants(db)
    redis_client.setex(cache_key, 300, json.dumps(result))
    return result
