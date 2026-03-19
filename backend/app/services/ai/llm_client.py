"""
LLM Client
Wraps OpenAI chat completions with graceful fallback to keyword-based parsing.

Usage:
  from app.services.ai.llm_client import llm_chat, LLM_AVAILABLE

  if LLM_AVAILABLE:
      result = llm_chat(messages, response_format="json")
  else:
      # fall back to regex/keyword logic
"""

import json
import logging
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)

LLM_AVAILABLE = False
_client = None

try:
    if settings.OPENAI_API_KEY:
        from openai import OpenAI
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
        LLM_AVAILABLE = True
        logger.info("OpenAI LLM client initialised (model=%s)", settings.OPENAI_MODEL)
    else:
        logger.info("OPENAI_API_KEY not set — using keyword-based fallback")
except ImportError:
    logger.info("openai package not installed — using keyword-based fallback")
except Exception as e:
    logger.warning("LLM client init failed: %s — using fallback", e)


def llm_chat(
    messages: list[dict],
    *,
    json_mode: bool = False,
    temperature: float = 0.3,
    max_tokens: int = 512,
) -> str | None:
    """
    Call the LLM and return the assistant's reply as a string.
    Returns None if unavailable or on error.
    """
    if not LLM_AVAILABLE or _client is None:
        return None
    try:
        kwargs: dict[str, Any] = {
            "model": settings.OPENAI_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        resp = _client.chat.completions.create(**kwargs)
        return resp.choices[0].message.content
    except Exception as e:
        logger.warning("LLM call failed: %s", e)
        return None


def llm_parse_intent_and_entities(
    query: str,
    history: list[dict],
) -> dict | None:
    """
    Ask the LLM to extract intent + entities from the user query in JSON.
    Returns None if LLM unavailable or parse fails.

    Expected JSON shape:
    {
      "intent": "booking|recommendation|availability|cancel|general",
      "entities": {
        "party_size": int | null,
        "time_str": "HH:MM" | null,
        "date_str": "YYYY-MM-DD" | null,
        "cuisine": str | null,
        "city": str | null,
        "price_limit": int | null
      }
    }
    """
    if not LLM_AVAILABLE:
        return None

    system = (
        "You are an AI restaurant concierge assistant. "
        "Extract the user's intent and entities from their message. "
        "Return ONLY valid JSON with keys: intent, entities. "
        "intent must be one of: booking, recommendation, availability, cancel, general. "
        "entities keys: party_size (int), time_str (HH:MM 24h), date_str (YYYY-MM-DD), "
        "cuisine (string), city (string), price_limit (int). "
        "Use null for missing values. Today's date context is available in history."
    )

    # Include recent history for context (last 6 messages)
    recent = [m for m in history if m["role"] in ("user", "assistant")][-6:]
    messages = [{"role": "system", "content": system}] + recent + [
        {"role": "user", "content": query}
    ]

    raw = llm_chat(messages, json_mode=True, max_tokens=256)
    if not raw:
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def llm_generate_reply(
    query: str,
    history: list[dict],
    intent: str,
    entities: dict,
    restaurants: list[dict],
    action: dict | None,
    user_context: str,
) -> str | None:
    """
    Generate a natural language reply using the LLM with full context.
    Returns None if LLM unavailable.
    """
    if not LLM_AVAILABLE:
        return None

    rest_summary = ""
    if restaurants:
        lines = [f"  - {r['name']} ({r.get('cuisine','')}, {r.get('rating','')}⭐)" for r in restaurants[:3]]
        rest_summary = "Matching restaurants:\n" + "\n".join(lines)

    action_summary = ""
    if action:
        action_summary = f"Action result: {json.dumps(action)}"

    system = (
        "You are SUFI, an AI restaurant concierge. "
        "Be concise, warm, and helpful. 1-3 sentences max. "
        "If a booking was made, confirm it clearly. "
        "If recommending, highlight the top pick briefly. "
        "Never mention JSON or internal data structures.\n\n"
        f"User context:\n{user_context}\n\n"
        f"{rest_summary}\n{action_summary}"
    )

    recent = [m for m in history if m["role"] in ("user", "assistant")][-8:]
    messages = [{"role": "system", "content": system}] + recent + [
        {"role": "user", "content": query}
    ]

    return llm_chat(messages, temperature=0.5, max_tokens=200)
