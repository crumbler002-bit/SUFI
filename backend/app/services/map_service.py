from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any

def get_restaurants_in_bounds(
    db: Session, 
    north: float, 
    south: float, 
    east: float, 
    west: float
) -> List[Dict[str, Any]]:
    """
    Get restaurants within map bounds using PostGIS bounding box query.
    
    Args:
        db: Database session
        north: Northern latitude boundary
        south: Southern latitude boundary  
        east: Eastern longitude boundary
        west: Western longitude boundary
        
    Returns:
        List of restaurants with coordinates and basic info
    """
    
    # Validate bounds
    if not (-90 <= south <= north <= 90):
        raise ValueError("Invalid latitude bounds")
    if not (-180 <= west <= east <= 180):
        raise ValueError("Invalid longitude bounds")
    
    # If PostGIS is available, use spatial query
    # Fallback to lat/lon bounding box if PostGIS not available
    query = text("""
        SELECT 
            id,
            name,
            cuisine,
            rating,
            total_reviews,
            price_range,
            city,
            address,
            latitude,
            longitude,
            is_featured
        FROM restaurants
        WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND latitude BETWEEN :south AND :north
        AND longitude BETWEEN :west AND :east
        ORDER BY rating DESC, total_reviews DESC
        LIMIT 500
    """)
    
    result = db.execute(query, {
        "north": north,
        "south": south,
        "east": east,
        "west": west
    }).fetchall()
    
    restaurants = []
    for row in result:
        restaurants.append({
            "id": row.id,
            "name": row.name,
            "cuisine": row.cuisine,
            "rating": float(row.rating) if row.rating else 0.0,
            "total_reviews": row.total_reviews or 0,
            "price_range": row.price_range,
            "city": row.city,
            "address": row.address,
            "latitude": float(row.latitude) if row.latitude else 0.0,
            "longitude": float(row.longitude) if row.longitude else 0.0,
            "is_featured": row.is_featured or False
        })
    
    return restaurants

def get_restaurants_in_bounds_postgis(
    db: Session, 
    north: float, 
    south: float, 
    east: float, 
    west: float
) -> List[Dict[str, Any]]:
    """
    Get restaurants within map bounds using PostGIS ST_Within query.
    This is the preferred method when PostGIS is available.
    """
    
    query = text("""
        SELECT 
            id,
            name,
            cuisine,
            rating,
            total_reviews,
            price_range,
            city,
            address,
            ST_Y(location::geometry) as latitude,
            ST_X(location::geometry) as longitude,
            is_featured
        FROM restaurants
        WHERE location IS NOT NULL
        AND ST_Within(
            location,
            ST_MakeEnvelope(:west, :south, :east, :north, 4326)
        )
        ORDER BY rating DESC, total_reviews DESC
        LIMIT 500
    """)
    
    result = db.execute(query, {
        "north": north,
        "south": south,
        "east": east,
        "west": west
    }).fetchall()
    
    restaurants = []
    for row in result:
        restaurants.append({
            "id": row.id,
            "name": row.name,
            "cuisine": row.cuisine,
            "rating": float(row.rating) if row.rating else 0.0,
            "total_reviews": row.total_reviews or 0,
            "price_range": row.price_range,
            "city": row.city,
            "address": row.address,
            "latitude": float(row.latitude) if row.latitude else 0.0,
            "longitude": float(row.longitude) if row.longitude else 0.0,
            "is_featured": row.is_featured or False
        })
    
    return restaurants

def generate_map_cache_key(north: float, south: float, east: float, west: float) -> str:
    """Generate Redis cache key for map bounds"""
    # Round coordinates to 4 decimal places for cache key consistency
    return f"map:{round(north,4)}:{round(south,4)}:{round(east,4)}:{round(west,4)}"
