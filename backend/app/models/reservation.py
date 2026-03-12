from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    table_id = Column(Integer, ForeignKey("restaurant_tables.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    reservation_time = Column(DateTime)
    guests = Column(Integer)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="reservations")
    table = relationship("RestaurantTable")
    user = relationship("User")

    __table_args__ = (
        Index('idx_reservations_restaurant_id', 'restaurant_id'),
        Index('idx_reservations_reservation_time', 'reservation_time'),
        Index('idx_reservations_table_time', 'table_id', 'reservation_time'),
    )
