"""Initial database schema

Revision ID: 001
Revises:
Create Date: 2025-10-18 00:00:00.000000

Creates all tables for Labia.AI:
- users: User accounts
- profiles: User profiles and preferences
- conversations: Conversation threads
- messages: Individual messages in conversations
- missions: Gamification missions
- user_missions: User progress on missions
- feedback: User feedback on AI suggestions
- safety_logs: Content safety moderation logs
- usage_stats: API usage analytics
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create all tables"""

    # Create enum types (idempotent — safe on retry)
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plantypeenum') THEN
                CREATE TYPE plantypeenum AS ENUM ('free', 'pro', 'premium');
            END IF;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tonestyleenum') THEN
                CREATE TYPE tonestyleenum AS ENUM ('genuino', 'coqueto', 'directo');
            END IF;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'messageroleenum') THEN
                CREATE TYPE messageroleenum AS ENUM ('user', 'assistant', 'system');
            END IF;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'missionstatusenum') THEN
                CREATE TYPE missionstatusenum AS ENUM ('pending', 'in_progress', 'completed');
            END IF;
        END $$;
    """)

    # ==================== Users Table ====================
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("country", sa.String(length=2), nullable=False),
        sa.Column(
            "plan",
            sa.Enum("free", "pro", "premium", name="plantypeenum", create_type=False),
            nullable=False,
            server_default="free",
        ),
        sa.Column("tone_default", sa.String(length=50), nullable=False, server_default="chill"),
        sa.Column("daily_suggestions_used", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_suggestion_reset", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=True, onupdate=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("last_login", sa.DateTime(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("idx_user_email", "users", ["email"])
    op.create_index("idx_user_plan", "users", ["plan"])
    op.create_index("idx_user_created_at", "users", ["created_at"])

    # ==================== Profiles Table ====================
    op.create_table(
        "profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("age_range", sa.String(length=20), nullable=True),
        sa.Column("interests", sa.JSON(), nullable=True, server_default="[]"),
        sa.Column("tone", sa.String(length=50), nullable=False, server_default="chill"),
        sa.Column("emoji_ratio", sa.Float(), nullable=False, server_default="0.3"),
        sa.Column("cultural_style", sa.String(length=50), nullable=False, server_default="boricua"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=True, onupdate=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    # ==================== Conversations Table ====================
    op.create_table(
        "conversations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=True),
        sa.Column("target_bio", sa.Text(), nullable=True),
        sa.Column("target_interests", sa.JSON(), nullable=True, server_default="[]"),
        sa.Column("cultural_style_used", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(), nullable=True, onupdate=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_conversation_user_id", "conversations", ["user_id"])
    op.create_index("idx_conversation_created_at", "conversations", ["created_at"])

    # ==================== Messages Table ====================
    op.create_table(
        "messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("conversation_id", sa.Integer(), nullable=False),
        sa.Column(
            "role",
            sa.Enum("user", "assistant", "system", name="messageroleenum", create_type=False),
            nullable=False,
        ),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column(
            "tone",
            sa.Enum("genuino", "coqueto", "directo", name="tonestyleenum", create_type=False),
            nullable=True,
        ),
        sa.Column("lang", sa.String(length=10), nullable=False, server_default="es"),
        sa.Column("model_used", sa.String(length=100), nullable=True),
        sa.Column("tokens_used", sa.Integer(), nullable=True),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_message_conversation_id", "messages", ["conversation_id"])
    op.create_index("idx_message_timestamp", "messages", ["timestamp"])
    op.create_index("idx_message_role", "messages", ["role"])

    # ==================== Missions Table ====================
    op.create_table(
        "missions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("difficulty", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("xp_reward", sa.Integer(), nullable=False, server_default="100"),
        sa.Column("mission_type", sa.String(length=50), nullable=False),
        sa.Column("requirements", sa.JSON(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_daily", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.PrimaryKeyConstraint("id"),
    )

    # ==================== User Missions Table ====================
    op.create_table(
        "user_missions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("mission_id", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("pending", "in_progress", "completed", name="missionstatusenum", create_type=False),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("score", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("progress_data", sa.JSON(), nullable=True),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["mission_id"], ["missions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_user_mission_user_id", "user_missions", ["user_id"])
    op.create_index("idx_user_mission_mission_id", "user_missions", ["mission_id"])
    op.create_index("idx_user_mission_status", "user_missions", ["status"])

    # ==================== Feedback Table ====================
    op.create_table(
        "feedback",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("message_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("thumb_up", sa.Boolean(), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["message_id"], ["messages.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_feedback_message_id", "feedback", ["message_id"])
    op.create_index("idx_feedback_user_id", "feedback", ["user_id"])
    op.create_index("idx_feedback_created_at", "feedback", ["created_at"])

    # ==================== Safety Logs Table ====================
    op.create_table(
        "safety_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(length=255), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("action_taken", sa.String(length=50), nullable=False),
        sa.Column("cultural_style", sa.String(length=50), nullable=True),
        sa.Column("endpoint", sa.String(length=100), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_safety_log_user_id", "safety_logs", ["user_id"])
    op.create_index("idx_safety_log_timestamp", "safety_logs", ["timestamp"])
    op.create_index("idx_safety_log_action", "safety_logs", ["action_taken"])

    # ==================== Usage Stats Table ====================
    op.create_table(
        "usage_stats",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("endpoint", sa.String(length=100), nullable=False),
        sa.Column("method", sa.String(length=10), nullable=False),
        sa.Column("status_code", sa.Integer(), nullable=False),
        sa.Column("response_time_ms", sa.Float(), nullable=True),
        sa.Column("llm_provider", sa.String(length=50), nullable=True),
        sa.Column("tokens_used", sa.Integer(), nullable=True),
        sa.Column("cultural_style", sa.String(length=50), nullable=True),
        sa.Column("timestamp", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_usage_stats_user_id", "usage_stats", ["user_id"])
    op.create_index("idx_usage_stats_endpoint", "usage_stats", ["endpoint"])
    op.create_index("idx_usage_stats_timestamp", "usage_stats", ["timestamp"])


def downgrade() -> None:
    """Drop all tables"""

    # Drop tables in reverse order (respecting foreign keys)
    op.drop_index("idx_usage_stats_timestamp", "usage_stats")
    op.drop_index("idx_usage_stats_endpoint", "usage_stats")
    op.drop_index("idx_usage_stats_user_id", "usage_stats")
    op.drop_table("usage_stats")

    op.drop_index("idx_safety_log_action", "safety_logs")
    op.drop_index("idx_safety_log_timestamp", "safety_logs")
    op.drop_index("idx_safety_log_user_id", "safety_logs")
    op.drop_table("safety_logs")

    op.drop_index("idx_feedback_created_at", "feedback")
    op.drop_index("idx_feedback_user_id", "feedback")
    op.drop_index("idx_feedback_message_id", "feedback")
    op.drop_table("feedback")

    op.drop_index("idx_user_mission_status", "user_missions")
    op.drop_index("idx_user_mission_mission_id", "user_missions")
    op.drop_index("idx_user_mission_user_id", "user_missions")
    op.drop_table("user_missions")

    op.drop_table("missions")

    op.drop_index("idx_message_role", "messages")
    op.drop_index("idx_message_timestamp", "messages")
    op.drop_index("idx_message_conversation_id", "messages")
    op.drop_table("messages")

    op.drop_index("idx_conversation_created_at", "conversations")
    op.drop_index("idx_conversation_user_id", "conversations")
    op.drop_table("conversations")

    op.drop_table("profiles")

    op.drop_index("idx_user_created_at", "users")
    op.drop_index("idx_user_plan", "users")
    op.drop_index("idx_user_email", "users")
    op.drop_table("users")

    # Drop enum types
    op.execute("DROP TYPE missionstatusenum")
    op.execute("DROP TYPE messageroleenum")
    op.execute("DROP TYPE tonestyleenum")
    op.execute("DROP TYPE plantypeenum")
