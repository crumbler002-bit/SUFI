import meilisearch
from app.config import settings
from typing import Dict, List, Any, Optional
from app.constants.tier_boost import TIER_BOOST

client = meilisearch.Client(
    settings.MEILISEARCH_URL,
    settings.MEILISEARCH_MASTER_KEY
)

# Get or create the restaurants index
restaurants_index = client.index("restaurants")

def setup_search_index():
    """Configure the MeiliSearch index with proper settings"""
    try:
        # Set up searchable attributes
        restaurants_index.update_searchable_attributes([
            "name",
            "brand_name",
            "cuisine", 
            "city",
            "description",
            "address"
        ])
        
        # Set up filterable attributes
        restaurants_index.update_filterable_attributes([
            "city",
            "cuisine",
            "price_range",
            "rating",
            "is_featured",
            "tier_boost",
            "tier_name",
        ])
        
        # Set up sortable attributes
        restaurants_index.update_sortable_attributes([
            "tier_boost",
            "rating",
            "total_reviews",
            "created_at"
        ])
        
        # Configure ranking rules
        restaurants_index.update_ranking_rules([
            "desc(is_featured)",
            "desc(tier_boost)",
            "words",
            "typo",
            "proximity",
            "attribute",
            "sort",
            "exactness"
        ])
        
        # Set up displayed attributes
        restaurants_index.update_displayed_attributes([
            "id",
            "name",
            "brand_name",
            "cuisine",
            "city",
            "tier_name",
            "tier_boost",
            "rating",
            "total_reviews",
            "price_range",
            "address",
            "is_featured",
            "description"
        ])
        
        print("MeiliSearch index configured successfully")
        
    except Exception as e:
        print(f"Error configuring MeiliSearch index: {e}")

def index_restaurant(restaurant) -> bool:
    """Index a single restaurant in MeiliSearch"""
    try:
        tier = getattr(restaurant, "tier", None)
        tier_name = getattr(tier, "name", None)
        tier_priority_rank = getattr(tier, "priority_rank", None)

        tier_boost = 0.0
        if tier_name:
            boost = TIER_BOOST.get(str(tier_name).strip().lower())
            if boost is not None:
                tier_boost = float(boost)
        elif tier_priority_rank is not None:
            try:
                tier_boost = float(tier_priority_rank)
            except Exception:
                tier_boost = 0.0

        brand = getattr(restaurant, "brand", None)
        brand_name = getattr(brand, "name", None)

        document = {
            "id": str(restaurant.id),
            "name": restaurant.name,
            "brand_name": brand_name,
            "cuisine": restaurant.cuisine,
            "city": restaurant.city,
            "tier_name": tier_name,
            "tier_boost": tier_boost,
            "rating": restaurant.rating or 0,
            "total_reviews": restaurant.total_reviews or 0,
            "price_range": restaurant.price_range,
            "address": restaurant.address,
            "is_featured": restaurant.is_featured or False,
            "description": restaurant.description or ""
        }
        
        restaurants_index.add_documents([document])
        return True
        
    except Exception as e:
        print(f"Error indexing restaurant {restaurant.id}: {e}")
        return False

def update_restaurant(restaurant) -> bool:
    """Update a restaurant in MeiliSearch"""
    return index_restaurant(restaurant)  # Same function - MeiliSearch handles upserts

def delete_restaurant(restaurant_id: int) -> bool:
    """Delete a restaurant from MeiliSearch"""
    try:
        restaurants_index.delete_document(str(restaurant_id))
        return True
    except Exception as e:
        print(f"Error deleting restaurant {restaurant_id}: {e}")
        return False

def search_restaurants(
    query: str,
    city: Optional[str] = None,
    cuisine: Optional[str] = None,
    price_range: Optional[str] = None,
    min_rating: Optional[float] = None,
    featured_only: bool = False,
    limit: int = 20,
    offset: int = 0
) -> Dict[str, Any]:
    """Search restaurants with filters"""
    try:
        # Build filter string
        filters = []
        
        if city:
            filters.append(f'city = "{city}"')
        
        if cuisine:
            filters.append(f'cuisine = "{cuisine}"')
            
        if price_range:
            filters.append(f'price_range = "{price_range}"')
            
        if min_rating is not None:
            filters.append(f'rating >= {min_rating}')
            
        if featured_only:
            filters.append('is_featured = true')
        
        filter_string = ' AND '.join(filters) if filters else None
        
        # Configure search options
        search_options = {
            "limit": limit,
            "offset": offset,
            "attributesToHighlight": ["name", "cuisine", "description"]
        }
        
        if filter_string:
            search_options["filter"] = filter_string
        
        # Execute search
        results = restaurants_index.search(query, search_options)
        
        return results
        
    except Exception as e:
        print(f"Error searching restaurants: {e}")
        return {"hits": [], "estimatedTotalHits": 0, "processingTimeMs": 0}

def get_autocomplete_suggestions(query: str, limit: int = 5) -> List[str]:
    """Get autocomplete suggestions for restaurant names"""
    try:
        suggestions = restaurants_index.search(query, {
            "limit": limit,
            "attributesToRetrieve": ["name"],
            "attributesToHighlight": ["name"]
        })
        
        return [hit["name"] for hit in suggestions.get("hits", [])]
        
    except Exception as e:
        print(f"Error getting autocomplete suggestions: {e}")
        return []

def reindex_all_restaurants(db_session) -> bool:
    """Reindex all restaurants from database"""
    try:
        from app.models.restaurant import Restaurant
        
        # Get all restaurants
        restaurants = db_session.query(Restaurant).all()
        
        # Prepare documents
        documents = []
        for restaurant in restaurants:
            tier = getattr(restaurant, "tier", None)
            tier_name = getattr(tier, "name", None)
            tier_priority_rank = getattr(tier, "priority_rank", None)

            brand = getattr(restaurant, "brand", None)
            brand_name = getattr(brand, "name", None)

            tier_boost = 0.0
            if tier_name:
                boost = TIER_BOOST.get(str(tier_name).strip().lower())
                if boost is not None:
                    tier_boost = float(boost)
            elif tier_priority_rank is not None:
                try:
                    tier_boost = float(tier_priority_rank)
                except Exception:
                    tier_boost = 0.0

            documents.append({
                "id": str(restaurant.id),
                "name": restaurant.name,
                "brand_name": brand_name,
                "cuisine": restaurant.cuisine,
                "city": restaurant.city,
                "tier_name": tier_name,
                "tier_boost": tier_boost,
                "rating": restaurant.rating or 0,
                "total_reviews": restaurant.total_reviews or 0,
                "price_range": restaurant.price_range,
                "address": restaurant.address,
                "is_featured": restaurant.is_featured or False,
                "description": restaurant.description or ""
            })
        
        # Clear and reindex
        restaurants_index.delete_all_documents()
        restaurants_index.add_documents(documents)
        
        print(f"Reindexed {len(documents)} restaurants")
        return True
        
    except Exception as e:
        print(f"Error reindexing restaurants: {e}")
        return False
