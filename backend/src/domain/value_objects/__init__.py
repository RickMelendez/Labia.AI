"""
Value Objects Package
Immutable objects representing domain concepts
"""
from .email import Email
from .country import Country

__all__ = ["Email", "Country"]
