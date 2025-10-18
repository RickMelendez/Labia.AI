"""
Error Handling Middleware
Global error handler for consistent error responses
"""
import time
import traceback
from typing import Callable
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from ...core.exceptions import (
    LabiaAIException,
    map_exception_to_http
)
from ...core.logging import structured_logger


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware for global error handling"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and handle errors"""
        start_time = time.time()

        try:
            response = await call_next(request)
            duration_ms = (time.time() - start_time) * 1000

            # Log successful request
            structured_logger.log_request(
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_ms=duration_ms
            )

            return response

        except LabiaAIException as e:
            # Handle custom exceptions
            duration_ms = (time.time() - start_time) * 1000

            structured_logger.log_error(
                error_type=type(e).__name__,
                error_message=e.message,
                context={
                    "error_code": e.error_code,
                    "details": e.details,
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": duration_ms
                }
            )

            http_exception = map_exception_to_http(e)

            return JSONResponse(
                status_code=http_exception.status_code,
                content={
                    "success": False,
                    "error": {
                        "code": e.error_code,
                        "message": e.message,
                        "details": e.details
                    },
                    "timestamp": time.time()
                }
            )

        except Exception as e:
            # Handle unexpected exceptions
            duration_ms = (time.time() - start_time) * 1000
            error_trace = traceback.format_exc()

            structured_logger.log_error(
                error_type=type(e).__name__,
                error_message=str(e),
                stack_trace=error_trace,
                context={
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": duration_ms
                }
            )

            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "success": False,
                    "error": {
                        "code": "INTERNAL_SERVER_ERROR",
                        "message": "An unexpected error occurred",
                        "details": {}
                    },
                    "timestamp": time.time()
                }
            )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging all requests"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Log request details"""
        start_time = time.time()

        # Log request start
        structured_logger.log_info(
            f"Request started: {request.method} {request.url.path}",
            method=request.method,
            path=request.url.path,
            client_host=request.client.host if request.client else None
        )

        response = await call_next(request)

        duration_ms = (time.time() - start_time) * 1000

        # Log request completion
        structured_logger.log_request(
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
            client_host=request.client.host if request.client else None
        )

        # Add timing header
        response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"

        return response
