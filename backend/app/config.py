from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "CosmicWalk"
    debug: bool = True
    anthropic_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
