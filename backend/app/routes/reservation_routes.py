from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.schemas.reservation_schema import ReservationCreate, ReservationAutoCreate
from app.schemas.reservation_search_schema import ReservationSearchRequest
from app.models.reservation import Reservation
from app.models.restaurant import Restaurant
from app.models.reservation_payment import ReservationPayment
from app.middleware.auth_middleware import get_current_user
from app.services.reservation_service import (
    search_restaurants_with_availability,
    create_reservation_with_table,
    check_table_availability
)
from app.services.table_optimization_service import (
    auto_assign_and_create,
    get_table_utilization_report,
)
from app.services.waitlist_service import add_to_waitlist, process_waitlist
from app.routes.ws_routes import broadcast_reservation_update
from app.services.recommendation_service import update_user_preference
from app.services.analytics_service import track_reservation
from app.services.promotion_service import mark_promotion_reservation
from app.utils.redis_client import redis_client as redis_raw_client, REDIS_AVAILABLE

router = APIRouter(prefix="/reservations")

@router.post("/search")
def search_availability(
    search_data: ReservationSearchRequest,
    db: Session = Depends(get_db)
):
    """Search for restaurants with available tables"""
    try:
        # Combine date and time into a single datetime
        reservation_datetime = datetime.combine(
            search_data.date.date(),
            search_data.time.time()
        )
        
        available_restaurants = search_restaurants_with_availability(
            db=db,
            city=search_data.location,
            guests=search_data.guests,
            reservation_time=reservation_datetime
        )
        
        return {
            "location": search_data.location,
            "guests": search_data.guests,
            "reservation_time": reservation_datetime,
            "available_restaurants": available_restaurants
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create")
async def create_reservation(
    data: ReservationCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a reservation with table assignment and double-booking prevention"""
    try:
        # Verify restaurant exists
        restaurant = db.query(Restaurant).filter(Restaurant.id == data.restaurant_id).first()
        if restaurant is None:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        # Check if table is available at the requested time
        if not check_table_availability(db, data.table_id, data.reservation_time):
            raise HTTPException(status_code=400, detail="Table is already reserved for this time slot")

        # Create reservation using the service
        reservation = create_reservation_with_table(
            db=db,
            restaurant_id=data.restaurant_id,
            table_id=data.table_id,
            user_id=current_user.id,
            reservation_time=data.reservation_time,
            guests=data.guests
        )

        # Commission tracking (placeholder booking value until menu/bill system exists)
        booking_value = 2000.0
        commission_rate = restaurant.commission_rate or 0.0
        commission_amount = float(commission_rate) * float(booking_value)

        payment = ReservationPayment(
            reservation_id=reservation.id,
            restaurant_id=restaurant.id,
            commission_amount=commission_amount,
            payment_status="pending",
        )

        db.add(payment)
        db.commit()

        track_reservation(db, restaurant.id)
        mark_promotion_reservation(db, restaurant.id)

        # Broadcast real-time update to all connected clients
        await broadcast_reservation_update(
            restaurant_id=reservation.restaurant_id,
            table_id=reservation.table_id,
            reservation_time=reservation.reservation_time.isoformat()
        )

        # Update user preference based on restaurant cuisine
        update_user_preference(db, current_user.id, restaurant.cuisine)

        if REDIS_AVAILABLE and redis_raw_client:
            redis_raw_client.delete(f"recommend:{current_user.id}:20")

        return {
            "reservation_id": reservation.id,
            "restaurant_id": reservation.restaurant_id,
            "table_id": reservation.table_id,
            "reservation_time": reservation.reservation_time,
            "guests": reservation.guests,
            "status": reservation.status
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/auto-create")
async def auto_create_reservation(
    data: ReservationAutoCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a reservation using the Table Optimization Engine.
    No table_id required — the engine picks the best-fit table automatically
    using time-window overlap detection and utilization scoring.
    """
    try:
        restaurant = db.query(Restaurant).filter(Restaurant.id == data.restaurant_id).first()
        if restaurant is None:
            raise HTTPException(status_code=404, detail="Restaurant not found")

        # Optimization engine: find best table + create reservation (not yet committed)
        reservation = auto_assign_and_create(
            db=db,
            restaurant_id=data.restaurant_id,
            user_id=current_user.id,
            reservation_time=data.reservation_time,
            guests=data.guests,
            duration_minutes=data.duration_minutes,
        )

        # Commission tracking
        booking_value = 2000.0
        commission_rate = restaurant.commission_rate or 0.0
        payment = ReservationPayment(
            reservation_id=reservation.id,
            restaurant_id=restaurant.id,
            commission_amount=float(commission_rate) * booking_value,
            payment_status="pending",
        )
        db.add(payment)
        db.commit()
        db.refresh(reservation)

        track_reservation(db, restaurant.id)
        mark_promotion_reservation(db, restaurant.id)

        await broadcast_reservation_update(
            restaurant_id=reservation.restaurant_id,
            table_id=reservation.table_id,
            reservation_time=reservation.reservation_time.isoformat(),
        )

        update_user_preference(db, current_user.id, restaurant.cuisine)

        if REDIS_AVAILABLE and redis_raw_client:
            redis_raw_client.delete(f"recommend:{current_user.id}:20")

        return {
            "reservation_id": reservation.id,
            "restaurant_id": reservation.restaurant_id,
            "table_id": reservation.table_id,
            "reservation_time": reservation.reservation_time,
            "guests": reservation.guests,
            "status": reservation.status,
            "auto_assigned": True,
        }

    except ValueError as e:
        # No table available — add to waitlist instead of rejecting
        from app.services.reservation_service import round_to_timeslot
        slot_time = round_to_timeslot(data.reservation_time)
        entry = add_to_waitlist(
            db=db,
            user_id=current_user.id,
            restaurant_id=data.restaurant_id,
            guests=data.guests,
            requested_time=slot_time,
            duration_minutes=data.duration_minutes,
        )
        return {
            "status": "waitlisted",
            "waitlist_id": entry.id,
            "restaurant_id": data.restaurant_id,
            "requested_time": slot_time,
            "guests": data.guests,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/cancel/{reservation_id}")
async def cancel_reservation(
    reservation_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Cancel a reservation and immediately trigger waitlist processing
    so the freed slot can be assigned to the next waiting user.
    """
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if str(reservation.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorised to cancel this reservation")

    restaurant_id = reservation.restaurant_id
    reservation.status = "cancelled"
    db.commit()

    # Trigger waitlist — someone may now get this slot
    process_waitlist(db, restaurant_id)

    return {"status": "cancelled", "reservation_id": reservation_id}


@router.get("/table-utilization")
def table_utilization(
    restaurant_id: int = Query(...),
    from_time: datetime = Query(...),
    to_time: datetime = Query(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns per-table utilization stats for a restaurant over a time window.
    Owners can use this to identify underused or overloaded tables.
    """
    try:
        report = get_table_utilization_report(db, restaurant_id, from_time, to_time)
        return {"restaurant_id": restaurant_id, "utilization": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
