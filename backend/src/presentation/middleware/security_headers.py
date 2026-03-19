"""
Security Headers Middleware
Adds security-related HTTP headers to all responses
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from typing import Callable

from ...core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all HTTP responses

    Headers added:
    - X-Content-Type-Options: Prevents MIME-sniffing
    - X-Frame-Options: Prevents clickjacking
    - X-XSS-Protection: Enables XSS filter (legacy browsers)
    - Strict-Transport-Security: Enforces HTTPS (production only)
    - Content-Security-Policy: Restricts resource loading
    - Referrer-Policy: Controls referrer information
    - Permissions-Policy: Controls browser features
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and add security headers to response"""

        # Process the request
        response = await call_next(request)

        # Add security headers

        # Prevent MIME-sniffing (forces browser to respect Content-Type)
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking by disallowing embedding in iframes
        response.headers["X-Frame-Options"] = "DENY"

        # Enable XSS filter in browsers (legacy support)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Strict Transport Security (HSTS) - only in production with HTTPS
        if settings.ENVIRONMENT == "production":
            # max-age=31536000 = 1 year
            # includeSubDomains = apply to all subdomains
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )

        # Content Security Policy
        # Note: Adjust these directives based on your frontend requirements
        csp_directives = [
            "default-src 'self'",  # Only load resources from same origin by default
            "script-src 'self' 'unsafe-inline'",  # Allow inline scripts (adjust for production)
            "style-src 'self' 'unsafe-inline'",  # Allow inline styles
            "img-src 'self' data: https:",  # Allow images from self, data URIs, and HTTPS
            "font-src 'self' data:",  # Allow fonts from self and data URIs
            "connect-src 'self' https://api.openai.com https://api.anthropic.com",  # API connections
            "frame-ancestors 'none'",  # Don't allow embedding (same as X-Frame-Options)
            "base-uri 'self'",  # Restrict base tag URLs
            "form-action 'self'",  # Restrict form submissions
        ]
        response.headers["Content-Security-Policy"] = "; ".join(csp_directives)

        # Referrer Policy - control how much referrer information is sent
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions Policy (formerly Feature-Policy)
        # Disable potentially dangerous browser features
        permissions_directives = [
            "geolocation=()",  # Disable geolocation
            "microphone=()",  # Disable microphone
            "camera=()",  # Disable camera
            "payment=()",  # Disable payment APIs
            "usb=()",  # Disable USB access
            "accelerometer=()",  # Disable accelerometer
            "gyroscope=()",  # Disable gyroscope
            "magnetometer=()",  # Disable magnetometer
        ]
        response.headers["Permissions-Policy"] = ", ".join(permissions_directives)

        # Remove server header to avoid revealing server information
        if "server" in response.headers:
            del response.headers["server"]

        return response
