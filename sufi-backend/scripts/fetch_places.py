from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import declarative_base

# fallback minimal schema in case of db sync issues, just for reference
# keeping imports standard
from sentence_transformers import SentenceTransformer
import requests
import os

from app.database import SessionLocal
from app.models.restaurant import Restaurant

# Ensure you set this before running!
API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "YOUR_API_KEY")

# Load embedding model once
model = SentenceTransformer("mixedbread-ai/mxbai-embed-large-v1")

def get_embedding(text: str):
    return model.encode(text).tolist()

def fetch_and_store(lat: float, lng: float, radius: int = 3000):
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "type": "restaurant",
        "key": API_KEY
    }

    print(f"Fetching restaurants near {lat}, {lng}...")
    response = requests.get(url, params=params)
    data = response.json()

    if "results" not in data:
        print("Error or no results found:", data)
        return

    db = SessionLocal()

    count = 0
    for r in data["results"]:
        place_id = r.get("place_id")
        
        # Check for duplicates
        existing = db.query(Restaurant).filter(Restaurant.google_place_id == place_id).first()
        if existing:
            continue
            
        name = r.get("name")
        rating = r.get("rating", 0)
        price_level = r.get("price_level", 0)
        types = r.get("types", [])
        
        # Create a semantic string representing the restaurant
        semantic_text = f"{name} {' '.join(types)} restaurant"
        embedding = get_embedding(semantic_text)

        restaurant = Restaurant(
            name=name,
            latitude=r["geometry"]["location"]["lat"],
            longitude=r["geometry"]["location"]["lng"],
            rating=rating,
            popularity_score=r.get("user_ratings_total", 0) / 100, # crude trend proxy
            google_place_id=place_id,
            embedding=embedding
        )
        db.add(restaurant)
        count += 1

    db.commit()
    db.close()
    print(f"Successfully added {count} new restaurants to the database.")

if __name__ == "__main__":
    # Example: Mumbai Coordinates
    fetch_and_store(19.0760, 72.8777)
