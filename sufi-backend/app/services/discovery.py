from __future__ import annotations

import hashlib
import math
from dataclasses import dataclass
from typing import Iterable

from openai import OpenAI
from sqlalchemy.orm import Session, joinedload

from app.config import settings
from app.models.restaurant import Restaurant
from app.models.user_preference import UserPreference
from app.schemas.discovery import (
    DiscoverRequest,
    DiscoverResponse,
    DiscoverRestaurant,
    SignalBreakdown,
)

EMBEDDING_DIMENSION = 1536


def _clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(maximum, value))


def _normalized_log(value: int | float | None, max_reference: float) -> float:
    if not value or value <= 0:
        return 0.0
    return _clamp(math.log1p(value) / math.log1p(max_reference))


def _tokenize(text: str) -> set[str]:
    return {token.strip(" ,.-").lower() for token in text.split() if token.strip(" ,.-")}


def _fallback_embedding(text: str) -> list[float]:
    digest = hashlib.sha256(text.encode("utf-8")).digest()
    vector: list[float] = []

    while len(vector) < EMBEDDING_DIMENSION:
        for byte in digest:
            vector.append((byte / 127.5) - 1.0)
            if len(vector) == EMBEDDING_DIMENSION:
                break
        digest = hashlib.sha256(digest).digest()

    return vector


class DiscoveryEmbeddingService:
    def __init__(self) -> None:
        self._client: OpenAI | None = None

    def _client_or_none(self) -> OpenAI | None:
        if not settings.OPENAI_API_KEY:
            return None
        if self._client is None:
            self._client = OpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client

    def embed_query(self, query: str) -> list[float]:
        client = self._client_or_none()
        if client is None:
            return _fallback_embedding(query)

        response = client.embeddings.create(
            model=settings.OPENAI_EMBEDDING_MODEL,
            input=query,
        )
        return response.data[0].embedding


embedding_service = DiscoveryEmbeddingService()


@dataclass
class RankedRestaurant:
    restaurant: Restaurant
    final_score: float
    signal_breakdown: SignalBreakdown
    explanation: str
    semantic_similarity: float
    distance_km: float | None


def _distance_km(
    request_latitude: float | None,
    request_longitude: float | None,
    restaurant_latitude: float | None,
    restaurant_longitude: float | None,
) -> float | None:
    if None in (request_latitude, request_longitude, restaurant_latitude, restaurant_longitude):
        return None

    earth_radius_km = 6371.0
    d_lat = math.radians(restaurant_latitude - request_latitude)
    d_lon = math.radians(restaurant_longitude - request_longitude)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(request_latitude))
        * math.cos(math.radians(restaurant_latitude))
        * math.sin(d_lon / 2) ** 2
    )
    return earth_radius_km * (2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))


def _tier_boost_score(restaurant: Restaurant) -> float:
    priority_rank = getattr(getattr(restaurant, "tier", None), "priority_rank", None)
    if priority_rank is None:
        return 0.35 if restaurant.is_featured else 0.2
    return _clamp(1 - ((priority_rank - 1) * 0.16), 0.18, 1.0)


def _personalization_score(
    restaurant: Restaurant,
    request: DiscoverRequest,
    user_preferences: Iterable[str],
) -> float:
    query_terms = _tokenize(request.query)
    preference_terms = {term.lower() for term in user_preferences}
    cuisine = (restaurant.cuisine or "").lower()
    tag_terms = {(tag.tag or "").lower() for tag in restaurant.tags}

    score = 0.0

    if cuisine and cuisine in preference_terms:
        score += 0.45
    if query_terms and cuisine and cuisine in query_terms:
        score += 0.25

    overlap = len(query_terms.intersection(tag_terms))
    if overlap:
        score += min(0.2 + overlap * 0.07, 0.35)

    if request.city and restaurant.city and request.city.lower() == restaurant.city.lower():
        score += 0.1

    return _clamp(score)


def _build_explanation(
    signal_breakdown: SignalBreakdown,
    restaurant: Restaurant,
    distance_km: float | None,
) -> str:
    reasons: list[str] = []

    if signal_breakdown.quality >= 0.85:
        reasons.append("top-tier quality")
    if signal_breakdown.personalization >= 0.55:
        reasons.append("aligned with your dining profile")
    if signal_breakdown.trending >= 0.6:
        reasons.append("surging live demand")
    if signal_breakdown.proximity >= 0.8 and distance_km is not None:
        reasons.append(f"{distance_km:.1f} km away")
    if signal_breakdown.tier_boost >= 0.6 and restaurant.tier is not None:
        reasons.append(f"{restaurant.tier.name} tier placement")

    return " | ".join(reasons[:4]) or "high semantic match across the SUFI signal stack"


def discover_restaurants(db: Session, payload: DiscoverRequest) -> DiscoverResponse:
    query_vector = embedding_service.embed_query(payload.query)

    user_preferences = []
    if payload.user_id is not None:
        user_preferences = [
            preference.cuisine
            for preference in db.query(UserPreference)
            .filter(UserPreference.user_id == payload.user_id)
            .order_by(UserPreference.weight.desc())
            .all()
        ]

    semantic_similarity = (
        (1 - Restaurant.embedding.cosine_distance(query_vector)).label("semantic_similarity")
    )

    candidate_query = (
        db.query(Restaurant, semantic_similarity)
        .options(joinedload(Restaurant.tier), joinedload(Restaurant.tags))
        .filter(Restaurant.embedding.isnot(None))
        .order_by(Restaurant.embedding.cosine_distance(query_vector))
        .limit(max(payload.limit * 4, payload.limit))
    )

    ranked_results: list[RankedRestaurant] = []
    for restaurant, semantic_score in candidate_query.all():
        distance_km = _distance_km(
            payload.latitude,
            payload.longitude,
            restaurant.latitude,
            restaurant.longitude,
        )

        quality = _clamp(((restaurant.rating or 0.0) / 5.0) * 0.75 + _normalized_log(restaurant.total_reviews, 400) * 0.25)
        engagement = _clamp(
            _normalized_log(restaurant.reservation_count, 600) * 0.55
            + _normalized_log(restaurant.total_reviews, 800) * 0.25
            + _normalized_log(restaurant.popularity_score, 100) * 0.2
        )
        proximity = (
            _clamp(1 - (distance_km / 18.0), 0.0, 1.0)
            if distance_km is not None
            else (0.72 if payload.city and restaurant.city and payload.city.lower() == restaurant.city.lower() else 0.38)
        )
        trending = _clamp(
            _normalized_log(restaurant.popularity_score, 120) * 0.65
            + (0.25 if restaurant.is_featured else 0.0)
            + _normalized_log(restaurant.reservation_count, 450) * 0.1
        )
        tier_boost = _tier_boost_score(restaurant)
        personalization = _personalization_score(restaurant, payload, user_preferences)

        breakdown = SignalBreakdown(
            quality=round(quality, 4),
            engagement=round(engagement, 4),
            proximity=round(proximity, 4),
            trending=round(trending, 4),
            tier_boost=round(tier_boost, 4),
            personalization=round(personalization, 4),
            semantic_similarity=round(float(semantic_score), 4),
        )

        six_signal_score = (
            quality * 0.24
            + engagement * 0.14
            + proximity * 0.16
            + trending * 0.14
            + tier_boost * 0.1
            + personalization * 0.22
        )
        final_score = _clamp(float(semantic_score) * 0.34 + six_signal_score * 0.66)

        ranked_results.append(
            RankedRestaurant(
                restaurant=restaurant,
                final_score=round(final_score, 4),
                signal_breakdown=breakdown,
                explanation=_build_explanation(breakdown, restaurant, distance_km),
                semantic_similarity=float(semantic_score),
                distance_km=distance_km,
            )
        )

    ranked_results.sort(key=lambda item: item.final_score, reverse=True)

    results = [
        DiscoverRestaurant(
            id=item.restaurant.id,
            name=item.restaurant.name,
            cuisine=item.restaurant.cuisine,
            city=item.restaurant.city,
            address=item.restaurant.address,
            description=item.restaurant.description,
            rating=round(item.restaurant.rating or 0.0, 2),
            price_range=item.restaurant.price_range,
            final_score=item.final_score,
            signal_breakdown=item.signal_breakdown,
            explanation=item.explanation,
            metadata={
                "distance_km": round(item.distance_km, 2) if item.distance_km is not None else None,
                "tier": getattr(item.restaurant.tier, "name", None),
                "is_featured": item.restaurant.is_featured,
                "reservation_count": item.restaurant.reservation_count or 0,
                "total_reviews": item.restaurant.total_reviews or 0,
            },
        )
        for item in ranked_results[: payload.limit]
    ]

    return DiscoverResponse(
        query=payload.query,
        total_results=len(results),
        results=results,
    )
