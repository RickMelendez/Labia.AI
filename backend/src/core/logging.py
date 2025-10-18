"""
Structured Logging Configuration
Provides consistent logging across the application
"""
import sys
import json
from typing import Any, Dict
from datetime import datetime
from loguru import logger
from pathlib import Path


class StructuredLogger:
    """Structured logger with JSON formatting"""

    def __init__(self, service_name: str = "labia-ai"):
        self.service_name = service_name
        self._configure_logger()

    def _configure_logger(self):
        """Configure loguru logger with structured format"""
        # Remove default logger
        logger.remove()

        # Console logger (development)
        logger.add(
            sys.stdout,
            format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{extra[service]}</cyan> | <level>{message}</level>",
            level="INFO",
            colorize=True,
            serialize=False,
            filter=self._add_service_context
        )

        # File logger (JSON format for production)
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)

        logger.add(
            log_dir / "labia-ai-{time:YYYY-MM-DD}.log",
            format="{message}",
            level="INFO",
            rotation="00:00",  # Rotate daily
            retention="30 days",
            compression="zip",
            serialize=True,  # JSON format
            filter=self._add_service_context
        )

        # Error logger (separate file for errors)
        logger.add(
            log_dir / "errors-{time:YYYY-MM-DD}.log",
            format="{message}",
            level="ERROR",
            rotation="00:00",
            retention="90 days",
            compression="zip",
            serialize=True,
            filter=self._add_service_context
        )

    def _add_service_context(self, record):
        """Add service context to log records"""
        record["extra"]["service"] = self.service_name
        return True

    def log_request(
        self,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        user_id: str = None,
        **kwargs
    ):
        """Log HTTP request"""
        log_data = {
            "event": "http_request",
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": duration_ms,
            "user_id": user_id,
            **kwargs
        }
        logger.bind(**log_data).info(f"{method} {path} {status_code} {duration_ms}ms")

    def log_llm_request(
        self,
        provider: str,
        model: str,
        prompt_type: str,
        tokens_used: int = None,
        duration_ms: float = None,
        success: bool = True,
        error: str = None,
        **kwargs
    ):
        """Log LLM API request"""
        log_data = {
            "event": "llm_request",
            "provider": provider,
            "model": model,
            "prompt_type": prompt_type,
            "tokens_used": tokens_used,
            "duration_ms": duration_ms,
            "success": success,
            "error": error,
            **kwargs
        }
        level = "INFO" if success else "ERROR"
        logger.bind(**log_data).log(
            level,
            f"LLM Request: {provider}/{model} - {prompt_type} - {'Success' if success else f'Error: {error}'}"
        )

    def log_content_safety(
        self,
        text_length: int,
        is_safe: bool,
        reason: str = None,
        cultural_style: str = None,
        **kwargs
    ):
        """Log content safety check"""
        log_data = {
            "event": "content_safety_check",
            "text_length": text_length,
            "is_safe": is_safe,
            "reason": reason,
            "cultural_style": cultural_style,
            **kwargs
        }
        level = "WARNING" if not is_safe else "INFO"
        logger.bind(**log_data).log(
            level,
            f"Content Safety: {'SAFE' if is_safe else f'UNSAFE ({reason})'}"
        )

    def log_rate_limit(
        self,
        user_id: str,
        endpoint: str,
        limit: int,
        used: int,
        exceeded: bool = False,
        **kwargs
    ):
        """Log rate limit check"""
        log_data = {
            "event": "rate_limit_check",
            "user_id": user_id,
            "endpoint": endpoint,
            "limit": limit,
            "used": used,
            "exceeded": exceeded,
            **kwargs
        }
        level = "WARNING" if exceeded else "INFO"
        logger.bind(**log_data).log(
            level,
            f"Rate Limit: {user_id} - {endpoint} - {used}/{limit} {'EXCEEDED' if exceeded else 'OK'}"
        )

    def log_cache_operation(
        self,
        operation: str,
        key: str,
        hit: bool = None,
        ttl: int = None,
        **kwargs
    ):
        """Log cache operation"""
        log_data = {
            "event": "cache_operation",
            "operation": operation,
            "key": key,
            "hit": hit,
            "ttl": ttl,
            **kwargs
        }
        logger.bind(**log_data).info(
            f"Cache {operation}: {key} - {'HIT' if hit else 'MISS' if hit is not None else 'N/A'}"
        )

    def log_database_operation(
        self,
        operation: str,
        table: str,
        duration_ms: float = None,
        rows_affected: int = None,
        success: bool = True,
        error: str = None,
        **kwargs
    ):
        """Log database operation"""
        log_data = {
            "event": "database_operation",
            "operation": operation,
            "table": table,
            "duration_ms": duration_ms,
            "rows_affected": rows_affected,
            "success": success,
            "error": error,
            **kwargs
        }
        level = "INFO" if success else "ERROR"
        logger.bind(**log_data).log(
            level,
            f"DB {operation}: {table} - {duration_ms}ms - {rows_affected} rows - {'Success' if success else f'Error: {error}'}"
        )

    def log_user_action(
        self,
        user_id: str,
        action: str,
        cultural_style: str = None,
        details: Dict[str, Any] = None,
        **kwargs
    ):
        """Log user action"""
        log_data = {
            "event": "user_action",
            "user_id": user_id,
            "action": action,
            "cultural_style": cultural_style,
            "details": details,
            **kwargs
        }
        logger.bind(**log_data).info(f"User Action: {user_id} - {action}")

    def log_error(
        self,
        error_type: str,
        error_message: str,
        stack_trace: str = None,
        context: Dict[str, Any] = None,
        **kwargs
    ):
        """Log error with context"""
        log_data = {
            "event": "error",
            "error_type": error_type,
            "error_message": error_message,
            "stack_trace": stack_trace,
            "context": context,
            **kwargs
        }
        logger.bind(**log_data).error(f"Error: {error_type} - {error_message}")

    def log_info(self, message: str, **kwargs):
        """Log info message"""
        logger.bind(**kwargs).info(message)

    def log_warning(self, message: str, **kwargs):
        """Log warning message"""
        logger.bind(**kwargs).warning(message)

    def log_debug(self, message: str, **kwargs):
        """Log debug message"""
        logger.bind(**kwargs).debug(message)


# Global logger instance
structured_logger = StructuredLogger()


# Convenience functions
def log_info(message: str, **kwargs):
    """Log info message"""
    logger.bind(**kwargs).info(message)


def log_warning(message: str, **kwargs):
    """Log warning message"""
    logger.bind(**kwargs).warning(message)


def log_error(message: str, **kwargs):
    """Log error message"""
    logger.bind(**kwargs).error(message)


def log_debug(message: str, **kwargs):
    """Log debug message"""
    logger.bind(**kwargs).debug(message)
