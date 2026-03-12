import meilisearch
from app.config import settings
from typing import Dict, List, Any, Optional

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
            "is_featured"
        ])
        
        # Set up sortable attributes
        restaurants_index.update_sortable_attributes([
            "rating",
            "total_reviews",
            "created_at"
        ])
        
        # Configure ranking rules
        restaurants_index.update_ranking_rules([
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
            "cuisine",
            "city",
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
        document = {
            "id": str(restaurant.id),
            "name": restaurant.name,
            "cuisine": restaurant.cuisine,
            "city": restaurant.city,
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
            documents.append({
                "id": str(restaurant.id),
                "name": restaurant.name,
                "cuisine": restaurant.cuisine,
                "city": restaurant.city,
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
