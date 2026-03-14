from pydantic import BaseModel


class AnalyticsClickCreate(BaseModel):
    restaurant_id: int
