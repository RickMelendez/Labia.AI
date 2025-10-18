"""
Unit tests for Openers API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock, patch

from src.main import app
from src.infrastructure.external_services import ConversationOpener


client = TestClient(app)


class TestOpenersAPI:
    """Test suite for openers endpoints"""

    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_ping(self):
        """Test ping endpoint"""
        response = client.get("/api/v1/ping")
        assert response.status_code == 200
        assert response.json()["message"] == "pong"

    def test_get_examples(self):
        """Test get examples endpoint"""
        response = client.get("/api/v1/openers/examples")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "examples" in data
        assert "boricua" in data["examples"]

    @pytest.mark.asyncio
    async def test_generate_openers_success(self):
        """Test successful opener generation"""
        # Mock the AI service
        mock_openers = [
            ConversationOpener(
                text="¡Wepa! Vi que eres fan de Bad Bunny. ¿Cuál es tu canción favorita?",
                tone="genuino",
                cultural_style="boricua",
                confidence=0.9
            ),
            ConversationOpener(
                text="Oye, me llamó la atención tu perfil 😏 ¿Qué tal si nos conocemos?",
                tone="coqueto",
                cultural_style="boricua",
                confidence=0.85
            ),
            ConversationOpener(
                text="Hola! Me gusta tu estilo. ¿Charlamos?",
                tone="directo",
                cultural_style="boricua",
                confidence=0.8
            )
        ]

        with patch('src.presentation.api.openers.get_ai_service') as mock_service:
            mock_ai = AsyncMock()
            mock_ai.generate_openers = AsyncMock(return_value=mock_openers)
            mock_service.return_value = mock_ai

            request_data = {
                "bio": "Me encanta la playa y el reggaeton. Fan de Bad Bunny 🐰",
                "interests": ["playa", "música", "deportes"],
                "cultural_style": "boricua",
                "num_suggestions": 3
            }

            response = client.post("/api/v1/openers", json=request_data)
            assert response.status_code == 200

            data = response.json()
            assert data["success"] is True
            assert len(data["openers"]) == 3
            assert data["cultural_style"] == "boricua"

            # Verify each opener has required fields
            for opener in data["openers"]:
                assert "text" in opener
                assert "tone" in opener
                assert "cultural_style" in opener
                assert "confidence" in opener

    def test_generate_openers_invalid_style(self):
        """Test opener generation with invalid cultural style"""
        request_data = {
            "bio": "Test bio",
            "interests": ["test"],
            "cultural_style": "invalid_style",
            "num_suggestions": 3
        }

        response = client.post("/api/v1/openers", json=request_data)
        assert response.status_code == 400
        assert "Invalid cultural_style" in response.json()["detail"]

    def test_generate_openers_bio_too_short(self):
        """Test opener generation with bio too short"""
        request_data = {
            "bio": "Short",  # Less than 10 characters
            "interests": ["test"],
            "cultural_style": "boricua",
            "num_suggestions": 3
        }

        response = client.post("/api/v1/openers", json=request_data)
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_preview_opener(self):
        """Test preview opener endpoint"""
        mock_opener = ConversationOpener(
            text="¡Hola! Vi tu perfil y me pareció interesante.",
            tone="genuino",
            cultural_style="boricua",
            confidence=0.85
        )

        with patch('src.presentation.api.openers.get_ai_service') as mock_service:
            mock_ai = AsyncMock()
            mock_ai.generate_openers = AsyncMock(return_value=[mock_opener])
            mock_service.return_value = mock_ai

            request_data = {
                "bio": "Me gusta viajar y conocer nuevas personas",
                "interests": ["viajes", "fotografía"],
                "cultural_style": "boricua",
                "num_suggestions": 1
            }

            response = client.post("/api/v1/openers/preview", json=request_data)
            assert response.status_code == 200

            data = response.json()
            assert data["success"] is True
            assert "preview" in data
            assert data["preview"]["tone"] == "genuino"

    def test_generate_openers_all_cultural_styles(self):
        """Test opener generation with all cultural styles"""
        cultural_styles = ["boricua", "mexicano", "colombiano", "argentino", "español"]

        for style in cultural_styles:
            mock_openers = [
                ConversationOpener(
                    text=f"Test opener for {style}",
                    tone="genuino",
                    cultural_style=style,
                    confidence=0.8
                )
            ]

            with patch('src.presentation.api.openers.get_ai_service') as mock_service:
                mock_ai = AsyncMock()
                mock_ai.generate_openers = AsyncMock(return_value=mock_openers)
                mock_service.return_value = mock_ai

                request_data = {
                    "bio": "Test bio for cultural style",
                    "interests": ["test"],
                    "cultural_style": style,
                    "num_suggestions": 1
                }

                response = client.post("/api/v1/openers", json=request_data)
                assert response.status_code == 200
                data = response.json()
                assert data["cultural_style"] == style
