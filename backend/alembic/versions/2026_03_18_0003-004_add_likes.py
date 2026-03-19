"""Add likes table

Revision ID: 004
Revises: 003
Create Date: 2026-03-18
"""
from alembic import op
import sqlalchemy as sa

revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'likes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('liker_user_id', sa.Integer(), nullable=False),
        sa.Column('liked_user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['liker_user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['liked_user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('liker_user_id', 'liked_user_id', name='uq_like_pair'),
    )
    op.create_index('idx_likes_liker', 'likes', ['liker_user_id'])
    op.create_index('idx_likes_liked', 'likes', ['liked_user_id'])


def downgrade() -> None:
    op.drop_index('idx_likes_liked', table_name='likes')
    op.drop_index('idx_likes_liker', table_name='likes')
    op.drop_table('likes')
