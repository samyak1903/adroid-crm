from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Adroit CRM API"
    DATABASE_URL: str = "sqlite+aiosqlite:///./crm.db"
    
    # R2 Storage Settings
    # R2_BUCKET_NAME: str = ""
    # R2_ACCOUNT_ID: str = ""
    # R2_ACCESS_KEY_ID: str = ""
    # R2_SECRET_ACCESS_KEY: str = ""
    
    # SMTP Settings
    # SMTP_SERVER: str = ""
    # SMTP_PORT: int = 587
    # SMTP_USERNAME: str = ""
    # SMTP_PASSWORD: str = ""

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
