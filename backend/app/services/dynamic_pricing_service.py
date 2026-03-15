"""
Dynamic Pricing Service
Restaurants define time-based rules; SUFI evaluates them against real-time
demand and attaches the matching offer to reservation search results.

Demand levels:
  low    → fill_ratio < 0.3
  medium → 0.3 <= fill_ratio < 0.7
  high   → fill_ratio >= 0.7
"""

from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.models.dynamic_pricing_rule import DynamicPricingRule
from app.models.reservation import Reservation
from app.models.restaurant_table import RestaurantTable

# ── Demand thresholds ────────────────────────────────────────────────────────
LOW_THRESHOLD = 0.3
HIGH_THRESHOLD = 0.7


def get_demand_level(db: Session, restaurant_id: int, slot_time: datetime) -> str:
    """
    Compute demand level for a restaurant at a specific time slot.
    fill_ratio = active reservations in the slot / total table count
    """
    total_tables = (
        db.query(func.count(RestaurantTable.id))
        .filter(RestaurantTable.restaurant_id == restaurant_id)
        .scalar()
        or 1  # avoid division by zero
    )

    slot_date = slot_time.date()
    slot_hour = slot_time.hour

    booked = (
        db.query(func.count(Reservation.id))
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.status.notin_(["cancelled"]),
            func.date(Reservation.reservation_time) == slot_date,
            func.extract("hour", Reservation.reservation_time) == slot_hour,
        )
        .scalar()
        or 0
    )

    fill_ratio = booked / total_tables

    if fill_ratio < LOW_THRESHOLD:
        return "low"
    if fill_ratio < HIGH_THRESHOLD:
        return "medium"
    return "high"


def get_active_rule(
    db: Session,
    restaurant_id: int,
    slot_time: datetime,
    demand_level: Optional[str] = None,
) -> Optional[DynamicPricingRule]:
    """
    Return the first active pricing rule that covers slot_time.
    Rules with a matching demand_level take priority over 'any' rules.
    """
    t = slot_time.time()

    candidates = (
        db.query(DynamicPricingRule)
        .filter(
            DynamicPricingRule.restaurant_id == restaurant_id,
            DynamicPricingRule.is_active == True,
            DynamicPricingRule.start_time <= t,
            DynamicPricingRule.end_time > t,
        )
        .all()
    )

    if not candidates:
        return None

    if demand_level:
        # Prefer an exact demand_level match
        exact = [r for r in candidates if r.demand_level == demand_level]
        if exact:
            return exact[0]
        # Fall back to rules marked 'any'
        fallback = [r for r in candidates if r.demand_level == "any"]
        if fallback:
            return fallback[0]
        return None

    return candidates[0]


def build_offer_payload(rule: Optional[DynamicPricingRule]) -> Optional[dict]:
    """Serialise a rule into the offer dict attached to search results."""
    if rule is None:
        return None

    offer: dict = {}
    if rule.discount_percent:
        offer["discount"] = f"{rule.discount_percent}%"
        offer["message"] = f"{rule.discount_percent}% off — limited time"
    if rule.minimum_spend:
        offer["minimum_spend"] = rule.minimum_spend
        offer["message"] = offer.get("message", "") + f" (min spend applies)"
    if rule.special_offer:
        offer["special_offer"] = rule.special_offer
        offer["message"] = rule.special_offer

    offer["rule_id"] = rule.id
    return offer if offer else None


def get_pricing_offer(
    db: Session,
    restaurant_id: int,
    slot_time: datetime,
) -> dict:
    """
    Full pipeline: compute demand → find matching rule → return offer payload.
    Returns a dict with keys: demand_level, offer (or None).
    """
    demand = get_demand_level(db, restaurant_id, slot_time)
    rule = get_active_rule(db, restaurant_id, slot_time, demand)
    return {
        "demand_level": demand,
        "offer": build_offer_payload(rule),
    }


# ── CRUD helpers used by owner routes ────────────────────────────────────────

def create_rule(db: Session, restaurant_id: int, data: dict) -> DynamicPricingRule:
    rule = DynamicPricingRule(restaurant_id=restaurant_id, **data)
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


def list_rules(db: Session, restaurant_id: int) -> list[DynamicPricingRule]:
    return (
        db.query(DynamicPricingRule)
        .filter(DynamicPricingRule.restaurant_id == restaurant_id)
        .order_by(DynamicPricingRule.start_time)
        .all()
    )


def update_rule(db: Session, rule_id: int, data: dict) -> DynamicPricingRule:
    rule = db.query(DynamicPricingRule).filter(DynamicPricingRule.id == rule_id).first()
    if rule is None:
        raise ValueError("Pricing rule not found")
    for k, v in data.items():
        setattr(rule, k, v)
    db.commit()
    db.refresh(rule)
    return rule


def delete_rule(db: Session, rule_id: int) -> None:
    rule = db.query(DynamicPricingRule).filter(DynamicPricingRule.id == rule_id).first()
    if rule is None:
        raise ValueError("Pricing rule not found")
    db.delete(rule)
    db.commit()
