from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
from pathlib import Path

from app.database import engine, Base

# IMPORTANT: import all models
# Import all models via __init__ (handles dependency order)
from app.models import (
    User, UserPreference, RestaurantTier, RestaurantBrand, Restaurant,
    RestaurantImage, RestaurantTag, RestaurantAnalytics, RestaurantPromotion,
    MenuCategory, MenuItem, RestaurantTable, Reservation, ReservationPayment,
    Review, WaitlistEntry, DynamicPricingRule, AutomationAction, Notification,
)

Base.metadata.create_all(bind=engine)

from app.database import SessionLocal
from app.seed import seed_default_restaurant_tiers, seed_demo_user

db = SessionLocal()
try:
    seed_default_restaurant_tiers(db)
    seed_demo_user(db)
finally:
    db.close()

from app.routes import (
    auth_routes,
    restaurant_routes,
    restaurant_media_routes,
    menu_routes,
    reservation_routes,
    discover_routes,
    trending_routes,
    owner_routes,
    subscription_routes,
    review_routes,
    analytics_routes,
    promotion_routes,
    recommendation_routes,
    location_routes,
    ws_routes,
    vector_routes,
    waitlist_routes,
    dynamic_pricing_routes,
    intelligence_routes,
    user_dashboard_routes,
    concierge_routes,
    owner_notification_routes,
    search,
)
from app.api.v1.discovery import router as discovery_v1_router

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from api.main import app as intelligence_app

app = FastAPI(title="SUFI API")

# Get allowed origins from environment variable
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
app.include_router(search.router, prefix="/api")
app.include_router(discovery_v1_router)
app.include_router(auth_routes.router)
app.include_router(restaurant_routes.router)
app.include_router(restaurant_media_routes.router)
app.include_router(menu_routes.router)
app.include_router(reservation_routes.router)
app.include_router(discover_routes.router)
app.include_router(trending_routes.router)
app.include_router(owner_routes.router)
app.include_router(subscription_routes.router)
app.include_router(review_routes.router)
app.include_router(analytics_routes.router)
app.include_router(promotion_routes.router)
app.include_router(recommendation_routes.router)
app.include_router(location_routes.router)
app.include_router(ws_routes.router)
app.include_router(vector_routes.router)
app.include_router(waitlist_routes.router)
app.include_router(dynamic_pricing_routes.router)
app.include_router(intelligence_routes.router)
app.include_router(intelligence_routes._automation_router)
app.include_router(user_dashboard_routes.router)
app.include_router(concierge_routes.router)
app.include_router(owner_notification_routes.router)
app.mount("/intelligence", intelligence_app)

@app.get("/")
def root():
    return {"message": "SUFI backend running"}


@app.on_event("startup")
async def warm_cache():
    """Pre-warm dashboard cache in the background — doesn't block server startup."""
    import asyncio
    asyncio.get_event_loop().run_in_executor(None, _warm_cache_sync)


def _warm_cache_sync():
    from app.services.intelligence.decision_engine import build_owner_dashboard
    from app.redis_client import redis_client as _cache
    db = SessionLocal()
    try:
        from app.models.restaurant import Restaurant
        restaurant_ids = [r.id for r in db.query(Restaurant.id).limit(10).all()]
        for rid in restaurant_ids:
            try:
                dashboard = build_owner_dashboard(db, rid)
                _cache.set(f"full:{rid}:500", dashboard, expire_seconds=60)
            except Exception:
                pass
    finally:
        db.close()
