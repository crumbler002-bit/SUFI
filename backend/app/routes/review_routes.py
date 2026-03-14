from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.review import Review
from app.models.restaurant import Restaurant
from app.schemas.review_schema import ReviewCreate

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post("")
def create_review(
    review: ReviewCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify restaurant exists
    restaurant = db.query(Restaurant).filter(Restaurant.id == review.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Create review
    new_review = Review(
        restaurant_id=review.restaurant_id,
        user_id=current_user.id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(new_review)

    # Update restaurant aggregated rating and total_reviews
    old_total = restaurant.total_reviews or 0
    old_rating = restaurant.rating or 0.0

    restaurant.total_reviews = old_total + 1
    restaurant.rating = ((old_rating * old_total) + review.rating) / restaurant.total_reviews

    db.commit()

    return {"message": "Review added successfully"}

@router.get("/restaurants/{restaurant_id}/reviews")
def get_reviews(restaurant_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.restaurant_id == restaurant_id).all()
    return reviews


@router.get("/analytics/{restaurant_id}")
def get_review_analytics(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    total_reviews = (
        db.query(func.count(Review.id))
        .filter(Review.restaurant_id == restaurant_id)
        .scalar()
        or 0
    )

    average_rating = (
        db.query(func.avg(Review.rating))
        .filter(Review.restaurant_id == restaurant_id)
        .scalar()
    )

    distribution_rows = (
        db.query(Review.rating, func.count(Review.id))
        .filter(Review.restaurant_id == restaurant_id)
        .group_by(Review.rating)
        .all()
    )

    distribution: dict[str, int] = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
    for rating, count in distribution_rows:
        key = str(int(round(rating)))
        if key in distribution:
            distribution[key] = int(count)
        else:
            distribution[key] = int(count)

    return {
        "average_rating": float(average_rating) if average_rating is not None else 0.0,
        "total_reviews": int(total_reviews),
        "distribution": distribution,
    }
