from pydantic import BaseModel


class PromotionCreate(BaseModel):
    restaurant_id: int
    promotion_type: str
    duration_days: int
