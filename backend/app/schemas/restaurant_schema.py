from pydantic import BaseModel

class RestaurantCreate(BaseModel):
    brand_name: str | None = None
    name: str
    description: str
    cuisine: str
    city: str
    address: str
    tier_id: int
    latitude: float = None
    longitude: float = None
