from pydantic import BaseModel


class RestaurantLocationCreate(BaseModel):
    name: str
    city: str
    address: str
    description: str | None = None
    cuisine: str | None = None
    price_range: str | None = None
    tier_id: int | None = None
    latitude: float | None = None
    longitude: float | None = None
