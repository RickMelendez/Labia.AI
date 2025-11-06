"""
Application Layer: Conversation Service Protocol
Defines the interface used by presentation/use-cases without depending on infrastructure.
"""
from __future__ import annotations

from typing import List, Optional, Protocol, runtime_checkable


class ConversationOpenerDTO:
    def __init__(self, text: str, tone: str, cultural_style: str, confidence: float = 0.0):
        self.text = text
        self.tone = tone
        self.cultural_style = cultural_style
        self.confidence = confidence


class ConversationResponseDTO:
    def __init__(self, text: str, tone: str, cultural_style: str, follow_up_suggestion: Optional[str] = None):
        self.text = text
        self.tone = tone
        self.cultural_style = cultural_style
        self.follow_up_suggestion = follow_up_suggestion


@runtime_checkable
class ConversationService(Protocol):
    async def generate_openers(
        self,
        bio: str,
        interests: List[str],
        cultural_style: str = "boricua",
        user_interests: Optional[List[str]] = None,
        num_suggestions: int = 3,
    ) -> List[ConversationOpenerDTO]:
        ...

    async def generate_responses(
        self,
        received_message: str,
        cultural_style: str = "boricua",
        conversation_context: Optional[List[str]] = None,
        shared_interests: Optional[List[str]] = None,
        relationship_stage: str = "early",
        num_suggestions: int = 3,
    ) -> List[ConversationResponseDTO]:
        ...

    async def check_content_safety(self, text: str) -> dict:
        ...

    async def rewrite_inappropriate_message(self, text: str, cultural_style: str = "boricua") -> str:
        ...

