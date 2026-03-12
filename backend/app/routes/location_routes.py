from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.services.location_service import get_nearby_restaurants
from app.services.map_service import get_restaurants_in_bounds, generate_map_cache_key
from app.utils.redis_client import redis_client

router = APIRouter(prefix="/restaurants", tags=["location"])

@router.get("/nearby")
def nearby_restaurants(
    lat: float = Query(..., description="User latitude"),
    lon: float = Query(..., description="User longitude"),
    radius: float = Query(5.0, description="Search radius in kilometers"),
    db: Session = Depends(get_db)
):
    # Check cache first
    cache_key = f"nearby:{lat:.4f}:{lon:.4f}:{radius:.1f}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Get nearby restaurants using service
    result = get_nearby_restaurants(db, lat, lon, radius)
    
    # Cache for 60 seconds
    redis_client.setex(cache_key, 60, json.dumps(result))
    
    return result

@router.get("/map")
def restaurants_in_bounds(
    north: float = Query(..., description="Northern boundary latitude"),
    south: float = Query(..., description="Southern boundary latitude"),
    east: float = Query(..., description="Eastern boundary longitude"),
    west: float = Query(..., description="Western boundary longitude"),
    db: Session = Depends(get_db)
):
    """Get restaurants within map bounds for map-based discovery"""
    try:
        # Validate bounds
        if north <= south or east <= west:
            raise HTTPException(status_code=400, detail="Invalid map bounds")
        
        # Check cache first
        cache_key = generate_map_cache_key(north, south, east, west)
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        
        # Get restaurants in bounds
        restaurants = get_restaurants_in_bounds(db, north, south, east, west)
        
        # Cache for 30 seconds
        redis_client.setex(cache_key, 30, json.dumps(restaurants))
        
        return {
            "bounds": {
                "north": north,
                "south": south,
                "east": east,
                "west": west
            },
            "restaurants": restaurants,
            "count": len(restaurants)
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch restaurants")
