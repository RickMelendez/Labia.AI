"""Add matches table

Revision ID: 005
Revises: 004
Create Date: 2026-03-18
"""
from alembic import op
import sqlalchemy as sa

revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    match_status_enum = sa.Enum(
        'pending_questions', 'questions_ready', 'user1_answered',
        'user2_answered', 'both_answered', 'confirmed', 'cancelled',
        name='matchstatusenum'
    )
    match_status_enum.create(op.get_bind())

    op.create_table(
        'matches',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user1_id', sa.Integer(), nullable=False),
        sa.Column('user2_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum(
            'pending_questions', 'questions_ready', 'user1_answered',
            'user2_answered', 'both_answered', 'confirmed', 'cancelled',
            name='matchstatusenum'
        ), nullable=False, server_default='pending_questions'),
        sa.Column('questions', sa.JSON(), nullable=True),
        sa.Column('user1_answers', sa.JSON(), nullable=True),
        sa.Column('user2_answers', sa.JSON(), nullable=True),
        sa.Column('user1_decision', sa.String(10), nullable=True),
        sa.Column('user2_decision', sa.String(10), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user1_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user2_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user1_id', 'user2_id', name='uq_match_pair'),
    )
    op.create_index('idx_matches_user1', 'matches', ['user1_id'])
    op.create_index('idx_matches_user2', 'matches', ['user2_id'])
    op.create_index('idx_matches_status', 'matches', ['status'])


def downgrade() -> None:
    op.drop_index('idx_matches_status', table_name='matches')
    op.drop_index('idx_matches_user2', table_name='matches')
    op.drop_index('idx_matches_user1', table_name='matches')
    op.drop_table('matches')
    sa.Enum(name='matchstatusenum').drop(op.get_bind())
