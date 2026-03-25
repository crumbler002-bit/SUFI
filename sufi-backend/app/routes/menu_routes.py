from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.menu_category import MenuCategory
from app.models.menu_item import MenuItem
from app.models.restaurant import Restaurant
from app.schemas.menu_schema import MenuCategoryCreate, MenuItemCreate, MenuItemUpdate


router = APIRouter(prefix="/menu", tags=["menu"])


@router.post("/category")
def create_category(
    data: MenuCategoryCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == data.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Owner access required")

    category = MenuCategory(restaurant_id=data.restaurant_id, name=data.name)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.post("/item")
def add_menu_item(
    data: MenuItemCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = db.query(MenuCategory).filter(MenuCategory.id == data.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    restaurant = db.query(Restaurant).filter(Restaurant.id == category.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Owner access required")

    item = MenuItem(
        category_id=data.category_id,
        name=data.name,
        description=data.description,
        price=data.price,
        image_url=data.image_url,
        is_popular=data.is_popular,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/item/{id}")
def update_menu_item(
    id: int,
    data: MenuItemUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(MenuItem).filter(MenuItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    category = db.query(MenuCategory).filter(MenuCategory.id == item.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    restaurant = db.query(Restaurant).filter(Restaurant.id == category.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Owner access required")

    if data.name is not None:
        item.name = data.name
    if data.description is not None:
        item.description = data.description
    if data.price is not None:
        item.price = data.price
    if data.image_url is not None:
        item.image_url = data.image_url
    if data.is_popular is not None:
        item.is_popular = data.is_popular

    db.commit()
    db.refresh(item)
    return item


@router.delete("/item/{id}")
def delete_menu_item(
    id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(MenuItem).filter(MenuItem.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    category = db.query(MenuCategory).filter(MenuCategory.id == item.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    restaurant = db.query(Restaurant).filter(Restaurant.id == category.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if getattr(current_user, "role", None) not in ["owner", "restaurant_owner"]:
        raise HTTPException(status_code=403, detail="Owner access required")
    if restaurant.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Owner access required")

    db.delete(item)
    db.commit()
    return {"message": "Menu item deleted"}


@router.get("/{restaurant_id}")
def fetch_menu(restaurant_id: int, db: Session = Depends(get_db)):
    categories = (
        db.query(MenuCategory)
        .filter(MenuCategory.restaurant_id == restaurant_id)
        .order_by(MenuCategory.id.asc())
        .all()
    )

    result = []
    for c in categories:
        items = (
            db.query(MenuItem)
            .filter(MenuItem.category_id == c.id)
            .order_by(MenuItem.id.asc())
            .all()
        )
        result.append(
            {
                "id": c.id,
                "restaurant_id": c.restaurant_id,
                "name": c.name,
                "items": items,
            }
        )

    return {"restaurant_id": restaurant_id, "categories": result}
