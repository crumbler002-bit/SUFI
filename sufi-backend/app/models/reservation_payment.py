from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from datetime import datetime

from app.database import Base


class ReservationPayment(Base):
    __tablename__ = "reservation_payments"

    id = Column(Integer, primary_key=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"))
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    commission_amount = Column(Float)
    payment_status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
