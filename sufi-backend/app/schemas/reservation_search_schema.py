from pydantic import BaseModel
from datetime import datetime

class ReservationSearchRequest(BaseModel):
    location: str
    date: datetime
    time: datetime
    guests: int
