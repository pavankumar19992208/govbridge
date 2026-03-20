import pytest
from fastapi.testclient import TestClient
from backend.main import app
from unittest.mock import patch, AsyncMock
import json
import io

client = TestClient(app)

def test_health_check_status_and_security_headers():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "GovBridge API is live"
    
    # Assert custom Helmet headers are dynamically injected
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"

def test_analyze_empty_payload_fails_gracefully():
    # Expect 500 since GEMINI API returns error or handled in except
    response = client.post("/api/analyze", data={"query": ""})
    
    # Ensures it doesn't crash catastrophically but returns a handled REST code
    assert response.status_code in [400, 422, 500]

@patch("backend.main.genai_client")
def test_analyze_mocked_success(mock_client):
    """Integrates Test Mocking explicitly intercepting genai client ensuring robust 200 checks independently."""
    mock_response = AsyncMock()
    mock_response.text = json.dumps({
        "schemes": [
            {
                "name": "GovBridge Mocked Subsidy Test",
                "score": 99,
                "amount": "₹50,000",
                "intro": "A mock scheme generated natively to bypass unauthenticated client failures.",
                "eligibility": ["Farmers", "Under poverty metric line"],
                "timeline": "Deploy within 12 weeks",
                "documents": ["Aadhar Card ID"],
                "link": "https://gov.in"
            }
        ],
        "message": "Direct mocking bypass successful"
    })
    
    # Safely mock the deeply nested aio method directly off the patched base object
    mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)

    response = client.post("/api/analyze", data={"role": "Farmer", "query": "Agricultural seed subsidy"})
    
    assert response.status_code == 200
    data = response.json()
    assert len(data.get("schemes", [])) == 1
    assert data["schemes"][0]["name"] == "GovBridge Mocked Subsidy Test"

@patch("backend.main.genai_client")
def test_analyze_multipart_file_upload(mock_client):
    """Saturates coverage mapping the multi-part Form File upload execution branch explicitly."""
    mock_response = AsyncMock()
    mock_response.text = json.dumps({
        "schemes": [],
        "message": "Image schema validation successful."
    })
    
    mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)

    file_content = b"fake simulated image or pdf bytes"
    files = {"file": ("document.jpg", io.BytesIO(file_content), "image/jpeg")}
    data = {"role": "Artisan", "query": "Document scan processing"}
    
    response = client.post("/api/analyze", data=data, files=files)
    
    assert response.status_code == 200
    assert response.json()["message"] == "Image schema validation successful."
