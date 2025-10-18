"""
Email Value Object
"""
import re
from dataclasses import dataclass


@dataclass(frozen=True)
class Email:
    """Email value object - immutable and self-validating"""
    
    value: str
    
    def __post_init__(self):
        if not self._is_valid(self.value):
            raise ValueError(f"Invalid email address: {self.value}")
    
    @staticmethod
    def _is_valid(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def __str__(self) -> str:
        return self.value
    
    def domain(self) -> str:
        """Get email domain"""
        return self.value.split('@')[1]
