from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class RestaurantTier(Base):
    __tablename__ = "restaurant_tiers"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    price = Column(Float)
    features = Column(String)
    priority_rank = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    restaurants = relationship("Restaurant", back_populates="tier")
