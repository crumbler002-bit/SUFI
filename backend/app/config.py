from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    DATABASE_URL: str = "postgresql://postgres:niharika31@localhost:5432/sufi"

    JWT_SECRET: str = "SUPER_SECRET_CHANGE_IN_PRODUCTION"
    JWT_ALGORITHM: str = "HS256"

    REDIS_URL: str = "redis://localhost:6379"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    MEILISEARCH_URL: str = "http://127.0.0.1:7700"
    MEILISEARCH_MASTER_KEY: str = "masterKey"

    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:5174"
    
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60
    
    LOG_LEVEL: str = "INFO"
    SENTRY_DSN: str = ""
    
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()