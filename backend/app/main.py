from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.database import engine, Base

# IMPORTANT: import all models
from app.models import (
    reservation,
    reservation_payment,
    restaurant_brand,
    restaurant_image,
    restaurant_table,
    restaurant_tier,
    restaurant,
    restaurant_tag,
    menu_category,
    menu_item,
    restaurant_analytics,
    restaurant_promotion,
    review,
    user
)

Base.metadata.create_all(bind=engine)

from app.database import SessionLocal
from app.seed import seed_default_restaurant_tiers

db = SessionLocal()
try:
    seed_default_restaurant_tiers(db)
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
    vector_routes
)

app = FastAPI(title="SUFI API")

# Get allowed origins from environment variable
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
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

@app.get("/")
def root():
    return {"message": "SUFI backend running"}
