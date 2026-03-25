from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class RestaurantBrand(Base):
    __tablename__ = "restaurant_brands"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User")
    locations = relationship("Restaurant", back_populates="brand")
