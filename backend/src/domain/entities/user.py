"""
User Entity - Core business logic for users
"""
from datetime import datetime
from typing import Optional
from enum import Enum


class PlanType(str, Enum):
    FREE = "free"
    PRO = "pro"
    PREMIUM = "premium"


class User:
    """User domain entity"""
    
    def __init__(
        self,
        email: str,
        hashed_password: str,
        country: str,
        user_id: Optional[int] = None,
        plan: PlanType = PlanType.FREE,
        tone_default: str = "chill",
        created_at: Optional[datetime] = None,
        daily_suggestions_used: int = 0,
        last_suggestion_reset: Optional[datetime] = None,
    ):
        self.id = user_id
        self.email = email
        self.hashed_password = hashed_password
        self.country = country
        self.plan = plan
        self.tone_default = tone_default
        self.created_at = created_at or datetime.utcnow()
        self.daily_suggestions_used = daily_suggestions_used
        self.last_suggestion_reset = last_suggestion_reset or datetime.utcnow()
    
    def can_generate_suggestion(self) -> bool:
        """Check if user can generate a new suggestion based on their plan"""
        self._reset_daily_count_if_needed()
        
        if self.plan == PlanType.PREMIUM:
            return True
        elif self.plan == PlanType.PRO:
            return self.daily_suggestions_used < 100
        else:  # FREE
            return self.daily_suggestions_used < 10
    
    def increment_suggestion_count(self) -> None:
        """Increment the daily suggestion counter"""
        self._reset_daily_count_if_needed()
        self.daily_suggestions_used += 1
    
    def _reset_daily_count_if_needed(self) -> None:
        """Reset daily count if it's a new day"""
        now = datetime.utcnow()
        if self.last_suggestion_reset.date() < now.date():
            self.daily_suggestions_used = 0
            self.last_suggestion_reset = now
    
    def upgrade_plan(self, new_plan: PlanType) -> None:
        """Upgrade user's subscription plan"""
        if new_plan.value > self.plan.value:
            self.plan = new_plan
    
    def is_premium(self) -> bool:
        """Check if user has premium plan"""
        return self.plan == PlanType.PREMIUM
    
    def is_pro_or_higher(self) -> bool:
        """Check if user has pro or premium plan"""
        return self.plan in [PlanType.PRO, PlanType.PREMIUM]
