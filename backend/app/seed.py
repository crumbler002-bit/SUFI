from sqlalchemy.orm import Session

from app.models.restaurant_tier import RestaurantTier


def seed_default_restaurant_tiers(db: Session) -> None:
    existing = db.query(RestaurantTier).count()
    if existing > 0:
        return

    tiers = [
        RestaurantTier(
            id=1,
            name="Free",
            price=0.0,
            features="Basic listing",
            priority_rank=0,
        ),
        RestaurantTier(
            id=2,
            name="Silver",
            price=49.0,
            features="Better visibility",
            priority_rank=10,
        ),
        RestaurantTier(
            id=3,
            name="Gold",
            price=99.0,
            features="Top search results",
            priority_rank=25,
        ),
        RestaurantTier(
            id=4,
            name="Platinum",
            price=199.0,
            features="Premium promotion",
            priority_rank=50,
        ),
    ]

    for tier in tiers:
        db.add(tier)

    db.commit()
