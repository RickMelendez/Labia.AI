"""
AI Service - High-level interface for conversation generation
Handles opener and response generation with cultural context
"""
from typing import List, Optional, Dict
from loguru import logger

from .llm_provider import BaseLLMProvider, LLMMessage
from .prompt_templates import PromptBuilder
from ...domain.entities.conversation import ToneStyle


class ConversationOpener:
    """Generated conversation opener with metadata"""

    def __init__(
        self,
        text: str,
        tone: str,
        cultural_style: str,
        confidence: float = 0.0
    ):
        self.text = text
        self.tone = tone
        self.cultural_style = cultural_style
        self.confidence = confidence


class ConversationResponse:
    """Generated conversation response with metadata"""

    def __init__(
        self,
        text: str,
        tone: str,
        cultural_style: str,
        follow_up_suggestion: Optional[str] = None
    ):
        self.text = text
        self.tone = tone
        self.cultural_style = cultural_style
        self.follow_up_suggestion = follow_up_suggestion


class AIConversationService:
    """Service for AI-powered conversation generation"""

    def __init__(self, llm_provider: BaseLLMProvider):
        self.llm = llm_provider
        logger.info("Initialized AI Conversation Service")

    async def generate_openers(
        self,
        bio: str,
        interests: List[str],
        cultural_style: str = "boricua",
        user_interests: List[str] = None,
        num_suggestions: int = 3
    ) -> List[ConversationOpener]:
        """
        Generate conversation openers in three different tones

        Args:
            bio: Target person's bio/description
            interests: Target person's interests
            cultural_style: Cultural context (boricua, mexicano, etc.)
            user_interests: User's own interests for finding common ground
            num_suggestions: Number of suggestions per tone (default 3 = 1 per tone)

        Returns:
            List of ConversationOpener objects with different tones
        """
        openers = []
        tones = [
            ("genuino", "Genuine and friendly"),
            ("coqueto", "Flirty and playful"),
            ("directo", "Direct and concise")
        ]

        for tone_key, tone_desc in tones[:num_suggestions]:
            try:
                prompt_messages = PromptBuilder.build_opener_prompt(
                    cultural_style=cultural_style,
                    tone=tone_key,
                    bio=bio,
                    interests=interests,
                    user_interests=user_interests
                )

                # Convert to LLMMessage objects
                llm_messages = [
                    LLMMessage(role=msg["role"], content=msg["content"])
                    for msg in prompt_messages
                ]

                # Generate opener
                text = await self.llm.generate(
                    messages=llm_messages,
                    temperature=0.8,
                    max_tokens=150
                )

                opener = ConversationOpener(
                    text=text.strip(),
                    tone=tone_key,
                    cultural_style=cultural_style,
                    confidence=0.85
                )
                openers.append(opener)

                logger.info(f"Generated {tone_key} opener for {cultural_style} style")

            except Exception as e:
                logger.error(f"Error generating {tone_key} opener: {e}")
                # Add fallback opener
                openers.append(self._get_fallback_opener(tone_key, cultural_style))

        return openers

    async def generate_responses(
        self,
        received_message: str,
        cultural_style: str = "boricua",
        conversation_context: List[str] = None,
        shared_interests: List[str] = None,
        relationship_stage: str = "early",
        num_suggestions: int = 3
    ) -> List[ConversationResponse]:
        """
        Generate conversation responses in different tones

        Args:
            received_message: The message to respond to
            cultural_style: Cultural context
            conversation_context: Previous messages for context
            shared_interests: Common interests to reference
            relationship_stage: Stage of relationship (early, building, advanced)
            num_suggestions: Number of responses to generate

        Returns:
            List of ConversationResponse objects
        """
        responses = []
        tones = [
            ("genuino", "Genuine and warm"),
            ("coqueto", "Flirty and playful"),
            ("directo", "Direct and clear")
        ]

        for tone_key, tone_desc in tones[:num_suggestions]:
            try:
                prompt_messages = PromptBuilder.build_response_prompt(
                    cultural_style=cultural_style,
                    tone=tone_key,
                    received_message=received_message,
                    conversation_context=conversation_context,
                    shared_interests=shared_interests,
                    relationship_stage=relationship_stage
                )

                # Convert to LLMMessage objects
                llm_messages = [
                    LLMMessage(role=msg["role"], content=msg["content"])
                    for msg in prompt_messages
                ]

                # Generate response
                text = await self.llm.generate(
                    messages=llm_messages,
                    temperature=0.8,
                    max_tokens=200
                )

                response = ConversationResponse(
                    text=text.strip(),
                    tone=tone_key,
                    cultural_style=cultural_style
                )
                responses.append(response)

                logger.info(f"Generated {tone_key} response for {cultural_style} style")

            except Exception as e:
                logger.error(f"Error generating {tone_key} response: {e}")
                # Add fallback response
                responses.append(self._get_fallback_response(tone_key, cultural_style))

        return responses

    async def check_content_safety(self, text: str) -> Dict[str, any]:
        """
        Check if content is safe and appropriate

        Args:
            text: Text to check

        Returns:
            Dict with 'is_safe' boolean and optional 'reason' for unsafe content
        """
        from .prompt_templates import PromptTemplates

        try:
            messages = [
                LLMMessage(role="system", content=PromptTemplates.get_content_safety_prompt()),
                LLMMessage(role="user", content=f"Mensaje a analizar:\n\n{text}")
            ]

            result = await self.llm.generate(
                messages=messages,
                temperature=0.3,  # Lower temperature for more consistent safety checks
                max_tokens=100
            )

            result = result.strip().upper()

            if result.startswith("SAFE"):
                return {"is_safe": True}
            elif result.startswith("UNSAFE"):
                reason = result.replace("UNSAFE:", "").strip()
                return {"is_safe": False, "reason": reason}
            else:
                # Uncertain - default to safe but log
                logger.warning(f"Unclear safety check result: {result}")
                return {"is_safe": True}

        except Exception as e:
            logger.error(f"Error in content safety check: {e}")
            # Default to safe on errors to not block users
            return {"is_safe": True}

    async def rewrite_inappropriate_message(
        self,
        text: str,
        cultural_style: str = "boricua"
    ) -> str:
        """
        Rewrite an inappropriate message to be respectful

        Args:
            text: Original inappropriate text
            cultural_style: Cultural context for rewrite

        Returns:
            Rewritten appropriate message
        """
        from .prompt_templates import PromptTemplates

        try:
            messages = [
                LLMMessage(role="system", content=PromptTemplates.get_rewrite_prompt(cultural_style)),
                LLMMessage(role="user", content=f"Mensaje a reescribir:\n\n{text}")
            ]

            rewritten = await self.llm.generate(
                messages=messages,
                temperature=0.7,
                max_tokens=200
            )

            return rewritten.strip()

        except Exception as e:
            logger.error(f"Error rewriting message: {e}")
            return "Hola, ¿cómo estás? Me gustaría conocerte mejor."

    def _get_fallback_opener(self, tone: str, cultural_style: str) -> ConversationOpener:
        """Get fallback opener when generation fails"""
        fallbacks = {
            "genuino": "Hola! Vi tu perfil y me pareció interesante. ¿Cómo estuvo tu día?",
            "coqueto": "¡Ey! Tu perfil me llamó la atención 👀 ¿Qué tal si nos conocemos?",
            "directo": "Hola, me gustó tu perfil. ¿Te gustaría chatear?"
        }

        text = fallbacks.get(tone, fallbacks["genuino"])

        return ConversationOpener(
            text=text,
            tone=tone,
            cultural_style=cultural_style,
            confidence=0.5
        )

    def _get_fallback_response(self, tone: str, cultural_style: str) -> ConversationResponse:
        """Get fallback response when generation fails"""
        fallbacks = {
            "genuino": "¡Qué interesante! Cuéntame más sobre eso.",
            "coqueto": "Me gusta cómo piensas 😏 ¿Qué más puedes contarme?",
            "directo": "Entiendo. ¿Y tú qué opinas?"
        }

        text = fallbacks.get(tone, fallbacks["genuino"])

        return ConversationResponse(
            text=text,
            tone=tone,
            cultural_style=cultural_style
        )
