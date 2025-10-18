"""
Custom Exceptions for Labia.AI
Structured error handling across the application
"""
from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class LabiaAIException(Exception):
    """Base exception for all Labia.AI errors"""

    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = None
    ):
        self.message = message
        self.details = details or {}
        self.error_code = error_code
        super().__init__(self.message)


class LLMProviderException(LabiaAIException):
    """Exception raised when LLM provider fails"""

    def __init__(
        self,
        message: str = "Error communicating with AI provider",
        provider: str = "unknown",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            details={**(details or {}), "provider": provider},
            error_code="LLM_PROVIDER_ERROR"
        )


class ContentSafetyException(LabiaAIException):
    """Exception raised when content violates safety policies"""

    def __init__(
        self,
        message: str = "Content violates safety policies",
        reason: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            details={**(details or {}), "reason": reason},
            error_code="CONTENT_SAFETY_VIOLATION"
        )


class RateLimitException(LabiaAIException):
    """Exception raised when rate limit is exceeded"""

    def __init__(
        self,
        message: str = "Rate limit exceeded",
        limit: int = 0,
        reset_time: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            details={
                **(details or {}),
                "limit": limit,
                "reset_time": reset_time
            },
            error_code="RATE_LIMIT_EXCEEDED"
        )


class ValidationException(LabiaAIException):
    """Exception raised for validation errors"""

    def __init__(
        self,
        message: str = "Validation error",
        field: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            details={**(details or {}), "field": field},
            error_code="VALIDATION_ERROR"
        )


class AuthenticationException(LabiaAIException):
    """Exception raised for authentication errors"""

    def __init__(
        self,
        message: str = "Authentication failed",
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            details=details,
            error_code="AUTHENTICATION_ERROR"
        )


class AuthorizationException(LabiaAIException):
    """Exception raised for authorization errors"""

    def __init__(
        self,
        message: str = "Insufficient permissions",
        required_permission: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            details={**(details or {}), "required_permission": required_permission},
            error_code="AUTHORIZATION_ERROR"
        )


class DatabaseException(LabiaAIException):
    """Exception raised for database errors"""

    def __init__(
        self,
        message: str = "Database error",
        operation: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            details={**(details or {}), "operation": operation},
            error_code="DATABASE_ERROR"
        )


class ConfigurationException(LabiaAIException):
    """Exception raised for configuration errors"""

    def __init__(
        self,
        message: str = "Configuration error",
        config_key: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            details={**(details or {}), "config_key": config_key},
            error_code="CONFIGURATION_ERROR"
        )


class CacheException(LabiaAIException):
    """Exception raised for cache errors"""

    def __init__(
        self,
        message: str = "Cache error",
        operation: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            details={**(details or {}), "operation": operation},
            error_code="CACHE_ERROR"
        )


# HTTP Exception Mappers
def map_exception_to_http(exception: LabiaAIException) -> HTTPException:
    """Map custom exceptions to HTTP exceptions"""

    status_code_map = {
        "LLM_PROVIDER_ERROR": status.HTTP_503_SERVICE_UNAVAILABLE,
        "CONTENT_SAFETY_VIOLATION": status.HTTP_400_BAD_REQUEST,
        "RATE_LIMIT_EXCEEDED": status.HTTP_429_TOO_MANY_REQUESTS,
        "VALIDATION_ERROR": status.HTTP_422_UNPROCESSABLE_ENTITY,
        "AUTHENTICATION_ERROR": status.HTTP_401_UNAUTHORIZED,
        "AUTHORIZATION_ERROR": status.HTTP_403_FORBIDDEN,
        "DATABASE_ERROR": status.HTTP_500_INTERNAL_SERVER_ERROR,
        "CONFIGURATION_ERROR": status.HTTP_500_INTERNAL_SERVER_ERROR,
        "CACHE_ERROR": status.HTTP_500_INTERNAL_SERVER_ERROR,
    }

    status_code = status_code_map.get(
        exception.error_code,
        status.HTTP_500_INTERNAL_SERVER_ERROR
    )

    return HTTPException(
        status_code=status_code,
        detail={
            "error": exception.error_code,
            "message": exception.message,
            "details": exception.details
        }
    )
