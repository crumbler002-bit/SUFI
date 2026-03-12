from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.schemas.reservation_schema import ReservationCreate
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
from app.routes.ws_routes import broadcast_reservation_update
from app.services.recommendation_service import update_user_preference

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

        # Broadcast real-time update to all connected clients
        await broadcast_reservation_update(
            restaurant_id=reservation.restaurant_id,
            table_id=reservation.table_id,
            reservation_time=reservation.reservation_time.isoformat()
        )

        # Update user preference based on restaurant cuisine
        update_user_preference(db, current_user.id, restaurant.cuisine)

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
