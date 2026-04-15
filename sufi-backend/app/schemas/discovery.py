from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class DiscoverRequest(BaseModel):
    query: str = Field(min_length=3, max_length=500)
    limit: int = Field(default=12, ge=1, le=24)
    latitude: float | None = None
    longitude: float | None = None
    city: str | None = None
    user_id: UUID | None = None


class SignalBreakdown(BaseModel):
    quality: float
    engagement: float
    proximity: float
    trending: float
    tier_boost: float
    personalization: float
    semantic_similarity: float


class DiscoverRestaurant(BaseModel):
    id: int
    name: str
    cuisine: str | None = None
    city: str | None = None
    address: str | None = None
    description: str | None = None
    rating: float
    price_range: str | None = None
    final_score: float
    signal_breakdown: SignalBreakdown
    explanation: str
    metadata: dict[str, Any]


class DiscoverResponse(BaseModel):
    query: str
    embedding_dimension: int = 1536
    total_results: int
    results: list[DiscoverRestaurant]
