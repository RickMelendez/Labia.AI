"""
Unit tests for AI Conversation Service
"""
import pytest
from unittest.mock import Mock, AsyncMock, patch

from src.infrastructure.external_services import (
    AIConversationService,
    ConversationOpener,
    ConversationResponse,
    LLMMessage
)


class TestAIConversationService:
    """Test suite for AI Conversation Service"""

    @pytest.fixture
    def mock_llm_provider(self):
        """Create mock LLM provider"""
        provider = AsyncMock()
        provider.generate = AsyncMock(return_value="Test generated response")
        provider.generate_multiple = AsyncMock(return_value=[
            "Response 1",
            "Response 2",
            "Response 3"
        ])
        return provider

    @pytest.fixture
    def ai_service(self, mock_llm_provider):
        """Create AI service with mock provider"""
        return AIConversationService(mock_llm_provider)

    @pytest.mark.asyncio
    async def test_generate_openers_success(self, ai_service, mock_llm_provider):
        """Test successful opener generation"""
        mock_llm_provider.generate.return_value = "¡Wepa! Vi que te gusta la playa 🏖️"

        openers = await ai_service.generate_openers(
            bio="Me encanta la playa y el reggaeton",
            interests=["playa", "música"],
            cultural_style="boricua",
            num_suggestions=3
        )

        assert len(openers) == 3
        assert all(isinstance(opener, ConversationOpener) for opener in openers)
        assert openers[0].cultural_style == "boricua"

        # Verify different tones
        tones = [opener.tone for opener in openers]
        assert "genuino" in tones
        assert "coqueto" in tones
        assert "directo" in tones

    @pytest.mark.asyncio
    async def test_generate_openers_with_user_interests(self, ai_service, mock_llm_provider):
        """Test opener generation with user interests"""
        mock_llm_provider.generate.return_value = "Test opener with shared interests"

        openers = await ai_service.generate_openers(
            bio="Fan de deportes y música",
            interests=["deportes", "música"],
            cultural_style="boricua",
            user_interests=["música", "cine"],
            num_suggestions=1
        )

        assert len(openers) == 1
        # Verify LLM was called
        assert mock_llm_provider.generate.called

    @pytest.mark.asyncio
    async def test_generate_responses_success(self, ai_service, mock_llm_provider):
        """Test successful response generation"""
        mock_llm_provider.generate.return_value = "¡Qué chévere! Cuéntame más sobre eso"

        responses = await ai_service.generate_responses(
            received_message="Hola, ¿cómo estás?",
            cultural_style="boricua",
            relationship_stage="early",
            num_suggestions=3
        )

        assert len(responses) == 3
        assert all(isinstance(resp, ConversationResponse) for resp in responses)

        # Verify different tones
        tones = [resp.tone for resp in responses]
        assert "genuino" in tones
        assert "coqueto" in tones
        assert "directo" in tones

    @pytest.mark.asyncio
    async def test_generate_responses_with_context(self, ai_service, mock_llm_provider):
        """Test response generation with conversation context"""
        mock_llm_provider.generate.return_value = "Sí, me gusta mucho! ¿Y tú?"

        context = [
            "Hola! ¿Cómo estás?",
            "Bien, gracias. ¿Te gusta la música?",
        ]

        responses = await ai_service.generate_responses(
            received_message="Sí, sobre todo el reggaeton",
            cultural_style="boricua",
            conversation_context=context,
            shared_interests=["música"],
            relationship_stage="building",
            num_suggestions=2
        )

        assert len(responses) == 2
        assert mock_llm_provider.generate.called

    @pytest.mark.asyncio
    async def test_check_content_safety_safe(self, ai_service, mock_llm_provider):
        """Test content safety check for safe content"""
        mock_llm_provider.generate.return_value = "SAFE"

        result = await ai_service.check_content_safety(
            "Hola, ¿cómo estás? Me gustaría conocerte mejor."
        )

        assert result["is_safe"] is True
        assert "reason" not in result

    @pytest.mark.asyncio
    async def test_check_content_safety_unsafe(self, ai_service, mock_llm_provider):
        """Test content safety check for unsafe content"""
        mock_llm_provider.generate.return_value = "UNSAFE: Contenido sexual explícito"

        result = await ai_service.check_content_safety(
            "Inappropriate content here"
        )

        assert result["is_safe"] is False
        assert "reason" in result
        assert "sexual" in result["reason"].lower()

    @pytest.mark.asyncio
    async def test_rewrite_inappropriate_message(self, ai_service, mock_llm_provider):
        """Test message rewriting"""
        mock_llm_provider.generate.return_value = "Hola, me gustaría conocerte mejor de forma respetuosa."

        rewritten = await ai_service.rewrite_inappropriate_message(
            text="Inappropriate message",
            cultural_style="boricua"
        )

        assert len(rewritten) > 0
        assert isinstance(rewritten, str)
        assert mock_llm_provider.generate.called

    @pytest.mark.asyncio
    async def test_generate_openers_fallback_on_error(self, ai_service, mock_llm_provider):
        """Test fallback when opener generation fails"""
        # Simulate error in LLM
        mock_llm_provider.generate.side_effect = Exception("API Error")

        openers = await ai_service.generate_openers(
            bio="Test bio",
            interests=["test"],
            cultural_style="boricua",
            num_suggestions=3
        )

        # Should return fallback openers
        assert len(openers) == 3
        assert all(isinstance(opener, ConversationOpener) for opener in openers)
        # Fallback openers have lower confidence
        assert all(opener.confidence < 1.0 for opener in openers)

    @pytest.mark.asyncio
    async def test_generate_responses_fallback_on_error(self, ai_service, mock_llm_provider):
        """Test fallback when response generation fails"""
        # Simulate error in LLM
        mock_llm_provider.generate.side_effect = Exception("API Error")

        responses = await ai_service.generate_responses(
            received_message="Test message",
            cultural_style="boricua",
            num_suggestions=3
        )

        # Should return fallback responses
        assert len(responses) == 3
        assert all(isinstance(resp, ConversationResponse) for resp in responses)

    @pytest.mark.asyncio
    async def test_different_cultural_styles(self, ai_service, mock_llm_provider):
        """Test opener generation with different cultural styles"""
        styles = ["boricua", "mexicano", "colombiano", "argentino", "español"]

        for style in styles:
            mock_llm_provider.generate.return_value = f"Opener for {style} style"

            openers = await ai_service.generate_openers(
                bio="Test bio",
                interests=["test"],
                cultural_style=style,
                num_suggestions=1
            )

            assert len(openers) == 1
            assert openers[0].cultural_style == style

    def test_fallback_opener_all_tones(self, ai_service):
        """Test fallback openers for all tones"""
        tones = ["genuino", "coqueto", "directo"]

        for tone in tones:
            fallback = ai_service._get_fallback_opener(tone, "boricua")
            assert isinstance(fallback, ConversationOpener)
            assert fallback.tone == tone
            assert len(fallback.text) > 0
            assert fallback.confidence == 0.5

    def test_fallback_response_all_tones(self, ai_service):
        """Test fallback responses for all tones"""
        tones = ["genuino", "coqueto", "directo"]

        for tone in tones:
            fallback = ai_service._get_fallback_response(tone, "boricua")
            assert isinstance(fallback, ConversationResponse)
            assert fallback.tone == tone
            assert len(fallback.text) > 0
