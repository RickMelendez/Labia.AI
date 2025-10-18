"""
Mission and UserMission Entities - Gamification
"""
from datetime import datetime
from typing import Optional
from enum import Enum


class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class MissionStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Mission:
    """Mission domain entity for gamification"""
    
    def __init__(
        self,
        title: str,
        description: str,
        mission_id: Optional[int] = None,
        difficulty: DifficultyLevel = DifficultyLevel.EASY,
        xp_reward: int = 10,
        created_at: Optional[datetime] = None,
    ):
        self.id = mission_id
        self.title = title
        self.description = description
        self.difficulty = difficulty
        self.xp_reward = xp_reward
        self.created_at = created_at or datetime.utcnow()
    
    def calculate_xp_for_score(self, score: float) -> int:
        """Calculate XP based on mission score (0.0 - 1.0)"""
        return int(self.xp_reward * score)


class UserMission:
    """User's progress on a specific mission"""
    
    def __init__(
        self,
        user_id: int,
        mission_id: int,
        user_mission_id: Optional[int] = None,
        status: MissionStatus = MissionStatus.PENDING,
        score: Optional[float] = None,
        completed_at: Optional[datetime] = None,
        created_at: Optional[datetime] = None,
    ):
        self.id = user_mission_id
        self.user_id = user_id
        self.mission_id = mission_id
        self.status = status
        self.score = score
        self.completed_at = completed_at
        self.created_at = created_at or datetime.utcnow()
    
    def start(self) -> None:
        """Mark mission as in progress"""
        if self.status == MissionStatus.PENDING:
            self.status = MissionStatus.IN_PROGRESS
    
    def complete(self, score: float) -> None:
        """Complete the mission with a score"""
        self.status = MissionStatus.COMPLETED
        self.score = max(0.0, min(1.0, score))  # Clamp between 0 and 1
        self.completed_at = datetime.utcnow()
    
    def is_completed(self) -> bool:
        """Check if mission is completed"""
        return self.status == MissionStatus.COMPLETED
