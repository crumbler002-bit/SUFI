"""
Training Pipeline
Fetches real reservation data from DB, builds feature vectors,
trains the NoShowModel + DemandModel, and persists them to disk with joblib.

Run manually:
    python -m app.services.ml.training_pipeline

Or trigger via API:
    POST /owner/intelligence/ml/train/{restaurant_id}
    POST /owner/intelligence/ml/train-demand/{restaurant_id}
"""

import os
import joblib
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.reservation import Reservation
from app.services.ml.noshow_model import NoShowModel
from app.services.ml.demand_model import train_demand_model

# Where trained models are stored (relative to backend/)
MODELS_DIR = os.path.join(os.path.dirname(__file__), "../../../../models")


def _model_path(restaurant_id: int) -> str:
    os.makedirs(MODELS_DIR, exist_ok=True)
    return os.path.join(MODELS_DIR, f"noshow_{restaurant_id}.pkl")


def _build_user_noshow_history(db: Session, restaurant_id: int) -> dict:
    """
    Pre-compute per-user no-show fraction from historical data.
    Returns {user_id_str: noshow_fraction}
    """
    from sqlalchemy import case, Integer

    rows = (
        db.query(
            Reservation.user_id,
            func.count(Reservation.id).label("total"),
            func.sum(
                case((Reservation.status == "no_show", 1), else_=0)
            ).label("noshows"),
        )
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.status.in_(["completed", "no_show"]),
        )
        .group_by(Reservation.user_id)
        .all()
    )

    history = {}
    for row in rows:
        total = row.total or 0
        noshows = row.noshows or 0
        if total > 0:
            history[str(row.user_id)] = round(noshows / total, 3)
    return history


def fetch_training_records(db: Session, restaurant_id: int) -> list[dict]:
    """
    Fetch all completed/no-show reservations and convert to feature dicts.
    Uses real DB fields: reservation_time, created_at, guests, status, user_id.
    """
    reservations = (
        db.query(Reservation)
        .filter(
            Reservation.restaurant_id == restaurant_id,
            Reservation.status.in_(["completed", "no_show"]),
        )
        .all()
    )

    user_history = _build_user_noshow_history(db, restaurant_id)

    records = []
    for r in reservations:
        if r.reservation_time is None or r.created_at is None:
            continue

        lead_time_hrs = max(
            0.0,
            (r.reservation_time - r.created_at).total_seconds() / 3600,
        )

        records.append({
            "hour": r.reservation_time.hour,
            "day_of_week": r.reservation_time.weekday(),
            "party_size": r.guests or 2,
            "lead_time_hrs": round(lead_time_hrs, 2),
            "user_noshow_history": user_history.get(str(r.user_id), 0.0),
            "status": r.status,
        })

    return records


def train_and_save(db: Session, restaurant_id: int) -> dict:
    """
    Full pipeline: fetch → train → save.
    Returns training summary dict.
    """
    records = fetch_training_records(db, restaurant_id)
    model = NoShowModel()
    summary = model.train(records)

    path = _model_path(restaurant_id)
    joblib.dump(model, path)

    return {
        **summary,
        "model_path": path,
        "trained_at": datetime.utcnow().isoformat(),
        "restaurant_id": restaurant_id,
    }


def load_model(restaurant_id: int) -> NoShowModel | None:
    """
    Load a previously trained model from disk.
    Returns None if no model exists yet for this restaurant.
    """
    path = _model_path(restaurant_id)
    if not os.path.exists(path):
        return None
    return joblib.load(path)


def predict_noshow(restaurant_id: int, reservation_record: dict) -> float:
    """
    Convenience wrapper: load model and predict P(no-show) for one reservation.
    Returns 0.0 if no trained model exists.
    """
    model = load_model(restaurant_id)
    if model is None:
        return 0.0
    return model.predict_proba(reservation_record)


def train_demand_and_save(db: Session, restaurant_id: int) -> dict:
    """
    Train (or retrain) the demand forecasting model for a restaurant.
    Delegates to demand_model.train_demand_model.
    """
    return train_demand_model(db, restaurant_id)


def train_all_models(db: Session, restaurant_id: int) -> dict:
    """
    Train both no-show and demand models in one call.
    Returns combined summary with per-model results.
    """
    results = {"restaurant_id": restaurant_id, "trained_at": datetime.utcnow().isoformat()}

    try:
        noshow_summary = train_and_save(db, restaurant_id)
        results["noshow_model"] = {"status": "trained", **noshow_summary}
    except ValueError as e:
        results["noshow_model"] = {"status": "skipped", "reason": str(e)}

    try:
        demand_summary = train_demand_and_save(db, restaurant_id)
        results["demand_model"] = {"status": "trained", **demand_summary}
    except (ValueError, ImportError) as e:
        results["demand_model"] = {"status": "skipped", "reason": str(e)}

    return results
