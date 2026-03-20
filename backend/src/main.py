"""
Labia.AI FastAPI Application
Main entry point for the API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from .presentation.api import openers, responses, health, auth, conversations, agent, dating_profile, discover, matches, lobbies
from .presentation.middleware.error_handler import (
    ErrorHandlerMiddleware,
    RequestLoggingMiddleware
)
from .presentation.middleware.rate_limiter import RateLimiterMiddleware
from .presentation.middleware.security_headers import SecurityHeadersMiddleware
from .core.config import settings
from .core.logging import StructuredLogger
from .infrastructure.database.database import check_database_connection, get_database_info
from .infrastructure.cache.redis_client import get_redis_client

# Configure structured logger
structured_logger = StructuredLogger(service_name="labia-ai")

# Create FastAPI app
app = FastAPI(
    title="Labia.AI API",
    description="AI-powered conversation assistant for Latin American markets",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add middleware (order matters - first added is executed last)
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimiterMiddleware)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    # Allow any IPv4/IPv6 host (with optional port) like http://192.168.1.10:3000 or http://[::1]:8080
    allow_origin_regex=r"^https?://(\[[0-9a-fA-F:]+\]|(\d{1,3}\.){3}\d{1,3})(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(openers.router, prefix="/api/v1", tags=["Openers"])
app.include_router(responses.router, prefix="/api/v1", tags=["Responses"])
app.include_router(conversations.router, prefix="/api/v1", tags=["Conversations"])
app.include_router(agent.router, prefix="/api/v1", tags=["Agent"])
app.include_router(dating_profile.router, prefix="/api/v1", tags=["Dating Profile"])
app.include_router(discover.router, prefix="/api/v1", tags=["Discover"])
app.include_router(matches.router, prefix="/api/v1", tags=["Matches"])
app.include_router(lobbies.router, prefix="/api/v1", tags=["Lobbies"])


@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("ðŸš€ Starting Labia.AI API")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"LLM Provider: {settings.LLM_PROVIDER}")

    # Check database connection
    logger.info("Checking database connection...")
    db_connected = await check_database_connection()
    if db_connected:
        db_info = get_database_info()
        logger.info(f"âœ… Database connected: {db_info['url']}")
    else:
        logger.warning("âš ï¸  Database connection failed - running without persistence")

    # Initialize Redis cache
    logger.info("Initializing Redis cache...")
    try:
        redis_client = get_redis_client()
        if await redis_client.ping():
            logger.info(f"âœ… Redis cache connected: {settings.REDIS_URL.split('@')[-1]}")
        else:
            logger.warning("âš ï¸  Redis ping failed - caching disabled")
    except Exception as e:
        logger.warning(f"âš ï¸  Redis connection failed: {e} - caching disabled")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info("ðŸ‘‹ Shutting down Labia.AI API")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Â¡Wepa! Bienvenido a Labia.AI ðŸ‡µðŸ‡·",
        "version": "1.0.0",
        "docs": "/docs"
    }
