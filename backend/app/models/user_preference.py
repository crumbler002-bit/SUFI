from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.database import Base

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    cuisine = Column(String, nullable=False)
    weight = Column(Integer, default=1)  # Preference strength (higher = stronger preference)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index('idx_user_preferences_user_cuisine', 'user_id', 'cuisine'),
        Index('idx_user_preferences_weight', 'weight'),
    )
