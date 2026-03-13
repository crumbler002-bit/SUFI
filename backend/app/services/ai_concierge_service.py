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
