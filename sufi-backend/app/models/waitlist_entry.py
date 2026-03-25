import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"

    id = Column(Integer, primary_key=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    guests = Column(Integer, nullable=False)
    requested_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=90)
    # waiting | assigned | expired | cancelled
    status = Column(String, default="waiting", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    restaurant = relationship("Restaurant")
    user = relationship("User")

    __table_args__ = (
        Index("idx_waitlist_restaurant_status", "restaurant_id", "status"),
        Index("idx_waitlist_user", "user_id"),
    )
