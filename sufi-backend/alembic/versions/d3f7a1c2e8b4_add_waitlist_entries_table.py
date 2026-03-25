"""add waitlist_entries table

Revision ID: d3f7a1c2e8b4
Revises: c2f4d8a6b9f0
Create Date: 2026-03-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "d3f7a1c2e8b4"
down_revision = "c2f4d8a6b9f0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "waitlist_entries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("restaurant_id", sa.Integer(), sa.ForeignKey("restaurants.id"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("guests", sa.Integer(), nullable=False),
        sa.Column("requested_time", sa.DateTime(), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), server_default="90"),
        sa.Column("status", sa.String(), server_default="waiting", nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("idx_waitlist_restaurant_status", "waitlist_entries", ["restaurant_id", "status"])
    op.create_index("idx_waitlist_user", "waitlist_entries", ["user_id"])


def downgrade() -> None:
    op.drop_index("idx_waitlist_user", table_name="waitlist_entries")
    op.drop_index("idx_waitlist_restaurant_status", table_name="waitlist_entries")
    op.drop_table("waitlist_entries")
