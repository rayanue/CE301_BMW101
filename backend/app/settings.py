from __future__ import annotations

from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv


def _default_backend_dir() -> Path:
    return Path(__file__).resolve().parents[1]


def _load_backend_dotenv() -> Path:
    # pin .env to backend/ (cwd varies); override=True beats stale exports in shell
    backend_dir = _default_backend_dir()
    dotenv_path = backend_dir / ".env"
    load_dotenv(dotenv_path=dotenv_path, override=True)
    return dotenv_path


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file_encoding="utf-8", extra="ignore")

    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    openai_base_url: str | None = Field(default=None, alias="OPENAI_BASE_URL")
    embedding_model: str = Field(default="text-embedding-3-small", alias="EMBEDDING_MODEL")

    openai_chat_model: str = Field(default="gpt-4o-mini", alias="OPENAI_CHAT_MODEL")
    openai_chat_timeout_seconds: int = Field(default=120, alias="OPENAI_CHAT_TIMEOUT_SECONDS")
    openai_max_output_tokens: int = Field(default=700, alias="OPENAI_MAX_OUTPUT_TOKENS")

    vector_index_path: Path = Field(default=Path("./data/vector_index.json"), alias="VECTOR_INDEX_PATH")

    models_csv_path: Path = Field(default=Path("./data/bmw_models.csv"), alias="MODELS_CSV_PATH")
    knowledge_dir: Path = Field(default=Path("./data/knowledge"), alias="KNOWLEDGE_DIR")

    cors_origins: str = Field(default="http://localhost:5173", alias="CORS_ORIGINS")

    backend_dir: Path = Field(default_factory=_default_backend_dir)

    @field_validator("openai_base_url", mode="before")
    @classmethod
    def empty_openai_base_url_to_none(cls, v):
        if v is None:
            return None
        if isinstance(v, str) and not v.strip():
            return None
        return v

    def resolved_vector_index_path(self) -> Path:
        p = self.vector_index_path
        return p if p.is_absolute() else (self.backend_dir / p).resolve()

    def resolved_models_csv_path(self) -> Path:
        p = self.models_csv_path
        return p if p.is_absolute() else (self.backend_dir / p).resolve()

    def resolved_knowledge_dir(self) -> Path:
        p = self.knowledge_dir
        return p if p.is_absolute() else (self.backend_dir / p).resolve()

    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


def get_settings() -> Settings:
    _load_backend_dotenv()  # before pydantic pulls env into Fields
    return Settings()
