"""add brand_id and missing restaurant columns

Revision ID: a1b2c3d4e5f6
Revises: f1a3c7d2e9b5
Create Date: 2026-03-19

"""
from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4e5f6"
down_revision = "f1a3c7d2e9b5"
branch_labels = None
depends_on = None


def _col_exists(table, col):
    from sqlalchemy import inspect, text
    conn = op.get_bind()
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name=:t AND column_name=:c"
    ), {"t": table, "c": col})
    return result.fetchone() is not None


def upgrade():
    if not _col_exists("restaurants", "brand_id"):
        op.add_column("restaurants", sa.Column("brand_id", sa.Integer(), sa.ForeignKey("restaurant_brands.id"), nullable=True))

    if not _col_exists("restaurants", "logo_url"):
        op.add_column("restaurants", sa.Column("logo_url", sa.String(), nullable=True))

    if not _col_exists("restaurants", "banner_url"):
        op.add_column("restaurants", sa.Column("banner_url", sa.String(), nullable=True))

    if not _col_exists("restaurants", "about"):
        op.add_column("restaurants", sa.Column("about", sa.String(), nullable=True))

    if not _col_exists("restaurants", "total_reviews"):
        op.add_column("restaurants", sa.Column("total_reviews", sa.Integer(), nullable=True, server_default="0"))

    if not _col_exists("restaurants", "reservation_count"):
        op.add_column("restaurants", sa.Column("reservation_count", sa.Integer(), nullable=True, server_default="0"))

    if not _col_exists("restaurants", "popularity_score"):
        op.add_column("restaurants", sa.Column("popularity_score", sa.Float(), nullable=True, server_default="0.0"))

    if not _col_exists("restaurants", "embedding"):
        op.add_column("restaurants", sa.Column("embedding", sa.JSON(), nullable=True))

    if not _col_exists("restaurants", "created_at"):
        op.add_column("restaurants", sa.Column("created_at", sa.DateTime(), nullable=True))

    if not _col_exists("restaurants", "auto_cancellation_enabled"):
        op.add_column("restaurants", sa.Column("auto_cancellation_enabled", sa.Boolean(), nullable=True, server_default="false"))

    if not _col_exists("restaurant_analytics", "unique_visitors"):
        op.add_column("restaurant_analytics", sa.Column("unique_visitors", sa.Integer(), nullable=True, server_default="0"))

    if not _col_exists("restaurant_images", "position"):
        op.add_column("restaurant_images", sa.Column("position", sa.Integer(), nullable=True))


def downgrade():
    op.drop_column("restaurants", "brand_id")
    op.drop_column("restaurants", "total_reviews")
    op.drop_column("restaurants", "reservation_count")
    op.drop_column("restaurants", "popularity_score")
    op.drop_column("restaurants", "embedding")
    op.drop_column("restaurants", "created_at")
    op.drop_column("restaurant_analytics", "unique_visitors")
