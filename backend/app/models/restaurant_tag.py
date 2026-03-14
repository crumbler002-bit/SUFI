from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class RestaurantTag(Base):
    __tablename__ = "restaurant_tags"

    id = Column(Integer, primary_key=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    tag = Column(String)

    restaurant = relationship("Restaurant", back_populates="tags")
