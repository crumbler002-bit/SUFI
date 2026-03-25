from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class RestaurantTable(Base):
    __tablename__ = "restaurant_tables"

    id = Column(Integer, primary_key=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    table_number = Column(Integer)
    capacity = Column(Integer)
    
    # Relationship
    restaurant = relationship("Restaurant", back_populates="tables")
