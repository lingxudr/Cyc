import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CYPY Web"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # CORS Configuration
    CORS_ORIGINS: list[str] = ["*"]
    
    # CYPY Engine Path Configuration
    CYPY_ENGINE_DIR: str = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "cypy-main")
    )
    
    # Storage Configuration for Uploads and Processed Manga
    UPLOAD_DIR: str = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "storage", "uploads")
    )
    OUTPUT_DIR: str = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "storage", "output")
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
