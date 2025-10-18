"""
Labia.AI FastAPI Application
Main entry point for the API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys

from .presentation.api import openers, responses, health, auth, conversations
from .presentation.middleware.error_handler import (
    ErrorHandlerMiddleware,
    RequestLoggingMiddleware
)
from .presentation.middleware.rate_limiter import RateLimiterMiddleware
from .core.config import settings
from .core.logging import StructuredLogger
from .infrastructure.database.database import check_database_connection, get_database_info
from .infrastructure.cache.redis_client import RedisClient, get_redis_client

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
app.add_middleware(RateLimiterMiddleware)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
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


@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("🚀 Starting Labia.AI API")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"LLM Provider: {settings.LLM_PROVIDER}")

    # Check database connection
    logger.info("Checking database connection...")
    db_connected = await check_database_connection()
    if db_connected:
        db_info = get_database_info()
        logger.info(f"✅ Database connected: {db_info['url']}")
    else:
        logger.warning("⚠️  Database connection failed - running without persistence")

    # Initialize Redis cache
    logger.info("Initializing Redis cache...")
    try:
        redis_client = get_redis_client()
        if await redis_client.ping():
            logger.info(f"✅ Redis cache connected: {settings.REDIS_URL.split('@')[-1]}")
        else:
            logger.warning("⚠️  Redis ping failed - caching disabled")
    except Exception as e:
        logger.warning(f"⚠️  Redis connection failed: {e} - caching disabled")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info("👋 Shutting down Labia.AI API")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "¡Wepa! Bienvenido a Labia.AI 🇵🇷",
        "version": "1.0.0",
        "docs": "/docs"
    }
