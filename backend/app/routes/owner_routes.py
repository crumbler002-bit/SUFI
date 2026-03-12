from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.restaurant import Restaurant
from app.models.reservation import Reservation
from app.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/owner")

@router.get("/restaurants")
def owner_restaurants(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    return db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).all()

@router.get("/reservations")
def owner_reservations(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    restaurants = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).all()

    ids = [r.id for r in restaurants]

    return db.query(Reservation).filter(
        Reservation.restaurant_id.in_(ids)
    ).all()
