from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth_middleware import get_current_user
from app.schemas.waitlist_schema import WaitlistJoin, WaitlistEntryOut
from app.services.waitlist_service import (
    add_to_waitlist,
    get_waitlist_for_restaurant,
    cancel_waitlist_entry,
)

router = APIRouter(prefix="/waitlist", tags=["waitlist"])


@router.post("/join")
def join_waitlist(
    data: WaitlistJoin,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add the current user to the waitlist for a restaurant / time slot."""
    entry = add_to_waitlist(
        db=db,
        user_id=current_user.id,
        restaurant_id=data.restaurant_id,
        guests=data.guests,
        requested_time=data.requested_time,
        duration_minutes=data.duration_minutes,
    )
    return {
        "status": "added_to_waitlist",
        "waitlist_id": entry.id,
        "position": _get_position(db, entry),
    }


@router.get("/restaurant/{restaurant_id}", response_model=list[WaitlistEntryOut])
def view_waitlist(
    restaurant_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Owner view — all waiting entries for a restaurant (FIFO order)."""
    return get_waitlist_for_restaurant(db, restaurant_id)


@router.delete("/{entry_id}")
def cancel_entry(
    entry_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel a waitlist entry (user must own the entry)."""
    try:
        entry = cancel_waitlist_entry(db, entry_id, current_user.id)
        return {"status": "cancelled", "waitlist_id": entry.id}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


# ---------------------------------------------------------------------------
# Internal helper
# ---------------------------------------------------------------------------

def _get_position(db, entry) -> int:
    """Return 1-based queue position for the newly added entry."""
    from app.models.waitlist_entry import WaitlistEntry
    count = (
        db.query(WaitlistEntry)
        .filter(
            WaitlistEntry.restaurant_id == entry.restaurant_id,
            WaitlistEntry.status == "waiting",
            WaitlistEntry.created_at <= entry.created_at,
        )
        .count()
    )
    return count
