"""
Table Optimizer (Intelligence Layer)
Wraps the existing table_optimization_service to produce
dashboard-level efficiency metrics, suggestions, and
best-fit assignment analysis using real party sizes from DB.
"""

from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.restaurant_table import RestaurantTable
from app.models.reservation import Reservation
from app.services.table_optimization_service import get_table_utilization_report


def get_table_efficiency(db: Session, restaurant_id: int, target_date: date | None = None) -> dict:
    """
    Returns table-level efficiency metrics for a given date.
    Wraps get_table_utilization_report and adds aggregate insights
    plus best-fit analysis using real party sizes.
    """
    if target_date is None:
        target_date = date.today()

    from_time = datetime.combine(target_date, datetime.min.time())
    to_time = from_time + timedelta(days=1)

    table_report = get_table_utilization_report(db, restaurant_id, from_time, to_time)

    total_tables = len(table_report)
    if total_tables == 0:
        return {
            "efficiency_score": 0.0,
            "total_tables": 0,
            "active_tables": 0,
            "idle_tables": 0,
            "avg_utilization_pct": 0.0,
            "suggestion": "No tables configured for this restaurant.",
            "layout_suggestion": _suggest_layout(0.0, []),
            "best_fit_score": 0.0,
            "table_breakdown": [],
        }

    active = [t for t in table_report if t["total_reservations"] > 0]
    idle = [t for t in table_report if t["total_reservations"] == 0]

    avg_utilization = sum(t["avg_utilization_pct"] for t in table_report) / total_tables
    efficiency_score = round(avg_utilization / 100, 3)

    # Best-fit score: how well party sizes matched table capacities today
    best_fit_score = _compute_best_fit_score(db, restaurant_id, from_time, to_time)

    # Capacity distribution for layout advice
    capacities = [t["capacity"] for t in table_report]

    return {
        "efficiency_score": efficiency_score,
        "total_tables": total_tables,
        "active_tables": len(active),
        "idle_tables": len(idle),
        "avg_utilization_pct": round(avg_utilization, 1),
        "best_fit_score": best_fit_score,
        "suggestion": _generate_suggestion(efficiency_score, idle, table_report),
        "layout_suggestion": _suggest_layout(best_fit_score, capacities),
        "table_breakdown": table_report,
    }


def _compute_best_fit_score(
    db: Session, restaurant_id: int, from_time: datetime, to_time: datetime
) -> float:
    """
    Measures how tightly party sizes matched assigned table capacities.
    Score of 1.0 = perfect fit every time. Lower = wasted seats.
    Uses real reservation.guests vs restaurant_tables.capacity from DB.
    """
    rows = (
        db.query(Reservation.guests, RestaurantTable.capacity)
        .join(RestaurantTable, Reservation.table_id == RestaurantTable.id)
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.status.notin_(["cancelled"]),
            Reservation.reservation_time >= from_time,
            Reservation.reservation_time < to_time,
            Reservation.table_id.isnot(None),
        )
        .all()
    )

    if not rows:
        return 0.0

    total_score = sum(guests / capacity for guests, capacity in rows if capacity > 0)
    return round(total_score / len(rows), 3)


def _generate_suggestion(efficiency: float, idle_tables: list, all_tables: list) -> str:
    if efficiency >= 0.80:
        return "Tables are well-utilized. Consider adding capacity during peak hours."
    if efficiency >= 0.50:
        if idle_tables:
            caps = sorted(set(t["capacity"] for t in idle_tables))
            return f"Tables with capacity {caps} are idle — promote those slots with discounts."
        return "Moderate utilization. Dynamic pricing on off-peak slots could help."
    return f"{len(idle_tables)} tables are idle. Activate waitlist or run promotions to fill gaps."


def _suggest_layout(best_fit_score: float, capacities: list[int]) -> str:
    """Suggest table layout changes based on best-fit score and current mix."""
    if not capacities:
        return "No table data available."

    small = sum(1 for c in capacities if c <= 2)
    medium = sum(1 for c in capacities if 3 <= c <= 4)
    large = sum(1 for c in capacities if c >= 6)
    total = len(capacities)

    if best_fit_score < 0.60:
        if small / total < 0.30:
            return "Add more 2-seat tables — many small parties are being over-assigned to large tables."
        return "Party sizes are poorly matched to table sizes — review your table mix."
    if best_fit_score > 0.85:
        return "Layout is optimal — party sizes match table capacities well."
    if large / total > 0.50:
        return "Too many large tables — consider splitting some into 4-seat configurations."
    return "Minor layout adjustments recommended — monitor best-fit score over time."
