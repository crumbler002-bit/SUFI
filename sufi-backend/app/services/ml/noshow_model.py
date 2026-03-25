"""
No-Show Prediction Model
Logistic Regression trained on real reservation history.

Features per reservation:
  - hour          : hour of reservation (0-23)
  - day_of_week   : 0=Mon … 6=Sun
  - party_size    : number of guests
  - lead_time_hrs : hours between booking creation and reservation time
  - user_noshow_history : fraction of past reservations that were no-shows (0.0-1.0)

Label: 1 = no_show, 0 = showed up
"""

import numpy as np

# sklearn is a soft dependency — graceful fallback if not installed
try:
    from sklearn.linear_model import LogisticRegression
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import Pipeline
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


FEATURE_NAMES = ["hour", "day_of_week", "party_size", "lead_time_hrs", "user_noshow_history"]
MIN_TRAINING_SAMPLES = 20  # don't train on tiny datasets


class NoShowModel:
    def __init__(self):
        if not SKLEARN_AVAILABLE:
            raise ImportError("scikit-learn is required. Run: pip install scikit-learn")
        self.pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=500, class_weight="balanced")),
        ])
        self.trained = False

    # ── Feature extraction ────────────────────────────────────────────────

    @staticmethod
    def extract_features(record: dict) -> list[float]:
        """
        Convert a reservation dict to a feature vector.
        record keys: hour, day_of_week, party_size, lead_time_hrs, user_noshow_history
        """
        return [
            float(record.get("hour", 0)),
            float(record.get("day_of_week", 0)),
            float(record.get("party_size", 2)),
            float(record.get("lead_time_hrs", 0)),
            float(record.get("user_noshow_history", 0.0)),
        ]

    def prepare_dataset(self, records: list[dict]) -> tuple[np.ndarray, np.ndarray]:
        X, y = [], []
        for r in records:
            if r.get("status") not in ("no_show", "completed"):
                continue
            X.append(self.extract_features(r))
            y.append(1 if r["status"] == "no_show" else 0)
        return np.array(X), np.array(y)

    # ── Training ──────────────────────────────────────────────────────────

    def train(self, records: list[dict]) -> dict:
        """
        Train on a list of reservation dicts.
        Returns training summary.
        """
        X, y = self.prepare_dataset(records)

        if len(X) < MIN_TRAINING_SAMPLES:
            raise ValueError(
                f"Need at least {MIN_TRAINING_SAMPLES} completed/no-show reservations to train. "
                f"Got {len(X)}."
            )

        self.pipeline.fit(X, y)
        self.trained = True

        noshow_count = int(y.sum())
        return {
            "samples": len(X),
            "noshow_count": noshow_count,
            "show_count": len(X) - noshow_count,
            "noshow_rate": round(noshow_count / len(X), 3),
        }

    # ── Prediction ────────────────────────────────────────────────────────

    def predict_proba(self, record: dict) -> float:
        """
        Returns P(no-show) for a single reservation dict.
        Falls back to 0.0 if model not trained.
        """
        if not self.trained:
            return 0.0
        features = np.array([self.extract_features(record)])
        return float(self.pipeline.predict_proba(features)[0][1])

    def predict_batch(self, records: list[dict]) -> list[float]:
        """Returns P(no-show) for a list of reservation dicts."""
        if not self.trained:
            return [0.0] * len(records)
        X = np.array([self.extract_features(r) for r in records])
        return [float(p) for p in self.pipeline.predict_proba(X)[:, 1]]
