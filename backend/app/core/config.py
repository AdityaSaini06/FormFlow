from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Typeform Builder API"
    API_VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = "sqlite:///./typeform_builder.db"
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
