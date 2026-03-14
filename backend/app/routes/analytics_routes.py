from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.restaurant import Restaurant
from app.models.restaurant_analytics import RestaurantAnalytics
from app.schemas.analytics_schema import AnalyticsClickCreate
from app.services.analytics_service import (
    track_click,
    calculate_ctr,
    get_popular_hours,
)
from app.services.promotion_service import mark_promotion_click
from app.utils.redis_client import redis_client as redis_raw_client, REDIS_AVAILABLE


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/click")
def click(payload: AnalyticsClickCreate, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == payload.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    track_click(db, payload.restaurant_id)
    mark_promotion_click(db, payload.restaurant_id)

    if REDIS_AVAILABLE and redis_raw_client:
        redis_raw_client.delete(f"analytics:{payload.restaurant_id}")
        redis_raw_client.delete(f"analytics:{payload.restaurant_id}:timeline")

    return {"message": "ok"}


@router.get("/restaurant/{id}")
def restaurant_analytics_summary(
    id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if getattr(current_user, "role", None) in ["owner", "restaurant_owner"]:
        if restaurant.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Owner access required")

    cache_key = f"analytics:{id}"
    if REDIS_AVAILABLE and redis_raw_client:
        cached = redis_raw_client.get(cache_key)
        if cached:
            return cached

    totals = (
        db.query(
            func.coalesce(func.sum(RestaurantAnalytics.profile_views), 0),
            func.coalesce(func.sum(RestaurantAnalytics.unique_visitors), 0),
            func.coalesce(func.sum(RestaurantAnalytics.search_appearances), 0),
            func.coalesce(func.sum(RestaurantAnalytics.clicks), 0),
            func.coalesce(func.sum(RestaurantAnalytics.reservations), 0),
        )
        .filter(RestaurantAnalytics.restaurant_id == id)
        .one()
    )

    views, unique_visitors, search_appearances, clicks, reservations = totals

    ctr = float(clicks / search_appearances) if search_appearances else 0.0
    performance_score = float((views * 0.2) + (ctr * 100.0 * 0.4) + (reservations * 0.4))

    result = {
        "views": int(views),
        "unique_visitors": int(unique_visitors),
        "search_appearances": int(search_appearances),
        "clicks": int(clicks),
        "ctr": float(ctr),
        "reservations": int(reservations),
        "performance_score": float(performance_score),
    }

    if REDIS_AVAILABLE and redis_raw_client:
        redis_raw_client.setex(cache_key, 300, __import__("json").dumps(result))

    return result


@router.get("/restaurant/{id}/timeline")
def restaurant_analytics_timeline(
    id: int,
    days: int = 30,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if getattr(current_user, "role", None) in ["owner", "restaurant_owner"]:
        if restaurant.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Owner access required")

    cache_key = f"analytics:{id}:timeline:{days}"
    if REDIS_AVAILABLE and redis_raw_client:
        cached = redis_raw_client.get(cache_key)
        if cached:
            return cached

    start = date.today() - timedelta(days=days)

    rows = (
        db.query(
            RestaurantAnalytics.date,
            RestaurantAnalytics.profile_views,
            RestaurantAnalytics.clicks,
            RestaurantAnalytics.reservations,
            RestaurantAnalytics.search_appearances,
        )
        .filter(
            RestaurantAnalytics.restaurant_id == id,
            RestaurantAnalytics.date >= start,
        )
        .order_by(RestaurantAnalytics.date.asc())
        .all()
    )

    result = []
    for r in rows:
        ctr = float((r.clicks or 0) / (r.search_appearances or 0)) if (r.search_appearances or 0) else 0.0
        result.append(
            {
                "date": r.date.isoformat(),
                "views": int(r.profile_views or 0),
                "clicks": int(r.clicks or 0),
                "reservations": int(r.reservations or 0),
                "ctr": float(ctr),
            }
        )

    if REDIS_AVAILABLE and redis_raw_client:
        redis_raw_client.setex(cache_key, 300, __import__("json").dumps(result))

    return result


@router.get("/restaurant/{id}/popular-hours")
def popular_hours(
    id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if getattr(current_user, "role", None) in ["owner", "restaurant_owner"]:
        if restaurant.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Owner access required")

    return get_popular_hours(db, id)
