from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.restaurant import Restaurant
from app.schemas.dynamic_pricing_schema import PricingRuleCreate, PricingRuleUpdate, PricingRuleOut
from app.services.dynamic_pricing_service import (
    create_rule,
    list_rules,
    update_rule,
    delete_rule,
)

router = APIRouter(prefix="/pricing-rules", tags=["dynamic-pricing"])


def _assert_owner(db: Session, restaurant_id: int, current_user) -> Restaurant:
    """Verify the current user owns the restaurant."""
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == restaurant_id,
        Restaurant.owner_id == current_user.id,
    ).first()
    if restaurant is None:
        raise HTTPException(status_code=404, detail="Restaurant not found or access denied")
    return restaurant


@router.post("/{restaurant_id}", response_model=PricingRuleOut)
def create_pricing_rule(
    restaurant_id: int,
    data: PricingRuleCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Owner: create a new dynamic pricing rule for a restaurant."""
    _assert_owner(db, restaurant_id, current_user)
    rule = create_rule(db, restaurant_id, data.model_dump())
    return rule


@router.get("/{restaurant_id}", response_model=list[PricingRuleOut])
def get_pricing_rules(
    restaurant_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Owner: list all pricing rules for a restaurant, ordered by start_time."""
    _assert_owner(db, restaurant_id, current_user)
    return list_rules(db, restaurant_id)


@router.patch("/{restaurant_id}/{rule_id}", response_model=PricingRuleOut)
def patch_pricing_rule(
    restaurant_id: int,
    rule_id: int,
    data: PricingRuleUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Owner: update fields on an existing pricing rule."""
    _assert_owner(db, restaurant_id, current_user)
    try:
        rule = update_rule(db, rule_id, data.model_dump(exclude_none=True))
        return rule
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{restaurant_id}/{rule_id}")
def remove_pricing_rule(
    restaurant_id: int,
    rule_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Owner: delete a pricing rule."""
    _assert_owner(db, restaurant_id, current_user)
    try:
        delete_rule(db, rule_id)
        return {"status": "deleted", "rule_id": rule_id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
