from sentence_transformers import SentenceTransformer

# Load embedding model (same as fetch script)
_model = None

def get_model():
    global _model
    if _model is None:
        # Load lazily to prevent massive memory usage on boot
        _model = SentenceTransformer("mixedbread-ai/mxbai-embed-large-v1")
    return _model

def get_query_embedding(query: str):
    return get_model().encode(query).tolist()

def generate_explanation(r, intent_score: float) -> str:
    """Generate intelligent reasoning based on the actual components of the rank"""
    reasons = []

    if intent_score > 0.75:
        reasons.append("Strong match for your request")
    elif intent_score > 0.5:
        reasons.append("Matches your intent")

    if getattr(r, 'rating', 0) > 4.5:
        reasons.append("Highly rated")

    if getattr(r, 'popularity_score', 0) > 10.0:
        reasons.append("Trending right now")

    return " • ".join(reasons) if reasons else "Recommended"
