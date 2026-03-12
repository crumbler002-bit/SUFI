from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
    ws_routes
)

app = FastAPI(title="SUFI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
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

@app.get("/")
def root():
    return {"message": "SUFI backend running"}
