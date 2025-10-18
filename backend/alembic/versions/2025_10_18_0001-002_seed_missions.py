"""Seed initial missions

Revision ID: 002
Revises: 001
Create Date: 2025-10-18 00:01:00.000000

Seeds the missions table with initial gamification challenges
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from datetime import datetime


# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Insert initial missions"""

    # Create a table representation for bulk insert
    missions_table = table(
        "missions",
        column("id", sa.Integer),
        column("title", sa.String),
        column("description", sa.Text),
        column("difficulty", sa.Integer),
        column("xp_reward", sa.Integer),
        column("mission_type", sa.String),
        column("requirements", sa.JSON),
        column("is_active", sa.Boolean),
        column("is_daily", sa.Boolean),
        column("created_at", sa.DateTime),
    )

    # Define initial missions
    missions_data = [
        # ==================== Beginner Missions (Difficulty 1) ====================
        {
            "id": 1,
            "title": "Primer Paso - First Step",
            "description": "Generate your first conversation opener. ¡Dale pa' lante!",
            "difficulty": 1,
            "xp_reward": 50,
            "mission_type": "generate_opener",
            "requirements": {"count": 1},
            "is_active": True,
            "is_daily": False,
            "created_at": datetime.utcnow(),
        },
        {
            "id": 2,
            "title": "Hablador - Chatterbox",
            "description": "Generate 5 conversation openers. You're getting the hang of it!",
            "difficulty": 1,
            "xp_reward": 100,
            "mission_type": "generate_opener",
            "requirements": {"count": 5},
            "is_active": True,
            "is_daily": False,
            "created_at": datetime.utcnow(),
        },
        {
            "id": 3,
            "title": "Responder Chévere - Cool Responder",
            "description": "Generate your first conversation response. Keep it flowing!",
            "difficulty": 1,
            "xp_reward": 50,
            "mission_type": "generate_response",
            "requirements": {"count": 1},
            "is_active": True,
            "is_daily": False,
            "created_at": datetime.utcnow(),
        },
        # ==================== Intermediate Missions (Difficulty 2-3) ====================
        {
            "id": 4,
            "title": "Explorador Cultural - Culture Explorer",
            "description": "Try all 5 cultural styles (Boricua, Mexicano, Colombiano, Argentino, Español)",
            "difficulty": 2,
            "xp_reward": 200,
            "mission_type": "try_all_cultures",
            "requirements": {"cultures": ["boricua", "mexicano", "colombiano", "argentino", "espanol"]},
            "is_active": True,
            "is_daily": False,
            "created_at": datetime.utcnow(),
        },
        {
            "id": 5,
            "title": "Maestro del Tono - Tone Master",
            "description": "Generate openers in all 3 tones: Genuino, Coqueto, Directo",
            "difficulty": 2,
            "xp_reward": 150,
            "mission_type": "try_all_tones",
            "requirements": {"tones": ["genuino", "coqueto", "directo"]},
            "is_active": True,
            "is_daily": False,
            "created_at": datetime.utcnow(),
        },
        {
            "id": 6,
            "title": "Conversador - Conversationalist",
            "description": "Complete a conversation with 10 back-and-forth messages",
            "difficulty": 3,
            "xp_reward": 250,
            "mission_type": "complete_conversation",
            "requirements": {"message_count": 10},
            "is_active": True,
            "is_daily": False,
            "created_at": datetime.utcnow(),
        },
        {
            "id": 7,
            "title": "Feedback Champion",
            "description": "Provide feedback (👍 or 👎) on 10 AI suggestions",
            "difficulty": 2,
            "xp_reward": 100,
            "mission_type": "give_feedback",
            "requirements": {"count": 10},
            "is_active": True,
            "is_daily": False,
            "created_at": datetime.utcnow(),
        },
        # ==================== Advanced Missions (Difficulty 4-5) ====================
        {
            "id": 8,
            "title": "Boricua de Corazón - Puerto Rican at Heart",
            "description": "Use Boricua style exclusively for 50 interactions",
            "difficulty": 4,
            "xp_reward": 500,
            "mission_type": "culture_streak",
            "requirements": {"culture": "boricua", "count": 50},
            "is_active": True,
            "is_daily": False,
            "created_at": datetime.utcnow(),
        },
        {
            "id": 9,
            "title": "El Conquistador - The Conqueror",
            "description": "Generate 100 conversation openers total",
            "difficulty": 5,
            "xp_reward": 1000,
            "mission_type": "generate_opener",
            "requirements": {"count": 100},
            "is_active": True,
            "is_daily": False,
            "created_at": datetime.utcnow(),
        },
        {
            "id": 10,
            "title": "Comunicador Profesional - Pro Communicator",
            "description": "Maintain 5 different conversations simultaneously",
            "difficulty": 4,
            "xp_reward": 400,
            "mission_type": "simultaneous_conversations",
            "requirements": {"count": 5},
            "is_active": True,
            "is_daily": False,
            "created_at": datetime.utcnow(),
        },
        # ==================== Daily Missions ====================
        {
            "id": 11,
            "title": "Daily Grind - Rutina Diaria",
            "description": "Generate 3 openers today. Build that habit!",
            "difficulty": 1,
            "xp_reward": 50,
            "mission_type": "generate_opener_daily",
            "requirements": {"count": 3, "timeframe": "daily"},
            "is_active": True,
            "is_daily": True,
            "created_at": datetime.utcnow(),
        },
        {
            "id": 12,
            "title": "Conversador Diario - Daily Conversationalist",
            "description": "Complete at least 1 conversation today",
            "difficulty": 2,
            "xp_reward": 75,
            "mission_type": "complete_conversation_daily",
            "requirements": {"count": 1, "timeframe": "daily"},
            "is_active": True,
            "is_daily": True,
            "created_at": datetime.utcnow(),
        },
        {
            "id": 13,
            "title": "Feedback Diario - Daily Feedback",
            "description": "Provide feedback on at least 3 suggestions today",
            "difficulty": 1,
            "xp_reward": 30,
            "mission_type": "give_feedback_daily",
            "requirements": {"count": 3, "timeframe": "daily"},
            "is_active": True,
            "is_daily": True,
            "created_at": datetime.utcnow(),
        },
        # ==================== Special Missions ====================
        {
            "id": 14,
            "title": "Weekend Warrior - Guerrero de Fin de Semana",
            "description": "Generate 20 openers during the weekend (Sat-Sun)",
            "difficulty": 3,
            "xp_reward": 300,
            "mission_type": "weekend_challenge",
            "requirements": {"count": 20, "days": ["saturday", "sunday"]},
            "is_active": True,
            "is_daily": False,
            "created_at": datetime.utcnow(),
        },
        {
            "id": 15,
            "title": "Perfeccionista - Perfectionist",
            "description": "Get 10 consecutive 👍 ratings on your generated content",
            "difficulty": 5,
            "xp_reward": 750,
            "mission_type": "positive_streak",
            "requirements": {"streak": 10, "feedback": "thumbs_up"},
            "is_active": True,
            "is_daily": False,
            "created_at": datetime.utcnow(),
        },
    ]

    # Insert missions
    op.bulk_insert(missions_table, missions_data)


def downgrade() -> None:
    """Remove seeded missions"""

    # Delete all missions with IDs 1-15
    op.execute("DELETE FROM missions WHERE id BETWEEN 1 AND 15")
