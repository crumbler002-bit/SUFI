from pydantic import BaseModel


class SubscribeRequest(BaseModel):
    restaurant_id: int
    tier_id: int
