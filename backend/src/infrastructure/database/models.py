"""
SQLAlchemy Database Models
ORM models for PostgreSQL database
"""
from datetime import datetime
from typing import List
from sqlalchemy import (
    Column, Integer, String, Boolean, Float, DateTime,
    ForeignKey, Text, Enum as SQLEnum, JSON, Index, UniqueConstraint
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()


class PlanTypeEnum(str, enum.Enum):
    """User subscription plan types"""
    FREE = "free"
    PRO = "pro"
    PREMIUM = "premium"


class ToneStyleEnum(str, enum.Enum):
    """Message tone styles"""
    GENUINO = "genuino"
    COQUETO = "coqueto"
    DIRECTO = "directo"


class MessageRoleEnum(str, enum.Enum):
    """Message roles"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class MissionStatusEnum(str, enum.Enum):
    """Mission completion status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class GenderEnum(str, enum.Enum):
    """Gender options for dating profile"""
    MALE = "male"
    FEMALE = "female"
    NONBINARY = "nonbinary"
    OTHER = "other"


class MatchStatusEnum(str, enum.Enum):
    """Match lifecycle statuses"""
    PENDING_QUESTIONS = "pending_questions"
    QUESTIONS_READY = "questions_ready"
    USER1_ANSWERED = "user1_answered"
    USER2_ANSWERED = "user2_answered"
    BOTH_ANSWERED = "both_answered"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


# ==================== User & Profile Models ====================

class UserModel(Base):
    """User table - main user account"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    country = Column(String(2), nullable=False)  # ISO 3166-1 alpha-2
    plan = Column(SQLEnum(PlanTypeEnum), default=PlanTypeEnum.FREE, nullable=False)
    tone_default = Column(String(50), default="chill", nullable=False)

    # Rate limiting
    daily_suggestions_used = Column(Integer, default=0, nullable=False)
    last_suggestion_reset = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # Relationships
    profile = relationship("ProfileModel", back_populates="user", uselist=False, cascade="all, delete-orphan")
    dating_profile = relationship("DatingProfileModel", back_populates="user", uselist=False, cascade="all, delete-orphan")
    conversations = relationship("ConversationModel", back_populates="user", cascade="all, delete-orphan")
    user_missions = relationship("UserMissionModel", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("FeedbackModel", back_populates="user", cascade="all, delete-orphan")
    safety_logs = relationship("SafetyLogModel", back_populates="user", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_user_email', 'email'),
        Index('idx_user_plan', 'plan'),
        Index('idx_user_created_at', 'created_at'),
    )

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, plan={self.plan})>"


class ProfileModel(Base):
    """Profile table - user preferences and personalization"""
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    age_range = Column(String(20))  # e.g., "18-25", "26-35"
    interests = Column(JSON, default=list)  # List of interests
    tone = Column(String(50), default="chill", nullable=False)
    emoji_ratio = Column(Float, default=0.3, nullable=False)  # 0.0 to 1.0
    cultural_style = Column(String(50), default="boricua", nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("UserModel", back_populates="profile")

    def __repr__(self):
        return f"<Profile(id={self.id}, user_id={self.user_id}, name={self.name})>"


# ==================== Dating Profile Model ====================

class DatingProfileModel(Base):
    """Dating Profile table - discoverable dating identity for users"""
    __tablename__ = "dating_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    display_name = Column(String(100), nullable=False)
    age = Column(Integer)
    gender = Column(SQLEnum(GenderEnum))
    bio = Column(Text)
    job_title = Column(String(100))
    interests = Column(JSON, default=list)
    photo_urls = Column(JSON, default=list)
    is_discoverable = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    user = relationship("UserModel", back_populates="dating_profile")

    # Indexes
    __table_args__ = (
        Index('idx_dating_profile_user_id', 'user_id'),
        Index('idx_dating_profile_discoverable', 'is_discoverable'),
    )

    def __repr__(self):
        return f"<DatingProfile(id={self.id}, user_id={self.user_id}, display_name={self.display_name})>"


# ==================== Conversation Models ====================

class ConversationModel(Base):
    """Conversation table - groups messages"""
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255))

    # Context
    target_bio = Column(Text)  # The bio that was analyzed
    target_interests = Column(JSON, default=list)
    cultural_style_used = Column(String(50))

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("UserModel", back_populates="conversations")
    messages = relationship("MessageModel", back_populates="conversation", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_conversation_user_id', 'user_id'),
        Index('idx_conversation_created_at', 'created_at'),
    )

    def __repr__(self):
        return f"<Conversation(id={self.id}, user_id={self.user_id}, title={self.title})>"


class MessageModel(Base):
    """Message table - individual messages/suggestions"""
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(SQLEnum(MessageRoleEnum), nullable=False)
    text = Column(Text, nullable=False)
    tone = Column(SQLEnum(ToneStyleEnum))
    lang = Column(String(10), default="es", nullable=False)

    # AI metadata
    model_used = Column(String(100))  # e.g., "gpt-4-turbo-preview"
    tokens_used = Column(Integer)
    confidence_score = Column(Float)

    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationship
    conversation = relationship("ConversationModel", back_populates="messages")
    feedbacks = relationship("FeedbackModel", back_populates="message", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index('idx_message_conversation_id', 'conversation_id'),
        Index('idx_message_timestamp', 'timestamp'),
        Index('idx_message_role', 'role'),
    )

    def __repr__(self):
        return f"<Message(id={self.id}, role={self.role}, tone={self.tone})>"


# ==================== Gamification Models ====================

class MissionModel(Base):
    """Mission table - gamification challenges"""
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    difficulty = Column(Integer, default=1, nullable=False)  # 1-5
    xp_reward = Column(Integer, default=100, nullable=False)

    # Mission configuration
    mission_type = Column(String(50), nullable=False)  # e.g., "generate_opener", "complete_conversation"
    requirements = Column(JSON)  # Mission-specific requirements

    # Visibility
    is_active = Column(Boolean, default=True, nullable=False)
    is_daily = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user_missions = relationship("UserMissionModel", back_populates="mission", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Mission(id={self.id}, title={self.title}, difficulty={self.difficulty})>"


class UserMissionModel(Base):
    """User-Mission table - tracks user progress on missions"""
    __tablename__ = "user_missions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mission_id = Column(Integer, ForeignKey("missions.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(MissionStatusEnum), default=MissionStatusEnum.PENDING, nullable=False)
    score = Column(Integer, default=0)

    # Progress tracking
    progress_data = Column(JSON)  # Mission-specific progress

    # Timestamps
    started_at = Column(DateTime)
    completed_at = Column(DateTime)

    # Relationships
    user = relationship("UserModel", back_populates="user_missions")
    mission = relationship("MissionModel", back_populates="user_missions")

    # Indexes
    __table_args__ = (
        Index('idx_user_mission_user_id', 'user_id'),
        Index('idx_user_mission_mission_id', 'mission_id'),
        Index('idx_user_mission_status', 'status'),
    )

    def __repr__(self):
        return f"<UserMission(id={self.id}, user_id={self.user_id}, mission_id={self.mission_id}, status={self.status})>"


# ==================== Feedback & Safety Models ====================

class FeedbackModel(Base):
    """Feedback table - user reactions to AI suggestions"""
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    thumb_up = Column(Boolean)  # True = 👍, False = 👎, None = no feedback
    note = Column(Text)  # Optional user comment

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    message = relationship("MessageModel", back_populates="feedbacks")
    user = relationship("UserModel", back_populates="feedbacks")

    # Indexes
    __table_args__ = (
        Index('idx_feedback_message_id', 'message_id'),
        Index('idx_feedback_user_id', 'user_id'),
        Index('idx_feedback_created_at', 'created_at'),
    )

    def __repr__(self):
        return f"<Feedback(id={self.id}, message_id={self.message_id}, thumb_up={self.thumb_up})>"


class SafetyLogModel(Base):
    """Safety Log table - tracks blocked/inappropriate content"""
    __tablename__ = "safety_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason = Column(String(255), nullable=False)  # Why it was blocked
    text = Column(Text, nullable=False)  # The blocked content
    action_taken = Column(String(50), nullable=False)  # "blocked", "rewritten", etc.

    # Context
    cultural_style = Column(String(50))
    endpoint = Column(String(100))  # Which endpoint triggered it

    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationship
    user = relationship("UserModel", back_populates="safety_logs")

    # Indexes
    __table_args__ = (
        Index('idx_safety_log_user_id', 'user_id'),
        Index('idx_safety_log_timestamp', 'timestamp'),
        Index('idx_safety_log_action', 'action_taken'),
    )

    def __repr__(self):
        return f"<SafetyLog(id={self.id}, user_id={self.user_id}, reason={self.reason})>"


# ==================== Analytics Models (Future) ====================

class UsageStatsModel(Base):
    """Usage Statistics table - track API usage for analytics"""
    __tablename__ = "usage_stats"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    # Endpoint tracking
    endpoint = Column(String(100), nullable=False)
    method = Column(String(10), nullable=False)  # GET, POST, etc.
    status_code = Column(Integer, nullable=False)

    # Performance
    response_time_ms = Column(Float)

    # LLM usage
    llm_provider = Column(String(50))
    tokens_used = Column(Integer)

    # Context
    cultural_style = Column(String(50))

    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Indexes
    __table_args__ = (
        Index('idx_usage_stats_user_id', 'user_id'),
        Index('idx_usage_stats_endpoint', 'endpoint'),
        Index('idx_usage_stats_timestamp', 'timestamp'),
    )

    def __repr__(self):
        return f"<UsageStats(id={self.id}, endpoint={self.endpoint}, status_code={self.status_code})>"


# ==================== Discover / Match Models ====================

class LikeModel(Base):
    """Likes table - one-directional likes between users"""
    __tablename__ = "likes"

    id = Column(Integer, primary_key=True, index=True)
    liker_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    liked_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint('liker_user_id', 'liked_user_id', name='uq_like_pair'),
        Index('idx_likes_liker', 'liker_user_id'),
        Index('idx_likes_liked', 'liked_user_id'),
    )

    def __repr__(self):
        return f"<Like(liker={self.liker_user_id}, liked={self.liked_user_id})>"


class MatchModel(Base):
    """Matches table - mutual likes with onboarding state machine"""
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)  # lower user_id
    user2_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)  # higher user_id
    status = Column(SQLEnum(MatchStatusEnum), default=MatchStatusEnum.PENDING_QUESTIONS, nullable=False)

    # AI-generated questions stored as JSON: [{"id": "q1", "text": "..."}]
    questions = Column(JSON, default=list)

    # Answers stored as JSON: {"q1": "answer text", ...}
    user1_answers = Column(JSON)
    user2_answers = Column(JSON)

    # Decisions: "accept" | "cancel"
    user1_decision = Column(String(10))
    user2_decision = Column(String(10))

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user1_id', 'user2_id', name='uq_match_pair'),
        Index('idx_matches_user1', 'user1_id'),
        Index('idx_matches_user2', 'user2_id'),
        Index('idx_matches_status', 'status'),
    )

    def __repr__(self):
        return f"<Match(id={self.id}, user1={self.user1_id}, user2={self.user2_id}, status={self.status})>"
