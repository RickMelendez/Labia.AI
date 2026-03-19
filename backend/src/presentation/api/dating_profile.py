"""
Dating Profile API Endpoints
Create and manage the user's discoverable dating profile
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List

from ...infrastructure.database.database import get_async_db
from ...infrastructure.database.models import DatingProfileModel, GenderEnum
from ...core.logging import StructuredLogger
from ..api.auth import get_current_user, UserModel

router = APIRouter(prefix="/dating-profile", tags=["Dating Profile"])
logger = StructuredLogger()


# ==================== Request/Response Models ====================

class UpsertDatingProfileRequest(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=100)
    age: Optional[int] = Field(None, ge=18, le=99)
    gender: Optional[str] = Field(None)
    bio: Optional[str] = Field(None, max_length=500)
    job_title: Optional[str] = Field(None, max_length=100)
    interests: Optional[List[str]] = Field(None, max_length=10)
    photo_urls: Optional[List[str]] = Field(None, max_length=6)
    is_discoverable: bool = False

    class Config:
        json_schema_extra = {
            "example": {
                "display_name": "Juan",
                "age": 28,
                "gender": "male",
                "bio": "Surf, café y buen humor.",
                "job_title": "Diseñador",
                "interests": ["surf", "música", "café"],
                "photo_urls": [],
                "is_discoverable": True,
            }
        }


class DatingProfileResponse(BaseModel):
    id: int
    user_id: int
    display_name: str
    age: Optional[int]
    gender: Optional[str]
    bio: Optional[str]
    job_title: Optional[str]
    interests: List[str]
    photo_urls: List[str]
    is_discoverable: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ==================== Endpoints ====================

@router.put("", response_model=DatingProfileResponse)
async def upsert_dating_profile(
    request: UpsertDatingProfileRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Create or update the authenticated user's dating profile.

    **Authentication**: Required (Bearer token)
    """
    try:
        result = await db.execute(
            select(DatingProfileModel).where(DatingProfileModel.user_id == current_user.id)
        )
        profile = result.scalar_one_or_none()

        gender_value = None
        if request.gender:
            try:
                gender_value = GenderEnum(request.gender)
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid gender value: {request.gender}")

        if profile:
            profile.display_name = request.display_name
            profile.age = request.age
            profile.gender = gender_value
            profile.bio = request.bio
            profile.job_title = request.job_title
            profile.interests = request.interests or []
            profile.photo_urls = request.photo_urls or []
            profile.is_discoverable = request.is_discoverable
            profile.updated_at = datetime.utcnow()
        else:
            profile = DatingProfileModel(
                user_id=current_user.id,
                display_name=request.display_name,
                age=request.age,
                gender=gender_value,
                bio=request.bio,
                job_title=request.job_title,
                interests=request.interests or [],
                photo_urls=request.photo_urls or [],
                is_discoverable=request.is_discoverable,
                created_at=datetime.utcnow(),
            )
            db.add(profile)

        await db.commit()
        await db.refresh(profile)

        logger.info(f"Dating profile upserted for user {current_user.id}")
        return profile

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error upserting dating profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to save dating profile")


@router.get("/me", response_model=DatingProfileResponse)
async def get_my_dating_profile(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get the authenticated user's dating profile.

    **Authentication**: Required (Bearer token)
    """
    result = await db.execute(
        select(DatingProfileModel).where(DatingProfileModel.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Dating profile not found")

    return profile
