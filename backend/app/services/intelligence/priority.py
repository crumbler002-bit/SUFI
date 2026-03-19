"""
Reservation Priority Scoring Engine

Assigns each reservation a numeric priority score combining:
  - User value     (visit frequency, avg spend)
  - Booking value  (party size → expected revenue)
  - Reliability    (no-show history, ML probability)
  - Timing         (lead time — early bookers are more reliable)
  - VIP flag       (hard boost)

Higher score = protect at all cost.
Lower score  = candidate for auto-cancel / reschedule.
"""

from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.reservation import Reservation
from app.services.ml.training_pipeline import predict_noshow


# ── Weights (tune without touching callers) ───────────────────────────────────
W_USER_VISITS = 2.0       # per past visit
W_AVG_SPEND = 0.01        # per rupee of avg spend
W_PARTY_SIZE = 3.0        # per guest
W_NOSHOW_HISTORY = -5.0   # per historical no-show
W_LEAD_TIME = 0.5         # per hour of advance booking
W_NOSHOW_ML = -10.0       # per unit of ML-predicted P(no-show)
VIP_BONUS = 20.0
TOP_TIER_THRESHOLD = 0.80  # top 20% are protected


# ── Core scorer ───────────────────────────────────────────────────────────────

def compute_priority(reservation: dict) -> float:
    """
    Compute a priority score for a single reservation dict.

    Expected keys (all optional with safe defaults):
      user_visits         int   — total past reservations by this user
      avg_spend           float — average spend per visit (₹)
      party_size          int   — number of guests
      no_show_count       int   — historical no-shows by this user
      lead_time_hours     float — hours between booking creation and slot
      noshow_probability  float — ML-predicted P(no-show), 0.0–1.0
      is_vip              bool
    """
    score = 0.0

    score += reservation.get("user_visits", 0) * W_USER_VISITS
    score += reservation.get("avg_spend", 0.0) * W_AVG_SPEND
    score += reservation.get("party_size", 2) * W_PARTY_SIZE
    score += reservation.get("no_show_count", 0) * W_NOSHOW_HISTORY
    score += reservation.get("lead_time_hours", 0.0) * W_LEAD_TIME
    score += reservation.get("noshow_probability", 0.0) * W_NOSHOW_ML

    if reservation.get("is_vip"):
        score += VIP_BONUS

    return round(score, 2)


def rank_reservations(reservations: list[dict]) -> list[dict]:
    """
    Attach priority_score + priority_label to each reservation dict.
    Returns list sorted ascending (lowest priority first — cancel candidates at top).
    """
    for r in reservations:
        r["priority_score"] = compute_priority(r)

    ranked = sorted(reservations, key=lambda x: x["priority_score"])

    if not ranked:
        return ranked

    scores = [r["priority_score"] for r in ranked]
    min_s, max_s = scores[0], scores[-1]
    spread = max_s - min_s or 1.0

    for r in ranked:
        pct = (r["priority_score"] - min_s) / spread
        if r.get("is_vip"):
            r["priority_label"] = "vip"
        elif pct >= TOP_TIER_THRESHOLD:
            r["priority_label"] = "high"
        elif pct >= 0.40:
            r["priority_label"] = "medium"
        else:
            r["priority_label"] = "low"

    return ranked


# ── DB-backed builder ─────────────────────────────────────────────────────────

def build_reservation_priority_list(
    db: Session,
    restaurant_id: int,
    reservations: list[Reservation] | None = None,
) -> list[dict]:
    """
    Fetch today's active reservations for a restaurant, enrich with user
    history signals, run ML noshow prediction, and return ranked list.
    """
    from datetime import date, timedelta

    if reservations is None:
        today = datetime.utcnow().date()
        day_start = datetime.combine(today, datetime.min.time())
        day_end = day_start + timedelta(days=1)
        reservations = (
            db.query(Reservation)
            .filter(
                Reservation.restaurant_id == restaurant_id,
                Reservation.reservation_time >= day_start,
                Reservation.reservation_time < day_end,
                Reservation.status.in_(["pending", "confirmed"]),
            )
            .all()
        )

    records = []
    for res in reservations:
        user_id = res.user_id

        # Past visit count for this user at this restaurant
        user_visits = (
            db.query(func.count(Reservation.id))
            .filter(
                Reservation.user_id == user_id,
                Reservation.restaurant_id == restaurant_id,
                Reservation.status == "completed",
            )
            .scalar()
        ) or 0

        # Historical no-show count
        no_show_count = (
            db.query(func.count(Reservation.id))
            .filter(
                Reservation.user_id == user_id,
                Reservation.status == "no_show",
            )
            .scalar()
        ) or 0

        # Total past reservations for noshow rate
        total_past = (
            db.query(func.count(Reservation.id))
            .filter(
                Reservation.user_id == user_id,
                Reservation.status.in_(["completed", "no_show"]),
            )
            .scalar()
        ) or 1

        user_noshow_history = round(no_show_count / total_past, 3)

        # Lead time in hours
        lead_time_hours = 0.0
        if res.created_at and res.reservation_time:
            lead_time_hours = max(
                0.0,
                (res.reservation_time - res.created_at).total_seconds() / 3600,
            )

        # ML noshow probability
        noshow_prob = predict_noshow(restaurant_id, {
            "hour": res.reservation_time.hour if res.reservation_time else 12,
            "day_of_week": res.reservation_time.weekday() if res.reservation_time else 0,
            "party_size": res.guests or 2,
            "lead_time_hrs": lead_time_hours,
            "user_noshow_history": user_noshow_history,
        })

        records.append({
            "id": res.id,
            "user_id": str(user_id),
            "restaurant_id": restaurant_id,
            "reservation_time": res.reservation_time,
            "guests": res.guests,
            "status": res.status,
            "created_at": res.created_at,
            # scoring signals
            "user_visits": user_visits,
            "avg_spend": 500.0,          # placeholder until billing exists
            "party_size": res.guests or 2,
            "no_show_count": no_show_count,
            "lead_time_hours": lead_time_hours,
            "noshow_probability": noshow_prob,
            "is_vip": False,             # extend when VIP flag added to User
        })

    return rank_reservations(records)
