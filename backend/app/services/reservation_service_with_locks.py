from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from app.models.reservation import Reservation
from app.models.restaurant_table import RestaurantTable
from typing import Optional

class ReservationService:
    @staticmethod
    def create_reservation_with_lock(
        db: Session,
        restaurant_id: int,
        user_id: str,
        reservation_time: datetime,
        guests: int
    ) -> Optional[Reservation]:
        """
        Create reservation with database locks to prevent double booking
        """
        try:
            # Start transaction
            with db.begin():
                # Find available tables with FOR UPDATE lock
                # This locks the table rows for the duration of the transaction
                available_tables = db.execute(text("""
                    SELECT rt.id, rt.capacity
                    FROM restaurant_tables rt
                    WHERE rt.restaurant_id = :restaurant_id
                    AND rt.capacity >= :guests
                    AND rt.id NOT IN (
                        SELECT r.table_id
                        FROM reservations r
                        WHERE r.restaurant_id = :restaurant_id
                        AND r.reservation_time = :reservation_time
                        AND r.status != 'cancelled'
                    )
                    FOR UPDATE
                    ORDER BY rt.capacity ASC
                    LIMIT 1
                """), {
                    "restaurant_id": restaurant_id,
                    "guests": guests,
                    "reservation_time": reservation_time
                }).fetchone()
                
                if not available_tables:
                    return None
                
                table_id, table_capacity = available_tables
                
                # Create reservation
                reservation = Reservation(
                    restaurant_id=restaurant_id,
                    table_id=table_id,
                    user_id=user_id,
                    reservation_time=reservation_time,
                    guests=guests,
                    status="pending"
                )
                
                db.add(reservation)
                db.flush()  # Get the ID without committing
                
                return reservation
                
        except Exception as e:
            db.rollback()
            raise e
    
    @staticmethod
    def check_table_availability_with_lock(
        db: Session,
        restaurant_id: int,
        reservation_time: datetime,
        guests: int
    ) -> list:
        """
        Check table availability with locks
        """
        try:
            available_tables = db.execute(text("""
                SELECT rt.id, rt.table_number, rt.capacity
                FROM restaurant_tables rt
                WHERE rt.restaurant_id = :restaurant_id
                AND rt.capacity >= :guests
                AND rt.id NOT IN (
                    SELECT r.table_id
                    FROM reservations r
                    WHERE r.restaurant_id = :restaurant_id
                    AND r.reservation_time = :reservation_time
                    AND r.status != 'cancelled'
                )
                FOR UPDATE
                ORDER BY rt.capacity ASC
            """), {
                "restaurant_id": restaurant_id,
                "guests": guests,
                "reservation_time": reservation_time
            }).fetchall()
            
            return [
                {
                    "table_id": row[0],
                    "table_number": row[1],
                    "capacity": row[2]
                }
                for row in available_tables
            ]
            
        except Exception as e:
            raise e
