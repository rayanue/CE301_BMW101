from __future__ import annotations

from functools import lru_cache

from openai import AsyncOpenAI

from .settings import Settings, get_settings


@lru_cache(maxsize=1)
def _async_client(api_key: str, base_url: str | None) -> AsyncOpenAI:
    kwargs = {"api_key": api_key}
    # empty string from .env breaks httpx; only pass base_url when non-blank
    if base_url and str(base_url).strip():
        kwargs["base_url"] = str(base_url).strip()
    return AsyncOpenAI(**kwargs)


async def openai_chat(*, system: str, user: str, settings: Settings | None = None) -> str:
    settings = settings or get_settings()
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set (required for ChatGPT generation).")

    client = _async_client(settings.openai_api_key, settings.openai_base_url)

    resp = await client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.2,
        max_completion_tokens=settings.openai_max_output_tokens,
        timeout=settings.openai_chat_timeout_seconds,
    )

    choice0 = resp.choices[0].message.content or ""
    if not isinstance(choice0, str) or not choice0.strip():
        raise RuntimeError("OpenAI returned an empty completion.")
    return choice0.strip()


async def openai_healthcheck(settings: Settings | None = None) -> bool:
    settings = settings or get_settings()
    if not settings.openai_api_key:
        return False
    try:
        client = _async_client(settings.openai_api_key, settings.openai_base_url)
        await client.models.list(timeout=5)
        return True
    except Exception:
        return False
