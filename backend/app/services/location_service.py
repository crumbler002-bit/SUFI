import math
from sqlalchemy.orm import Session
from app.models.restaurant import Restaurant

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat/2)**2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def get_nearby_restaurants(db: Session, lat: float, lon: float, radius: float = 5.0):
    """Get restaurants within radius of given coordinates"""
    # Calculate bounding box for initial filter (optimization)
    # 1 degree of latitude ≈ 111 km
    # 1 degree of longitude ≈ 111 km * cos(latitude)
    lat_delta = radius / 111.0
    lon_delta = radius / (111.0 * math.cos(math.radians(lat)))
    
    # Get restaurants within bounding box
    restaurants = db.query(Restaurant).filter(
        Restaurant.latitude.isnot(None),
        Restaurant.longitude.isnot(None),
        Restaurant.latitude.between(lat - lat_delta, lat + lat_delta),
        Restaurant.longitude.between(lon - lon_delta, lon + lon_delta)
    ).all()
    
    # Calculate actual distances and filter by radius
    nearby = []
    for restaurant in restaurants:
        distance = haversine_distance(lat, lon, restaurant.latitude, restaurant.longitude)
        if distance <= radius:
            nearby.append({
                "id": restaurant.id,
                "name": restaurant.name,
                "cuisine": restaurant.cuisine,
                "rating": restaurant.rating,
                "total_reviews": restaurant.total_reviews,
                "city": restaurant.city,
                "address": restaurant.address,
                "price_range": restaurant.price_range,
                "is_featured": restaurant.is_featured,
                "distance_km": round(distance, 2)
            })
    
    # Sort by distance
    nearby.sort(key=lambda x: x["distance_km"])
    
    return nearby
