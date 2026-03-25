import re
from sqlalchemy.orm import Session
from app.models.restaurant import Restaurant
from datetime import datetime, timedelta
from typing import List, Dict, Any


def parse_user_query(query: str):
    """
    Extract intent from natural language query
    """

    cuisine = None
    price_limit = None
    mood = None
    meal_time = None
    location = None

    query = query.lower()

    # Cuisine detection
    cuisines = ["italian", "chinese", "indian", "mexican", "japanese", "thai", "korean", "french", "spanish", "american", "continental"]
    for c in cuisines:
        if c in query:
            cuisine = c.capitalize()
            break

    # Mood detection
    if "romantic" in query or "date" in query:
        mood = "romantic"
    elif "quiet" in query or "peaceful" in query:
        mood = "quiet"
    elif "lively" in query or "bustling" in query or "vibrant" in query:
        mood = "lively"
    elif "casual" in query or "informal" in query:
        mood = "casual"
    elif "family" in query or "kids" in query:
        mood = "family"

    # Price limit detection (supports ₹, Rs, and plain numbers)
    price_patterns = [
        r"under\s*₹?\s*(\d+)",
        r"below\s*₹?\s*(\d+)",
        r"less\s*than\s*₹?\s*(\d+)",
        r"max\s*₹?\s*(\d+)",
        r"₹?\s*(\d+)\s*or\s*less",
        r"budget\s*₹?\s*(\d+)"
    ]
    
    for pattern in price_patterns:
        price_match = re.search(pattern, query)
        if price_match:
            price_limit = int(price_match.group(1))
            break

    # Meal time detection
    if "breakfast" in query or "morning" in query:
        meal_time = "breakfast"
    elif "lunch" in query or "afternoon" in query:
        meal_time = "lunch"
    elif "dinner" in query or "evening" in query or "tonight" in query:
        meal_time = "dinner"

    # Location detection (simple city names)
    cities = ["delhi", "mumbai", "bangalore", "chennai", "kolkata", "hyderabad", "pune", "jaipur", "lucknow", "chandigarh"]
    for city in cities:
        if city in query:
            location = city.capitalize()
            break

    return {
        "cuisine": cuisine,
        "price_limit": price_limit,
        "mood": mood,
        "meal_time": meal_time,
        "location": location
    }


def get_reservation_suggestions(intent: dict) -> List[Dict[str, Any]]:
    """
    Generate reservation time suggestions based on parsed intent
    """
    suggestions = []
    now = datetime.now()
    
    # Base time slots
    time_slots = [
        {"time": "6:00 PM", "hour": 18, "minute": 0},
        {"time": "6:30 PM", "hour": 18, "minute": 30},
        {"time": "7:00 PM", "hour": 19, "minute": 0},
        {"time": "7:30 PM", "hour": 19, "minute": 30},
        {"time": "8:00 PM", "hour": 20, "minute": 0},
        {"time": "8:30 PM", "hour": 20, "minute": 30},
        {"time": "9:00 PM", "hour": 21, "minute": 0},
        {"time": "9:30 PM", "hour": 21, "minute": 30},
    ]
    
    # Lunch slots if meal_time is lunch
    if intent.get("meal_time") == "lunch":
        time_slots = [
            {"time": "12:00 PM", "hour": 12, "minute": 0},
            {"time": "12:30 PM", "hour": 12, "minute": 30},
            {"time": "1:00 PM", "hour": 13, "minute": 0},
            {"time": "1:30 PM", "hour": 13, "minute": 30},
            {"time": "2:00 PM", "hour": 14, "minute": 0},
            {"time": "2:30 PM", "hour": 14, "minute": 30},
        ]
    
    # Breakfast slots if meal_time is breakfast
    elif intent.get("meal_time") == "breakfast":
        time_slots = [
            {"time": "8:00 AM", "hour": 8, "minute": 0},
            {"time": "8:30 AM", "hour": 8, "minute": 30},
            {"time": "9:00 AM", "hour": 9, "minute": 0},
            {"time": "9:30 AM", "hour": 9, "minute": 30},
            {"time": "10:00 AM", "hour": 10, "minute": 0},
            {"time": "10:30 AM", "hour": 10, "minute": 30},
        ]
    
    # Generate suggestions for next 3 days
    for day_offset in range(3):
        target_date = now + timedelta(days=day_offset)
        day_name = target_date.strftime("%A")
        
        # For today, only show future times
        if day_offset == 0:
            current_hour = now.hour
            current_minute = now.minute
            
            for slot in time_slots:
                slot_time = target_date.replace(hour=slot["hour"], minute=slot["minute"], second=0, microsecond=0)
                
                if slot_time > now:
                    suggestions.append({
                        "date": day_name,
                        "date_full": target_date.strftime("%Y-%m-%d"),
                        "time": slot["time"],
                        "available": True,  # In real implementation, check actual availability
                        "recommended": slot["hour"] in [19, 20]  # Recommend dinner times
                    })
        else:
            # For future days, show all slots
            for slot in time_slots:
                suggestions.append({
                    "date": day_name,
                    "date_full": target_date.strftime("%Y-%m-%d"),
                    "time": slot["time"],
                    "available": True,  # In real implementation, check actual availability
                    "recommended": slot["hour"] in [19, 20, 13]  # Recommend popular times
                })
    
    # Return top 12 suggestions
    return suggestions[:12]


def ai_restaurant_search(db: Session, query: str):
    """
    AI-powered restaurant search with intent parsing and intelligent ranking
    """

    intent = parse_user_query(query)

    # Start with base query
    restaurants_query = db.query(Restaurant)

    # Apply filters based on parsed intent
    if intent["cuisine"]:
        restaurants_query = restaurants_query.filter(Restaurant.cuisine == intent["cuisine"])
    
    if intent["location"]:
        restaurants_query = restaurants_query.filter(Restaurant.city == intent["location"])

    restaurants = restaurants_query.all()

    results = []

    for r in restaurants:
        score = 0

        # Cuisine match bonus
        if intent["cuisine"] and r.cuisine == intent["cuisine"]:
            score += 5

        # Rating score
        if r.rating:
            score += r.rating * 2

        # Review count score
        if r.total_reviews:
            score += min(r.total_reviews * 0.1, 3)  # Cap at 3 points

        # Popularity score
        if r.popularity_score:
            score += r.popularity_score

        # Reservation count score
        if r.reservation_count:
            score += min(r.reservation_count * 0.05, 2)  # Cap at 2 points

        # Featured restaurant bonus
        if r.is_featured:
            score += 2

        # Price range filtering (if specified)
        if intent["price_limit"]:
            # Simple price range logic (you may need to adjust based on your price_range format)
            if r.price_range:
                # Assuming price_range is like "₹₹", "₹₹₹", etc.
                price_symbols = r.price_range.count('₹')
                estimated_price = price_symbols * 500  # Rough estimate
                if estimated_price > intent["price_limit"]:
                    score -= 5  # Heavy penalty for over budget

        # Mood-based scoring (simple implementation)
        if intent["mood"] == "romantic" and r.rating and r.rating >= 4.0:
            score += 1.5
        elif intent["mood"] == "quiet" and "cafe" in r.name.lower():
            score += 1
        elif intent["mood"] == "family" and r.rating and r.rating >= 3.5:
            score += 1

        results.append({
            "restaurant": r,
            "score": score,
            "match_reasons": get_match_reasons(r, intent)
        })

    # Sort by score
    results.sort(key=lambda x: x["score"], reverse=True)

    # Return top 10 results
    top_results = results[:10]

    # Generate reservation suggestions
    reservation_suggestions = get_reservation_suggestions(intent)

    return {
        "query": query,
        "parsed_intent": intent,
        "results": [
            {
                "restaurant": result["restaurant"],
                "score": result["score"],
                "match_reasons": result["match_reasons"]
            }
            for result in top_results
        ],
        "total_found": len(top_results),
        "reservation_suggestions": reservation_suggestions
    }


def get_match_reasons(restaurant: Restaurant, intent: dict):
    """
    Generate human-readable reasons why this restaurant matches the query
    """
    reasons = []

    if intent["cuisine"] and restaurant.cuisine == intent["cuisine"]:
        reasons.append(f"Perfect {intent['cuisine']} cuisine match")

    if restaurant.rating and restaurant.rating >= 4.0:
        reasons.append(f"Highly rated ({restaurant.rating}⭐)")

    if restaurant.total_reviews and restaurant.total_reviews >= 100:
        reasons.append(f"Popular ({restaurant.total_reviews}+ reviews)")

    if restaurant.is_featured:
        reasons.append("Featured restaurant")

    if intent["mood"] == "romantic" and restaurant.rating and restaurant.rating >= 4.0:
        reasons.append("Great for dates")

    if intent["price_limit"] and restaurant.price_range:
        price_symbols = restaurant.price_range.count('₹')
        estimated_price = price_symbols * 500
        if estimated_price <= intent["price_limit"]:
            reasons.append("Within budget")

    return reasons


# ─────────────────────────────────────────────────────────────────────────────
# UPGRADED CONCIERGE — intent + entity extraction + action handler
# ─────────────────────────────────────────────────────────────────────────────

import re
from datetime import date, timedelta


def parse_intent(query: str) -> str:
    """Classify the user's top-level intent."""
    q = query.lower()
    # cancel must be checked before booking ("cancel my reservation" contains "reservation")
    if any(w in q for w in ("cancel", "cancellation")):
        return "cancel"
    if any(w in q for w in ("book", "reserve", "reservation", "table for")):
        return "booking"
    if any(w in q for w in ("recommend", "suggest", "best", "good", "where")):
        return "recommendation"
    if any(w in q for w in ("available", "availability", "free slot", "open")):
        return "availability"
    return "general"


def extract_entities(query: str) -> dict:
    """
    Pull structured entities from a natural language query.
    Returns: party_size, time_str, date_str, cuisine, city, price_limit
    """
    q = query.lower()
    entities: dict = {}

    # Party size — "for 4", "table for 2", "4 people", "party of 6"
    party_match = re.search(
        r"(?:for|party of|table for|group of)\s*(\d+)|(\d+)\s*(?:people|guests|persons|pax)",
        q,
    )
    if party_match:
        entities["party_size"] = int(party_match.group(1) or party_match.group(2))

    # Time — "at 8pm", "at 7:30", "8 pm"
    time_match = re.search(r"at\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", q)
    if time_match:
        hour = int(time_match.group(1))
        minute = int(time_match.group(2) or 0)
        meridiem = time_match.group(3)
        if meridiem == "pm" and hour < 12:
            hour += 12
        elif meridiem == "am" and hour == 12:
            hour = 0
        entities["time_str"] = f"{hour:02d}:{minute:02d}"

    # Date — "tonight", "tomorrow", "this weekend"
    today = date.today()
    if "tonight" in q or "today" in q:
        entities["date_str"] = today.isoformat()
    elif "tomorrow" in q:
        entities["date_str"] = (today + timedelta(days=1)).isoformat()
    elif "weekend" in q:
        days_ahead = 5 - today.weekday()  # next Saturday
        if days_ahead <= 0:
            days_ahead += 7
        entities["date_str"] = (today + timedelta(days=days_ahead)).isoformat()

    # Cuisine
    cuisines = [
        "italian", "chinese", "indian", "mexican", "japanese", "thai",
        "korean", "french", "spanish", "american", "continental", "biryani",
        "pizza", "sushi", "bbq", "seafood", "vegetarian", "vegan",
    ]
    for c in cuisines:
        if c in q:
            entities["cuisine"] = c.capitalize()
            break

    # City
    cities = [
        "delhi", "mumbai", "bangalore", "chennai", "kolkata",
        "hyderabad", "pune", "jaipur", "lucknow", "chandigarh",
    ]
    for city in cities:
        if city in q:
            entities["city"] = city.capitalize()
            break

    # Price limit
    price_match = re.search(
        r"(?:under|below|less than|max|budget)\s*₹?\s*(\d+)", q
    )
    if price_match:
        entities["price_limit"] = int(price_match.group(1))

    return entities


def handle_booking_action(
    db,
    user_id,
    restaurant_id: int,
    entities: dict,
) -> dict:
    """
    If intent is booking and we have enough entities, auto-create a reservation.
    Returns a result dict with status and reservation details.
    """
    from datetime import datetime
    from app.services.table_optimization_service import auto_assign_and_create
    from app.services.waitlist_service import add_to_waitlist

    date_str = entities.get("date_str", date.today().isoformat())
    time_str = entities.get("time_str", "19:00")
    party_size = entities.get("party_size", 2)

    try:
        reservation_time = datetime.fromisoformat(f"{date_str}T{time_str}:00")
    except ValueError:
        return {"status": "error", "message": "Could not parse reservation time"}

    if reservation_time <= datetime.utcnow():
        return {"status": "error", "message": "Requested time is in the past"}

    try:
        reservation = auto_assign_and_create(
            db=db,
            restaurant_id=restaurant_id,
            user_id=user_id,
            reservation_time=reservation_time,
            guests=party_size,
        )
        db.commit()
        return {
            "status": "booked",
            "reservation_id": reservation.id,
            "restaurant_id": restaurant_id,
            "reservation_time": reservation_time.isoformat(),
            "guests": party_size,
            "table_id": reservation.table_id,
        }
    except ValueError:
        # No table — add to waitlist
        entry = add_to_waitlist(
            db=db,
            user_id=user_id,
            restaurant_id=restaurant_id,
            guests=party_size,
            requested_time=reservation_time,
        )
        return {
            "status": "waitlisted",
            "waitlist_id": entry.id,
            "restaurant_id": restaurant_id,
            "requested_time": reservation_time.isoformat(),
            "guests": party_size,
        }


def chat(db, query: str, user=None) -> dict:
    """
    Main concierge entry point.
    1. Parse intent + entities
    2. Search restaurants (existing ai_restaurant_search)
    3. If booking intent + top result + authenticated user → auto-create
    4. Return structured response
    """
    intent = parse_intent(query)
    entities = extract_entities(query)

    # Search restaurants using existing engine
    search_result = ai_restaurant_search(db, query)
    restaurants = search_result.get("results", [])

    # Build a human-readable response
    action_result = None

    if intent == "booking" and restaurants and user is not None:
        top = restaurants[0]["restaurant"]
        restaurant_id = top.id if hasattr(top, "id") else top.get("id")
        if restaurant_id:
            action_result = handle_booking_action(db, user.id, restaurant_id, entities)

    # Format restaurant list for response
    formatted = []
    for r in restaurants[:5]:
        rest = r["restaurant"]
        formatted.append({
            "id": rest.id if hasattr(rest, "id") else rest.get("id"),
            "name": rest.name if hasattr(rest, "name") else rest.get("name"),
            "cuisine": rest.cuisine if hasattr(rest, "cuisine") else rest.get("cuisine"),
            "rating": rest.rating if hasattr(rest, "rating") else rest.get("rating"),
            "city": rest.city if hasattr(rest, "city") else rest.get("city"),
            "address": rest.address if hasattr(rest, "address") else rest.get("address"),
            "price_range": rest.price_range if hasattr(rest, "price_range") else rest.get("price_range"),
            "match_reasons": r.get("match_reasons", []),
        })

    return {
        "query": query,
        "intent": intent,
        "entities": entities,
        "restaurants": formatted,
        "reservation_suggestions": search_result.get("reservation_suggestions", []),
        "action": action_result,
    }
