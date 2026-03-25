from datetime import datetime, time as time_type
from sqlalchemy import Column, Integer, String, Time, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base


class DynamicPricingRule(Base):
    __tablename__ = "dynamic_pricing_rules"

    id = Column(Integer, primary_key=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)

    # Time window this rule applies to (time-of-day, not date-specific)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # demand_level the restaurant expects during this window: low | medium | high | any
    demand_level = Column(String, default="any", nullable=False)

    # What the rule does (all optional — at least one should be set)
    discount_percent = Column(Integer, nullable=True)   # e.g. 20  → "20% off"
    minimum_spend = Column(Integer, nullable=True)      # e.g. 5000 (paise / cents)
    special_offer = Column(String, nullable=True)       # e.g. "Free dessert"

    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    restaurant = relationship("Restaurant")

    __table_args__ = (
        Index("idx_pricing_rules_restaurant", "restaurant_id"),
    )
