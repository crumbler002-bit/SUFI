"""
Notification Service
Creates DB notifications and pushes real-time alerts to connected
owner WebSocket clients via a per-restaurant connection registry.
"""

import asyncio
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.notification import Notification

# Per-restaurant WebSocket registry  {restaurant_id: [WebSocket, ...]}
_owner_connections: dict[int, list] = {}


# ── Registry helpers ──────────────────────────────────────────────────────────

def register_owner_ws(restaurant_id: int, websocket) -> None:
    _owner_connections.setdefault(restaurant_id, []).append(websocket)


def unregister_owner_ws(restaurant_id: int, websocket) -> None:
    conns = _owner_connections.get(restaurant_id, [])
    if websocket in conns:
        conns.remove(websocket)


# ── Core notification creator ─────────────────────────────────────────────────

def create_notification(
    db: Session,
    restaurant_id: int,
    message: str,
    notif_type: str,
) -> Notification:
    """
    Persist a notification to the DB.
    Also schedules a real-time push to any connected owner WebSocket.
    """
    notif = Notification(
        restaurant_id=restaurant_id,
        type=notif_type,
        message=message,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    # Fire-and-forget real-time push (non-blocking)
    _push_to_owner(restaurant_id, {
        "type": "notification",
        "notification_type": notif_type,
        "message": message,
        "id": notif.id,
        "created_at": notif.created_at.isoformat(),
    })

    return notif


def _push_to_owner(restaurant_id: int, payload: dict) -> None:
    """Push payload to all WebSocket connections for this restaurant."""
    conns = _owner_connections.get(restaurant_id, [])
    if not conns:
        return

    async def _send():
        dead = []
        for ws in list(conns):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            unregister_owner_ws(restaurant_id, ws)

    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.ensure_future(_send())
        else:
            loop.run_until_complete(_send())
    except RuntimeError:
        pass  # no event loop in sync context — notification still persisted in DB


# ── Convenience wrappers ──────────────────────────────────────────────────────

def notify_new_booking(db: Session, restaurant_id: int, user_name: str, guests: int, time: datetime) -> None:
    t = time.strftime("%b %d, %I:%M %p")
    create_notification(
        db, restaurant_id,
        f"New booking: {user_name} reserved for {guests} on {t}",
        "booking",
    )


def notify_cancellation(db: Session, restaurant_id: int, user_name: str, guests: int, time: datetime) -> None:
    t = time.strftime("%b %d, %I:%M %p")
    create_notification(
        db, restaurant_id,
        f"Cancellation: {user_name} cancelled their reservation for {guests} on {t}",
        "cancellation",
    )


def notify_auto_cancel(db: Session, restaurant_id: int, reservation_id: int) -> None:
    create_notification(
        db, restaurant_id,
        f"Auto-cancelled reservation #{reservation_id} due to overcapacity",
        "auto_cancel",
    )


def notify_waitlist_assigned(db: Session, restaurant_id: int, user_name: str) -> None:
    create_notification(
        db, restaurant_id,
        f"Waitlist: {user_name} was assigned a table from the waitlist",
        "waitlist_assigned",
    )
