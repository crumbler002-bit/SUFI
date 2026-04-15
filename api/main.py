from __future__ import annotations

import hashlib
import math
import os
import sys
from pathlib import Path
from typing import Any
from uuid import UUID

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import text

BACKEND_ROOT = Path(__file__).resolve().parents[1] / "sufi-backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.database import SessionLocal  # type: ignore  # noqa: E402

try:
    from openai import OpenAI  # type: ignore  # noqa: E402
except Exception:  # pragma: no cover
    OpenAI = None


app = FastAPI(title="SUFI Intelligence API")

EMBEDDING_DIMENSION = 1536
WEIGHTS = {
    "intent": 0.40,
    "quality": 0.10,
    "trending": 0.15,
    "monetization": 0.10,
    "proximity": 0.15,
    "personalization": 0.10,
}


class RankRequest(BaseModel):
    query: str = Field(min_length=4)
    user_id: UUID | None = None
    user_latitude: float | None = None
    user_longitude: float | None = None
    limit: int = Field(default=1, ge=1, le=10)
    candidate_limit: int = Field(default=48, ge=5, le=100)


class RankedResult(BaseModel):
    id: int
    name: str
    cuisine: str | None
    city: str | None
    description: str | None
    score: float
    explanation: str
    breakdown: dict[str, float]


class RankResponse(BaseModel):
    results: list[RankedResult]


def _fallback_embedding(query: str) -> list[float]:
    digest = hashlib.sha256(query.encode("utf-8")).digest()
    seed = list(digest) * math.ceil(EMBEDDING_DIMENSION / len(digest))
    vector = [((value / 255.0) * 2.0) - 1.0 for value in seed[:EMBEDDING_DIMENSION]]
    norm = math.sqrt(sum(value * value for value in vector)) or 1.0
    return [value / norm for value in vector]


def embed_query(query: str) -> list[float]:
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

    if api_key and OpenAI is not None:
        client = OpenAI(api_key=api_key)
        response = client.embeddings.create(model=model, input=query)
        return response.data[0].embedding

    return _fallback_embedding(query)


def ensure_vector_index() -> None:
    db = SessionLocal()
    try:
        db.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        db.execute(
            text(
                """
                CREATE INDEX IF NOT EXISTS idx_restaurants_embedding_hnsw
                ON restaurants
                USING hnsw (embedding vector_cosine_ops)
                WITH (m = 16, ef_construction = 64)
                """
            )
        )
        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def startup() -> None:
    ensure_vector_index()


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/rank", response_model=RankResponse)
def rank_restaurants(payload: RankRequest) -> RankResponse:
    ensure_vector_index()

    vector = embed_query(payload.query)
    vector_literal = "[" + ",".join(f"{value:.8f}" for value in vector) + "]"

    sql = text(
        """
        WITH candidates AS (
            SELECT
                r.id,
                r.name,
                r.cuisine,
                r.city,
                COALESCE(r.about, r.description) AS description,
                GREATEST(0.0, 1 - (r.embedding <=> CAST(:embedding AS vector))) AS intent_score,
                LEAST(1.0, COALESCE(r.rating, 0) / 5.0) AS quality_score,
                LEAST(
                    1.0,
                    COALESCE(booking_stats.booking_count, 0)::float / GREATEST(max_booking.max_booking_count, 1)::float
                ) AS trending_score,
                LEAST(
                    1.0,
                    COALESCE(t.priority_rank, 1)::float / GREATEST(max_tier.max_priority_rank, 1)::float
                ) AS monetization_score,
                CASE
                    WHEN :user_latitude IS NULL OR :user_longitude IS NULL THEN 0.50
                    ELSE GREATEST(
                        0.0,
                        1.0 - (
                            SQRT(
                                POWER(COALESCE(r.latitude, :user_latitude) - :user_latitude, 2) +
                                POWER(COALESCE(r.longitude, :user_longitude) - :user_longitude, 2)
                            ) / 1.5
                        )
                    )
                END AS proximity_score,
                COALESCE(pref.preference_score, 0.0) AS personalization_score
            FROM restaurants r
            LEFT JOIN restaurant_tiers t ON t.id = r.tier_id
            LEFT JOIN LATERAL (
                SELECT COUNT(*) AS booking_count
                FROM reservations res
                WHERE res.restaurant_id = r.id
                  AND res.created_at >= NOW() - INTERVAL '7 days'
                  AND res.status IN ('confirmed', 'pending')
            ) booking_stats ON TRUE
            LEFT JOIN LATERAL (
                SELECT COALESCE(MAX(LEAST(up.weight::float / 5.0, 1.0)), 0.0) AS preference_score
                FROM user_preferences up
                WHERE :user_id IS NOT NULL
                  AND up.user_id = CAST(:user_id AS uuid)
                  AND LOWER(up.cuisine) = LOWER(r.cuisine)
            ) pref ON TRUE
            CROSS JOIN (
                SELECT COALESCE(MAX(recent_counts.booking_count), 1) AS max_booking_count
                FROM (
                    SELECT COUNT(*) AS booking_count
                    FROM reservations
                    WHERE created_at >= NOW() - INTERVAL '7 days'
                      AND status IN ('confirmed', 'pending')
                    GROUP BY restaurant_id
                ) recent_counts
            ) max_booking
            CROSS JOIN (
                SELECT COALESCE(MAX(priority_rank), 1) AS max_priority_rank
                FROM restaurant_tiers
            ) max_tier
            WHERE r.embedding IS NOT NULL
            ORDER BY r.embedding <=> CAST(:embedding AS vector)
            LIMIT :candidate_limit
        ),
        scored AS (
            SELECT
                id,
                name,
                cuisine,
                city,
                description,
                intent_score,
                quality_score,
                trending_score,
                monetization_score,
                proximity_score,
                personalization_score,
                (
                    intent_score * 0.40 +
                    quality_score * 0.10 +
                    trending_score * 0.15 +
                    monetization_score * 0.10 +
                    proximity_score * 0.15 +
                    personalization_score * 0.10
                ) AS composite_score
            FROM candidates
        )
        SELECT
            id,
            name,
            cuisine,
            city,
            description,
            composite_score,
            intent_score,
            quality_score,
            trending_score,
            monetization_score,
            proximity_score,
            personalization_score
        FROM scored
        ORDER BY composite_score DESC
        LIMIT :limit
        """
    )

    db = SessionLocal()
    try:
        rows = db.execute(
            sql,
            {
                "embedding": vector_literal,
                "user_id": str(payload.user_id) if payload.user_id else None,
                "user_latitude": payload.user_latitude,
                "user_longitude": payload.user_longitude,
                "candidate_limit": payload.candidate_limit,
                "limit": payload.limit,
            },
        ).mappings().all()
    finally:
        db.close()

    if not rows:
        raise HTTPException(status_code=404, detail="No ranked restaurants found.")

    results = [
        RankedResult(
            id=row["id"],
            name=row["name"],
            cuisine=row["cuisine"],
            city=row["city"],
            description=row["description"],
            score=round(float(row["composite_score"]), 4),
            explanation=f"{row['name']} leads on intent fit, live demand, and local relevance.",
            breakdown={
                "intent": round(float(row["intent_score"]), 4),
                "quality": round(float(row["quality_score"]), 4),
                "trending": round(float(row["trending_score"]), 4),
                "monetization": round(float(row["monetization_score"]), 4),
                "proximity": round(float(row["proximity_score"]), 4),
                "personalization": round(float(row["personalization_score"]), 4),
            },
        )
        for row in rows
    ]

    return RankResponse(results=results)
