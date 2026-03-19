"""
SUFI AI Agent
Multi-turn conversational agent with:
  - Persistent session memory (Redis / in-memory fallback)
  - Personalized context from user preferences + history
  - Intent-driven action execution (book / cancel / recommend)
  - Follow-up prompting when required entities are missing

Flow per turn:
  1. Load session history
  2. Extract entities from current message + merge with session entities
  3. Determine intent
  4. If entities incomplete → ask follow-up question
  5. If complete → execute action or search
  6. Persist messages + entities
  7. Return structured response
"""

from sqlalchemy.orm import Session

from app.services.ai.memory import (
    get_history,
    save_message,
    save_entities,
    get_missing_entities,
    clear_history,
)
from app.services.ai.context_builder import build_user_context
from app.services.ai_concierge_service import (
    parse_intent,
    extract_entities,
    ai_restaurant_search,
    handle_booking_action,
)


# ── What we need before we can book ──────────────────────────────────────────
BOOKING_REQUIRED = {"party_size", "date_str", "time_str"}

# Follow-up questions for missing booking entities
_FOLLOWUP = {
    "party_size": "How many people will be dining?",
    "date_str":   "What date would you like? (e.g. tonight, tomorrow, this weekend)",
    "time_str":   "What time works for you? (e.g. 7pm, 8:30pm)",
}


def _first_missing(entities: dict, required: set) -> str | None:
    for key in ["party_size", "date_str", "time_str"]:   # priority order
        if key in required and not entities.get(key):
            return key
    return None


def _format_restaurants(results: list) -> list[dict]:
    out = []
    for r in results[:5]:
        rest = r["restaurant"]
        out.append({
            "id":          rest.id if hasattr(rest, "id") else rest.get("id"),
            "name":        rest.name if hasattr(rest, "name") else rest.get("name"),
            "cuisine":     rest.cuisine if hasattr(rest, "cuisine") else rest.get("cuisine"),
            "rating":      rest.rating if hasattr(rest, "rating") else rest.get("rating"),
            "city":        rest.city if hasattr(rest, "city") else rest.get("city"),
            "address":     rest.address if hasattr(rest, "address") else rest.get("address"),
            "price_range": rest.price_range if hasattr(rest, "price_range") else rest.get("price_range"),
            "match_reasons": r.get("match_reasons", []),
        })
    return out


def _build_recommendation_reply(restaurants: list[dict], user_context: str) -> str:
    if not restaurants:
        return "I couldn't find any matching restaurants right now. Try a different cuisine or city."

    top = restaurants[0]
    name    = top.get("name", "a great restaurant")
    cuisine = top.get("cuisine", "")
    rating  = top.get("rating", "")
    reasons = top.get("match_reasons", [])

    reply = f"I'd recommend {name}"
    if cuisine:
        reply += f" — {cuisine}"
    if rating:
        reply += f" ({rating}⭐)"
    if reasons:
        reply += f". {reasons[0]}."
    if len(restaurants) > 1:
        reply += f" I also found {len(restaurants) - 1} other option(s) for you."
    return reply


def _build_booking_reply(action: dict, restaurant_name: str) -> str:
    status = action.get("status")
    if status == "booked":
        t = action.get("reservation_time", "")[:16].replace("T", " at ")
        g = action.get("guests", "")
        return (
            f"Done! I've booked a table at {restaurant_name} for {g} "
            f"on {t}. Your reservation ID is #{action.get('reservation_id')}."
        )
    if status == "waitlisted":
        return (
            f"{restaurant_name} is fully booked at that time. "
            f"I've added you to the waitlist (#{action.get('waitlist_id')}). "
            "You'll be notified if a slot opens up."
        )
    return action.get("message", "Something went wrong with the booking.")


# ── Main agent entry point ────────────────────────────────────────────────────

def run_agent(
    db: Session,
    session_id: str,
    query: str,
    user=None,
) -> dict:
    """
    Process one conversational turn.

    Returns:
      {
        "reply":        str,          # natural language response
        "intent":       str,
        "entities":     dict,         # all entities collected so far
        "restaurants":  list[dict],
        "action":       dict | None,  # booking/cancel result if executed
        "history":      list[dict],   # full session history (user+assistant only)
        "needs_input":  str | None,   # follow-up question key if waiting for more info
      }
    """
    # 1. Persist user message
    save_message(session_id, "user", query)

    # 2. Intent + entities from this turn
    intent  = parse_intent(query)
    new_ent = extract_entities(query)

    # 3. Merge with entities already collected in this session
    session_ent = get_missing_entities(session_id)
    merged_ent  = {**session_ent, **{k: v for k, v in new_ent.items() if v}}
    save_entities(session_id, merged_ent)

    # 4. Build personalized context
    user_context = build_user_context(db, user)

    # 5. Search restaurants (always — used for both recommend + booking)
    search_result  = ai_restaurant_search(db, query)
    restaurants    = _format_restaurants(search_result.get("results", []))
    suggestions    = search_result.get("reservation_suggestions", [])

    reply       = ""
    action      = None
    needs_input = None

    # ── BOOKING FLOW ──────────────────────────────────────────────────────
    if intent == "booking":
        if user is None:
            reply = "Please log in to make a reservation. I can still help you find the perfect restaurant!"
        else:
            missing = _first_missing(merged_ent, BOOKING_REQUIRED)
            if missing:
                # Ask for the next missing piece
                needs_input = missing
                reply = _FOLLOWUP[missing]
            else:
                # All entities present — execute booking
                if restaurants:
                    top_id   = restaurants[0]["id"]
                    top_name = restaurants[0]["name"]
                    action   = handle_booking_action(db, user.id, top_id, merged_ent)
                    reply    = _build_booking_reply(action, top_name)
                    if action.get("status") in ("booked", "waitlisted"):
                        clear_history(session_id)   # fresh session after booking
                else:
                    reply = "I couldn't find a matching restaurant for your request. Try a different cuisine or city."

    # ── CANCEL FLOW ───────────────────────────────────────────────────────
    elif intent == "cancel":
        if user is None:
            reply = "Please log in to manage your reservations."
        else:
            reply = (
                "To cancel a reservation, head to your Profile → My Reservations "
                "and tap Cancel next to the booking you want to remove."
            )

    # ── RECOMMENDATION FLOW ───────────────────────────────────────────────
    elif intent in ("recommendation", "general"):
        reply = _build_recommendation_reply(restaurants, user_context)

    # ── AVAILABILITY FLOW ─────────────────────────────────────────────────
    elif intent == "availability":
        if restaurants:
            reply = (
                f"I found {len(restaurants)} restaurant(s) with availability. "
                "Would you like me to book one for you?"
            )
        else:
            reply = "No availability found for your criteria. Try a different time or date."

    # 6. Persist assistant reply
    save_message(session_id, "assistant", reply)

    # 7. Return — filter internal _entities markers from visible history
    visible_history = [
        m for m in get_history(session_id)
        if m["role"] in ("user", "assistant")
    ]

    return {
        "reply":       reply,
        "intent":      intent,
        "entities":    merged_ent,
        "restaurants": restaurants,
        "suggestions": suggestions,
        "action":      action,
        "history":     visible_history,
        "needs_input": needs_input,
        "user_context": user_context if user else None,
    }
