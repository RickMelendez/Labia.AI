"""
Authentication API Endpoints
User registration, login, logout, token refresh
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from ...core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    validate_email,
    validate_password_strength,
)
from ...core.exceptions import (
    AuthenticationException,
    ValidationException,
)
from ...core.logging import StructuredLogger
from ...infrastructure.database.database import get_async_db
from ...infrastructure.database.models import UserModel, ProfileModel, PlanTypeEnum

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = StructuredLogger()
security = HTTPBearer()


# ==================== Request/Response Models ====================


class RegisterRequest(BaseModel):
    """User registration request"""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    name: str = Field(..., min_length=2, max_length=100)
    country: str = Field(..., min_length=2, max_length=2, description="ISO 3166-1 alpha-2 country code")
    age_range: Optional[str] = Field(None, description="e.g., '18-25', '26-35'")
    cultural_style: str = Field(default="boricua", description="Preferred cultural style")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "juan@example.com",
                "password": "MySecurePassword123",
                "name": "Juan Pérez",
                "country": "PR",
                "age_range": "25-35",
                "cultural_style": "boricua",
            }
        }


class LoginRequest(BaseModel):
    """User login request"""

    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {"example": {"email": "juan@example.com", "password": "MySecurePassword123"}}


class RefreshTokenRequest(BaseModel):
    """Token refresh request"""

    refresh_token: str


class TokenResponse(BaseModel):
    """Authentication token response"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class UserResponse(BaseModel):
    """User information response"""

    id: int
    email: str
    name: str
    country: str
    plan: str
    cultural_style: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Complete authentication response"""

    user: UserResponse
    tokens: TokenResponse


# ==================== Dependency: Get Current User ====================


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security), db: AsyncSession = Depends(get_async_db)
) -> UserModel:
    """
    Dependency to get the current authenticated user

    Usage:
        @router.get("/protected")
        async def protected_route(user: UserModel = Depends(get_current_user)):
            return {"user_id": user.id}
    """
    from ...core.security import get_user_id_from_token

    try:
        # Extract token from Bearer header
        token = credentials.credentials

        # Get user ID from token
        user_id = get_user_id_from_token(token)

        # Fetch user from database
        result = await db.execute(select(UserModel).where(UserModel.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise AuthenticationException("User not found")

        if not user.is_active:
            raise AuthenticationException("User account is disabled")

        # Update last login
        user.last_login = datetime.utcnow()
        await db.commit()

        return user

    except AuthenticationException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise AuthenticationException("Could not validate credentials")


# ==================== Endpoints ====================


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_async_db)):
    """
    Register a new user account

    **Steps**:
    1. Validate email format
    2. Validate password strength
    3. Check if email already exists
    4. Create user account
    5. Create user profile
    6. Generate JWT tokens
    7. Return user info + tokens

    **Rate Limits**:
    - No authentication required
    - Standard rate limiting applies

    **Returns**:
    - User information
    - Access token (30 min)
    - Refresh token (7 days)
    """
    try:
        # Validate email
        if not validate_email(request.email):
            raise ValidationException("Invalid email format")

        # Validate password strength
        is_valid, error_msg = validate_password_strength(request.password)
        if not is_valid:
            raise ValidationException(error_msg)

        # Check if user already exists
        result = await db.execute(select(UserModel).where(UserModel.email == request.email))
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise ValidationException("Email already registered")

        # Hash password
        hashed_password = hash_password(request.password)

        # Create user
        new_user = UserModel(
            email=request.email,
            hashed_password=hashed_password,
            country=request.country.upper(),
            plan=PlanTypeEnum.FREE,
            is_active=True,
            is_verified=False,  # Email verification can be implemented later
        )
        db.add(new_user)
        await db.flush()  # Get user.id

        # Create profile
        new_profile = ProfileModel(
            user_id=new_user.id,
            name=request.name,
            age_range=request.age_range,
            cultural_style=request.cultural_style,
            tone="chill",
            emoji_ratio=0.3,
        )
        db.add(new_profile)
        await db.commit()
        await db.refresh(new_user)
        await db.refresh(new_profile)

        # Generate tokens
        access_token = create_access_token({"sub": new_user.email, "user_id": new_user.id})
        refresh_token = create_refresh_token({"sub": new_user.email, "user_id": new_user.id})

        logger.info(f"New user registered: {new_user.email} (ID: {new_user.id})")

        return AuthResponse(
            user=UserResponse(
                id=new_user.id,
                email=new_user.email,
                name=new_profile.name,
                country=new_user.country,
                plan=new_user.plan.value,
                cultural_style=new_profile.cultural_style,
                is_verified=new_user.is_verified,
                created_at=new_user.created_at,
            ),
            tokens=TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=30 * 60,  # 30 minutes
            ),
        )

    except (ValidationException, AuthenticationException):
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_async_db)):
    """
    Login with email and password

    **Steps**:
    1. Find user by email
    2. Verify password
    3. Check if account is active
    4. Generate JWT tokens
    5. Update last login timestamp
    6. Return user info + tokens

    **Returns**:
    - User information
    - Access token (30 min)
    - Refresh token (7 days)
    """
    try:
        # Find user by email
        result = await db.execute(select(UserModel).where(UserModel.email == request.email))
        user = result.scalar_one_or_none()

        if not user:
            raise AuthenticationException("Invalid email or password")

        # Verify password
        if not verify_password(request.password, user.hashed_password):
            logger.warning(f"Failed login attempt for: {request.email}")
            raise AuthenticationException("Invalid email or password")

        # Check if account is active
        if not user.is_active:
            raise AuthenticationException("Account is disabled")

        # Get user profile
        profile_result = await db.execute(select(ProfileModel).where(ProfileModel.user_id == user.id))
        profile = profile_result.scalar_one_or_none()

        if not profile:
            raise AuthenticationException("User profile not found")

        # Update last login
        user.last_login = datetime.utcnow()
        await db.commit()

        # Generate tokens
        access_token = create_access_token({"sub": user.email, "user_id": user.id})
        refresh_token = create_refresh_token({"sub": user.email, "user_id": user.id})

        logger.info(f"User logged in: {user.email} (ID: {user.id})")

        return AuthResponse(
            user=UserResponse(
                id=user.id,
                email=user.email,
                name=profile.name,
                country=user.country,
                plan=user.plan.value,
                cultural_style=profile.cultural_style,
                is_verified=user.is_verified,
                created_at=user.created_at,
            ),
            tokens=TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=30 * 60,  # 30 minutes
            ),
        )

    except AuthenticationException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/dev-login", response_model=AuthResponse)
async def dev_login(request: LoginRequest):
    """
    Development login endpoint - bypasses database requirement

    **ONLY WORKS IN DEVELOPMENT ENVIRONMENT**

    Test credentials:
    - Email: rickmelendez001@gmail.com
    - Password: password123

    **Steps**:
    1. Check if environment is development
    2. Verify credentials match test user
    3. Generate JWT tokens
    4. Return user info + tokens (no database required)

    **Returns**:
    - User information
    - Access token (30 min)
    - Refresh token (7 days)
    """
    from ...core.config import settings

    # Only allow in development
    if settings.ENVIRONMENT != "development":
        raise HTTPException(
            status_code=404,
            detail="This endpoint is only available in development mode"
        )

    # Test user credentials (must match test_credentials.txt)
    TEST_USER_EMAIL = "rickmelendez001@gmail.com"
    TEST_USER_PASSWORD = "password123"
    TEST_USER_ID = "test-user-001"
    TEST_USER_NAME = "Rick Melendez"

    try:
        # Verify credentials match test user
        if request.email != TEST_USER_EMAIL:
            raise AuthenticationException("Invalid email or password")

        if request.password != TEST_USER_PASSWORD:
            logger.log_warning(f"Failed dev login attempt for: {request.email}")
            raise AuthenticationException("Invalid email or password")

        # Generate tokens (same as regular login)
        access_token = create_access_token({
            "sub": TEST_USER_EMAIL,
            "user_id": TEST_USER_ID,
            "plan": "free",
            "email": TEST_USER_EMAIL
        })

        refresh_token = create_refresh_token({
            "sub": TEST_USER_EMAIL,
            "user_id": TEST_USER_ID
        })

        logger.log_info(f"Development login successful: {TEST_USER_EMAIL}")

        return AuthResponse(
            user=UserResponse(
                id=1,  # Mock ID
                email=TEST_USER_EMAIL,
                name=TEST_USER_NAME,
                country="PR",
                plan="free",
                cultural_style="boricua",
                is_verified=True,
                created_at=datetime.utcnow(),
            ),
            tokens=TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                expires_in=30 * 60,  # 30 minutes
            ),
        )

    except AuthenticationException:
        raise
    except Exception as e:
        logger.log_error("dev_login", e, {"email": request.email})
        raise HTTPException(status_code=500, detail="Development login failed")


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(request: RefreshTokenRequest, db: AsyncSession = Depends(get_async_db)):
    """
    Refresh access token using refresh token

    **Steps**:
    1. Verify refresh token
    2. Extract user info from token
    3. Generate new access token
    4. Return new tokens

    **Note**: Refresh token is NOT rotated (same refresh token can be reused)

    **Returns**:
    - New access token (30 min)
    - Same refresh token
    """
    try:
        # Verify refresh token
        payload = verify_refresh_token(request.refresh_token)

        user_id = payload.get("user_id")
        email = payload.get("sub")

        if not user_id or not email:
            raise AuthenticationException("Invalid refresh token payload")

        # Verify user still exists and is active
        result = await db.execute(select(UserModel).where(UserModel.id == user_id))
        user = result.scalar_one_or_none()

        if not user or not user.is_active:
            raise AuthenticationException("User not found or inactive")

        # Generate new access token
        access_token = create_access_token({"sub": email, "user_id": user_id})

        logger.info(f"Token refreshed for user: {email} (ID: {user_id})")

        return TokenResponse(
            access_token=access_token,
            refresh_token=request.refresh_token,  # Keep same refresh token
            expires_in=30 * 60,  # 30 minutes
        )

    except AuthenticationException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(status_code=500, detail="Token refresh failed")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserModel = Depends(get_current_user)):
    """
    Get current authenticated user information

    **Authentication**: Required (Bearer token)

    **Returns**:
    - User profile information
    """
    try:
        # Get user profile
        from ...infrastructure.database.database import AsyncSessionLocal

        async with AsyncSessionLocal() as db:
            profile_result = await db.execute(select(ProfileModel).where(ProfileModel.user_id == current_user.id))
            profile = profile_result.scalar_one_or_none()

            if not profile:
                raise HTTPException(status_code=404, detail="Profile not found")

            return UserResponse(
                id=current_user.id,
                email=current_user.email,
                name=profile.name,
                country=current_user.country,
                plan=current_user.plan.value,
                cultural_style=profile.cultural_style,
                is_verified=current_user.is_verified,
                created_at=current_user.created_at,
            )

    except Exception as e:
        logger.error(f"Get user info error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user information")


@router.post("/logout")
async def logout(current_user: UserModel = Depends(get_current_user)):
    """
    Logout current user

    **Note**: Since we're using stateless JWT tokens, actual logout happens client-side
    by deleting the tokens. This endpoint is mainly for logging purposes.

    **Authentication**: Required (Bearer token)

    **Returns**:
    - Success message
    """
    logger.info(f"User logged out: {current_user.email} (ID: {current_user.id})")

    return {
        "message": "Successfully logged out",
        "detail": "Please delete the access and refresh tokens from client storage",
    }
