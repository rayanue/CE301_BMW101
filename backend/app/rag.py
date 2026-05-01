from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from .embeddings import embed_texts
from .llm import openai_chat
from .local_index import retrieve_chunks
from .settings import Settings, get_settings


@dataclass(frozen=True)
class RetrievedChunk:
    chunk_id: str
    text: str
    metadata: dict[str, Any]


def _dedupe_keep_order(chunks: list[RetrievedChunk]) -> list[RetrievedChunk]:
    seen: set[str] = set()
    out: list[RetrievedChunk] = []
    for c in chunks:
        if c.chunk_id in seen:
            continue
        seen.add(c.chunk_id)
        out.append(c)
    return out


def _format_context(chunks: list[RetrievedChunk]) -> str:
    parts: list[str] = []
    for c in chunks:
        source_file = c.metadata.get("source_file", "unknown")
        header = f"[source: {source_file} | {c.chunk_id}]"
        parts.append(f"{header}\n{c.text.strip()}")
    return "\n\n".join(parts).strip()


async def rag_answer(
    *,
    user_message: str,
    recommended_model_ids: list[str],
    settings: Settings | None = None,
) -> tuple[str, list[dict[str, Any]]]:
    settings = settings or get_settings()

    q_emb = embed_texts([user_message], settings=settings)[0]

    retrieved = retrieve_chunks(
        query_embedding=q_emb,
        recommended_model_ids=recommended_model_ids,
        scoped_k=4,
        global_k=4,
        settings=settings,
    )

    merged = [
        RetrievedChunk(chunk_id=str(r["chunk_id"]), text=str(r["text"]), metadata=dict(r.get("metadata") or {}))
        for r in retrieved
    ]
    merged = _dedupe_keep_order(merged)[:8]

    context = _format_context(merged)

    # optional shortlist ids in the prompt - answers should still follow the chunks above
    ids = [m.strip().lower() for m in recommended_model_ids if m and m.strip()]
    focus_line = ""
    if ids:
        focus_line = "Current focus models (IDs): " + ", ".join(ids) + "\n\n"

    system = (
        "You are BMW Assistant for a dissertation demo.\n"
        "Answer ONLY using the provided Context.\n"
        "If the Context does not contain enough information, say you don't know.\n"
        "Use short paragraphs. Mention uncertainties.\n"
        "Every factual statement should be traceable to a context header like [source: file | chunk_id]."
    )

    user = focus_line + f"Question:\n{user_message}\n\nContext:\n{context or '(empty)'}"

    answer = await openai_chat(system=system, user=user, settings=settings)

    sources: list[dict[str, Any]] = []
    for c in merged:
        sources.append(
            {
                "text": c.text,
                "metadata": {
                    **c.metadata,
                    "model_ids": json.loads(c.metadata.get("model_ids_json") or "[]"),
                },
            }
        )

    return answer, sources
