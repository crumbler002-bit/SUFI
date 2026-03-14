from datetime import datetime, timedelta

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.constants.promotion_boost import PROMOTION_BOOST, MAX_ACTIVE_PROMOTIONS, MAX_DURATION_DAYS, COOLDOWN_DAYS
from app.models.restaurant_promotion import RestaurantPromotion
from app.services.recommendation_service import get_tier_boost


def expire_promotions(db: Session) -> int:
    now = datetime.utcnow()
    promotions = (
        db.query(RestaurantPromotion)
        .filter(RestaurantPromotion.end_date < now, RestaurantPromotion.active == True)
        .all()
    )

    for p in promotions:
        p.active = False

    db.commit()
    return len(promotions)


def get_active_promotion_boost(db: Session, restaurant_id: int) -> int:
    now = datetime.utcnow()
    active_promotions = (
        db.query(RestaurantPromotion)
        .filter(
            RestaurantPromotion.restaurant_id == restaurant_id,
            RestaurantPromotion.active == True,
            RestaurantPromotion.start_date <= now,
            RestaurantPromotion.end_date >= now,
        )
        .all()
    )

    return int(sum((p.boost_score or 0) for p in active_promotions))


def create_promotion(
    db: Session,
    restaurant_id: int,
    promotion_type: str,
    duration_days: int,
) -> RestaurantPromotion:
    if promotion_type not in PROMOTION_BOOST:
        raise ValueError("Invalid promotion type")

    if duration_days <= 0 or duration_days > MAX_DURATION_DAYS:
        raise ValueError("Invalid duration")

    expire_promotions(db)

    now = datetime.utcnow()

    active_count = (
        db.query(func.count(RestaurantPromotion.id))
        .filter(
            RestaurantPromotion.restaurant_id == restaurant_id,
            RestaurantPromotion.active == True,
            RestaurantPromotion.end_date >= now,
        )
        .scalar()
        or 0
    )

    if int(active_count) >= MAX_ACTIVE_PROMOTIONS:
        raise ValueError("Too many active promotions")

    latest = (
        db.query(RestaurantPromotion)
        .filter(RestaurantPromotion.restaurant_id == restaurant_id)
        .order_by(RestaurantPromotion.end_date.desc())
        .first()
    )

    if latest and latest.end_date:
        cooldown_until = latest.end_date + timedelta(days=COOLDOWN_DAYS)
        if cooldown_until > now:
            raise ValueError("Promotion cooldown active")

    promo = RestaurantPromotion(
        restaurant_id=restaurant_id,
        promotion_type=promotion_type,
        start_date=now,
        end_date=now + timedelta(days=duration_days),
        boost_score=int(PROMOTION_BOOST[promotion_type]),
        active=True,
    )

    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo


def calculate_quality_score(restaurant) -> float:
    rating = float(getattr(restaurant, "rating", 0.0) or 0.0)
    total_reviews = float(getattr(restaurant, "total_reviews", 0.0) or 0.0)
    reservation_count = float(getattr(restaurant, "reservation_count", 0.0) or 0.0)

    return (rating * 50.0) + (total_reviews * 0.2) + (reservation_count * 0.2)


def calculate_final_ranking(db: Session, restaurant) -> float:
    quality_score = calculate_quality_score(restaurant)
    tier_boost = float(get_tier_boost(restaurant))

    promotion_boost = float(get_active_promotion_boost(db, restaurant.id))

    return float(quality_score + tier_boost + promotion_boost)


def mark_promotion_impressions(db: Session, restaurant_ids: list[int]) -> None:
    now = datetime.utcnow()
    promos = (
        db.query(RestaurantPromotion)
        .filter(
            RestaurantPromotion.restaurant_id.in_(restaurant_ids),
            RestaurantPromotion.active == True,
            RestaurantPromotion.start_date <= now,
            RestaurantPromotion.end_date >= now,
        )
        .all()
    )

    for p in promos:
        p.promotion_impressions = (p.promotion_impressions or 0) + 1

    db.commit()


def mark_promotion_click(db: Session, restaurant_id: int) -> None:
    now = datetime.utcnow()
    promos = (
        db.query(RestaurantPromotion)
        .filter(
            RestaurantPromotion.restaurant_id == restaurant_id,
            RestaurantPromotion.active == True,
            RestaurantPromotion.start_date <= now,
            RestaurantPromotion.end_date >= now,
        )
        .all()
    )

    for p in promos:
        p.promotion_clicks = (p.promotion_clicks or 0) + 1

    db.commit()


def mark_promotion_reservation(db: Session, restaurant_id: int) -> None:
    now = datetime.utcnow()
    promos = (
        db.query(RestaurantPromotion)
        .filter(
            RestaurantPromotion.restaurant_id == restaurant_id,
            RestaurantPromotion.active == True,
            RestaurantPromotion.start_date <= now,
            RestaurantPromotion.end_date >= now,
        )
        .all()
    )

    for p in promos:
        p.promotion_reservations = (p.promotion_reservations or 0) + 1

    db.commit()
