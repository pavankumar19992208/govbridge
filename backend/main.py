"""
Main application module for the GovBridge FastAPI Backend.
Handles multipart ingestion, security headers, CORS boundaries,
and asynchronously queries the Gemini model with Google Search Grounding.
"""

import os
import json
import logging
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Switching strictly to the new modern SDK per guidelines
from google import genai
from google.genai import types

app = FastAPI(title="GovBridge API", description="Production Backend services for GovBridge.")

# -------------------------------------------------------------
# Security Middlewares
# -------------------------------------------------------------
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://govbridge-frontend.run.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Authorization"],
)

@app.middleware("http")
async def secure_headers_middleware(request: Request, call_next):
    """
    Applies Helmet-like security headers across all incoming requests
    to protect against clickjacking, sniffing, and XSS attacks.
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# -------------------------------------------------------------
# Configuration: Secure loading of environment variables
# -------------------------------------------------------------
GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")

# Initialize modern GenAI client globally
genai_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

# -------------------------------------------------------------
# Pydantic Schemas - Matching Strict Requirements
# -------------------------------------------------------------
class SchemeResult(BaseModel):
    name: str = Field(description="Official name of the government scheme")
    score: int = Field(description="Match score percentage out of 100")
    amount: str = Field(description="Amount or description of the grant/subsidy provided")
    intro: str = Field(description="Brief overview of the scheme's core purpose")
    eligibility: List[str] = Field(description="Array of precise eligibility rules")
    timeline: str = Field(description="Application timeline and strict deadlines")
    documents: List[str] = Field(description="Array of required documentation proofs")
    link: str = Field(description="Secure, official link to the application portal")

class SchemeListResponse(BaseModel):
    schemes: List[SchemeResult] = Field(description="List of matching government schemes")
    message: str = Field(description="A helpful, encouraging message summarizing the AI recommendations")

# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------
@app.get("/health")
async def health_check() -> dict:
    """Verifies that the backend is responding and confirms Gemini connectivity context."""
    api_status = "configured" if GEMINI_API_KEY else "missing_key"
    return {"status": "GovBridge API is live", "gemini_status": api_status}

@app.post("/api/analyze", response_model=SchemeListResponse)
async def analyze_input(
    role: Optional[str] = Form(None),
    query: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
) -> dict:
    """
    Asynchronously parses multipart form data and queries gemini-3.1-flash-lite-preview
    utilizing Google Search Grounding to return live scheme matches via the modernized SDK.
    """
    if not genai_client:
        raise HTTPException(
            status_code=500, 
            detail="GEMINI_API_KEY environment variable is not set. Security misconfiguration."
        )

    try:
        contents = []
        prompt = (
            "You are GovBridge AI, an expert agent connecting vulnerable Indian citizens "
            "to official government schemes.\n"
            "Use your Google Search grounding tool to retrieve the most up-to-date and active schemes matching the user's profile strictly. "
            "Ensure the output exactly matches the requested JSON schema constraints.\n"
        )
        
        if role:
            prompt += f"\nUser Profession/Role: {role}"
        if query:
            prompt += f"\nUser Query: {query}"
        
        contents.append(prompt)

        # Safely parse multipart Form data via new explicit bytes syntax 
        if file and file.filename:
            file_bytes = await file.read()
            if file_bytes:
                mime_type = file.content_type or "image/jpeg"
                contents.append(
                    types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
                )

        # Utilizing aio models per efficiency metrics bound to lite preview
        response = await genai_client.aio.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=contents,
            config=types.GenerateContentConfig(
                tools=[{"google_search": {}}],
                response_mime_type="application/json",
                response_schema=SchemeListResponse,
                temperature=0.2 
            )
        )
        
        if not response.text:
            raise HTTPException(status_code=500, detail="Gemini returned an empty response. Verify context length.")
            
        structured_data = json.loads(response.text)
        return structured_data

    except json.JSONDecodeError:
        logging.error("JSON Decode Error: failed to parse Gemini output.")
        raise HTTPException(status_code=500, detail="Failed to safely decode strictly structured response from AI.")
    except Exception as e:
        logging.error(f"Unexpected Backend Error: {e}")
        raise HTTPException(status_code=500, detail=f"Backend processing trapped an error: {str(e)}")
