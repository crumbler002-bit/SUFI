from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.restaurant import Restaurant
from app.models.restaurant_promotion import RestaurantPromotion
from app.schemas.promotion_schema import PromotionCreate
from app.services.promotion_service import create_promotion, expire_promotions


router = APIRouter(prefix="/promotions", tags=["promotions"])


@router.post("/create")
def create(data: PromotionCreate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == data.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Owner access required")

    try:
        promo = create_promotion(db, data.restaurant_id, data.promotion_type, data.duration_days)
        return promo
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/restaurant/{restaurant_id}")
def list_promotions(restaurant_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Owner access required")

    expire_promotions(db)

    promos = (
        db.query(RestaurantPromotion)
        .filter(RestaurantPromotion.restaurant_id == restaurant_id)
        .order_by(RestaurantPromotion.active.desc(), RestaurantPromotion.end_date.desc())
        .all()
    )

    return promos


@router.get("/performance/{promotion_id}")
def promotion_performance(promotion_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    promo = db.query(RestaurantPromotion).filter(RestaurantPromotion.id == promotion_id).first()
    if not promo:
        raise HTTPException(status_code=404, detail="Promotion not found")

    restaurant = db.query(Restaurant).filter(Restaurant.id == promo.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Owner access required")

    impressions = int(promo.promotion_impressions or 0)
    clicks = int(promo.promotion_clicks or 0)
    reservations = int(promo.promotion_reservations or 0)
    ctr = float(clicks / impressions) if impressions else 0.0

    return {
        "promotion_id": promo.id,
        "impressions": impressions,
        "clicks": clicks,
        "reservations": reservations,
        "ctr": ctr,
    }
