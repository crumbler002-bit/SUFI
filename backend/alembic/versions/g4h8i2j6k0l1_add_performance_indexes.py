"""add performance indexes

Revision ID: g4h8i2j6k0l1
Revises: a1b2c3d4e5f6
Create Date: 2026-03-19

"""
from alembic import op

revision = "g4h8i2j6k0l1"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Reservations — most queried table
    op.execute("CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON reservations(restaurant_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_reservations_created_at    ON reservations(created_at)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_reservations_status        ON reservations(status)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_reservations_time          ON reservations(reservation_time)")

    # Restaurants — owner lookups + search
    op.execute("CREATE INDEX IF NOT EXISTS idx_restaurants_owner_id       ON restaurants(owner_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_restaurants_is_featured    ON restaurants(is_featured)")

    # Analytics — time-series queries
    op.execute("CREATE INDEX IF NOT EXISTS idx_analytics_restaurant_date  ON restaurant_analytics(restaurant_id, date)")

    # Waitlist
    op.execute("CREATE INDEX IF NOT EXISTS idx_waitlist_restaurant_id     ON waitlist_entries(restaurant_id)")

    # Automation actions
    op.execute("CREATE INDEX IF NOT EXISTS idx_automation_restaurant_id   ON automation_actions(restaurant_id)")
    op.execute("CREATE INDEX IF NOT EXISTS idx_automation_status          ON automation_actions(status)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_reservations_restaurant_id")
    op.execute("DROP INDEX IF EXISTS idx_reservations_created_at")
    op.execute("DROP INDEX IF EXISTS idx_reservations_status")
    op.execute("DROP INDEX IF EXISTS idx_reservations_time")
    op.execute("DROP INDEX IF EXISTS idx_restaurants_owner_id")
    op.execute("DROP INDEX IF EXISTS idx_restaurants_is_featured")
    op.execute("DROP INDEX IF EXISTS idx_analytics_restaurant_date")
    op.execute("DROP INDEX IF EXISTS idx_waitlist_restaurant_id")
    op.execute("DROP INDEX IF EXISTS idx_automation_restaurant_id")
    op.execute("DROP INDEX IF EXISTS idx_automation_status")
