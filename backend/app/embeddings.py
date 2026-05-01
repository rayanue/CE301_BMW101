from __future__ import annotations

from functools import lru_cache

from openai import OpenAI

from .settings import Settings, get_settings


@lru_cache(maxsize=8)
def _client(api_key: str, base_url: str | None) -> OpenAI:
    kwargs = {"api_key": api_key}
    # same idea as llm.py - blank base_url from .env upsets httpx
    if base_url and str(base_url).strip():
        kwargs["base_url"] = str(base_url).strip()
    return OpenAI(**kwargs)


def embed_texts(texts: list[str], settings: Settings | None = None) -> list[list[float]]:
    settings = settings or get_settings()
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set (required for embeddings).")

    client = _client(settings.openai_api_key, settings.openai_base_url)
    resp = client.embeddings.create(model=settings.embedding_model, input=texts)
    return [d.embedding for d in resp.data]
