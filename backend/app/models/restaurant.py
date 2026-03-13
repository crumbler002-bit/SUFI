from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Index, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    cuisine = Column(String)
    city = Column(String)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    rating = Column(Float)
    price_range = Column(String)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    tier_id = Column(Integer, ForeignKey("restaurant_tiers.id"), nullable=True)
    subscription_start = Column(DateTime, nullable=True)
    subscription_end = Column(DateTime, nullable=True)
    is_featured = Column(Boolean, default=False)
    commission_rate = Column(Float, default=0.05)
    total_reviews = Column(Integer, default=0)
    reservation_count = Column(Integer, default=0)
    popularity_score = Column(Float, default=0.0)
    embedding = Column(JSON)  # Store embedding vector as JSON
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    images = relationship("RestaurantImage", back_populates="restaurant")
    tables = relationship("RestaurantTable", back_populates="restaurant")
    reservations = relationship("Reservation", back_populates="restaurant")
    reviews = relationship("Review", back_populates="restaurant")
    tier = relationship("RestaurantTier", back_populates="restaurants")

    __table_args__ = (
        Index('idx_restaurants_city', 'city'),
        Index('idx_restaurants_cuisine', 'cuisine'),
        Index('idx_restaurants_rating', 'rating'),
        Index('idx_restaurants_featured', 'is_featured'),
    )
