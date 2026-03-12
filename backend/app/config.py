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

    class Config:
        env_file = ".env"


settings = Settings()