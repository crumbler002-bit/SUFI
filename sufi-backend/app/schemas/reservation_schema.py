from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ReservationCreate(BaseModel):
    restaurant_id: int
    table_id: int
    reservation_time: datetime
    guests: int


class ReservationAutoCreate(BaseModel):
    """
    Reservation creation without a table_id.
    The Table Optimization Engine selects the best available table automatically.
    """
    restaurant_id: int
    reservation_time: datetime
    guests: int = Field(..., ge=1, le=20)
    duration_minutes: int = Field(default=90, ge=30, le=300)
    special_requests: Optional[str] = None
