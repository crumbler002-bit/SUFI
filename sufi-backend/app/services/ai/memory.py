"""
Conversation Memory
Stores per-session chat history with Redis (persistent) and
falls back to an in-process dict when Redis is unavailable.

Each message: {"role": "user"|"assistant"|"system", "content": str}
TTL: 2 hours of inactivity per session.
"""

import json
from typing import List

from app.utils.redis_client import redis_client, REDIS_AVAILABLE

# In-memory fallback (single-process only)
_local_store: dict[str, list] = {}

SESSION_TTL = 60 * 60 * 2   # 2 hours
MAX_HISTORY  = 20            # keep last N messages to avoid token bloat
_KEY_PREFIX  = "sufi:chat:"


def _redis_key(session_id: str) -> str:
    return f"{_KEY_PREFIX}{session_id}"


def get_history(session_id: str) -> List[dict]:
    """Return the full message history for a session."""
    if REDIS_AVAILABLE and redis_client:
        raw = redis_client.get(_redis_key(session_id))
        if raw:
            return json.loads(raw)
        return []
    return _local_store.get(session_id, [])


def save_message(session_id: str, role: str, content: str) -> None:
    """Append a message and persist. Trims to MAX_HISTORY."""
    history = get_history(session_id)
    history.append({"role": role, "content": content})
    # Keep only the last MAX_HISTORY messages
    history = history[-MAX_HISTORY:]

    if REDIS_AVAILABLE and redis_client:
        redis_client.setex(_redis_key(session_id), SESSION_TTL, json.dumps(history))
    else:
        _local_store[session_id] = history


def clear_history(session_id: str) -> None:
    """Wipe a session's history (e.g. after booking confirmed)."""
    if REDIS_AVAILABLE and redis_client:
        redis_client.delete(_redis_key(session_id))
    else:
        _local_store.pop(session_id, None)


def get_missing_entities(session_id: str) -> dict:
    """
    Scan history to reconstruct entities already collected in this session.
    Used by the agent to avoid re-asking for info the user already gave.
    """
    history = get_history(session_id)
    merged: dict = {}
    for msg in history:
        if msg.get("role") == "_entities":   # internal marker
            merged.update(json.loads(msg["content"]))
    return merged


def save_entities(session_id: str, entities: dict) -> None:
    """Persist extracted entities as an internal history marker."""
    if not entities:
        return
    history = get_history(session_id)
    history.append({"role": "_entities", "content": json.dumps(entities)})
    history = history[-MAX_HISTORY:]
    if REDIS_AVAILABLE and redis_client:
        redis_client.setex(_redis_key(session_id), SESSION_TTL, json.dumps(history))
    else:
        _local_store[session_id] = history
