from __future__ import annotations

from functools import lru_cache
from typing import Any

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from .llm import openai_healthcheck
from .rag import rag_answer
from .recommendation import load_models_rows, recommend_models
from .schemas import ChatRequest, ChatResponse, RecommendRequest, RecommendResponse, SourceItem
from .settings import get_settings


@lru_cache(maxsize=1)
def _models_rows() -> tuple[dict[str, Any], ...]:
    settings = get_settings()
    rows = load_models_rows(str(settings.resolved_models_csv_path()))
    return tuple(rows)


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="BMW Assistant API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health")
    async def health() -> dict[str, Any]:
        index_path = settings.resolved_vector_index_path()
        openai_ok = await openai_healthcheck(settings)

        return {
            "status": "ok",
            "vector_index_path": str(index_path),
            "vector_index_exists": index_path.exists(),
            "openai_reachable": openai_ok,
            "openai_chat_model": settings.openai_chat_model,
            "openai_base_url_configured": bool(settings.openai_base_url),
            "openai_key_configured": bool(settings.openai_api_key),
        }

    @app.post("/api/recommend", response_model=RecommendResponse)
    async def recommend(
        body: RecommendRequest,
        debug_scores: bool = Query(default=False),
    ) -> RecommendResponse:
        rows = list(_models_rows())
        items, debug = recommend_models(rows, body)
        return RecommendResponse(
            recommendations=items,
            preferences_echo=body,
            debug_scores=debug if debug_scores else None,
        )

    @app.post("/api/chat", response_model=ChatResponse)
    async def chat(body: ChatRequest) -> ChatResponse:
        answer, sources = await rag_answer(
            user_message=body.message,
            recommended_model_ids=body.recommended_model_ids,
        )
        return ChatResponse(answer=answer, sources=[SourceItem(**s) for s in sources])

    return app


app = create_app()
