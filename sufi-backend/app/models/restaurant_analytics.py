from sqlalchemy import Column, Integer, ForeignKey, Date
from sqlalchemy.orm import relationship

from app.database import Base


class RestaurantAnalytics(Base):
    __tablename__ = "restaurant_analytics"

    id = Column(Integer, primary_key=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    date = Column(Date)

    profile_views = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    search_appearances = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    reservations = Column(Integer, default=0)

    restaurant = relationship("Restaurant")
