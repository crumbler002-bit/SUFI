from sqlalchemy.orm import Session
from sqlalchemy import text, desc
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json

from app.models.restaurant import Restaurant
from app.models.user_preference import UserPreference
from app.models.reservation import Reservation
from app.models.review import Review
from app.utils.redis_client import redis_client
from app.services.location_service import haversine_distance
from app.constants.tier_boost import TIER_BOOST, TIER_BADGE


def get_tier_boost(restaurant: Restaurant) -> float:
    tier = getattr(restaurant, "tier", None)
    tier_name = getattr(tier, "name", None)
    tier_priority_rank = getattr(tier, "priority_rank", None)

    if tier_name:
        boost = TIER_BOOST.get(str(tier_name).strip().lower())
        if boost is not None:
            return float(boost)

    if tier_priority_rank is not None:
        try:
            return float(tier_priority_rank)
        except Exception:
            return 0.0

    return 0.0


def get_tier_badge(restaurant: Restaurant) -> str | None:
    tier = getattr(restaurant, "tier", None)
    tier_name = getattr(tier, "name", None)
    if not tier_name:
        return TIER_BADGE.get("free")
    return TIER_BADGE.get(str(tier_name).strip().lower())

def calculate_intelligent_ranking_score(restaurant: Restaurant) -> float:
    """
    Phase-1 Intelligent Ranking AI Score
    Calculates restaurant score based on:
    - rating (50% weight)
    - reviews (20% weight) 
    - reservations (20% weight)
    - popularity (10% weight)
    """
    # Rating score (50% weight) - normalize to 0-5 scale
    rating_score = (restaurant.rating or 0) * 0.5
    
    # Review score (20% weight) - normalize reviews (assume max 100 reviews for scoring)
    review_score = min((restaurant.total_reviews or 0) / 100.0, 1.0) * 5 * 0.2
    
    # Reservation score (20% weight) - normalize reservations (assume max 200 for scoring)
    reservation_score = min((restaurant.reservation_count or 0) / 200.0, 1.0) * 5 * 0.2
    
    # Popularity score (10% weight) - use popularity_score directly (assume 0-5 scale)
    popularity_score = (restaurant.popularity_score or 0) * 0.1

    # Tier boost - marketplace monetization lever
    tier_boost = get_tier_boost(restaurant)
    
    # Total score (0-5 scale)
    total_score = rating_score + review_score + reservation_score + popularity_score + tier_boost
    
    return total_score

def get_intelligent_recommendations(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get Phase-1 Intelligent Ranking recommendations
    Simple, fast, and effective ranking without ML
    """
    try:
        # Get all restaurants
        restaurants = db.query(Restaurant).all()
        
        # Calculate scores and rank
        scored_restaurants = []
        for restaurant in restaurants:
            score = calculate_intelligent_ranking_score(restaurant)
            tier_boost = get_tier_boost(restaurant)
            tier_name = getattr(getattr(restaurant, "tier", None), "name", None)
            badge = get_tier_badge(restaurant)
            
            scored_restaurants.append({
                "id": restaurant.id,
                "name": restaurant.name,
                "cuisine": restaurant.cuisine,
                "tier": tier_name,
                "tier_boost": tier_boost,
                "badge": badge,
                "rating": restaurant.rating or 0.0,
                "total_reviews": restaurant.total_reviews or 0,
                "reservation_count": restaurant.reservation_count or 0,
                "popularity_score": restaurant.popularity_score or 0.0,
                "price_range": restaurant.price_range,
                "city": restaurant.city,
                "address": restaurant.address,
                "is_featured": restaurant.is_featured or False,
                "intelligent_score": score,
                "score_breakdown": {
                    "rating_score": (restaurant.rating or 0) * 0.5,
                    "review_score": min((restaurant.total_reviews or 0) / 100.0, 1.0) * 5 * 0.2,
                    "reservation_score": min((restaurant.reservation_count or 0) / 200.0, 1.0) * 5 * 0.2,
                    "popularity_score": (restaurant.popularity_score or 0) * 0.1,
                    "tier_boost": tier_boost,
                }
            })
        
        # Sort by intelligent score (descending)
        scored_restaurants.sort(key=lambda x: x["intelligent_score"], reverse=True)
        
        # Return top recommendations
        return scored_restaurants[:limit]
        
    except Exception as e:
        print(f"Error getting intelligent recommendations: {e}")
        return []

def update_user_preference(db: Session, user_id: str, cuisine: str) -> bool:
    try:
        # Check if preference exists
        pref = db.query(UserPreference).filter(
            UserPreference.user_id == user_id,
            UserPreference.cuisine == cuisine
        ).first()
        
        if pref:
            pref.weight += 1
            pref.updated_at = datetime.utcnow()
        else:
            pref = UserPreference(
                user_id=user_id,
                cuisine=cuisine,
                weight=1
            )
            db.add(pref)
        
        db.commit()
        return True
        
    except Exception as e:
        print(f"Error updating user preference: {e}")
        db.rollback()
        return False

def get_user_preferences(db: Session, user_id: str) -> List[UserPreference]:
    """Get user's cuisine preferences sorted by weight"""
    return db.query(UserPreference).filter(
        UserPreference.user_id == user_id
    ).order_by(desc(UserPreference.weight)).all()

def calculate_trending_score(db: Session, restaurant_id: int) -> float:
    """Calculate trending score based on recent activity"""
    # Get recent reservations (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    
    recent_reservations = db.query(Reservation).filter(
        Reservation.restaurant_id == restaurant_id,
        Reservation.created_at >= week_ago
    ).count()
    
    # Get recent reviews (last 7 days)
    recent_reviews = db.query(Review).filter(
        Review.restaurant_id == restaurant_id,
        Review.created_at >= week_ago
    ).count()
    
    # Simple trending score: recent reservations + recent reviews * 2
    return float(recent_reservations + (recent_reviews * 2))

def calculate_recommendation_score(
    restaurant: Restaurant,
    user_preferences: List[UserPreference],
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None,
    trending_scores: Dict[int, float] = None
) -> float:
    """Calculate recommendation score for a restaurant"""
    
    # Initialize score components
    cuisine_match = 0.0
    rating_score = 0.0
    trending_score = 0.0
    distance_score = 0.0
    
    # 1. Cuisine preference match (40% weight)
    for pref in user_preferences:
        if pref.cuisine.lower() == restaurant.cuisine.lower():
            # Normalize weight (assuming max weight of 10)
            cuisine_match = min(pref.weight / 10.0, 1.0)
            break
    
    # 2. Restaurant rating (30% weight)
    if restaurant.rating:
        # Normalize rating (5-star scale)
        rating_score = restaurant.rating / 5.0
    
    # 3. Trending score (20% weight)
    if trending_scores and restaurant.id in trending_scores:
        # Normalize trending score (assuming max of 50)
        trending_score = min(trending_scores[restaurant.id] / 50.0, 1.0)
    
    # 4. Distance score (10% weight) - if user location provided
    if user_lat is not None and user_lon is not None and restaurant.latitude and restaurant.longitude:
        distance = haversine_distance(user_lat, user_lon, restaurant.latitude, restaurant.longitude)
        # Closer is better - normalize (assuming 10km as max for scoring)
        distance_score = max(0, 1.0 - (distance / 10.0))
    
    # Final weighted score
    final_score = (
        cuisine_match * 0.4 +
        rating_score * 0.3 +
        trending_score * 0.2 +
        distance_score * 0.1
    )
    
    return final_score

def get_personalized_recommendations(
    db: Session,
    user_id: str,
    limit: int = 20,
    user_lat: Optional[float] = None,
    user_lon: Optional[float] = None
) -> List[Dict[str, Any]]:
    """Get personalized restaurant recommendations for a user"""
    
    # Check cache first
    cache_key = f"recommend:{user_id}:{limit}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    try:
        # Get user preferences
        user_preferences = get_user_preferences(db, user_id)
        
        if not user_preferences:
            # No preferences, return popular restaurants
            restaurants = db.query(Restaurant).filter(
                Restaurant.rating >= 4.0
            ).order_by(desc(Restaurant.rating)).limit(limit).all()
        else:
            # Get preferred cuisines
            preferred_cuisines = [pref.cuisine for pref in user_preferences]
            
            # Get restaurants in preferred cuisines
            restaurants = db.query(Restaurant).filter(
                Restaurant.cuisine.in_(preferred_cuisines)
            ).all()
        
        # Calculate trending scores for all restaurants
        trending_scores = {}
        for restaurant in restaurants:
            trending_scores[restaurant.id] = calculate_trending_score(db, restaurant.id)
        
        # Calculate recommendation scores
        scored_restaurants = []
        for restaurant in restaurants:
            score = calculate_recommendation_score(
                restaurant=restaurant,
                user_preferences=user_preferences,
                user_lat=user_lat,
                user_lon=user_lon,
                trending_scores=trending_scores
            )
            
            scored_restaurants.append({
                "id": restaurant.id,
                "name": restaurant.name,
                "cuisine": restaurant.cuisine,
                "rating": restaurant.rating or 0.0,
                "total_reviews": restaurant.total_reviews or 0,
                "price_range": restaurant.price_range,
                "city": restaurant.city,
                "address": restaurant.address,
                "is_featured": restaurant.is_featured or False,
                "recommendation_score": score,
                "latitude": restaurant.latitude,
                "longitude": restaurant.longitude
            })
        
        # Sort by recommendation score
        scored_restaurants.sort(key=lambda x: x["recommendation_score"], reverse=True)
        
        # Limit results
        recommendations = scored_restaurants[:limit]
        
        # Cache for 5 minutes
        redis_client.setex(cache_key, 300, json.dumps(recommendations))
        
        return recommendations
        
    except Exception as e:
        print(f"Error getting recommendations: {e}")
        return []

def get_similar_users_recommendations(db: Session, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Get recommendations based on similar users' preferences"""
    try:
        # Get user's preferred cuisines
        user_prefs = get_user_preferences(db, user_id)
        user_cuisines = set(pref.cuisine for pref in user_prefs)
        
        if not user_cuisines:
            return []
        
        # Find users with similar cuisine preferences
        similar_users_query = text("""
            SELECT DISTINCT r2.user_id, COUNT(*) as common_cuisines
            FROM user_preferences up1
            JOIN user_preferences up2 ON up1.cuisine = up2.cuisine AND up1.user_id != up2.user_id
            WHERE up1.user_id = :user_id
            AND up2.cuisine IN :cuisines
            GROUP BY r2.user_id
            HAVING COUNT(*) >= 2
            ORDER BY common_cuisines DESC
            LIMIT 5
        """)
        
        similar_users = db.execute(similar_users_query, {
            "user_id": user_id,
            "cuisines": tuple(user_cuisines)
        }).fetchall()
        
        if not similar_users:
            return []
        
        similar_user_ids = [user.user_id for user in similar_users]
        
        # Get restaurants booked by similar users that the current user hasn't tried
        recommendations_query = text("""
            SELECT DISTINCT r.*, COUNT(*) as booking_count
            FROM reservations res
            JOIN restaurants r ON res.restaurant_id = r.id
            WHERE res.user_id IN :similar_user_ids
            AND res.restaurant_id NOT IN (
                SELECT restaurant_id FROM reservations WHERE user_id = :user_id
            )
            GROUP BY r.id
            ORDER BY booking_count DESC, r.rating DESC
            LIMIT :limit
        """)
        
        results = db.execute(recommendations_query, {
            "similar_user_ids": tuple(similar_user_ids),
            "user_id": user_id,
            "limit": limit
        }).fetchall()
        
        recommendations = []
        for row in results:
            recommendations.append({
                "id": row.id,
                "name": row.name,
                "cuisine": row.cuisine,
                "rating": row.rating or 0.0,
                "total_reviews": row.total_reviews or 0,
                "price_range": row.price_range,
                "city": row.city,
                "address": row.address,
                "is_featured": row.is_featured or False,
                "recommendation_reason": "Users with similar taste also liked this"
            })
        
        return recommendations
        
    except Exception as e:
        print(f"Error getting similar users recommendations: {e}")
        return []
