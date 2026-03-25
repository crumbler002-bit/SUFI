"""
AutomationAction — persists every action the decision engine triggers.
Gives owners a full audit trail of what SUFI did automatically.
"""

import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text
from app.database import Base


class AutomationAction(Base):
    __tablename__ = "automation_actions"

    id = Column(Integer, primary_key=True)
    restaurant_id = Column(Integer, nullable=False, index=True)
    action_type = Column(String, nullable=False)   # NOTIFY_WAITLIST | OVERBOOK | SEND_ALERT
    status = Column(String, default="pending")      # pending | executed | failed
    action_metadata = Column(Text, default="{}")    # arbitrary JSON payload
    created_at = Column(DateTime, default=datetime.utcnow)
    executed_at = Column(DateTime, nullable=True)

    def get_metadata(self) -> dict:
        try:
            return json.loads(self.action_metadata or "{}")
        except Exception:
            return {}

    def set_metadata(self, value: dict) -> None:
        self.action_metadata = json.dumps(value)
