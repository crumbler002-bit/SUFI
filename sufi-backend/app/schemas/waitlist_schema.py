from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class WaitlistJoin(BaseModel):
    restaurant_id: int
    guests: int = Field(..., ge=1, le=20)
    requested_time: datetime
    duration_minutes: int = Field(default=90, ge=30, le=300)


class WaitlistEntryOut(BaseModel):
    id: int
    restaurant_id: int
    user_id: str
    guests: int
    requested_time: datetime
    duration_minutes: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
