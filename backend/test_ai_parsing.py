# Test the AI parsing logic directly
from app.services.ai_concierge_service import parse_user_query, get_reservation_suggestions

# Test queries
test_queries = [
    "Find quiet Italian place for a date tonight under ₹1500",
    "Looking for romantic rooftop dinner with Indian cuisine",
    "Need a casual family restaurant under ₹1000 for lunch",
    "Show me highly rated Chinese restaurants for dinner",
    "Find peaceful cafe for reading with good coffee"
]

print("Testing AI Query Parsing:")
print("=" * 50)

for query in test_queries:
    print(f"\nQuery: {query}")
    intent = parse_user_query(query)
    print(f"Parsed Intent: {intent}")
    
    if intent.get("meal_time"):
        suggestions = get_reservation_suggestions(intent)
        print(f"Reservation Suggestions: {len(suggestions)} slots generated")
        print(f"First 3 suggestions: {suggestions[:3]}")

print("\n" + "=" * 50)
print("AI parsing test completed successfully!")
