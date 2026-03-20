"""
Lobbies API Endpoints
Group discovery rooms — activity-anchored, max 10 people, with group chat
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from typing import Optional, List

from ...infrastructure.database.database import get_async_db
from ...infrastructure.database.models import (
    LobbyModel, LobbyMemberModel, LobbyMessageModel,
    LobbyStatusEnum, ActivityTypeEnum, DatingProfileModel, UserModel,
)
from ...core.logging import StructuredLogger
from ..api.auth import get_current_user

router = APIRouter(prefix="/lobbies", tags=["Lobbies"])
logger = StructuredLogger()

LOBBY_LIFETIME_HOURS = 48


# ==================== Request / Response Models ====================

class CreateLobbyRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    activity_type: ActivityTypeEnum
    description: str = Field(..., min_length=10, max_length=500)
    max_size: int = Field(default=10, ge=2, le=10)
    location_hint: Optional[str] = Field(default=None, max_length=200)
    time_window_hint: Optional[str] = Field(default=None, max_length=200)


class SendMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


class LobbyMemberResponse(BaseModel):
    user_id: int
    display_name: str
    photo_url: Optional[str]
    joined_at: datetime


class LobbyMessageResponse(BaseModel):
    id: int
    user_id: int
    sender_name: str
    sender_photo: Optional[str]
    content: str
    created_at: datetime


class LobbyResponse(BaseModel):
    id: int
    creator_id: int
    creator_name: str
    creator_photo: Optional[str]
    name: str
    activity_type: str
    description: str
    max_size: int
    member_count: int
    status: str
    energy_level: str
    spots_left: int
    location_hint: Optional[str]
    time_window_hint: Optional[str]
    expires_at: datetime
    created_at: datetime
    is_member: bool = False


class LobbyDetailResponse(LobbyResponse):
    members: List[LobbyMemberResponse]


class LobbyListResponse(BaseModel):
    lobbies: List[LobbyResponse]
    total: int


class LobbyMessagesResponse(BaseModel):
    messages: List[LobbyMessageResponse]
    total: int


# ==================== Helpers ====================

def _energy_level(member_count: int, max_size: int) -> str:
    if member_count == 0:
        return "empty"
    ratio = member_count / max_size
    if ratio < 0.4:
        return "warm"
    if ratio < 0.85:
        return "buzzing"
    return "full"


async def _get_profile_info(db: AsyncSession, user_id: int) -> tuple[str, Optional[str]]:
    """Return (display_name, first_photo_url) for a user."""
    result = await db.execute(
        select(DatingProfileModel).where(DatingProfileModel.user_id == user_id)
    )
    dp = result.scalar_one_or_none()
    display_name = dp.display_name if dp else f"User {user_id}"
    photo_url = (dp.photo_urls[0] if dp and dp.photo_urls else None)
    return display_name, photo_url


async def _member_count(db: AsyncSession, lobby_id: int) -> int:
    result = await db.execute(
        select(func.count()).where(LobbyMemberModel.lobby_id == lobby_id)
    )
    return result.scalar() or 0


async def _is_member(db: AsyncSession, lobby_id: int, user_id: int) -> bool:
    result = await db.execute(
        select(LobbyMemberModel).where(
            LobbyMemberModel.lobby_id == lobby_id,
            LobbyMemberModel.user_id == user_id,
        )
    )
    return result.scalar_one_or_none() is not None


async def _build_lobby_response(
    db: AsyncSession, lobby: LobbyModel, current_user_id: int
) -> LobbyResponse:
    count = await _member_count(db, lobby.id)
    creator_name, creator_photo = await _get_profile_info(db, lobby.creator_id)
    member = await _is_member(db, lobby.id, current_user_id)

    # Auto-expire stale lobbies on read
    now = datetime.now(timezone.utc)
    expires = lobby.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if now > expires and lobby.status == LobbyStatusEnum.OPEN:
        lobby.status = LobbyStatusEnum.EXPIRED
        await db.commit()

    return LobbyResponse(
        id=lobby.id,
        creator_id=lobby.creator_id,
        creator_name=creator_name,
        creator_photo=creator_photo,
        name=lobby.name,
        activity_type=lobby.activity_type.value,
        description=lobby.description,
        max_size=lobby.max_size,
        member_count=count,
        status=lobby.status.value,
        energy_level=_energy_level(count, lobby.max_size),
        spots_left=max(0, lobby.max_size - count),
        location_hint=lobby.location_hint,
        time_window_hint=lobby.time_window_hint,
        expires_at=lobby.expires_at,
        created_at=lobby.created_at,
        is_member=member,
    )


# ==================== Endpoints ====================

@router.get("", response_model=LobbyListResponse)
async def list_lobbies(
    activity_type: Optional[ActivityTypeEnum] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    List open lobbies. Optionally filter by activity type.
    Expired lobbies are automatically excluded.

    **Authentication**: Required (Bearer token)
    """
    try:
        now = datetime.now(timezone.utc)
        query = select(LobbyModel).where(
            LobbyModel.status.in_([LobbyStatusEnum.OPEN, LobbyStatusEnum.FULL]),
            LobbyModel.expires_at > now,
        )
        if activity_type:
            query = query.where(LobbyModel.activity_type == activity_type)

        count_result = await db.execute(
            select(func.count()).select_from(query.subquery())
        )
        total = count_result.scalar() or 0

        result = await db.execute(
            query.order_by(LobbyModel.created_at.desc()).limit(limit).offset(offset)
        )
        lobbies = result.scalars().all()

        lobby_responses = []
        for lobby in lobbies:
            lobby_responses.append(await _build_lobby_response(db, lobby, current_user.id))

        return LobbyListResponse(lobbies=lobby_responses, total=total)

    except Exception as e:
        logger.error(f"Error listing lobbies: {e}")
        raise HTTPException(status_code=500, detail="Failed to list lobbies")


@router.post("", response_model=LobbyDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_lobby(
    request: CreateLobbyRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Create a new group lobby. The creator automatically becomes a member.

    **Authentication**: Required (Bearer token)
    """
    try:
        expires_at = datetime.now(timezone.utc) + timedelta(hours=LOBBY_LIFETIME_HOURS)
        lobby = LobbyModel(
            creator_id=current_user.id,
            name=request.name,
            activity_type=request.activity_type,
            description=request.description,
            max_size=request.max_size,
            status=LobbyStatusEnum.OPEN,
            location_hint=request.location_hint,
            time_window_hint=request.time_window_hint,
            expires_at=expires_at,
        )
        db.add(lobby)
        await db.flush()  # get lobby.id without committing

        # Creator auto-joins
        member = LobbyMemberModel(lobby_id=lobby.id, user_id=current_user.id)
        db.add(member)
        await db.commit()
        await db.refresh(lobby)

        base = await _build_lobby_response(db, lobby, current_user.id)
        creator_name, creator_photo = await _get_profile_info(db, current_user.id)
        return LobbyDetailResponse(
            **base.model_dump(),
            members=[LobbyMemberResponse(
                user_id=current_user.id,
                display_name=creator_name,
                photo_url=creator_photo,
                joined_at=member.joined_at,
            )],
        )

    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating lobby: {e}")
        raise HTTPException(status_code=500, detail="Failed to create lobby")


@router.get("/{lobby_id}", response_model=LobbyDetailResponse)
async def get_lobby(
    lobby_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get lobby details including full member list.

    **Authentication**: Required (Bearer token)
    """
    result = await db.execute(select(LobbyModel).where(LobbyModel.id == lobby_id))
    lobby = result.scalar_one_or_none()
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found")

    # Load members
    members_result = await db.execute(
        select(LobbyMemberModel).where(LobbyMemberModel.lobby_id == lobby_id)
        .order_by(LobbyMemberModel.joined_at.asc())
    )
    raw_members = members_result.scalars().all()

    member_responses = []
    for m in raw_members:
        name, photo = await _get_profile_info(db, m.user_id)
        member_responses.append(LobbyMemberResponse(
            user_id=m.user_id,
            display_name=name,
            photo_url=photo,
            joined_at=m.joined_at,
        ))

    base = await _build_lobby_response(db, lobby, current_user.id)
    return LobbyDetailResponse(**base.model_dump(), members=member_responses)


@router.post("/{lobby_id}/join", response_model=LobbyDetailResponse)
async def join_lobby(
    lobby_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Join an open lobby. Fails if full, expired, or already a member.

    **Authentication**: Required (Bearer token)
    """
    result = await db.execute(select(LobbyModel).where(LobbyModel.id == lobby_id))
    lobby = result.scalar_one_or_none()
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found")

    if lobby.status == LobbyStatusEnum.EXPIRED:
        raise HTTPException(status_code=409, detail="Lobby has expired")
    if lobby.status == LobbyStatusEnum.FULL:
        raise HTTPException(status_code=409, detail="Lobby is full")

    now = datetime.now(timezone.utc)
    expires = lobby.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if now > expires:
        lobby.status = LobbyStatusEnum.EXPIRED
        await db.commit()
        raise HTTPException(status_code=409, detail="Lobby has expired")

    if await _is_member(db, lobby_id, current_user.id):
        raise HTTPException(status_code=409, detail="Already a member of this lobby")

    count = await _member_count(db, lobby_id)
    if count >= lobby.max_size:
        lobby.status = LobbyStatusEnum.FULL
        await db.commit()
        raise HTTPException(status_code=409, detail="Lobby is full")

    try:
        member = LobbyMemberModel(lobby_id=lobby_id, user_id=current_user.id)
        db.add(member)

        # Update status to full if this fills it
        if count + 1 >= lobby.max_size:
            lobby.status = LobbyStatusEnum.FULL

        await db.commit()
        await db.refresh(lobby)

        # Re-use get_lobby logic
        return await get_lobby(lobby_id, current_user, db)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error joining lobby: {e}")
        raise HTTPException(status_code=500, detail="Failed to join lobby")


@router.delete("/{lobby_id}/leave", status_code=status.HTTP_204_NO_CONTENT)
async def leave_lobby(
    lobby_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Leave a lobby you are a member of.

    **Authentication**: Required (Bearer token)
    """
    result = await db.execute(
        select(LobbyMemberModel).where(
            LobbyMemberModel.lobby_id == lobby_id,
            LobbyMemberModel.user_id == current_user.id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Not a member of this lobby")

    try:
        await db.delete(member)

        # Re-open lobby if it was full
        lobby_result = await db.execute(select(LobbyModel).where(LobbyModel.id == lobby_id))
        lobby = lobby_result.scalar_one_or_none()
        if lobby and lobby.status == LobbyStatusEnum.FULL:
            lobby.status = LobbyStatusEnum.OPEN

        await db.commit()

    except Exception as e:
        await db.rollback()
        logger.error(f"Error leaving lobby: {e}")
        raise HTTPException(status_code=500, detail="Failed to leave lobby")


@router.get("/{lobby_id}/messages", response_model=LobbyMessagesResponse)
async def get_messages(
    lobby_id: int,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get group chat messages for a lobby. Must be a member to read.

    **Authentication**: Required (Bearer token)
    """
    if not await _is_member(db, lobby_id, current_user.id):
        raise HTTPException(status_code=403, detail="Must be a lobby member to read messages")

    count_result = await db.execute(
        select(func.count()).where(LobbyMessageModel.lobby_id == lobby_id)
    )
    total = count_result.scalar() or 0

    result = await db.execute(
        select(LobbyMessageModel)
        .where(LobbyMessageModel.lobby_id == lobby_id)
        .order_by(LobbyMessageModel.created_at.asc())
        .limit(limit)
        .offset(offset)
    )
    raw_messages = result.scalars().all()

    message_responses = []
    for msg in raw_messages:
        name, photo = await _get_profile_info(db, msg.user_id)
        message_responses.append(LobbyMessageResponse(
            id=msg.id,
            user_id=msg.user_id,
            sender_name=name,
            sender_photo=photo,
            content=msg.content,
            created_at=msg.created_at,
        ))

    return LobbyMessagesResponse(messages=message_responses, total=total)


@router.post("/{lobby_id}/messages", response_model=LobbyMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    lobby_id: int,
    request: SendMessageRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Send a message to a lobby's group chat. Must be a member.

    **Authentication**: Required (Bearer token)
    """
    if not await _is_member(db, lobby_id, current_user.id):
        raise HTTPException(status_code=403, detail="Must be a lobby member to send messages")

    lobby_result = await db.execute(select(LobbyModel).where(LobbyModel.id == lobby_id))
    lobby = lobby_result.scalar_one_or_none()
    if not lobby:
        raise HTTPException(status_code=404, detail="Lobby not found")
    if lobby.status == LobbyStatusEnum.EXPIRED:
        raise HTTPException(status_code=409, detail="Lobby has expired")

    try:
        msg = LobbyMessageModel(
            lobby_id=lobby_id,
            user_id=current_user.id,
            content=request.content.strip(),
        )
        db.add(msg)
        await db.commit()
        await db.refresh(msg)

        name, photo = await _get_profile_info(db, current_user.id)
        return LobbyMessageResponse(
            id=msg.id,
            user_id=msg.user_id,
            sender_name=name,
            sender_photo=photo,
            content=msg.content,
            created_at=msg.created_at,
        )

    except Exception as e:
        await db.rollback()
        logger.error(f"Error sending lobby message: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message")
