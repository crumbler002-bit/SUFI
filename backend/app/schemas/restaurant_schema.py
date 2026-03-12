from pydantic import BaseModel

class RestaurantCreate(BaseModel):
    name: str
    description: str
    cuisine: str
    city: str
    address: str
    tier_id: int
    latitude: float = None
    longitude: float = None
