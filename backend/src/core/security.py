"""
Security Utilities
JWT token generation, password hashing, and authentication helpers
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
from loguru import logger

from .config import settings
from .exceptions import AuthenticationException, AuthorizationException


# ==================== Password Hashing ====================

# Configure bcrypt for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt

    Args:
        password: Plain-text password

    Returns:
        str: Bcrypt hashed password

    Example:
        >>> hashed = hash_password("mypassword123")
        >>> verify_password("mypassword123", hashed)
        True
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a hashed password

    Args:
        plain_password: Plain-text password to verify
        hashed_password: Bcrypt hashed password

    Returns:
        bool: True if password matches, False otherwise

    Example:
        >>> hashed = hash_password("mypassword123")
        >>> verify_password("mypassword123", hashed)
        True
        >>> verify_password("wrongpassword", hashed)
        False
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {e}")
        return False


# ==================== JWT Token Generation ====================


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token

    Args:
        data: Dictionary of claims to encode in the token
        expires_delta: Optional custom expiration time

    Returns:
        str: Encoded JWT token

    Raises:
        AuthenticationException: If token creation fails

    Example:
        >>> token = create_access_token({"sub": "user@example.com", "user_id": 123})
        >>> # Token expires in 30 minutes by default
    """
    try:
        to_encode = data.copy()

        # Set expiration time
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        # Add expiration to payload
        to_encode.update({"exp": expire, "iat": datetime.utcnow()})

        # Encode JWT
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

        logger.debug(f"Access token created for subject: {data.get('sub')}")
        return encoded_jwt

    except Exception as e:
        logger.error(f"Failed to create access token: {e}")
        raise AuthenticationException("Could not create access token")


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Create a JWT refresh token with longer expiration

    Args:
        data: Dictionary of claims to encode in the token

    Returns:
        str: Encoded JWT refresh token

    Raises:
        AuthenticationException: If token creation fails

    Example:
        >>> token = create_refresh_token({"sub": "user@example.com"})
        >>> # Token expires in 7 days by default
    """
    try:
        to_encode = data.copy()

        # Set longer expiration for refresh tokens
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        # Add expiration and type to payload
        to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "refresh"})

        # Encode JWT
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

        logger.debug(f"Refresh token created for subject: {data.get('sub')}")
        return encoded_jwt

    except Exception as e:
        logger.error(f"Failed to create refresh token: {e}")
        raise AuthenticationException("Could not create refresh token")


# ==================== JWT Token Verification ====================


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT token

    Args:
        token: JWT token string

    Returns:
        dict: Decoded token payload

    Raises:
        AuthenticationException: If token is invalid or expired

    Example:
        >>> token = create_access_token({"sub": "user@example.com", "user_id": 123})
        >>> payload = decode_token(token)
        >>> payload["user_id"]
        123
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload

    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        raise AuthenticationException("Token has expired")

    except JWTError as e:
        logger.warning(f"Invalid token: {e}")
        raise AuthenticationException("Invalid token")


def verify_access_token(token: str) -> Dict[str, Any]:
    """
    Verify an access token and return the payload

    Args:
        token: JWT access token

    Returns:
        dict: Decoded token payload

    Raises:
        AuthenticationException: If token is invalid, expired, or not an access token

    Example:
        >>> token = create_access_token({"sub": "user@example.com"})
        >>> payload = verify_access_token(token)
        >>> payload["sub"]
        'user@example.com'
    """
    payload = decode_token(token)

    # Ensure it's not a refresh token
    if payload.get("type") == "refresh":
        raise AuthenticationException("Invalid token type")

    return payload


def verify_refresh_token(token: str) -> Dict[str, Any]:
    """
    Verify a refresh token and return the payload

    Args:
        token: JWT refresh token

    Returns:
        dict: Decoded token payload

    Raises:
        AuthenticationException: If token is invalid, expired, or not a refresh token

    Example:
        >>> token = create_refresh_token({"sub": "user@example.com"})
        >>> payload = verify_refresh_token(token)
        >>> payload["type"]
        'refresh'
    """
    payload = decode_token(token)

    # Ensure it's a refresh token
    if payload.get("type") != "refresh":
        raise AuthenticationException("Invalid token type")

    return payload


# ==================== Token Extraction ====================


def get_user_id_from_token(token: str) -> int:
    """
    Extract user ID from a JWT token

    Args:
        token: JWT token

    Returns:
        int: User ID from token

    Raises:
        AuthenticationException: If token is invalid or doesn't contain user_id

    Example:
        >>> token = create_access_token({"sub": "user@example.com", "user_id": 123})
        >>> get_user_id_from_token(token)
        123
    """
    payload = verify_access_token(token)

    user_id = payload.get("user_id")
    if not user_id:
        raise AuthenticationException("Token does not contain user_id")

    return int(user_id)


def get_email_from_token(token: str) -> str:
    """
    Extract email (subject) from a JWT token

    Args:
        token: JWT token

    Returns:
        str: Email from token

    Raises:
        AuthenticationException: If token is invalid or doesn't contain email

    Example:
        >>> token = create_access_token({"sub": "user@example.com"})
        >>> get_email_from_token(token)
        'user@example.com'
    """
    payload = verify_access_token(token)

    email = payload.get("sub")
    if not email:
        raise AuthenticationException("Token does not contain email")

    return email


# ==================== Permission Checks ====================


def check_user_permission(user_id: int, resource_user_id: int) -> None:
    """
    Check if user has permission to access a resource

    Args:
        user_id: ID of the requesting user
        resource_user_id: ID of the user who owns the resource

    Raises:
        AuthorizationException: If user doesn't have permission

    Example:
        >>> check_user_permission(user_id=123, resource_user_id=123)  # OK
        >>> check_user_permission(user_id=123, resource_user_id=456)  # Raises exception
    """
    if user_id != resource_user_id:
        logger.warning(f"User {user_id} attempted to access resource owned by {resource_user_id}")
        raise AuthorizationException("You don't have permission to access this resource")


def check_plan_permission(user_plan: str, required_plan: str) -> None:
    """
    Check if user's plan has sufficient permissions

    Args:
        user_plan: Current user's plan (free, pro, premium)
        required_plan: Minimum required plan

    Raises:
        AuthorizationException: If user's plan is insufficient

    Example:
        >>> check_plan_permission("premium", "free")  # OK
        >>> check_plan_permission("free", "pro")  # Raises exception
    """
    plan_hierarchy = {"free": 0, "pro": 1, "premium": 2}

    user_level = plan_hierarchy.get(user_plan, 0)
    required_level = plan_hierarchy.get(required_plan, 0)

    if user_level < required_level:
        logger.warning(f"User with plan '{user_plan}' attempted to access '{required_plan}' feature")
        raise AuthorizationException(f"This feature requires a {required_plan} plan or higher")


# ==================== Email Validation ====================


def validate_email(email: str) -> bool:
    """
    Basic email validation

    Args:
        email: Email address to validate

    Returns:
        bool: True if email is valid format

    Example:
        >>> validate_email("user@example.com")
        True
        >>> validate_email("invalid-email")
        False
    """
    import re

    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength

    Requirements:
    - At least 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number

    Args:
        password: Password to validate

    Returns:
        tuple: (is_valid, error_message)

    Example:
        >>> validate_password_strength("MyPassword123")
        (True, "")
        >>> validate_password_strength("weak")
        (False, "Password must be at least 8 characters")
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters"

    if not any(c.isupper() for c in password):
        return False, "Password must contain at least 1 uppercase letter"

    if not any(c.islower() for c in password):
        return False, "Password must contain at least 1 lowercase letter"

    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least 1 number"

    return True, ""
