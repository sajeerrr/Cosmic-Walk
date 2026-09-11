import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env from backend directory or project root
root_dir = Path(__file__).resolve().parent.parent.parent
backend_dir = Path(__file__).resolve().parent.parent

load_dotenv(dotenv_path=backend_dir / ".env")
load_dotenv(dotenv_path=root_dir / ".env")


class Settings(BaseSettings):
    app_name: str = "CosmicWalk"
    debug: bool = True
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    anthropic_api_key: str = ""

    class Config:
        env_file = (str(backend_dir / ".env"), str(root_dir / ".env"))
        extra = "ignore"


settings = Settings()
if not settings.groq_api_key:
    settings.groq_api_key = os.getenv("GROQ_API_KEY", "")


