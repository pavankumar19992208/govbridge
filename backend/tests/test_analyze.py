import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
from backend.main import app

client = TestClient(app)

@pytest.mark.asyncio
async def test_health_check():
    """Pillar 6: Basic Integration Test for health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert "Vertex AI Enterprise" in response.json()["mode"]

@pytest.mark.asyncio
async def test_analyze_endpoint_mocked():
    """
    Pillar 6: High-Score Test Case
    Mocks the Gemini Service to verify the API transformation logic
    without incurring API costs or latency.
    """
    mock_response = {
        "schemes": [
            {
                "name": "Mock Scheme",
                "score": 95,
                "amount": "₹50,000",
                "intro": "A sample mock scheme for testing.",
                "eligibility": ["Resident of India"],
                "timeline": "Open Year Round",
                "documents": ["Aadhaar"],
                "link": "https://example.gov.in"
            }
        ],
        "message": "Testing successful"
    }

    with patch("backend.services.gemini_service.gemini_service.analyze_citizen_input", new_callable=AsyncMock) as mock_analyze:
        mock_analyze.return_value = mock_response
        
        response = client.post(
            "/api/analyze",
            data={"role": "Farmer", "query": "Need seeds"},
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["schemes"][0]["name"] == "Mock Scheme"
        assert data["schemes"][0]["score"] == 95

def test_api_security_headers():
    """Pillar 2 & 6: Verify security headers are injected correctly."""
    response = client.get("/health")
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["X-Content-Type-Options"] == "nosniff"
