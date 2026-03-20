from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """
    Enterprise Configuration management using pydantic-settings.
    This ensures all environment variables are validated at startup.
    """
    GOOGLE_CLOUD_PROJECT: str = "alpine-dogfish-490805-c5"
    GOOGLE_CLOUD_LOCATION: str = "us-central1"
    GCS_BUCKET_NAME: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    ENVIRONMENT: str = "production"
    
    # CORS Configuration
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://govbridge-frontend.run.app"
    ]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
