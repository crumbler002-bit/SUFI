from pydantic import BaseModel, Field, model_validator
from datetime import time
from typing import Optional, Literal


class PricingRuleCreate(BaseModel):
    start_time: time
    end_time: time
    demand_level: Literal["low", "medium", "high", "any"] = "any"
    discount_percent: Optional[int] = Field(None, ge=1, le=100)
    minimum_spend: Optional[int] = Field(None, ge=0)
    special_offer: Optional[str] = None
    is_active: bool = True

    @model_validator(mode="after")
    def at_least_one_action(self):
        if not any([self.discount_percent, self.minimum_spend, self.special_offer]):
            raise ValueError("At least one of discount_percent, minimum_spend, or special_offer must be set")
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self


class PricingRuleUpdate(BaseModel):
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    demand_level: Optional[Literal["low", "medium", "high", "any"]] = None
    discount_percent: Optional[int] = Field(None, ge=1, le=100)
    minimum_spend: Optional[int] = Field(None, ge=0)
    special_offer: Optional[str] = None
    is_active: Optional[bool] = None


class PricingRuleOut(BaseModel):
    id: int
    restaurant_id: int
    start_time: time
    end_time: time
    demand_level: str
    discount_percent: Optional[int]
    minimum_spend: Optional[int]
    special_offer: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True
