from pydantic import BaseModel


class MenuCategoryCreate(BaseModel):
    restaurant_id: int
    name: str


class MenuItemCreate(BaseModel):
    category_id: int
    name: str
    description: str | None = None
    price: float
    image_url: str | None = None
    is_popular: bool = False


class MenuItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    image_url: str | None = None
    is_popular: bool | None = None
