import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.services.embedding_service import create_embedding, get_embedding_dimension
from app.models.restaurant import Restaurant

def cosine_similarity(a: List[float], b: List[float]) -> float:
    """
    Calculate cosine similarity between two vectors
    
    Args:
        a: First vector
        b: Second vector
        
    Returns:
        Cosine similarity score (0 to 1, higher = more similar)
    """
    try:
        # Convert to numpy arrays
        a_array = np.array(a, dtype=np.float32)
        b_array = np.array(b, dtype=np.float32)
        
        # Calculate cosine similarity
        dot_product = np.dot(a_array, b_array)
        norm_a = np.linalg.norm(a_array)
        norm_b = np.linalg.norm(b_array)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        similarity = dot_product / (norm_a * norm_b)
        
        # Ensure result is in [0, 1] range
        return float(max(0.0, min(1.0, similarity)))
        
    except Exception as e:
        print(f"Error calculating cosine similarity: {e}")
        return 0.0

def search_restaurants_vector(
    db: Session, 
    query: str, 
    limit: int = 10,
    min_similarity: float = 0.1
) -> List[Dict[str, Any]]:
    """
    Perform vector search for restaurants based on semantic similarity
    
    Args:
        db: Database session
        query: Search query text
        limit: Maximum number of results to return
        min_similarity: Minimum similarity threshold
        
    Returns:
        List of restaurants with similarity scores
    """
    try:
        # Generate embedding for query
        query_vector = create_embedding(query)
        
        # Get all restaurants with embeddings
        restaurants = db.query(Restaurant).filter(
            Restaurant.embedding.isnot(None)
        ).all()
        
        if not restaurants:
            print("No restaurants with embeddings found")
            return []
        
        print(f"Searching through {len(restaurants)} restaurants with embeddings")
        
        # Calculate similarity scores
        scored_restaurants: List[Tuple[float, Restaurant]] = []
        
        for restaurant in restaurants:
            if not restaurant.embedding:
                continue
                
            similarity = cosine_similarity(query_vector, restaurant.embedding)
            
            # Only include restaurants above similarity threshold
            if similarity >= min_similarity:
                scored_restaurants.append((similarity, restaurant))
        
        # Sort by similarity score (descending)
        scored_restaurants.sort(key=lambda x: x[0], reverse=True)
        
        # Format results
        results = []
        for similarity, restaurant in scored_restaurants[:limit]:
            results.append({
                "id": restaurant.id,
                "name": restaurant.name,
                "cuisine": restaurant.cuisine,
                "city": restaurant.city,
                "description": restaurant.description,
                "rating": restaurant.rating or 0.0,
                "price_range": restaurant.price_range,
                "similarity_score": similarity,
                "similarity_percentage": round(similarity * 100, 1),
                "address": restaurant.address,
                "total_reviews": restaurant.total_reviews or 0,
                "is_featured": restaurant.is_featured or False
            })
        
        print(f"Found {len(results)} matching restaurants")
        return results
        
    except Exception as e:
        print(f"Error in vector search: {e}")
        return []

def hybrid_search(
    db: Session,
    query: str,
    limit: int = 10,
    vector_weight: float = 0.7,
    keyword_weight: float = 0.3
) -> List[Dict[str, Any]]:
    """
    Perform hybrid search combining vector similarity and keyword matching
    
    Args:
        db: Database session
        query: Search query
        limit: Maximum results
        vector_weight: Weight for vector search (0-1)
        keyword_weight: Weight for keyword search (0-1)
        
    Returns:
        Combined search results
    """
    try:
        # Get vector search results
        vector_results = search_restaurants_vector(db, query, limit * 2)
        
        # Get keyword search results (simple text matching)
        keyword_results = []
        query_lower = query.lower()
        
        restaurants = db.query(Restaurant).all()
        
        for restaurant in restaurants:
            score = 0.0
            
            # Check name match
            if restaurant.name and query_lower in restaurant.name.lower():
                score += 0.5
            
            # Check cuisine match
            if restaurant.cuisine and query_lower in restaurant.cuisine.lower():
                score += 0.3
            
            # Check description match
            if restaurant.description and query_lower in restaurant.description.lower():
                score += 0.2
            
            if score > 0:
                keyword_results.append((score, restaurant))
        
        # Sort keyword results
        keyword_results.sort(key=lambda x: x[0], reverse=True)
        
        # Combine results
        combined_scores = {}
        
        # Add vector scores
        for result in vector_results:
            restaurant_id = result["id"]
            combined_scores[restaurant_id] = {
                "restaurant": result,
                "vector_score": result["similarity_score"] * vector_weight,
                "keyword_score": 0.0,
                "combined_score": result["similarity_score"] * vector_weight
            }
        
        # Add keyword scores
        for score, restaurant in keyword_results[:limit * 2]:
            restaurant_id = restaurant.id
            
            if restaurant_id in combined_scores:
                combined_scores[restaurant_id]["keyword_score"] = score * keyword_weight
                combined_scores[restaurant_id]["combined_score"] += score * keyword_weight
            else:
                combined_scores[restaurant_id] = {
                    "restaurant": {
                        "id": restaurant.id,
                        "name": restaurant.name,
                        "cuisine": restaurant.cuisine,
                        "city": restaurant.city,
                        "description": restaurant.description,
                        "rating": restaurant.rating or 0.0,
                        "price_range": restaurant.price_range,
                        "address": restaurant.address,
                        "total_reviews": restaurant.total_reviews or 0,
                        "is_featured": restaurant.is_featured or False,
                        "similarity_score": 0.0,
                        "similarity_percentage": 0.0
                    },
                    "vector_score": 0.0,
                    "keyword_score": score * keyword_weight,
                    "combined_score": score * keyword_weight
                }
        
        # Sort by combined score
        final_results = sorted(
            combined_scores.values(),
            key=lambda x: x["combined_score"],
            reverse=True
        )
        
        # Format final results
        formatted_results = []
        for item in final_results[:limit]:
            result = item["restaurant"].copy()
            result["combined_score"] = round(item["combined_score"], 3)
            result["vector_score"] = round(item["vector_score"], 3)
            result["keyword_score"] = round(item["keyword_score"], 3)
            formatted_results.append(result)
        
        return formatted_results
        
    except Exception as e:
        print(f"Error in hybrid search: {e}")
        return []

def test_vector_search():
    """Test the vector search functionality"""
    print("🧪 Testing vector search...")
    
    # Test cosine similarity
    vec1 = [1.0, 0.0, 0.0]
    vec2 = [1.0, 0.0, 0.0]  # Identical
    vec3 = [0.0, 1.0, 0.0]  # Orthogonal
    vec4 = [0.707, 0.707, 0.0]  # 45 degrees
    
    sim1 = cosine_similarity(vec1, vec2)
    sim2 = cosine_similarity(vec1, vec3)
    sim3 = cosine_similarity(vec1, vec4)
    
    print(f"Identical vectors similarity: {sim1:.3f}")
    print(f"Orthogonal vectors similarity: {sim2:.3f}")
    print(f"45-degree vectors similarity: {sim3:.3f}")
    
    # Test embedding generation
    test_query = "romantic italian dinner"
    embedding = create_embedding(test_query)
    print(f"Query embedding dimension: {len(embedding)}")
    
    return True

if __name__ == "__main__":
    test_vector_search()
