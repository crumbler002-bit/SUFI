"""
Concierge Routes
Multi-turn AI agent with session memory, personalization, and action execution.
"""

import uuid
from fastapi import APIRouter, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.services.ai.agent import run_agent
from app.services.ai.memory import get_history, clear_history

router = APIRouter(prefix="/concierge", tags=["concierge"])

_bearer = HTTPBearer(auto_error=False)


def _resolve_user(credentials, db):
    """Resolve optional JWT → User or None."""
    if not credentials:
        return None
    try:
        from jose import jwt
        from app.config import settings
        from app.models.user import User

        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = payload.get("user_id")
        if user_id:
            return db.query(User).filter(User.id == user_id).first()
    except Exception:
        pass
    return None


class ChatRequest(BaseModel):
    query: str
    session_id: str | None = None   # client passes this back each turn


@router.post("/chat")
def concierge_chat(
    request: ChatRequest,
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
):
    """
    Multi-turn AI concierge.

    - Pass `session_id` from the previous response to continue a conversation.
    - Omit it (or send null) to start a new session.
    - Authenticated users can auto-book; guests get search + suggestions only.

    Response includes:
      reply          — natural language answer
      session_id     — pass this back on the next turn
      intent         — detected intent
      entities       — all entities collected so far in this session
      restaurants    — top matching restaurants
      suggestions    — available time slots
      action         — booking/waitlist result if executed
      needs_input    — follow-up question key if agent needs more info
      history        — full visible conversation so far
    """
    user = _resolve_user(credentials, db)

    # Generate a new session_id if client didn't provide one
    session_id = request.session_id or str(uuid.uuid4())

    result = run_agent(db, session_id, request.query, user=user)

    return {
        "session_id": session_id,
        **result,
    }


@router.get("/history/{session_id}")
def get_session_history(
    session_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
):
    """Return the full visible conversation history for a session."""
    history = [
        m for m in get_history(session_id)
        if m["role"] in ("user", "assistant")
    ]
    return {"session_id": session_id, "history": history}


@router.delete("/history/{session_id}")
def reset_session(
    session_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
):
    """Clear a session's conversation history."""
    clear_history(session_id)
    return {"session_id": session_id, "status": "cleared"}
