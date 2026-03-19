"""Add dating_profiles table

Revision ID: 003
Revises: 002
Create Date: 2026-03-18
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create gender enum type
    gender_enum = sa.Enum('male', 'female', 'nonbinary', 'other', name='genderenum')
    gender_enum.create(op.get_bind())

    # Create dating_profiles table
    op.create_table(
        'dating_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('display_name', sa.String(100), nullable=False),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('gender', sa.Enum('male', 'female', 'nonbinary', 'other', name='genderenum'), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('job_title', sa.String(100), nullable=True),
        sa.Column('interests', sa.JSON(), nullable=True),
        sa.Column('photo_urls', sa.JSON(), nullable=True),
        sa.Column('is_discoverable', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )
    op.create_index('idx_dating_profile_user_id', 'dating_profiles', ['user_id'])
    op.create_index('idx_dating_profile_discoverable', 'dating_profiles', ['is_discoverable'])


def downgrade() -> None:
    op.drop_index('idx_dating_profile_discoverable', table_name='dating_profiles')
    op.drop_index('idx_dating_profile_user_id', table_name='dating_profiles')
    op.drop_table('dating_profiles')
    sa.Enum(name='genderenum').drop(op.get_bind())
