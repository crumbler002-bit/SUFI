from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.services.recommendation_service import (
    get_personalized_recommendations,
    get_similar_users_recommendations,
)


router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/personalized")
def personalized(
    limit: int = Query(20),
    lat: float | None = Query(None),
    lon: float | None = Query(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    restaurants = get_personalized_recommendations(
        db=db,
        user_id=current_user.id,
        limit=limit,
        user_lat=lat,
        user_lon=lon,
    )

    enriched = []
    for r in restaurants:
        reason = "Recommended for you"
        cuisine = r.get("cuisine")
        if cuisine:
            reason = f"Because you like {cuisine}"
        enriched.append({**r, "reason": reason})

    return {"restaurants": enriched}


@router.get("/similar-users")
def similar_users(
    limit: int = Query(10),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    restaurants = get_similar_users_recommendations(db=db, user_id=current_user.id, limit=limit)
    return {"restaurants": restaurants}
