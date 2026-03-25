from sqlalchemy.orm import Session

from app.models.restaurant_tier import RestaurantTier


def seed_default_restaurant_tiers(db: Session) -> None:
    existing = db.query(RestaurantTier).count()
    if existing > 0:
        return

    tiers = [
        RestaurantTier(id=1, name="Free",     price=0.0,   features="Basic listing",       priority_rank=0),
        RestaurantTier(id=2, name="Silver",   price=49.0,  features="Better visibility",   priority_rank=10),
        RestaurantTier(id=3, name="Gold",     price=99.0,  features="Top search results",  priority_rank=25),
        RestaurantTier(id=4, name="Platinum", price=199.0, features="Premium promotion",   priority_rank=50),
    ]
    for tier in tiers:
        db.add(tier)
    db.commit()


def seed_demo_user(db: Session) -> None:
    """Ensure demo@sufi.ai owner account always exists, and owns restaurant 1."""
    from app.models.user import User
    from app.utils.password_hash import hash_password

    try:
        existing = db.query(User).filter(User.email == "demo@sufi.ai").first()
        if not existing:
            existing = User(
                name="Demo Owner",
                email="demo@sufi.ai",
                password_hash=hash_password("demo1234"),
                role="owner",
            )
            db.add(existing)
            db.commit()
            db.refresh(existing)

        # Reassign restaurant 1 to demo user so all owner routes work
        try:
            from app.models.restaurant import Restaurant
            restaurant = db.query(Restaurant).filter(Restaurant.id == 1).first()
            if restaurant and str(restaurant.owner_id) != str(existing.id):
                restaurant.owner_id = existing.id
                db.commit()
        except Exception:
            db.rollback()  # schema might be out of sync — skip silently

    except Exception as e:
        db.rollback()
        print(f"seed_demo_user skipped: {e}")
