from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List

# Lazy-loaded — model is only initialised on first actual use, not at import time
_model = None

def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def create_embedding(text: str) -> List[float]:
    """
    Create embedding vector for given text using sentence-transformers
    
    Args:
        text: Input text to embed
        
    Returns:
        List of float values representing the embedding vector
    """
    try:
        vector = _get_model().encode(text)
        
        # Convert numpy array to list for JSON serialization
        return vector.tolist()
        
    except Exception as e:
        print(f"Error creating embedding: {e}")
        # Return zero vector as fallback (384 dimensions for MiniLM-L6-v2)
        return [0.0] * 384

def create_batch_embeddings(texts: List[str]) -> List[List[float]]:
    """
    Create embeddings for multiple texts at once (more efficient)
    
    Args:
        texts: List of input texts to embed
        
    Returns:
        List of embedding vectors
    """
    try:
        vectors = _get_model().encode(texts)
        
        # Convert to list of lists
        return [vector.tolist() for vector in vectors]
        
    except Exception as e:
        print(f"Error creating batch embeddings: {e}")
        # Return zero vectors as fallback
        return [[0.0] * 384 for _ in texts]

def get_embedding_dimension() -> int:
    """
    Get the dimension of the embedding vectors
    
    Returns:
        Integer representing embedding dimension
    """
    return 384  # Dimension for all-MiniLM-L6-v2

def test_embedding():
    """Test the embedding service"""
    test_text = "A cozy Italian restaurant with romantic atmosphere"
    embedding = create_embedding(test_text)
    
    print(f"Embedding dimension: {len(embedding)}")
    print(f"First 5 values: {embedding[:5]}")
    print(f"Sample values range: {min(embedding):.4f} to {max(embedding):.4f}")
    
    return embedding

if __name__ == "__main__":
    # Test the embedding service
    test_embedding()
