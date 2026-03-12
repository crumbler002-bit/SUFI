from pydantic import BaseModel
from datetime import datetime

class ReservationCreate(BaseModel):
    restaurant_id: int
    table_id: int
    reservation_time: datetime
    guests: int
