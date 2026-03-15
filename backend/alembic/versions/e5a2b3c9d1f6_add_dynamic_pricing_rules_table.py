"""add dynamic_pricing_rules table

Revision ID: e5a2b3c9d1f6
Revises: d3f7a1c2e8b4
Create Date: 2026-03-15

"""
from alembic import op
import sqlalchemy as sa

revision = "e5a2b3c9d1f6"
down_revision = "d3f7a1c2e8b4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "dynamic_pricing_rules",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("restaurant_id", sa.Integer(), sa.ForeignKey("restaurants.id"), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("demand_level", sa.String(), server_default="any", nullable=False),
        sa.Column("discount_percent", sa.Integer(), nullable=True),
        sa.Column("minimum_spend", sa.Integer(), nullable=True),
        sa.Column("special_offer", sa.String(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("idx_pricing_rules_restaurant", "dynamic_pricing_rules", ["restaurant_id"])


def downgrade() -> None:
    op.drop_index("idx_pricing_rules_restaurant", table_name="dynamic_pricing_rules")
    op.drop_table("dynamic_pricing_rules")
