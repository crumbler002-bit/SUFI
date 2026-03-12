from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from datetime import datetime

from app.database import Base


class RestaurantSubscription(Base):
    __tablename__ = "restaurant_subscriptions"

    id = Column(Integer, primary_key=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    tier_id = Column(Integer, ForeignKey("restaurant_tiers.id"))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    payment_status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
