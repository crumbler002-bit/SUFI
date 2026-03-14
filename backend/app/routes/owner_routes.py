from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.restaurant import Restaurant
from app.models.restaurant_brand import RestaurantBrand
from app.models.reservation import Reservation
from app.middleware.auth_middleware import get_current_user
from app.schemas.restaurant_location_schema import RestaurantLocationCreate
from app.utils.search_client import index_restaurant

router = APIRouter(prefix="/owner")

@router.get("/restaurants")
def owner_restaurants(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    brands = db.query(RestaurantBrand).filter(
        RestaurantBrand.owner_id == current_user.id
    ).all()

    locations = db.query(Restaurant).filter(
        Restaurant.owner_id == current_user.id
    ).all()

    locations_by_brand: dict[int | None, list] = {}
    for loc in locations:
        locations_by_brand.setdefault(loc.brand_id, []).append(loc)

    result = []
    for brand in brands:
        locs = locations_by_brand.get(brand.id, [])
        result.append({
            "brand": {
                "id": brand.id,
                "name": brand.name,
                "description": brand.description,
            },
            "locations": [
                {
                    "id": r.id,
                    "name": r.name,
                    "city": r.city,
                    "address": r.address,
                    "tier_id": r.tier_id,
                    "is_featured": r.is_featured,
                    "rating": r.rating,
                }
                for r in locs
            ],
        })

    unbranded = locations_by_brand.get(None, [])
    if unbranded:
        result.append({
            "brand": None,
            "locations": [
                {
                    "id": r.id,
                    "name": r.name,
                    "city": r.city,
                    "address": r.address,
                    "tier_id": r.tier_id,
                    "is_featured": r.is_featured,
                    "rating": r.rating,
                }
                for r in unbranded
            ],
        })

    return result


@router.post("/restaurants/{brand_id}/locations")
def create_location(
    brand_id: int,
    data: RestaurantLocationCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")

    brand = db.query(RestaurantBrand).filter(
        RestaurantBrand.id == brand_id,
        RestaurantBrand.owner_id == current_user.id,
    ).first()

    if brand is None:
        raise HTTPException(status_code=404, detail="Brand not found")

    location = Restaurant(
        brand_id=brand.id,
        owner_id=current_user.id,
        name=data.name,
        city=data.city,
        address=data.address,
        latitude=data.latitude,
        longitude=data.longitude,
        description=data.description or brand.description,
        cuisine=data.cuisine,
        price_range=data.price_range,
        tier_id=data.tier_id,
    )

    db.add(location)
    db.commit()
    db.refresh(location)

    index_restaurant(location)

    return {"brand_id": brand.id, "location": location}

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
