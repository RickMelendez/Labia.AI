"""
Rate Limiting Middleware
Enforces per-user rate limits based on subscription plan
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from typing import Callable
import time

from ...core.config import settings
from ...core.exceptions import RateLimitException
from ...core.logging import StructuredLogger
from ...infrastructure.cache.redis_client import redis_client

logger = StructuredLogger()


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware based on user plan

    Rate Limits (per 24 hours):
    - Free: 10 AI requests
    - Pro: 100 AI requests
    - Premium: Unlimited

    Exempted endpoints:
    - /health
    - /
    - /auth/* (authentication endpoints)

    Rate limit info is returned in response headers:
    - X-RateLimit-Limit: Maximum requests allowed
    - X-RateLimit-Remaining: Requests remaining
    - X-RateLimit-Reset: Unix timestamp when limit resets
    """

    # Endpoints that require rate limiting
    RATE_LIMITED_ENDPOINTS = [
        "/api/v1/openers",
        "/api/v1/responses",
        "/api/v1/safety-check",
        "/api/v1/rewrite",
    ]

    # Endpoints exempt from rate limiting
    EXEMPT_ENDPOINTS = [
        "/health",
        "/",
        "/api/v1/auth",
        "/docs",
        "/openapi.json",
        "/redoc",
    ]

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and enforce rate limits

        Steps:
        1. Check if endpoint requires rate limiting
        2. Extract user from auth token
        3. Check current usage from Redis
        4. Compare against plan limits
        5. Increment counter or reject
        6. Add rate limit headers to response
        """
        start_time = time.time()
        path = request.url.path

        # Skip rate limiting for exempt endpoints
        if any(path.startswith(exempt) for exempt in self.EXEMPT_ENDPOINTS):
            return await call_next(request)

        # Only rate limit specific endpoints
        if not any(path.startswith(endpoint) for endpoint in self.RATE_LIMITED_ENDPOINTS):
            return await call_next(request)

        try:
            # Extract user from request (if authenticated)
            user = getattr(request.state, "user", None)

            if not user:
                # If no user found, apply IP-based rate limiting
                return await self._rate_limit_by_ip(request, call_next)

            # Get user plan and rate limit
            plan = user.plan.value  # "free", "pro", or "premium"
            limit = self._get_plan_limit(plan)

            # Premium users get unlimited access
            if limit == -1:
                response = await call_next(request)
                response.headers["X-RateLimit-Limit"] = "unlimited"
                response.headers["X-RateLimit-Remaining"] = "unlimited"
                return response

            # Check rate limit from Redis
            rate_key = f"rate:user:{user.id}"

            # Get current usage
            current_usage = await redis_client.get_rate_limit(rate_key)

            # Check if limit exceeded
            if current_usage >= limit:
                # Get TTL for reset time
                ttl = await redis_client.get_ttl(rate_key)
                reset_time = int(time.time()) + ttl if ttl > 0 else int(time.time()) + 86400

                logger.warning(f"Rate limit exceeded for user {user.id} (plan: {plan})")

                # Log rate limit event
                logger.log_rate_limit(
                    user_id=user.id,
                    limit=limit,
                    used=current_usage,
                    endpoint=path,
                )

                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "Rate limit exceeded",
                        "message": f"You have reached your {plan} plan limit of {limit} requests per day",
                        "limit": limit,
                        "used": current_usage,
                        "reset_at": reset_time,
                        "upgrade_url": "/api/v1/plans/upgrade" if plan != "premium" else None,
                    },
                    headers={
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(reset_time),
                        "Retry-After": str(ttl) if ttl > 0 else "86400",
                    },
                )

            # Increment usage counter (24 hour TTL)
            new_usage = await redis_client.increment_rate_limit(rate_key, ttl=86400)

            # Process request
            response = await call_next(request)

            # Add rate limit headers
            remaining = max(0, limit - new_usage)
            ttl = await redis_client.get_ttl(rate_key)
            reset_time = int(time.time()) + ttl if ttl > 0 else int(time.time()) + 86400

            response.headers["X-RateLimit-Limit"] = str(limit)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(reset_time)

            # Log successful request
            duration = (time.time() - start_time) * 1000
            logger.log_request(
                method=request.method,
                path=path,
                status_code=response.status_code,
                duration_ms=duration,
            )

            return response

        except Exception as e:
            logger.error(f"Rate limiter error: {e}")
            # On error, allow request through (fail open)
            return await call_next(request)

    async def _rate_limit_by_ip(self, request: Request, call_next: Callable) -> Response:
        """
        Rate limit unauthenticated requests by IP address

        IP-based limit: 20 requests per hour (stricter than free plan)
        """
        try:
            # Get client IP
            client_ip = request.client.host if request.client else "unknown"

            # Use IP-based rate limit key
            rate_key = f"rate:ip:{client_ip}"
            limit = 20  # 20 requests per hour for unauthenticated

            # Get current usage
            current_usage = await redis_client.get_rate_limit(rate_key)

            # Check if limit exceeded
            if current_usage >= limit:
                ttl = await redis_client.get_ttl(rate_key)
                reset_time = int(time.time()) + ttl if ttl > 0 else int(time.time()) + 3600

                logger.warning(f"IP rate limit exceeded for {client_ip}")

                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "Rate limit exceeded",
                        "message": "Please register or login to increase your rate limit",
                        "limit": limit,
                        "used": current_usage,
                        "reset_at": reset_time,
                    },
                    headers={
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(reset_time),
                        "Retry-After": str(ttl) if ttl > 0 else "3600",
                    },
                )

            # Increment usage (1 hour TTL)
            new_usage = await redis_client.increment_rate_limit(rate_key, ttl=3600)

            # Process request
            response = await call_next(request)

            # Add rate limit headers
            remaining = max(0, limit - new_usage)
            response.headers["X-RateLimit-Limit"] = str(limit)
            response.headers["X-RateLimit-Remaining"] = str(remaining)

            return response

        except Exception as e:
            logger.error(f"IP rate limiter error: {e}")
            # On error, allow request through
            return await call_next(request)

    @staticmethod
    def _get_plan_limit(plan: str) -> int:
        """
        Get rate limit for subscription plan

        Args:
            plan: User's plan ("free", "pro", "premium")

        Returns:
            int: Rate limit (-1 = unlimited)
        """
        limits = {
            "free": settings.RATE_LIMIT_FREE,
            "pro": settings.RATE_LIMIT_PRO,
            "premium": settings.RATE_LIMIT_PREMIUM,
        }
        return limits.get(plan, settings.RATE_LIMIT_FREE)


# ==================== Rate Limit Helper Functions ====================


async def check_rate_limit(user_id: int, plan: str) -> dict:
    """
    Check current rate limit status for a user

    Args:
        user_id: User ID
        plan: User's subscription plan

    Returns:
        dict: {
            "limit": int,
            "used": int,
            "remaining": int,
            "reset_at": int (unix timestamp)
        }

    Example:
        >>> status = await check_rate_limit(user_id=123, plan="free")
        >>> print(f"Remaining: {status['remaining']}")
    """
    from ...core.config import settings

    # Get plan limit
    limits = {
        "free": settings.RATE_LIMIT_FREE,
        "pro": settings.RATE_LIMIT_PRO,
        "premium": settings.RATE_LIMIT_PREMIUM,
    }
    limit = limits.get(plan, settings.RATE_LIMIT_FREE)

    # Premium = unlimited
    if limit == -1:
        return {"limit": -1, "used": 0, "remaining": -1, "reset_at": None}

    # Get current usage from Redis
    rate_key = f"rate:user:{user_id}"
    used = await redis_client.get_rate_limit(rate_key)

    # Get TTL
    ttl = await redis_client.get_ttl(rate_key)
    reset_at = int(time.time()) + ttl if ttl > 0 else int(time.time()) + 86400

    return {"limit": limit, "used": used, "remaining": max(0, limit - used), "reset_at": reset_at}


async def reset_user_rate_limit(user_id: int) -> bool:
    """
    Reset rate limit for a user (admin function)

    Args:
        user_id: User ID

    Returns:
        bool: True if successful

    Example:
        >>> await reset_user_rate_limit(user_id=123)
    """
    rate_key = f"rate:user:{user_id}"
    return await redis_client.reset_rate_limit(rate_key)
