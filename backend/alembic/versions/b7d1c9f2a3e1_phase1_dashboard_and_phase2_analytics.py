"""Phase1 dashboard tables + Phase2 analytics

Revision ID: b7d1c9f2a3e1
Revises: a846976a7e54
Create Date: 2026-03-14

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b7d1c9f2a3e1"
down_revision: Union[str, Sequence[str], None] = "a846976a7e54"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # restaurants: profile enhancements
    op.add_column("restaurants", sa.Column("logo_url", sa.String(), nullable=True))
    op.add_column("restaurants", sa.Column("banner_url", sa.String(), nullable=True))
    op.add_column("restaurants", sa.Column("about", sa.String(), nullable=True))

    # restaurant_images: media ordering
    op.add_column("restaurant_images", sa.Column("position", sa.Integer(), nullable=True))

    # restaurant_tags
    op.create_table(
        "restaurant_tags",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("restaurant_id", sa.Integer(), sa.ForeignKey("restaurants.id")),
        sa.Column("tag", sa.String(), nullable=True),
    )

    # menu_categories
    op.create_table(
        "menu_categories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("restaurant_id", sa.Integer(), sa.ForeignKey("restaurants.id")),
        sa.Column("name", sa.String(), nullable=True),
    )

    # menu_items
    op.create_table(
        "menu_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("menu_categories.id")),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("price", sa.Float(), nullable=True),
        sa.Column("image_url", sa.String(), nullable=True),
        sa.Column("is_popular", sa.Boolean(), nullable=True),
    )

    # restaurant_analytics
    op.create_table(
        "restaurant_analytics",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("restaurant_id", sa.Integer(), sa.ForeignKey("restaurants.id")),
        sa.Column("date", sa.Date(), nullable=True),
        sa.Column("profile_views", sa.Integer(), nullable=True),
        sa.Column("unique_visitors", sa.Integer(), nullable=True),
        sa.Column("search_appearances", sa.Integer(), nullable=True),
        sa.Column("clicks", sa.Integer(), nullable=True),
        sa.Column("reservations", sa.Integer(), nullable=True),
    )
    op.create_index(
        "idx_restaurant_analytics_restaurant_date",
        "restaurant_analytics",
        ["restaurant_id", "date"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("idx_restaurant_analytics_restaurant_date", table_name="restaurant_analytics")
    op.drop_table("restaurant_analytics")

    op.drop_table("menu_items")
    op.drop_table("menu_categories")
    op.drop_table("restaurant_tags")

    op.drop_column("restaurant_images", "position")

    op.drop_column("restaurants", "about")
    op.drop_column("restaurants", "banner_url")
    op.drop_column("restaurants", "logo_url")
