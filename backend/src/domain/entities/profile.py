"""
Profile Entity - User preferences and personalization
"""
from datetime import datetime
from typing import List, Optional


class CulturalStyle:
    """Cultural style presets"""
    BORICUA = "boricua"
    MEXICANO = "mexicano"
    COLOMBIANO = "colombiano"
    ARGENTINO = "argentino"
    ESPAÑOL = "español"


class PresetTone:
    """Preset communication tones"""
    CHILL = "chill"
    ELEGANTE = "elegante"
    INTELECTUAL = "intelectual"
    PLAYERO = "playero"
    MINIMALISTA = "minimalista"


class Profile:
    """User profile entity for personalization"""
    
    def __init__(
        self,
        user_id: int,
        name: str,
        profile_id: Optional[int] = None,
        age_range: Optional[str] = None,
        interests: Optional[List[str]] = None,
        tone: str = PresetTone.CHILL,
        emoji_ratio: float = 0.3,
        created_at: Optional[datetime] = None,
    ):
        self.id = profile_id
        self.user_id = user_id
        self.name = name
        self.age_range = age_range
        self.interests = interests or []
        self.tone = tone
        self.emoji_ratio = self._validate_emoji_ratio(emoji_ratio)
        self.created_at = created_at or datetime.utcnow()
    
    @staticmethod
    def _validate_emoji_ratio(ratio: float) -> float:
        """Ensure emoji ratio is between 0 and 1"""
        return max(0.0, min(1.0, ratio))
    
    def update_interests(self, new_interests: List[str]) -> None:
        """Update user interests"""
        self.interests = new_interests
    
    def set_emoji_ratio(self, ratio: float) -> None:
        """Set emoji usage ratio"""
        self.emoji_ratio = self._validate_emoji_ratio(ratio)
    
    def get_interests_string(self) -> str:
        """Get interests as comma-separated string"""
        return ", ".join(self.interests)
