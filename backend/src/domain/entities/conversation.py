"""
Conversation and Message Entities
"""
from datetime import datetime
from typing import List, Optional
from enum import Enum


class ToneStyle(str, Enum):
    GENUINE = "genuino"
    FLIRTY = "coqueto"
    DIRECT = "directo"


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Message:
    """Message domain entity"""
    
    def __init__(
        self,
        text: str,
        role: MessageRole,
        message_id: Optional[int] = None,
        tone: Optional[ToneStyle] = None,
        lang: str = "es",
        timestamp: Optional[datetime] = None,
    ):
        self.id = message_id
        self.text = text
        self.role = role
        self.tone = tone
        self.lang = lang
        self.timestamp = timestamp or datetime.utcnow()
    
    def is_assistant_message(self) -> bool:
        """Check if message is from assistant"""
        return self.role == MessageRole.ASSISTANT
    
    def word_count(self) -> int:
        """Get word count of message"""
        return len(self.text.split())


class Conversation:
    """Conversation domain entity"""
    
    def __init__(
        self,
        user_id: int,
        conversation_id: Optional[int] = None,
        title: Optional[str] = None,
        created_at: Optional[datetime] = None,
        messages: Optional[List[Message]] = None,
    ):
        self.id = conversation_id
        self.user_id = user_id
        self.title = title
        self.created_at = created_at or datetime.utcnow()
        self.messages = messages or []
    
    def add_message(self, message: Message) -> None:
        """Add a message to the conversation"""
        self.messages.append(message)
    
    def get_last_message(self) -> Optional[Message]:
        """Get the most recent message"""
        return self.messages[-1] if self.messages else None
    
    def get_context_window(self, n: int = 5) -> List[Message]:
        """Get the last N messages for context"""
        return self.messages[-n:] if len(self.messages) >= n else self.messages
    
    def total_messages(self) -> int:
        """Get total number of messages"""
        return len(self.messages)
