"""add google_place_id to restaurants

Revision ID: h5i9j3k7l1m2
Revises: g4h8i2j6k0l1
Create Date: 2026-05-03

"""
from alembic import op
import sqlalchemy as sa

revision = "h5i9j3k7l1m2"
down_revision = "g4h8i2j6k0l1"
branch_labels = None
depends_on = None


def _col_exists(table, col):
    from sqlalchemy import text
    conn = op.get_bind()
    result = conn.execute(text(
        "SELECT column_name FROM information_schema.columns "
        "WHERE table_name=:t AND column_name=:c"
    ), {"t": table, "c": col})
    return result.fetchone() is not None


def upgrade():
    if not _col_exists("restaurants", "google_place_id"):
        op.add_column(
            "restaurants",
            sa.Column("google_place_id", sa.String(), nullable=True),
        )
        op.create_index(
            "idx_restaurants_google_place_id",
            "restaurants",
            ["google_place_id"],
            unique=True,
        )


def downgrade():
    op.drop_index("idx_restaurants_google_place_id", table_name="restaurants")
    op.drop_column("restaurants", "google_place_id")
