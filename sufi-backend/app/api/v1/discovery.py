from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.discovery import DiscoverRequest, DiscoverResponse
from app.services.discovery import discover_restaurants

router = APIRouter(prefix="/api/v1", tags=["discovery-v1"])


@router.post("/discover", response_model=DiscoverResponse)
def discover(payload: DiscoverRequest, db: Session = Depends(get_db)) -> DiscoverResponse:
    return discover_restaurants(db, payload)
