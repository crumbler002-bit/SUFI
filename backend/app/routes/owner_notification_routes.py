"""
Owner Notification Routes
Inbox API for restaurant owners to view and manage notifications.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.models.notification import Notification

router = APIRouter(prefix="/owner/notifications", tags=["owner"])


@router.get("/{restaurant_id}")
def get_notifications(
    restaurant_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notifications = (
        db.query(Notification)
        .filter(Notification.restaurant_id == restaurant_id)
        .order_by(Notification.created_at.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": n.id,
            "type": n.type,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
        }
        for n in notifications
    ]


@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"status": "read", "id": notification_id}


@router.put("/{restaurant_id}/read-all")
def mark_all_read(
    restaurant_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(
        Notification.restaurant_id == restaurant_id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"status": "all_read", "restaurant_id": restaurant_id}


@router.get("/{restaurant_id}/unread-count")
def unread_count(
    restaurant_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = (
        db.query(Notification)
        .filter(
            Notification.restaurant_id == restaurant_id,
            Notification.is_read == False,
        )
        .count()
    )
    return {"restaurant_id": restaurant_id, "unread_count": count}
