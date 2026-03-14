from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("menu_categories.id"))
    name = Column(String)
    description = Column(Text)
    price = Column(Float)
    image_url = Column(String)
    is_popular = Column(Boolean, default=False)

    category = relationship("MenuCategory", back_populates="items")
