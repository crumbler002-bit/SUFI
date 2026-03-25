from pydantic import BaseModel


class OwnerRestaurantProfileUpdate(BaseModel):
    about: str | None = None
    price_range: str | None = None
    tags: list[str] | None = None
    logo_url: str | None = None
    banner_url: str | None = None
