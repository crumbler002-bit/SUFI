"""
LLM Client
Prefers Groq (free, fast). Falls back to OpenAI if available.
Falls back to keyword-based parsing if neither is configured.
"""

import json
import logging
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)

LLM_AVAILABLE = False
_client = None
_model = None

# Try Groq first
try:
    if settings.GROQ_API_KEY:
        from groq import Groq
        _client = Groq(api_key=settings.GROQ_API_KEY)
        _model = settings.GROQ_MODEL
        LLM_AVAILABLE = True
        logger.info("Groq LLM client initialised (model=%s)", _model)
except ImportError:
    logger.info("groq package not installed — trying OpenAI")
except Exception as e:
    logger.warning("Groq client init failed: %s", e)

# Fall back to OpenAI
if not LLM_AVAILABLE:
    try:
        if settings.OPENAI_API_KEY:
            from openai import OpenAI
            _client = OpenAI(api_key=settings.OPENAI_API_KEY)
            _model = settings.OPENAI_MODEL
            LLM_AVAILABLE = True
            logger.info("OpenAI LLM client initialised (model=%s)", _model)
        else:
            logger.info("No LLM API key set — using keyword-based fallback")
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
    if not LLM_AVAILABLE or _client is None:
        return None
    try:
        kwargs: dict[str, Any] = {
            "model": _model,
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
    if not LLM_AVAILABLE:
        return None

    system = (
        "You are an AI restaurant concierge assistant. "
        "Extract the user's intent and entities from their message. "
        "Return ONLY valid JSON with keys: intent, entities. "
        "intent must be one of: booking, recommendation, availability, cancel, general. "
        "entities keys: party_size (int), time_str (HH:MM 24h), date_str (YYYY-MM-DD), "
        "cuisine (string), city (string), price_limit (int). "
        "Use null for missing values."
    )

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
    if not LLM_AVAILABLE:
        return None

    rest_summary = ""
    if restaurants:
        lines = [
            f"  - {r['name']} ({r.get('cuisine', '')}, {r.get('city', '')}"
            + (f", ★{r.get('rating')}" if r.get("rating") else "") + ")"
            for r in restaurants[:3]
        ]
        rest_summary = "Matching restaurants:\n" + "\n".join(lines)

    action_summary = f"Action result: {json.dumps(action)}" if action else ""

    system = (
        "You are SUFI, a warm and concise AI restaurant concierge. "
        "Reply in 1-3 sentences. Highlight the top restaurant pick. "
        "If a booking was made, confirm it clearly. "
        "Never mention JSON or internal data.\n\n"
        f"{rest_summary}\n{action_summary}"
    )

    recent = [m for m in history if m["role"] in ("user", "assistant")][-8:]
    messages = [{"role": "system", "content": system}] + recent + [
        {"role": "user", "content": query}
    ]

    return llm_chat(messages, temperature=0.5, max_tokens=200)
