from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.restaurant import Restaurant
from app.models.restaurant_image import RestaurantImage
from app.middleware.auth_middleware import get_current_user
from app.schemas.restaurant_image_schema import (
    RestaurantImageCreate,
    RestaurantImageReorderRequest,
)


router = APIRouter(prefix="/restaurants", tags=["media"])


@router.post("/{id}/images")
def upload_image(
    id: int,
    data: RestaurantImageCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Owner access required")

    image = RestaurantImage(
        restaurant_id=id,
        image_url=data.image_url,
        image_type=data.image_type,
        position=data.position,
    )

    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.get("/{id}/images")
def get_images(id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    images = (
        db.query(RestaurantImage)
        .filter(RestaurantImage.restaurant_id == id)
        .order_by(RestaurantImage.position.asc().nullslast(), RestaurantImage.id.asc())
        .all()
    )
    return images


@router.delete("/images/{image_id}")
def delete_image(
    image_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    image = db.query(RestaurantImage).filter(RestaurantImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    restaurant = db.query(Restaurant).filter(Restaurant.id == image.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Owner access required")

    db.delete(image)
    db.commit()
    return {"message": "Image deleted"}


@router.patch("/images/reorder")
def reorder_images(
    payload: RestaurantImageReorderRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == payload.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Owner access required")

    images = (
        db.query(RestaurantImage)
        .filter(RestaurantImage.restaurant_id == payload.restaurant_id)
        .all()
    )
    images_by_id = {img.id: img for img in images}

    for item in payload.items:
        img = images_by_id.get(item.id)
        if img is None:
            raise HTTPException(status_code=404, detail=f"Image not found: {item.id}")
        img.position = item.position

    db.commit()

    updated = (
        db.query(RestaurantImage)
        .filter(RestaurantImage.restaurant_id == payload.restaurant_id)
        .order_by(RestaurantImage.position.asc().nullslast(), RestaurantImage.id.asc())
        .all()
    )
    return updated
