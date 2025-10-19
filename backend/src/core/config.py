"""
Application Configuration
Settings loaded from environment variables
"""
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "Labia.AI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",  # React Native
        "http://localhost:19000",  # Expo
        "http://localhost:19006",  # Expo web
        "https://labia.chat",  # Production domain
        "https://www.labia.chat",  # Production domain (www)
        "https://api.labia.chat",  # API subdomain
        "https://staging.labia.chat",  # Staging domain
        "https://api.staging.labia.chat",  # Staging API subdomain
    ]

    # Database
    DATABASE_URL: str = "postgresql://labiaai:labiaai@localhost:5432/labiaai"

    # LLM Configuration
    LLM_PROVIDER: str = "openai"  # openai or anthropic
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    # Redis Cache
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600  # 1 hour in seconds
    REDIS_RATE_LIMIT_TTL: int = 86400  # 24 hours in seconds

    # Security & JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_SECRET_KEY: str = "your-jwt-secret-key-change-in-production-must-be-32-chars-minimum"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30  # 30 minutes
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # 7 days

    # Rate Limiting
    RATE_LIMIT_FREE: int = 10  # per day
    RATE_LIMIT_PRO: int = 100  # per day
    RATE_LIMIT_PREMIUM: int = -1  # unlimited

    # Default Settings
    DEFAULT_CULTURAL_STYLE: str = "boricua"
    DEFAULT_TONE: str = "chill"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env that aren't defined in Settings


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Global settings instance
settings = get_settings()
