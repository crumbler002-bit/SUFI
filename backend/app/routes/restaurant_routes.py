from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import traceback
import json
from app.database import get_db
from app.schemas.restaurant_schema import RestaurantCreate
from app.models.restaurant import Restaurant
from app.models.restaurant_brand import RestaurantBrand
from app.middleware.auth_middleware import get_current_user
from app.utils.search_client import index_restaurant, search_restaurants, get_autocomplete_suggestions, setup_search_index, reindex_all_restaurants
from app.services.recommendation_service import get_personalized_recommendations, get_similar_users_recommendations, update_user_preference, get_intelligent_recommendations
from app.services.ai_concierge_service import ai_restaurant_search
from pydantic import BaseModel

router = APIRouter(prefix="/restaurants")

class AIConciergeRequest(BaseModel):
    query: str

@router.get("/discover")
def discover(
    city: str = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Discover restaurants with optional city filter and pagination"""
    try:
        cache_key = f"discover:{city}:{page}:{limit}"
        
        # Try to get from cache first
        from app.utils.redis_client import redis_client, REDIS_AVAILABLE
        if REDIS_AVAILABLE and redis_client:
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        
        # Build query
        query = db.query(Restaurant)
        if city:
            query = query.filter(Restaurant.city == city)
        
        # Get total count for pagination
        total = query.count()
        
        # Apply ordering and pagination
        restaurants = (
            query.order_by(
                Restaurant.is_featured.desc(),
                Restaurant.tier_id.desc(),
                Restaurant.rating.desc(),
            )
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )
        
        result = {
            "restaurants": [
                {
                    "id": r.id,
                    "name": r.name,
                    "cuisine": r.cuisine,
                    "city": r.city,
                    "rating": r.rating,
                    "total_reviews": r.total_reviews,
                    "price_range": r.price_range,
                    "address": r.address,
                    "is_featured": r.is_featured
                } for r in restaurants
            ],
            "total": total,
            "page": page,
            "limit": limit
        }
        
        # Cache for 60 seconds
        if REDIS_AVAILABLE and redis_client:
            redis_client.setex(cache_key, 60, json.dumps(result))
        
        return result
        
    except Exception as e:
        print("DISCOVER ERROR:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending")
def featured_restaurants(db: Session = Depends(get_db)):
    restaurants = (
        db.query(Restaurant)
        .filter(Restaurant.is_featured == True)
        .limit(10)
        .all()
    )
    return restaurants

@router.post("/register")
def register_restaurant(
    data: RestaurantCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        brand_name = (data.brand_name or data.name).strip() if (data.brand_name or data.name) else None

        brand = None
        if brand_name:
            brand = (
                db.query(RestaurantBrand)
                .filter(
                    RestaurantBrand.owner_id == current_user.id,
                    RestaurantBrand.name == brand_name,
                )
                .first()
            )
            if brand is None:
                brand = RestaurantBrand(
                    name=brand_name,
                    description=data.description,
                    owner_id=current_user.id,
                )
                db.add(brand)
                db.commit()
                db.refresh(brand)

        restaurant = Restaurant(
            brand_id=getattr(brand, "id", None),
            name=data.name,
            description=data.description,
            cuisine=data.cuisine,
            city=data.city,
            address=data.address,
            latitude=data.latitude,
            longitude=data.longitude,
            owner_id=current_user.id
        )

        db.add(restaurant)
        db.commit()
        db.refresh(restaurant)

        # Index restaurant in MeiliSearch
        index_restaurant(restaurant)

        return {
            "brand": {
                "id": getattr(brand, "id", None),
                "name": getattr(brand, "name", None),
            },
            "location": restaurant,
        }

    except Exception as e:
        print("ERROR OCCURRED:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/featured")
def featured_restaurants(db: Session = Depends(get_db)):
    restaurants = (
        db.query(Restaurant)
        .filter(Restaurant.is_featured == True)
        .limit(10)
        .all()
    )
    return restaurants

@router.get("/search")
def search_restaurants_endpoint(
    q: str = Query(..., description="Search query"),
    city: str = Query(None, description="Filter by city"),
    cuisine: str = Query(None, description="Filter by cuisine"),
    price_range: str = Query(None, description="Filter by price range"),
    min_rating: float = Query(None, description="Minimum rating"),
    featured_only: bool = Query(False, description="Show only featured restaurants"),
    limit: int = Query(20, description="Number of results"),
    offset: int = Query(0, description="Results offset")
):
    """Search restaurants with MeiliSearch and filters"""
    try:
        results = search_restaurants(
            query=q,
            city=city,
            cuisine=cuisine,
            price_range=price_range,
            min_rating=min_rating,
            featured_only=featured_only,
            limit=limit,
            offset=offset
        )
        
        return {
            "query": q,
            "filters": {
                "city": city,
                "cuisine": cuisine,
                "price_range": price_range,
                "min_rating": min_rating,
                "featured_only": featured_only
            },
            "results": results.get("hits", []),
            "total": results.get("estimatedTotalHits", 0),
            "processing_time_ms": results.get("processingTimeMs", 0)
        }
        
    except Exception as e:
        print("SEARCH ERROR:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/autocomplete")
def autocomplete_restaurants(
    q: str = Query(..., description="Query for autocomplete"),
    limit: int = Query(5, description="Number of suggestions")
):
    """Get autocomplete suggestions for restaurant names"""
    try:
        suggestions = get_autocomplete_suggestions(q, limit)
        return {
            "query": q,
            "suggestions": suggestions
        }
    except Exception as e:
        print("AUTOCOMPLETE ERROR:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{restaurant_id}")
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    return restaurant

@router.post("/search/setup")
def setup_search(db: Session = Depends(get_db)):
    """Initialize MeiliSearch index and reindex all restaurants"""
    try:
        # Set up the search index configuration
        setup_search_index()
        
        # Reindex all existing restaurants
        success = reindex_all_restaurants(db)
        
        if success:
            return {"message": "Search index initialized and all restaurants reindexed successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to reindex restaurants")
            
    except Exception as e:
        print("SEARCH SETUP ERROR:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations")
def get_recommendations(
    limit: int = Query(20, description="Number of recommendations"),
    lat: float = Query(None, description="User latitude for location-based scoring"),
    lon: float = Query(None, description="User longitude for location-based scoring"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized restaurant recommendations for the current user"""
    try:
        recommendations = get_personalized_recommendations(
            db=db,
            user_id=current_user.id,
            limit=limit,
            user_lat=lat,
            user_lon=lon
        )
        
        return {
            "user_id": current_user.id,
            "recommendations": recommendations,
            "count": len(recommendations)
        }
        
    except Exception as e:
        print("RECOMMENDATIONS ERROR:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/similar-users")
def get_similar_users_recommendations_endpoint(
    limit: int = Query(10, description="Number of recommendations"),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recommendations based on similar users' preferences"""
    try:
        recommendations = get_similar_users_recommendations(
            db=db,
            user_id=current_user.id,
            limit=limit
        )
        
        return {
            "user_id": current_user.id,
            "recommendations": recommendations,
            "count": len(recommendations),
            "type": "similar_users"
        }
        
    except Exception as e:
        print("SIMILAR USERS RECOMMENDATIONS ERROR:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/intelligent")
def get_intelligent_recommendations_endpoint(
    limit: int = Query(10, description="Number of recommendations"),
    db: Session = Depends(get_db)
):
    """Get Phase-1 Intelligent Ranking AI recommendations"""
    try:
        recommendations = get_intelligent_recommendations(
            db=db,
            limit=limit
        )
        
        return {
            "recommendations": recommendations,
            "count": len(recommendations),
            "type": "intelligent_ranking",
            "algorithm": "Phase-1 Intelligent Ranking AI",
            "weights": {
                "rating": 0.5,
                "reviews": 0.2,
                "reservations": 0.2,
                "popularity": 0.1
            }
        }
        
    except Exception as e:
        print("INTELLIGENT RECOMMENDATIONS ERROR:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai-concierge")
def ai_concierge(request: AIConciergeRequest, db: Session = Depends(get_db)):
    """
    AI-powered restaurant search with natural language query understanding
    """
    try:
        result = ai_restaurant_search(db, request.query)
        return result
        
    except Exception as e:
        print("AI CONCIERGE ERROR:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
