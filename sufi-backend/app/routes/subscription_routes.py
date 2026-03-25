from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.restaurant import Restaurant
from app.models.restaurant_tier import RestaurantTier
from app.models.restaurant_subscription import RestaurantSubscription
from app.schemas.subscription_schema import SubscribeRequest

router = APIRouter(prefix="/subscriptions")


@router.post("/create")
def create_subscription(
    data: SubscribeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == data.restaurant_id)
        .first()
    )
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if str(restaurant.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your restaurant")

    tier = db.query(RestaurantTier).filter(RestaurantTier.id == data.tier_id).first()
    if tier is None:
        raise HTTPException(status_code=404, detail="Tier not found")

    now = datetime.utcnow()
    end_date = now + timedelta(days=30)

    # Create subscription record
    subscription = RestaurantSubscription(
        restaurant_id=restaurant.id,
        tier_id=tier.id,
        start_date=now,
        end_date=end_date,
        payment_status="paid"
    )
    db.add(subscription)

    # Update restaurant cached fields
    restaurant.tier_id = tier.id
    restaurant.subscription_start = now
    restaurant.subscription_end = end_date

    if tier.name and tier.name.lower() == "featured":
        restaurant.is_featured = True
    else:
        restaurant.is_featured = False

    db.commit()
    db.refresh(restaurant)

    return {
        "restaurant_id": restaurant.id,
        "tier_id": restaurant.tier_id,
        "subscription_start": restaurant.subscription_start,
        "subscription_end": restaurant.subscription_end,
        "is_featured": restaurant.is_featured,
    }


@router.get("/status")
def subscription_status(
    restaurant_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if str(restaurant.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your restaurant")

    return {
        "restaurant_id": restaurant.id,
        "tier_id": restaurant.tier_id,
        "subscription_start": restaurant.subscription_start,
        "subscription_end": restaurant.subscription_end,
        "is_featured": restaurant.is_featured,
        "commission_rate": restaurant.commission_rate,
    }


@router.post("/cancel")
def cancel_subscription(
    restaurant_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if str(restaurant.owner_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not your restaurant")

    # Cancel active subscription records
    db.query(RestaurantSubscription).filter(
        RestaurantSubscription.restaurant_id == restaurant.id,
        RestaurantSubscription.end_date > datetime.utcnow()
    ).update({"end_date": datetime.utcnow(), "payment_status": "cancelled"})

    # Clear restaurant cached fields
    restaurant.tier_id = None
    restaurant.subscription_start = None
    restaurant.subscription_end = None
    restaurant.is_featured = False

    db.commit()
    db.refresh(restaurant)

    return {
        "restaurant_id": restaurant.id,
        "tier_id": restaurant.tier_id,
        "subscription_start": restaurant.subscription_start,
        "subscription_end": restaurant.subscription_end,
        "is_featured": restaurant.is_featured,
    }
