from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

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
