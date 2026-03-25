#!/usr/bin/env python3

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.restaurant import Restaurant
from app.services.vector_service import restaurant_embedding, generate_restaurant_embeddings_batch
from sqlalchemy import text

def generate_embeddings_for_existing_restaurants():
    """Generate and save embeddings for all existing restaurants"""
    
    print("🚀 Starting to generate embeddings for existing restaurants...")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if embedding column exists
        try:
            db.execute(text("SELECT embedding FROM restaurants LIMIT 1"))
            print("✅ Embedding column exists in database")
        except Exception as e:
            print(f"❌ Embedding column not found: {e}")
            print("Please run database migration first:")
            print("alembic revision --autogenerate -m \"Add embedding column to restaurants\"")
            print("alembic upgrade head")
            return
        
        # Get all restaurants
        restaurants = db.query(Restaurant).all()
        print(f"📊 Found {len(restaurants)} restaurants in database")
        
        if not restaurants:
            print("⚠️  No restaurants found. Please add some restaurants first.")
            return
        
        # Process in batches for efficiency
        batch_size = 10
        updated_count = 0
        
        for i in range(0, len(restaurants), batch_size):
            batch = restaurants[i:i + batch_size]
            
            print(f"🔄 Processing batch {i//batch_size + 1}/{(len(restaurants) + batch_size - 1)//batch_size}")
            
            # Generate embeddings for batch
            embeddings = generate_restaurant_embeddings_batch(batch)
            
            # Update restaurants with embeddings
            for restaurant, embedding in zip(batch, embeddings):
                restaurant.embedding = embedding
                updated_count += 1
                
                print(f"  ✅ Generated embedding for: {restaurant.name}")
        
        # Commit all changes
        db.commit()
        
        print(f"🎉 Successfully generated embeddings for {updated_count} restaurants!")
        
        # Test one embedding
        if restaurants:
            sample_restaurant = restaurants[0]
            if sample_restaurant.embedding:
                print(f"📝 Sample embedding dimension: {len(sample_restaurant.embedding)}")
                print(f"📝 Sample values: {sample_restaurant.embedding[:3]}...")
        
    except Exception as e:
        print(f"❌ Error generating embeddings: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
        
    finally:
        db.close()

def test_embedding_generation():
    """Test embedding generation with a sample restaurant"""
    print("🧪 Testing embedding generation...")
    
    # Create a test restaurant
    class TestRestaurant:
        def __init__(self):
            self.name = "Cozy Italian Cafe"
            self.cuisine = "Italian"
            self.city = "Mumbai"
            self.description = "A romantic spot perfect for date nights with authentic pasta"
            self.price_range = "$$"
            self.rating = 4.5
    
    test_restaurant = TestRestaurant()
    
    # Generate embedding
    embedding = restaurant_embedding(test_restaurant)
    
    print(f"✅ Test embedding generated successfully!")
    print(f"📏 Dimension: {len(embedding)}")
    print(f"📊 Sample values: {embedding[:5]}")
    
    return embedding

if __name__ == "__main__":
    print("=" * 60)
    print("🔎 SUFI Vector Embeddings Generator")
    print("=" * 60)
    
    # Test embedding generation first
    test_embedding_generation()
    print()
    
    # Generate embeddings for existing restaurants
    generate_embeddings_for_existing_restaurants()
    
    print("\n🎯 Embedding generation complete!")
    print("Now you can use vector search to find restaurants semantically!")
