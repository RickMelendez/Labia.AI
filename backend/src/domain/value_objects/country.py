"""
Country Value Object
"""
from dataclasses import dataclass
from typing import Dict


@dataclass(frozen=True)
class Country:
    """Country value object with cultural context"""
    
    code: str  # ISO 3166-1 alpha-2 code
    
    # Cultural style mappings
    STYLES: Dict[str, str] = {
        "PR": "boricua",
        "MX": "mexicano",
        "CO": "colombiano",
        "AR": "argentino",
        "ES": "español",
        "US": "americano",
    }
    
    def __post_init__(self):
        if not self._is_valid(self.code):
            raise ValueError(f"Invalid country code: {self.code}")
    
    @staticmethod
    def _is_valid(code: str) -> bool:
        """Validate country code"""
        return len(code) == 2 and code.isupper()
    
    def get_cultural_style(self) -> str:
        """Get cultural communication style for country"""
        return self.STYLES.get(self.code, "neutral")
    
    def __str__(self) -> str:
        return self.code
