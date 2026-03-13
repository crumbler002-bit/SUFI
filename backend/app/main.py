from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.database import engine, Base

# IMPORTANT: import all models
from app.models import (
    reservation,
    reservation_payment,
    restaurant_image,
    restaurant_table,
    restaurant_tier,
    restaurant,
    review,
    user
)

Base.metadata.create_all(bind=engine)

from app.routes import (
    auth_routes,
    restaurant_routes,
    reservation_routes,
    discover_routes,
    trending_routes,
    owner_routes,
    subscription_routes,
    review_routes,
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
app.include_router(reservation_routes.router)
app.include_router(discover_routes.router)
app.include_router(trending_routes.router)
app.include_router(owner_routes.router)
app.include_router(subscription_routes.router)
app.include_router(review_routes.router)
app.include_router(location_routes.router)
app.include_router(ws_routes.router)
app.include_router(vector_routes.router)

@app.get("/")
def root():
    return {"message": "SUFI backend running"}
