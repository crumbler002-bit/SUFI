"""Add restaurant_promotions

Revision ID: c2f4d8a6b9f0
Revises: b7d1c9f2a3e1
Create Date: 2026-03-14

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c2f4d8a6b9f0"
down_revision: Union[str, Sequence[str], None] = "b7d1c9f2a3e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "restaurant_promotions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("restaurant_id", sa.Integer(), sa.ForeignKey("restaurants.id")),
        sa.Column("promotion_type", sa.String(), nullable=True),
        sa.Column("start_date", sa.DateTime(), nullable=True),
        sa.Column("end_date", sa.DateTime(), nullable=True),
        sa.Column("boost_score", sa.Integer(), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=True),
        sa.Column("promotion_impressions", sa.Integer(), nullable=True),
        sa.Column("promotion_clicks", sa.Integer(), nullable=True),
        sa.Column("promotion_reservations", sa.Integer(), nullable=True),
    )
    op.create_index(
        "idx_restaurant_promotions_restaurant_active",
        "restaurant_promotions",
        ["restaurant_id", "active"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("idx_restaurant_promotions_restaurant_active", table_name="restaurant_promotions")
    op.drop_table("restaurant_promotions")
