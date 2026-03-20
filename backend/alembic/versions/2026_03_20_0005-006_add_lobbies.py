"""Add lobbies, lobby_members, lobby_messages tables

Revision ID: 006
Revises: 005
Create Date: 2026-03-20
"""
from alembic import op
import sqlalchemy as sa

revision = '006'
down_revision = '005'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enums
    activity_type_enum = sa.Enum(
        'date_night', 'road_trip', 'brunch', 'adventure',
        'beach', 'concert', 'hiking', 'chill',
        name='activitytypeenum'
    )
    activity_type_enum.create(op.get_bind())

    lobby_status_enum = sa.Enum(
        'open', 'full', 'started', 'expired',
        name='lobbystatusenum'
    )
    lobby_status_enum.create(op.get_bind())

    # Create lobbies table
    op.create_table(
        'lobbies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('creator_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('activity_type', sa.Enum(
            'date_night', 'road_trip', 'brunch', 'adventure',
            'beach', 'concert', 'hiking', 'chill',
            name='activitytypeenum'
        ), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('max_size', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('status', sa.Enum(
            'open', 'full', 'started', 'expired',
            name='lobbystatusenum'
        ), nullable=False, server_default='open'),
        sa.Column('location_hint', sa.String(200), nullable=True),
        sa.Column('time_window_hint', sa.String(200), nullable=True),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_lobby_creator', 'lobbies', ['creator_id'])
    op.create_index('idx_lobby_status', 'lobbies', ['status'])
    op.create_index('idx_lobby_activity_type', 'lobbies', ['activity_type'])
    op.create_index('idx_lobby_expires_at', 'lobbies', ['expires_at'])

    # Create lobby_members table
    op.create_table(
        'lobby_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lobby_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('joined_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['lobby_id'], ['lobbies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('lobby_id', 'user_id', name='uq_lobby_member'),
    )
    op.create_index('idx_lobby_member_lobby_id', 'lobby_members', ['lobby_id'])
    op.create_index('idx_lobby_member_user_id', 'lobby_members', ['user_id'])

    # Create lobby_messages table
    op.create_table(
        'lobby_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('lobby_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['lobby_id'], ['lobbies.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_lobby_message_lobby_id', 'lobby_messages', ['lobby_id'])
    op.create_index('idx_lobby_message_created_at', 'lobby_messages', ['created_at'])


def downgrade() -> None:
    op.drop_index('idx_lobby_message_created_at', table_name='lobby_messages')
    op.drop_index('idx_lobby_message_lobby_id', table_name='lobby_messages')
    op.drop_table('lobby_messages')

    op.drop_index('idx_lobby_member_user_id', table_name='lobby_members')
    op.drop_index('idx_lobby_member_lobby_id', table_name='lobby_members')
    op.drop_table('lobby_members')

    op.drop_index('idx_lobby_expires_at', table_name='lobbies')
    op.drop_index('idx_lobby_activity_type', table_name='lobbies')
    op.drop_index('idx_lobby_status', table_name='lobbies')
    op.drop_index('idx_lobby_creator', table_name='lobbies')
    op.drop_table('lobbies')

    sa.Enum(name='lobbystatusenum').drop(op.get_bind())
    sa.Enum(name='activitytypeenum').drop(op.get_bind())
