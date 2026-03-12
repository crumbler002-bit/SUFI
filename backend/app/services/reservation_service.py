from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.restaurant import Restaurant
from app.models.restaurant_table import RestaurantTable
from app.models.reservation import Reservation

def round_to_timeslot(reservation_time: datetime, slot_duration_minutes: int = 90) -> datetime:
    """Round reservation time to the nearest time slot"""
    # Round to the nearest slot
    total_minutes = reservation_time.hour * 60 + reservation_time.minute
    slot_minutes = (total_minutes // slot_duration_minutes) * slot_duration_minutes
    
    rounded_time = reservation_time.replace(
        hour=slot_minutes // 60,
        minute=slot_minutes % 60,
        second=0,
        microsecond=0
    )
    
    return rounded_time

def search_available_tables(db: Session, restaurant_id: int, guests: int, reservation_time: datetime) -> list:
    """Search for available tables at a specific restaurant for given time and guests"""
    
    # Round to time slot
    slot_time = round_to_timeslot(reservation_time)
    
    # Find tables with sufficient capacity that are not already reserved
    query = text("""
        SELECT t.id, t.table_number, t.capacity
        FROM restaurant_tables t
        WHERE t.restaurant_id = :restaurant_id
        AND t.capacity >= :guests
        AND t.id NOT IN (
            SELECT r.table_id
            FROM reservations r
            WHERE r.table_id IS NOT NULL
            AND r.reservation_time = :slot_time
        )
        ORDER BY t.capacity ASC
    """)
    
    result = db.execute(query, {
        "restaurant_id": restaurant_id,
        "guests": guests,
        "slot_time": slot_time
    }).fetchall()
    
    return [
        {
            "table_id": row.id,
            "table_number": row.table_number,
            "capacity": row.capacity
        }
        for row in result
    ]

def search_restaurants_with_availability(
    db: Session, 
    city: str, 
    guests: int, 
    reservation_time: datetime
) -> list:
    """Search restaurants in a city that have available tables for given time and guests"""
    
    # Round to time slot
    slot_time = round_to_timeslot(reservation_time)
    
    # Find restaurants in the city
    restaurants = db.query(Restaurant).filter(Restaurant.city == city).all()
    
    available_restaurants = []
    
    for restaurant in restaurants:
        # Check if restaurant has available tables
        available_tables = search_available_tables(db, restaurant.id, guests, slot_time)
        
        if available_tables:
            available_restaurants.append({
                "restaurant_id": restaurant.id,
                "name": restaurant.name,
                "cuisine": restaurant.cuisine,
                "rating": restaurant.rating,
                "total_reviews": restaurant.total_reviews,
                "price_range": restaurant.price_range,
                "address": restaurant.address,
                "is_featured": restaurant.is_featured,
                "available_tables": available_tables
            })
    
    return available_restaurants

def check_table_availability(db: Session, table_id: int, reservation_time: datetime) -> bool:
    """Check if a specific table is available at a given time"""
    
    # Round to time slot
    slot_time = round_to_timeslot(reservation_time)
    
    existing = db.query(Reservation).filter(
        Reservation.table_id == table_id,
        Reservation.reservation_time == slot_time
    ).first()
    
    return existing is None

def create_reservation_with_table(
    db: Session,
    restaurant_id: int,
    table_id: int,
    user_id: str,
    reservation_time: datetime,
    guests: int
) -> Reservation:
    """Create a reservation with table assignment and double-booking prevention"""
    
    # Round to time slot
    slot_time = round_to_timeslot(reservation_time)
    
    # Check if table is available
    if not check_table_availability(db, table_id, slot_time):
        raise ValueError("Table is already reserved for this time slot")
    
    # Create reservation
    reservation = Reservation(
        restaurant_id=restaurant_id,
        table_id=table_id,
        user_id=user_id,
        reservation_time=slot_time,
        guests=guests
    )
    
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    
    return reservation
