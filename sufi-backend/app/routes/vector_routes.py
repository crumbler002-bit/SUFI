from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import traceback

from app.database import get_db
from app.services.vector_search_service import search_restaurants_vector, hybrid_search

router = APIRouter(prefix="/vector", tags=["Vector Search"])


class SearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 10
    min_similarity: Optional[float] = 0.1


class HybridSearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 10
    vector_weight: Optional[float] = 0.7
    keyword_weight: Optional[float] = 0.3


@router.post("/search")
def vector_search(
    search_query: SearchQuery, 
    db: Session = Depends(get_db)
):
    """
    Perform semantic vector search for restaurants
    
    Example:
    POST /vector/search
    {
        "query": "quiet place for reading",
        "limit": 10,
        "min_similarity": 0.1
    }
    """
    try:
        if not search_query.query or len(search_query.query.strip()) < 2:
            raise HTTPException(status_code=400, detail="Query must be at least 2 characters long")
        
        results = search_restaurants_vector(
            db=db,
            query=search_query.query.strip(),
            limit=search_query.limit or 10,
            min_similarity=search_query.min_similarity or 0.1
        )
        
        return {
            "query": search_query.query,
            "results": results,
            "count": len(results),
            "search_type": "vector_search",
            "algorithm": "cosine_similarity"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print("VECTOR SEARCH ERROR:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Vector search failed: {str(e)}")


@router.post("/search/hybrid")
def hybrid_vector_search(
    search_query: HybridSearchQuery,
    db: Session = Depends(get_db)
):
    """
    Perform hybrid search combining vector similarity and keyword matching
    
    Example:
    POST /vector/search/hybrid
    {
        "query": "romantic italian dinner",
        "limit": 10,
        "vector_weight": 0.7,
        "keyword_weight": 0.3
    }
    """
    try:
        if not search_query.query or len(search_query.query.strip()) < 2:
            raise HTTPException(status_code=400, detail="Query must be at least 2 characters long")
        
        # Validate weights
        vector_weight = search_query.vector_weight or 0.7
        keyword_weight = search_query.keyword_weight or 0.3
        
        if abs((vector_weight + keyword_weight) - 1.0) > 0.01:
            raise HTTPException(status_code=400, detail="Vector and keyword weights must sum to 1.0")
        
        results = hybrid_search(
            db=db,
            query=search_query.query.strip(),
            limit=search_query.limit or 10,
            vector_weight=vector_weight,
            keyword_weight=keyword_weight
        )
        
        return {
            "query": search_query.query,
            "results": results,
            "count": len(results),
            "search_type": "hybrid_search",
            "weights": {
                "vector": vector_weight,
                "keyword": keyword_weight
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print("HYBRID SEARCH ERROR:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Hybrid search failed: {str(e)}")


@router.get("/search")
def vector_search_get(
    query: str = Query(..., description="Search query"),
    limit: int = Query(10, description="Maximum number of results"),
    min_similarity: float = Query(0.1, description="Minimum similarity threshold"),
    db: Session = Depends(get_db)
):
    """
    GET version of vector search for easier testing
    
    Example:
    GET /vector/search?query=quiet%20place&limit=5&min_similarity=0.1
    """
    try:
        if not query or len(query.strip()) < 2:
            raise HTTPException(status_code=400, detail="Query must be at least 2 characters long")
        
        results = search_restaurants_vector(
            db=db,
            query=query.strip(),
            limit=limit,
            min_similarity=min_similarity
        )
        
        return {
            "query": query,
            "results": results,
            "count": len(results),
            "search_type": "vector_search",
            "algorithm": "cosine_similarity"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print("VECTOR SEARCH GET ERROR:")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Vector search failed: {str(e)}")


@router.get("/examples")
def get_search_examples():
    """
    Get example search queries to test vector search
    """
    examples = [
        {
            "query": "quiet place for reading",
            "description": "Find calm, peaceful restaurants for studying or reading"
        },
        {
            "query": "romantic dinner date",
            "description": "Find restaurants perfect for romantic evenings"
        },
        {
            "query": "family friendly brunch",
            "description": "Find casual restaurants good for families with kids"
        },
        {
            "query": "business lunch meeting",
            "description": "Find professional restaurants for business meetings"
        },
        {
            "query": "cozy cafe with wifi",
            "description": "Find comfortable cafes with internet access"
        },
        {
            "query": "spicy authentic food",
            "description": "Find restaurants with authentic, spicy cuisine"
        },
        {
            "query": "outdoor seating garden",
            "description": "Find restaurants with outdoor garden seating"
        },
        {
            "query": "late night dining",
            "description": "Find restaurants open late for dinner"
        }
    ]
    
    return {
        "examples": examples,
        "usage": "Use these queries with POST /vector/search or GET /vector/search"
    }
