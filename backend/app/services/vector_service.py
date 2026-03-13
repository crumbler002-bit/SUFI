from app.services.embedding_service import create_embedding
from app.models.restaurant import Restaurant
from typing import List

def restaurant_text(restaurant: Restaurant) -> str:
    """
    Convert restaurant information into searchable text description
    
    Args:
        restaurant: Restaurant model instance
        
    Returns:
        Formatted text string for embedding
    """
    text_parts = []
    
    # Basic restaurant info
    if restaurant.name:
        text_parts.append(restaurant.name)
    
    if restaurant.cuisine:
        text_parts.append(restaurant.cuisine)
    
    if restaurant.city:
        text_parts.append(restaurant.city)
    
    if restaurant.description:
        text_parts.append(restaurant.description)
    
    # Add inferred context
    context_parts = []
    
    # Cuisine-specific context
    if restaurant.cuisine:
        cuisine_lower = restaurant.cuisine.lower()
        if 'italian' in cuisine_lower:
            context_parts.extend(['pasta', 'pizza', 'wine', 'romantic', 'family dining'])
        elif 'chinese' in cuisine_lower:
            context_parts.extend(['noodles', 'rice', 'family style', 'casual'])
        elif 'indian' in cuisine_lower:
            context_parts.extend(['spicy', 'curry', 'authentic', 'traditional'])
        elif 'japanese' in cuisine_lower:
            context_parts.extend(['sushi', 'ramen', 'minimalist', 'fresh'])
        elif 'mexican' in cuisine_lower:
            context_parts.extend(['tacos', 'burritos', 'festive', 'casual'])
        elif 'american' in cuisine_lower:
            context_parts.extend(['burgers', 'casual', 'comfort food'])
    
    # Price range context
    if restaurant.price_range:
        price_lower = restaurant.price_range.lower()
        if '$' in price_lower or 'budget' in price_lower:
            context_parts.extend(['affordable', 'casual', 'value'])
        elif '$$$' in price_lower or 'expensive' in price_lower:
            context_parts.extend(['upscale', 'fine dining', 'premium', 'elegant'])
    
    # Rating context
    if restaurant.rating:
        if restaurant.rating >= 4.5:
            context_parts.extend(['excellent', 'top rated', 'popular', 'must try'])
        elif restaurant.rating >= 4.0:
            context_parts.extend(['good', 'reliable', 'solid choice'])
    
    # Combine all text
    all_text = ' '.join(text_parts + context_parts)
    
    return all_text.strip()

def restaurant_embedding(restaurant: Restaurant) -> List[float]:
    """
    Generate embedding vector for a restaurant
    
    Args:
        restaurant: Restaurant model instance
        
    Returns:
        Embedding vector as list of floats
    """
    text = restaurant_text(restaurant)
    return create_embedding(text)

def generate_restaurant_embeddings_batch(restaurants: List[Restaurant]) -> List[List[float]]:
    """
    Generate embeddings for multiple restaurants at once
    
    Args:
        restaurants: List of Restaurant model instances
        
    Returns:
        List of embedding vectors
    """
    texts = [restaurant_text(restaurant) for restaurant in restaurants]
    
    from app.services.embedding_service import create_batch_embeddings
    return create_batch_embeddings(texts)

def test_restaurant_embedding():
    """Test restaurant embedding generation"""
    # Create a mock restaurant for testing
    class MockRestaurant:
        def __init__(self):
            self.name = "Romantic Italian Bistro"
            self.cuisine = "Italian"
            self.city = "Mumbai"
            self.description = "Cozy restaurant perfect for date nights with authentic pasta and wood-fired pizza"
            self.price_range = "$$"
            self.rating = 4.6
    
    mock_restaurant = MockRestaurant()
    
    # Generate text representation
    text = restaurant_text(mock_restaurant)
    print(f"Restaurant text: {text}")
    
    # Generate embedding
    embedding = restaurant_embedding(mock_restaurant)
    print(f"Embedding dimension: {len(embedding)}")
    print(f"Sample embedding values: {embedding[:5]}")
    
    return text, embedding

if __name__ == "__main__":
    test_restaurant_embedding()
