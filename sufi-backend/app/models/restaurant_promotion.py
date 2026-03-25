from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class RestaurantPromotion(Base):
    __tablename__ = "restaurant_promotions"

    id = Column(Integer, primary_key=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))

    promotion_type = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    boost_score = Column(Integer)
    active = Column(Boolean, default=True)

    promotion_impressions = Column(Integer, default=0)
    promotion_clicks = Column(Integer, default=0)
    promotion_reservations = Column(Integer, default=0)

    restaurant = relationship("Restaurant")
