"""
Conversation Repository Interface
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from src.domain.entities.conversation import Conversation, Message


class IConversationRepository(ABC):
    """Interface for Conversation repository"""
    
    @abstractmethod
    async def create(self, conversation: Conversation) -> Conversation:
        """Create a new conversation"""
        pass
    
    @abstractmethod
    async def get_by_id(self, conversation_id: int) -> Optional[Conversation]:
        """Get conversation by ID"""
        pass
    
    @abstractmethod
    async def get_by_user_id(self, user_id: int, limit: int = 50) -> List[Conversation]:
        """Get all conversations for a user"""
        pass
    
    @abstractmethod
    async def add_message(self, conversation_id: int, message: Message) -> Message:
        """Add a message to a conversation"""
        pass
    
    @abstractmethod
    async def delete(self, conversation_id: int) -> bool:
        """Delete a conversation"""
        pass
