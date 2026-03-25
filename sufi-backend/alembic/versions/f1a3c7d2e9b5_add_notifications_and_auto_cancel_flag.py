"""add notifications table and auto_cancellation_enabled to restaurants

Revision ID: f1a3c7d2e9b5
Revises: e5a2b3c9d1f6
Create Date: 2026-03-18

"""
from alembic import op
import sqlalchemy as sa

revision = "f1a3c7d2e9b5"
down_revision = "e5a2b3c9d1f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("restaurant_id", sa.Integer(), sa.ForeignKey("restaurants.id"), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("message", sa.String(), nullable=False),
        sa.Column("is_read", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("idx_notifications_restaurant", "notifications", ["restaurant_id"])
    op.create_index("idx_notifications_unread", "notifications", ["restaurant_id", "is_read"])

    op.add_column(
        "restaurants",
        sa.Column("auto_cancellation_enabled", sa.Boolean(), server_default="false", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("restaurants", "auto_cancellation_enabled")
    op.drop_index("idx_notifications_unread", table_name="notifications")
    op.drop_index("idx_notifications_restaurant", table_name="notifications")
    op.drop_table("notifications")
