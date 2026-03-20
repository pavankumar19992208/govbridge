import os
import logging
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import logging as cloud_logging

# Local Refactored Imports
from .config.settings import settings
from .services.gemini_service import gemini_service
from .services.storage_service import storage_service

# -------------------------------------------------------------
# Enterprise Google Cloud Logging
# -------------------------------------------------------------
client_logging = cloud_logging.Client(project=settings.GOOGLE_CLOUD_PROJECT)
client_logging.setup_logging()

app = FastAPI(title="GovBridge API", description="Production API for GovBridge Citizen Interface.")

# -------------------------------------------------------------
# Pillar 2: Security Boundaries & Middleware
# -------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Authorization"],
)

@app.middleware("http")
async def secure_headers_middleware(request: Request, call_next):
    """
    Pillar 2: Defensive ASGI Security Headers
    Injects HSTS, X-Frame-Options, XSS protection, and CSP headers.
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# -------------------------------------------------------------
# Endpoints: Controller Implementation (Pillar 5)
# -------------------------------------------------------------
@app.get("/health")
async def health_check() -> dict:
    """Verifies that the backend is responding and confirms Gemini connectivity context."""
    return {
        "status": "GovBridge API is live",
        "mode": "Vertex AI Enterprise",
        "environment": settings.ENVIRONMENT
    }

@app.post("/api/analyze")
async def analyze_input(
    role: Optional[str] = Form(None),
    query: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
) -> dict:
    """
    Asynchronously coordinates the analysis pipeline.
    1. PERSISTS blob to GCS (if present).
    2. QUERIES Gemini in Vertex AI mode with Search Grounding.
    3. RETURNS structured citizen-optimized mapping.
    """
    try:
        file_bytes = None
        mime_type = None

        if file and file.filename:
            file_bytes = await file.read()
            mime_type = file.content_type
            # Pillar 1 & 5: Service-coordinated GCS Persistence
            await storage_service.upload_bytes(file_bytes, f"uploads/{file.filename}", mime_type)

        # Pillar 1: Advanced Grounding Execution
        result = await gemini_service.analyze_citizen_input(role, query, file_bytes, mime_type)
        
        if not result:
            raise HTTPException(status_code=500, detail="Gemini analysis pipeline yielded null response.")

        return result

    except Exception as e:
        logging.error(f"Top-level API Failure: {e}")
        raise HTTPException(status_code=500, detail="Critical fail state in analysis pipeline.")
