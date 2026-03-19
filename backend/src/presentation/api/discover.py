"""
Discover API Endpoints
Browse other users and send likes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, not_
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List

from ...infrastructure.database.database import get_async_db
from ...infrastructure.database.models import (
    DatingProfileModel, LikeModel, MatchModel, MatchStatusEnum, UserModel
)
from ...core.logging import StructuredLogger
from ..api.auth import get_current_user

router = APIRouter(prefix="/discover", tags=["Discover"])
logger = StructuredLogger()


# ==================== Response Models ====================

class DiscoverProfileResponse(BaseModel):
    user_id: int
    display_name: str
    age: Optional[int]
    bio: Optional[str]
    interests: List[str]
    photo_urls: List[str]

    class Config:
        from_attributes = True


class DiscoverFeedResponse(BaseModel):
    profiles: List[DiscoverProfileResponse]
    has_more: bool


class LikeResponse(BaseModel):
    liked: bool
    is_mutual_match: bool
    match_id: Optional[int]


# ==================== Background Task ====================

async def generate_match_questions_background(match_id: int, user1_id: int, user2_id: int):
    """Background task: generate AI questions for a new match and update the match record."""
    from ...infrastructure.database.database import AsyncSessionLocal
    from ...infrastructure.external_services.ai_service import AIConversationService
    from ...presentation.dependencies.ai import get_ai_service

    try:
        async with AsyncSessionLocal() as db:
            # Load both dating profiles for context
            result1 = await db.execute(
                select(DatingProfileModel).where(DatingProfileModel.user_id == user1_id)
            )
            dp1 = result1.scalar_one_or_none()

            result2 = await db.execute(
                select(DatingProfileModel).where(DatingProfileModel.user_id == user2_id)
            )
            dp2 = result2.scalar_one_or_none()

            profile1 = {
                "name": dp1.display_name if dp1 else f"User {user1_id}",
                "age": dp1.age if dp1 else None,
                "interests": dp1.interests if dp1 else [],
                "bio": dp1.bio if dp1 else "",
                "cultural_style": "boricua",
            }
            profile2 = {
                "name": dp2.display_name if dp2 else f"User {user2_id}",
                "age": dp2.age if dp2 else None,
                "interests": dp2.interests if dp2 else [],
                "bio": dp2.bio if dp2 else "",
                "cultural_style": "boricua",
            }

            # Get AI service and generate questions
            ai_service = get_ai_service()
            questions = await ai_service.generate_match_questions(profile1, profile2)

            # Update match with questions and set status to questions_ready
            match_result = await db.execute(
                select(MatchModel).where(MatchModel.id == match_id)
            )
            match = match_result.scalar_one_or_none()
            if match:
                match.questions = questions
                match.status = MatchStatusEnum.QUESTIONS_READY
                match.updated_at = datetime.utcnow()
                await db.commit()
                logger.info(f"Generated {len(questions)} questions for match {match_id}")

    except Exception as e:
        logger.error(f"Error generating match questions for match {match_id}: {e}")
        # Fallback: set questions to defaults even on failure
        try:
            async with AsyncSessionLocal() as db:
                match_result = await db.execute(
                    select(MatchModel).where(MatchModel.id == match_id)
                )
                match = match_result.scalar_one_or_none()
                if match and match.status == MatchStatusEnum.PENDING_QUESTIONS:
                    match.questions = [
                        {"id": "q1", "text": "¿Cuál es tu comida favorita y qué dice eso de ti?"},
                        {"id": "q2", "text": "¿A dónde irías de viaje si pudieras mañana mismo?"},
                        {"id": "q3", "text": "¿Qué haces en tu tiempo libre que más te define?"},
                        {"id": "q4", "text": "¿Cuál es el valor más importante en una relación para ti?"},
                    ]
                    match.status = MatchStatusEnum.QUESTIONS_READY
                    match.updated_at = datetime.utcnow()
                    await db.commit()
        except Exception:
            pass


# ==================== Endpoints ====================

@router.get("", response_model=DiscoverFeedResponse)
async def get_discover_feed(
    limit: int = Query(default=20, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get a paginated feed of discoverable user profiles.

    Excludes: the current user, users already liked, users in active matches.

    **Authentication**: Required (Bearer token)
    """
    try:
        # IDs the current user has already liked
        liked_subq = select(LikeModel.liked_user_id).where(
            LikeModel.liker_user_id == current_user.id
        ).scalar_subquery()

        # IDs in active matches with current user
        matched_subq = select(
            MatchModel.user1_id
        ).where(
            and_(MatchModel.user2_id == current_user.id, MatchModel.status != MatchStatusEnum.CANCELLED)
        ).union(
            select(MatchModel.user2_id).where(
                and_(MatchModel.user1_id == current_user.id, MatchModel.status != MatchStatusEnum.CANCELLED)
            )
        ).scalar_subquery()

        query = (
            select(DatingProfileModel)
            .where(
                and_(
                    DatingProfileModel.user_id != current_user.id,
                    DatingProfileModel.is_discoverable == True,
                    not_(DatingProfileModel.user_id.in_(liked_subq)),
                    not_(DatingProfileModel.user_id.in_(matched_subq)),
                )
            )
            .offset(offset)
            .limit(limit + 1)  # Fetch one extra to check has_more
        )

        result = await db.execute(query)
        profiles = result.scalars().all()

        has_more = len(profiles) > limit
        profiles = profiles[:limit]

        return DiscoverFeedResponse(
            profiles=[
                DiscoverProfileResponse(
                    user_id=p.user_id,
                    display_name=p.display_name,
                    age=p.age,
                    bio=p.bio,
                    interests=p.interests or [],
                    photo_urls=p.photo_urls or [],
                )
                for p in profiles
            ],
            has_more=has_more,
        )

    except Exception as e:
        logger.error(f"Error fetching discover feed: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch discover feed")


@router.post("/like/{user_id}", response_model=LikeResponse)
async def like_user(
    user_id: int,
    background_tasks: BackgroundTasks,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Like a user. If it's a mutual like, creates a match and starts AI question generation.

    **Authentication**: Required (Bearer token)
    """
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot like yourself")

    try:
        # Check if already liked
        existing = await db.execute(
            select(LikeModel).where(
                and_(
                    LikeModel.liker_user_id == current_user.id,
                    LikeModel.liked_user_id == user_id,
                )
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Already liked this user")

        # Record the like
        new_like = LikeModel(
            liker_user_id=current_user.id,
            liked_user_id=user_id,
            created_at=datetime.utcnow(),
        )
        db.add(new_like)
        await db.flush()

        # Check for mutual like (other user already liked me)
        mutual = await db.execute(
            select(LikeModel).where(
                and_(
                    LikeModel.liker_user_id == user_id,
                    LikeModel.liked_user_id == current_user.id,
                )
            )
        )
        is_mutual = mutual.scalar_one_or_none() is not None

        match_id = None
        if is_mutual:
            # Create match with canonical ordering (lower user_id = user1)
            u1 = min(current_user.id, user_id)
            u2 = max(current_user.id, user_id)

            # Avoid duplicate match if one somehow already exists
            existing_match = await db.execute(
                select(MatchModel).where(
                    and_(MatchModel.user1_id == u1, MatchModel.user2_id == u2)
                )
            )
            match = existing_match.scalar_one_or_none()

            if not match:
                match = MatchModel(
                    user1_id=u1,
                    user2_id=u2,
                    status=MatchStatusEnum.PENDING_QUESTIONS,
                    questions=[],
                    created_at=datetime.utcnow(),
                )
                db.add(match)
                await db.flush()
                match_id = match.id

                # Fire background task to generate AI questions
                background_tasks.add_task(
                    generate_match_questions_background, match.id, u1, u2
                )
                logger.info(f"Match created: id={match.id} between users {u1} and {u2}")
            else:
                match_id = match.id

        await db.commit()

        return LikeResponse(
            liked=True,
            is_mutual_match=is_mutual,
            match_id=match_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error processing like: {e}")
        raise HTTPException(status_code=500, detail="Failed to process like")
