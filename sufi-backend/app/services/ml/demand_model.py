"""
Demand Forecasting Model — RandomForest
Trained on historical hourly reservation counts from DB.

Features per slot:
  - hour         : 0-23
  - day_of_week  : 0=Mon … 6=Sun

Label: bookings count for that slot

Falls back to moving-average if no trained model exists.
"""

import os
import numpy as np
from collections import defaultdict
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import extract, func

from app.models.reservation import Reservation

try:
    from sklearn.ensemble import RandomForestRegressor
    import joblib
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

LOOKBACK_DAYS = 14
WINDOW = 3  # moving-average fallback window
MODELS_DIR = os.path.join(os.path.dirname(__file__), "../../../../models")
MIN_TRAINING_SAMPLES = 10


def _demand_model_path(restaurant_id: int) -> str:
    os.makedirs(MODELS_DIR, exist_ok=True)
    return os.path.join(MODELS_DIR, f"demand_{restaurant_id}.pkl")


# ── DB helpers ────────────────────────────────────────────────────────────────

def _fetch_hourly_history(
    db: Session, restaurant_id: int, lookback_days: int = LOOKBACK_DAYS
) -> dict[int, list[int]]:
    """Returns {hour: [count_day1, count_day2, ...]} over the last N days."""
    since = datetime.combine(
        date.today() - timedelta(days=lookback_days), datetime.min.time()
    )
    rows = (
        db.query(
            func.date(Reservation.reservation_time).label("day"),
            extract("hour", Reservation.reservation_time).label("hour"),
            func.count(Reservation.id).label("count"),
        )
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.reservation_time >= since,
            Reservation.status.notin_(["cancelled"]),
        )
        .group_by("day", "hour")
        .all()
    )
    history: dict[int, list[int]] = defaultdict(list)
    for row in rows:
        if row.hour is not None:
            history[int(row.hour)].append(int(row.count))
    return history


def _fetch_training_records(db: Session, restaurant_id: int) -> tuple[list, list]:
    """
    Build (X, y) training pairs from historical data.
    X = [hour, day_of_week], y = booking count
    """
    since = datetime.combine(
        date.today() - timedelta(days=90), datetime.min.time()
    )
    rows = (
        db.query(
            func.date(Reservation.reservation_time).label("day"),
            extract("hour", Reservation.reservation_time).label("hour"),
            extract("dow", Reservation.reservation_time).label("dow"),
            func.count(Reservation.id).label("count"),
        )
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.reservation_time >= since,
            Reservation.status.notin_(["cancelled"]),
        )
        .group_by("day", "hour", "dow")
        .all()
    )
    X, y = [], []
    for row in rows:
        if row.hour is not None and row.dow is not None:
            X.append([int(row.hour), int(row.dow)])
            y.append(int(row.count))
    return X, y


# ── Training ──────────────────────────────────────────────────────────────────

def train_demand_model(db: Session, restaurant_id: int) -> dict:
    """
    Train RandomForest demand model from DB history and save to disk.
    Returns training summary.
    """
    if not SKLEARN_AVAILABLE:
        raise ImportError("scikit-learn is required. Run: pip install scikit-learn")

    X, y = _fetch_training_records(db, restaurant_id)
    if len(X) < MIN_TRAINING_SAMPLES:
        raise ValueError(
            f"Need at least {MIN_TRAINING_SAMPLES} reservation records to train demand model. "
            f"Got {len(X)}."
        )

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(np.array(X), np.array(y))

    path = _demand_model_path(restaurant_id)
    joblib.dump(model, path)

    return {
        "samples": len(X),
        "model_path": path,
        "trained_at": datetime.utcnow().isoformat(),
        "restaurant_id": restaurant_id,
    }


def load_demand_model(restaurant_id: int):
    """Load trained demand model from disk. Returns None if not trained yet."""
    if not SKLEARN_AVAILABLE:
        return None
    path = _demand_model_path(restaurant_id)
    if not os.path.exists(path):
        return None
    import joblib
    return joblib.load(path)


# ── Prediction ────────────────────────────────────────────────────────────────

def predict_demand_ml(restaurant_id: int, hour: int, day_of_week: int) -> float | None:
    """
    Predict booking count for a slot using trained RandomForest.
    Returns None if no model trained yet.
    """
    model = load_demand_model(restaurant_id)
    if model is None:
        return None
    return float(model.predict([[hour, day_of_week]])[0])


# ── Moving-average fallback ───────────────────────────────────────────────────

def forecast_demand(db: Session, restaurant_id: int) -> dict[str, float]:
    """
    Returns predicted reservation count per hour using moving average.
    Used as fallback when no ML model is trained.
    """
    history = _fetch_hourly_history(db, restaurant_id)
    forecast: dict[str, float] = {}
    for hour, counts in history.items():
        if not counts:
            continue
        window_counts = counts[-WINDOW:]
        forecast[str(hour)] = round(sum(window_counts) / len(window_counts), 2)
    return forecast


def forecast_demand_smart(db: Session, restaurant_id: int) -> dict[str, float]:
    """
    Forecast demand for all hours today.
    Uses ML model if trained, falls back to moving average.
    """
    from datetime import date as date_cls
    today = date_cls.today()
    day_of_week = today.weekday()

    model = load_demand_model(restaurant_id)
    if model is not None:
        # Predict all 24 hours
        hours = list(range(24))
        X = [[h, day_of_week] for h in hours]
        preds = model.predict(np.array(X))
        return {str(h): round(max(0.0, float(p)), 2) for h, p in zip(hours, preds)}

    return forecast_demand(db, restaurant_id)


def get_peak_hours(db: Session, restaurant_id: int) -> list[int]:
    """Returns the top 3 peak hours based on demand forecast."""
    forecast = forecast_demand(db, restaurant_id)
    if not forecast:
        return []
    sorted_hours = sorted(forecast.items(), key=lambda x: x[1], reverse=True)
    return [int(h) for h, _ in sorted_hours[:3]]