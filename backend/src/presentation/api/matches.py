"""
Matches API Endpoints
Manage match lifecycle, questions, answers, reveal, and decisions
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List, Dict

from ...infrastructure.database.database import get_async_db
from ...infrastructure.database.models import (
    MatchModel, MatchStatusEnum, DatingProfileModel, UserModel
)
from ...core.logging import StructuredLogger
from ..api.auth import get_current_user

router = APIRouter(prefix="/matches", tags=["Matches"])
logger = StructuredLogger()


# ==================== Response Models ====================

class OtherUserResponse(BaseModel):
    user_id: int
    display_name: str
    photo_urls: List[str]


class MatchQuestionResponse(BaseModel):
    id: str
    text: str


class MatchSummaryResponse(BaseModel):
    match_id: int
    status: str
    other_user: OtherUserResponse
    i_have_answered: bool
    partner_has_answered: bool
    created_at: datetime


class MatchDetailResponse(MatchSummaryResponse):
    questions: Optional[List[MatchQuestionResponse]]
    my_decision: Optional[str]


class MatchListResponse(BaseModel):
    matches: List[MatchSummaryResponse]


class AnswersRequest(BaseModel):
    answers: Dict[str, str]


class DecisionRequest(BaseModel):
    decision: str  # "accept" | "cancel"


class MatchRevealResponse(BaseModel):
    match_id: int
    questions: List[MatchQuestionResponse]
    my_answers: Dict[str, str]
    partner_answers: Dict[str, str]
    my_decision: Optional[str]
    partner_decided: bool


# ==================== Helpers ====================

def _get_my_role(match: MatchModel, user_id: int) -> str:
    """Returns 'user1' or 'user2' for the current user."""
    return 'user1' if match.user1_id == user_id else 'user2'


def _i_have_answered(match: MatchModel, user_id: int) -> bool:
    role = _get_my_role(match, user_id)
    answers = match.user1_answers if role == 'user1' else match.user2_answers
    return bool(answers)


def _partner_has_answered(match: MatchModel, user_id: int) -> bool:
    role = _get_my_role(match, user_id)
    answers = match.user2_answers if role == 'user1' else match.user1_answers
    return bool(answers)


def _get_my_decision(match: MatchModel, user_id: int) -> Optional[str]:
    role = _get_my_role(match, user_id)
    return match.user1_decision if role == 'user1' else match.user2_decision


async def _get_other_user_info(db: AsyncSession, other_user_id: int) -> OtherUserResponse:
    dp_result = await db.execute(
        select(DatingProfileModel).where(DatingProfileModel.user_id == other_user_id)
    )
    dp = dp_result.scalar_one_or_none()
    return OtherUserResponse(
        user_id=other_user_id,
        display_name=dp.display_name if dp else f"User {other_user_id}",
        photo_urls=dp.photo_urls if dp else [],
    )


# ==================== Endpoints ====================

@router.get("", response_model=MatchListResponse)
async def list_matches(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    List all active matches for the authenticated user.

    **Authentication**: Required (Bearer token)
    """
    try:
        result = await db.execute(
            select(MatchModel).where(
                and_(
                    or_(
                        MatchModel.user1_id == current_user.id,
                        MatchModel.user2_id == current_user.id,
                    ),
                    MatchModel.status != MatchStatusEnum.CANCELLED,
                )
            ).order_by(MatchModel.created_at.desc())
        )
        matches = result.scalars().all()

        summaries = []
        for match in matches:
            other_id = match.user2_id if match.user1_id == current_user.id else match.user1_id
            other = await _get_other_user_info(db, other_id)
            summaries.append(
                MatchSummaryResponse(
                    match_id=match.id,
                    status=match.status.value,
                    other_user=other,
                    i_have_answered=_i_have_answered(match, current_user.id),
                    partner_has_answered=_partner_has_answered(match, current_user.id),
                    created_at=match.created_at,
                )
            )

        return MatchListResponse(matches=summaries)

    except Exception as e:
        logger.error(f"Error listing matches: {e}")
        raise HTTPException(status_code=500, detail="Failed to list matches")


@router.get("/{match_id}", response_model=MatchDetailResponse)
async def get_match_detail(
    match_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get details of a specific match including questions (when ready).

    **Authentication**: Required (Bearer token)
    """
    result = await db.execute(
        select(MatchModel).where(MatchModel.id == match_id)
    )
    match = result.scalar_one_or_none()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if match.user1_id != current_user.id and match.user2_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your match")

    other_id = match.user2_id if match.user1_id == current_user.id else match.user1_id
    other = await _get_other_user_info(db, other_id)

    # Include questions if status is past questions_ready
    questions = None
    show_questions_statuses = {
        MatchStatusEnum.QUESTIONS_READY,
        MatchStatusEnum.USER1_ANSWERED,
        MatchStatusEnum.USER2_ANSWERED,
        MatchStatusEnum.BOTH_ANSWERED,
        MatchStatusEnum.CONFIRMED,
    }
    if match.status in show_questions_statuses and match.questions:
        questions = [MatchQuestionResponse(id=q["id"], text=q["text"]) for q in match.questions]

    return MatchDetailResponse(
        match_id=match.id,
        status=match.status.value,
        other_user=other,
        i_have_answered=_i_have_answered(match, current_user.id),
        partner_has_answered=_partner_has_answered(match, current_user.id),
        created_at=match.created_at,
        questions=questions,
        my_decision=_get_my_decision(match, current_user.id),
    )


@router.post("/{match_id}/answers", response_model=MatchDetailResponse)
async def submit_answers(
    match_id: int,
    request: AnswersRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Submit answers to the 4 onboarding questions.

    **Authentication**: Required (Bearer token)
    """
    result = await db.execute(select(MatchModel).where(MatchModel.id == match_id))
    match = result.scalar_one_or_none()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if match.user1_id != current_user.id and match.user2_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your match")

    if match.status not in {MatchStatusEnum.QUESTIONS_READY, MatchStatusEnum.USER1_ANSWERED, MatchStatusEnum.USER2_ANSWERED}:
        raise HTTPException(status_code=409, detail="Cannot submit answers in current match status")

    if _i_have_answered(match, current_user.id):
        raise HTTPException(status_code=409, detail="Already submitted answers")

    role = _get_my_role(match, current_user.id)

    try:
        if role == 'user1':
            match.user1_answers = request.answers
            if match.status == MatchStatusEnum.USER2_ANSWERED:
                match.status = MatchStatusEnum.BOTH_ANSWERED
            else:
                match.status = MatchStatusEnum.USER1_ANSWERED
        else:
            match.user2_answers = request.answers
            if match.status == MatchStatusEnum.USER1_ANSWERED:
                match.status = MatchStatusEnum.BOTH_ANSWERED
            else:
                match.status = MatchStatusEnum.USER2_ANSWERED

        match.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(match)

        other_id = match.user2_id if match.user1_id == current_user.id else match.user1_id
        other = await _get_other_user_info(db, other_id)
        questions = [MatchQuestionResponse(id=q["id"], text=q["text"]) for q in (match.questions or [])]

        return MatchDetailResponse(
            match_id=match.id,
            status=match.status.value,
            other_user=other,
            i_have_answered=True,
            partner_has_answered=_partner_has_answered(match, current_user.id),
            created_at=match.created_at,
            questions=questions,
            my_decision=_get_my_decision(match, current_user.id),
        )

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error submitting answers: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit answers")


@router.get("/{match_id}/reveal", response_model=MatchRevealResponse)
async def get_reveal(
    match_id: int,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Get both users' answers for reveal. Only available when both have answered.

    **Authentication**: Required (Bearer token)
    """
    result = await db.execute(select(MatchModel).where(MatchModel.id == match_id))
    match = result.scalar_one_or_none()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if match.user1_id != current_user.id and match.user2_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your match")

    if match.status not in {MatchStatusEnum.BOTH_ANSWERED, MatchStatusEnum.CONFIRMED, MatchStatusEnum.CANCELLED}:
        raise HTTPException(status_code=409, detail="Both users must answer before reveal")

    role = _get_my_role(match, current_user.id)
    my_answers = (match.user1_answers if role == 'user1' else match.user2_answers) or {}
    partner_answers = (match.user2_answers if role == 'user1' else match.user1_answers) or {}
    my_decision = _get_my_decision(match, current_user.id)
    partner_decision = (match.user2_decision if role == 'user1' else match.user1_decision)

    questions = [MatchQuestionResponse(id=q["id"], text=q["text"]) for q in (match.questions or [])]

    return MatchRevealResponse(
        match_id=match.id,
        questions=questions,
        my_answers=my_answers,
        partner_answers=partner_answers,
        my_decision=my_decision,
        partner_decided=bool(partner_decision),
    )


@router.post("/{match_id}/decision", response_model=MatchDetailResponse)
async def submit_decision(
    match_id: int,
    request: DecisionRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Submit accept or cancel decision after seeing the reveal.
    - cancel: immediately marks match as cancelled
    - accept: if both accept → confirmed; otherwise waits for partner

    **Authentication**: Required (Bearer token)
    """
    if request.decision not in ("accept", "cancel"):
        raise HTTPException(status_code=400, detail="Decision must be 'accept' or 'cancel'")

    result = await db.execute(select(MatchModel).where(MatchModel.id == match_id))
    match = result.scalar_one_or_none()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if match.user1_id != current_user.id and match.user2_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your match")

    if match.status not in {MatchStatusEnum.BOTH_ANSWERED, MatchStatusEnum.CONFIRMED}:
        raise HTTPException(status_code=409, detail="Cannot submit decision before both users answer")

    if _get_my_decision(match, current_user.id):
        raise HTTPException(status_code=409, detail="Already submitted decision")

    role = _get_my_role(match, current_user.id)

    try:
        if role == 'user1':
            match.user1_decision = request.decision
            partner_decision = match.user2_decision
        else:
            match.user2_decision = request.decision
            partner_decision = match.user1_decision

        if request.decision == "cancel":
            match.status = MatchStatusEnum.CANCELLED
        elif partner_decision == "accept":
            match.status = MatchStatusEnum.CONFIRMED

        match.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(match)

        other_id = match.user2_id if match.user1_id == current_user.id else match.user1_id
        other = await _get_other_user_info(db, other_id)
        questions = [MatchQuestionResponse(id=q["id"], text=q["text"]) for q in (match.questions or [])]

        return MatchDetailResponse(
            match_id=match.id,
            status=match.status.value,
            other_user=other,
            i_have_answered=True,
            partner_has_answered=True,
            created_at=match.created_at,
            questions=questions,
            my_decision=request.decision,
        )

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error submitting decision: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit decision")
