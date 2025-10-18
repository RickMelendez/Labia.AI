"""
Conversations API Endpoints
CRUD operations for user conversations
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update, func
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from ...core.logging import StructuredLogger
from ...infrastructure.database.database import get_async_db
from ...infrastructure.database.models import (
    UserModel,
    ConversationModel,
    MessageModel,
    MessageRoleEnum,
    ToneStyleEnum,
)
from ...presentation.api.auth import get_current_user

router = APIRouter(prefix="/conversations", tags=["Conversations"])
logger = StructuredLogger()


# ==================== Request/Response Models ====================


class MessageCreate(BaseModel):
    """Create a new message"""

    text: str = Field(..., min_length=1, max_length=5000)
    role: str = Field(..., description="user, assistant, or system")
    tone: Optional[str] = Field(None, description="genuino, coqueto, or directo")

    class Config:
        json_schema_extra = {
            "example": {"text": "¡Wepa! ¿Cómo estás?", "role": "assistant", "tone": "genuino"}
        }


class ConversationCreate(BaseModel):
    """Create a new conversation"""

    title: Optional[str] = Field(None, max_length=255)
    target_bio: Optional[str] = Field(None, description="The bio that was analyzed")
    target_interests: Optional[List[str]] = Field(default_factory=list)
    cultural_style: Optional[str] = Field(None, description="boricua, mexicano, etc.")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Match with Ana from San Juan",
                "target_bio": "Beach lover, coffee addict, loves salsa dancing",
                "target_interests": ["beach", "coffee", "salsa"],
                "cultural_style": "boricua",
            }
        }


class ConversationUpdate(BaseModel):
    """Update conversation details"""

    title: Optional[str] = Field(None, max_length=255)


class MessageResponse(BaseModel):
    """Message response"""

    id: int
    conversation_id: int
    role: str
    text: str
    tone: Optional[str]
    lang: str
    model_used: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    """Conversation response"""

    id: int
    user_id: int
    title: Optional[str]
    target_bio: Optional[str]
    target_interests: Optional[List[str]]
    cultural_style_used: Optional[str]
    message_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationDetailResponse(BaseModel):
    """Detailed conversation with messages"""

    id: int
    user_id: int
    title: Optional[str]
    target_bio: Optional[str]
    target_interests: Optional[List[str]]
    cultural_style_used: Optional[str]
    messages: List[MessageResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ==================== Endpoints ====================


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    request: ConversationCreate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Create a new conversation

    **Authentication**: Required

    **Steps**:
    1. Create new conversation record
    2. Link to authenticated user
    3. Store context (bio, interests, cultural style)

    **Returns**:
    - New conversation ID
    - Conversation details
    """
    try:
        # Create conversation
        conversation = ConversationModel(
            user_id=current_user.id,
            title=request.title or f"Conversation {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
            target_bio=request.target_bio,
            target_interests=request.target_interests or [],
            cultural_style_used=request.cultural_style,
        )

        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)

        logger.info(f"Conversation created: {conversation.id} (user: {current_user.id})")

        return ConversationResponse(
            id=conversation.id,
            user_id=conversation.user_id,
            title=conversation.title,
            target_bio=conversation.target_bio,
            target_interests=conversation.target_interests,
            cultural_style_used=conversation.cultural_style_used,
            message_count=0,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
        )

    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to create conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to create conversation")


@router.get("", response_model=List[ConversationResponse])
async def get_conversations(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get all conversations for current user

    **Authentication**: Required

    **Query Parameters**:
    - skip: Pagination offset (default: 0)
    - limit: Max results (default: 20, max: 100)

    **Returns**:
    - List of conversations (most recent first)
    - Message count for each conversation
    """
    try:
        # Get conversations with message counts
        stmt = (
            select(ConversationModel, func.count(MessageModel.id).label("message_count"))
            .outerjoin(MessageModel)
            .where(ConversationModel.user_id == current_user.id)
            .group_by(ConversationModel.id)
            .order_by(ConversationModel.updated_at.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(stmt)
        rows = result.all()

        conversations = [
            ConversationResponse(
                id=conv.id,
                user_id=conv.user_id,
                title=conv.title,
                target_bio=conv.target_bio,
                target_interests=conv.target_interests,
                cultural_style_used=conv.cultural_style_used,
                message_count=count,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
            )
            for conv, count in rows
        ]

        return conversations

    except Exception as e:
        logger.error(f"Failed to get conversations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get conversations")


@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get a specific conversation with all messages

    **Authentication**: Required

    **Path Parameters**:
    - conversation_id: ID of the conversation

    **Returns**:
    - Conversation details
    - All messages in chronological order

    **Errors**:
    - 404: Conversation not found
    - 403: Not authorized to access this conversation
    """
    try:
        # Get conversation with messages
        stmt = (
            select(ConversationModel)
            .options(selectinload(ConversationModel.messages))
            .where(ConversationModel.id == conversation_id)
        )
        result = await db.execute(stmt)
        conversation = result.scalar_one_or_none()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Check authorization
        if conversation.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access this conversation")

        # Sort messages by timestamp
        messages = sorted(conversation.messages, key=lambda m: m.timestamp)

        return ConversationDetailResponse(
            id=conversation.id,
            user_id=conversation.user_id,
            title=conversation.title,
            target_bio=conversation.target_bio,
            target_interests=conversation.target_interests,
            cultural_style_used=conversation.cultural_style_used,
            messages=[
                MessageResponse(
                    id=msg.id,
                    conversation_id=msg.conversation_id,
                    role=msg.role.value,
                    text=msg.text,
                    tone=msg.tone.value if msg.tone else None,
                    lang=msg.lang,
                    model_used=msg.model_used,
                    timestamp=msg.timestamp,
                )
                for msg in messages
            ],
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get conversation")


@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: int,
    request: ConversationUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Update conversation details

    **Authentication**: Required

    **Path Parameters**:
    - conversation_id: ID of the conversation

    **Updates**:
    - Title (optional)

    **Returns**:
    - Updated conversation details

    **Errors**:
    - 404: Conversation not found
    - 403: Not authorized
    """
    try:
        # Get conversation
        result = await db.execute(select(ConversationModel).where(ConversationModel.id == conversation_id))
        conversation = result.scalar_one_or_none()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Check authorization
        if conversation.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this conversation")

        # Update fields
        if request.title is not None:
            conversation.title = request.title

        conversation.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(conversation)

        # Get message count
        count_result = await db.execute(
            select(func.count(MessageModel.id)).where(MessageModel.conversation_id == conversation_id)
        )
        message_count = count_result.scalar() or 0

        logger.info(f"Conversation updated: {conversation_id}")

        return ConversationResponse(
            id=conversation.id,
            user_id=conversation.user_id,
            title=conversation.title,
            target_bio=conversation.target_bio,
            target_interests=conversation.target_interests,
            cultural_style_used=conversation.cultural_style_used,
            message_count=message_count,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
        )

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to update conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update conversation")


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Delete a conversation and all its messages

    **Authentication**: Required

    **Path Parameters**:
    - conversation_id: ID of the conversation

    **Note**: This is a hard delete. All messages will be permanently removed.

    **Returns**:
    - 204 No Content on success

    **Errors**:
    - 404: Conversation not found
    - 403: Not authorized
    """
    try:
        # Get conversation
        result = await db.execute(select(ConversationModel).where(ConversationModel.id == conversation_id))
        conversation = result.scalar_one_or_none()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Check authorization
        if conversation.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this conversation")

        # Delete conversation (cascade will delete messages)
        await db.delete(conversation)
        await db.commit()

        logger.info(f"Conversation deleted: {conversation_id} (user: {current_user.id})")

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to delete conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete conversation")


@router.post("/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def add_message(
    conversation_id: int,
    request: MessageCreate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Add a message to a conversation

    **Authentication**: Required

    **Path Parameters**:
    - conversation_id: ID of the conversation

    **Body**:
    - text: Message text
    - role: "user", "assistant", or "system"
    - tone: Optional tone style

    **Returns**:
    - Created message details

    **Errors**:
    - 404: Conversation not found
    - 403: Not authorized
    """
    try:
        # Get conversation
        result = await db.execute(select(ConversationModel).where(ConversationModel.id == conversation_id))
        conversation = result.scalar_one_or_none()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Check authorization
        if conversation.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to add messages to this conversation")

        # Validate role
        try:
            role_enum = MessageRoleEnum(request.role)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid role. Must be 'user', 'assistant', or 'system'")

        # Validate tone (if provided)
        tone_enum = None
        if request.tone:
            try:
                tone_enum = ToneStyleEnum(request.tone)
            except ValueError:
                raise HTTPException(
                    status_code=400, detail="Invalid tone. Must be 'genuino', 'coqueto', or 'directo'"
                )

        # Create message
        message = MessageModel(
            conversation_id=conversation_id,
            role=role_enum,
            text=request.text,
            tone=tone_enum,
            lang="es",  # Default to Spanish
        )

        db.add(message)

        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(message)

        logger.info(f"Message added to conversation {conversation_id}: {message.id}")

        return MessageResponse(
            id=message.id,
            conversation_id=message.conversation_id,
            role=message.role.value,
            text=message.text,
            tone=message.tone.value if message.tone else None,
            lang=message.lang,
            model_used=message.model_used,
            timestamp=message.timestamp,
        )

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to add message to conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to add message")


@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get all messages in a conversation

    **Authentication**: Required

    **Path Parameters**:
    - conversation_id: ID of the conversation

    **Query Parameters**:
    - skip: Pagination offset
    - limit: Max messages to return

    **Returns**:
    - List of messages in chronological order

    **Errors**:
    - 404: Conversation not found
    - 403: Not authorized
    """
    try:
        # Check conversation exists and user owns it
        result = await db.execute(select(ConversationModel).where(ConversationModel.id == conversation_id))
        conversation = result.scalar_one_or_none()

        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        if conversation.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access this conversation")

        # Get messages
        stmt = (
            select(MessageModel)
            .where(MessageModel.conversation_id == conversation_id)
            .order_by(MessageModel.timestamp.asc())
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(stmt)
        messages = result.scalars().all()

        return [
            MessageResponse(
                id=msg.id,
                conversation_id=msg.conversation_id,
                role=msg.role.value,
                text=msg.text,
                tone=msg.tone.value if msg.tone else None,
                lang=msg.lang,
                model_used=msg.model_used,
                timestamp=msg.timestamp,
            )
            for msg in messages
        ]

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get messages for conversation {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get messages")
