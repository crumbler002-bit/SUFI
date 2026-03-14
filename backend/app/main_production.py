from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.config import settings

# Import middleware
from app.middleware.rate_limit_middleware import RateLimitMiddleware, LoginRateLimitMiddleware
from app.middleware.logging_middleware import LoggingMiddleware, SecurityLoggingMiddleware, ErrorLoggingMiddleware

# Import all models to ensure they're registered
from app.models import (
    reservation,
    reservation_payment,
    restaurant_brand,
    restaurant_image,
    restaurant_table,
    restaurant_tier,
    restaurant,
    review,
    user,
    user_preference
)

# Create database tables
Base.metadata.create_all(bind=engine)

from app.database import SessionLocal
from app.seed import seed_default_restaurant_tiers

db = SessionLocal()
try:
    seed_default_restaurant_tiers(db)
finally:
    db.close()

# Import routes
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

# Create FastAPI app
app = FastAPI(
    title="SUFI API - Production",
    description="Restaurant Reservation System - Production Ready",
    version="2.0.0"
)

# Add CORS middleware with environment-based origins
origins = settings.ALLOWED_ORIGINS.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add production middleware in correct order
# 1. Error logging first (catches everything)
app.add_middleware(ErrorLoggingMiddleware)

# 2. Security logging
app.add_middleware(SecurityLoggingMiddleware)

# 3. Rate limiting
app.add_middleware(RateLimitMiddleware)
app.add_middleware(LoginRateLimitMiddleware)

# 4. General logging
app.add_middleware(LoggingMiddleware)

# Include routes
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

# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "2.0.0"
    }

@app.get("/")
def root():
    return {"message": "SUFI backend running - Production Ready"}

# Startup event
@app.on_event("startup")
async def startup_event():
    import logging
    logger = logging.getLogger(__name__)
    logger.info("SUFI Backend starting up...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Database: Connected")
    logger.info(f"Rate Limiting: {settings.RATE_LIMIT_REQUESTS} requests/{settings.RATE_LIMIT_WINDOW}s")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    import logging
    logger = logging.getLogger(__name__)
    logger.info("SUFI Backend shutting down...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_production:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
        log_level=settings.LOG_LEVEL.lower()
    )
