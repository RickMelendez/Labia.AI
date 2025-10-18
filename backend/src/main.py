"""
Labia.AI FastAPI Application
Main entry point for the API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys

from .presentation.api import openers, responses, health
from .presentation.middleware.error_handler import (
    ErrorHandlerMiddleware,
    RequestLoggingMiddleware
)
from .core.config import settings
from .core.logging import StructuredLogger

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
app.include_router(openers.router, prefix="/api/v1", tags=["Openers"])
app.include_router(responses.router, prefix="/api/v1", tags=["Responses"])


@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("🚀 Starting Labia.AI API")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"LLM Provider: {settings.LLM_PROVIDER}")


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
