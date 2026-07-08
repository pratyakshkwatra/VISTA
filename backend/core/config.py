import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "VISTA API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://vista:vista123@localhost:5432/vista_db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "vista_super_secret_key_change_in_production")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings()
