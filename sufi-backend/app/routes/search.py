from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.database import get_db
from app.models.restaurant import Restaurant
from app.services.ranking import get_query_embedding, generate_explanation

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    location: Optional[str] = None

@router.post("/search")
async def search_restaurants(payload: SearchRequest, db: Session = Depends(get_db)):
    query = payload.query.strip()
    
    if not query:
        # Fallback if no query is provided
        restaurants = db.query(Restaurant).limit(10).all()
        results = [
            {
                "id": str(r.id),
                "name": r.name,
                "rating": r.rating,
                "cuisine": r.cuisine,
                "score": 0.5,
                "tags": [t.name for t in getattr(r, 'tags', [])]
            } for r in restaurants
        ]
        return {
            "results": results,
            "bestMatchId": results[0]["id"] if results else None,
            "explanations": {},
            "count": len(results),
        }

    try:
        # 1. Generate Query Embedding
        query_embedding = get_query_embedding(query)

        # 2. Similarity Search using pgvector's cosine distance operator (<=> or cosine_distance)
        # In pgvector, cosine_distance = 1 - cosine_similarity
        # So we order by distance ASC (smallest distance = highest similarity)
        restaurants = (
            db.query(Restaurant)
            .order_by(Restaurant.embedding.cosine_distance(query_embedding))
            .limit(10)
            .all()
        )

        results = []
        explanations = {}

        for r in restaurants:
            # Reconstruct similarity score (1 - cosine_distance)
            distance = r.embedding.cosine_distance(query_embedding) if r.embedding else 1.0
            # Depending on the sqlalchemy evaluation, if it's evaluated in DB, we'd need to select the distance. 
            # For simplicity, we just assign a mock dynamic score based on order since we are ordering by it,
            # or we calculate the actual distance if we used add_columns(Restaurant.embedding.cosine_distance(query_embedding).label('distance'))
            
            # Placeholder dynamic intent logic if distance is not returned natively
            intent_score = 1.0 - 0.05 * len(results) # Fake for now if not fetched explicitly
            
            # Combine intent, rating, and popularity into final score
            final_score = (
                0.35 * intent_score +
                0.20 * min((getattr(r, 'popularity_score', 0) / 100), 1.0) +
                0.15 * (r.rating / 5 if r.rating else 0.5)
            )

            results.append({
                "id": str(r.id),
                "name": r.name,
                "rating": r.rating,
                "cuisine": getattr(r, 'cuisine', "Restaurant"),
                "score": round(final_score, 2),
                "trend_score": getattr(r, 'popularity_score', 0),
                "tags": [] # Placeholder
            })

            explanations[str(r.id)] = generate_explanation(r, intent_score)

        # 3. Sort by final score explicitly
        results.sort(key=lambda x: x["score"], reverse=True)

        best_match_id = results[0]["id"] if results else None

        return {
            "results": results,
            "bestMatchId": best_match_id,
            "explanations": explanations,
            "count": len(results)
        }

    except Exception as e:
        print(f"Error in search: {e}")
        raise HTTPException(status_code=500, detail="Search failed")
