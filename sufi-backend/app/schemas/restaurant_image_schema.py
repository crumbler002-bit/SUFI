from pydantic import BaseModel


class RestaurantImageCreate(BaseModel):
    image_url: str
    image_type: str | None = None
    position: int | None = None


class RestaurantImageReorderItem(BaseModel):
    id: int
    position: int


class RestaurantImageReorderRequest(BaseModel):
    restaurant_id: int
    items: list[RestaurantImageReorderItem]
