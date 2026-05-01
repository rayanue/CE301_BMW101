from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

from .settings import Settings, get_settings


@dataclass(frozen=True)
class VectorIndex:
    embedding_model: str
    chunk_ids: list[str]
    texts: list[str]
    metadatas: list[dict[str, Any]]
    embeddings: np.ndarray  # shape: (n, d), float32
    norms: np.ndarray  # shape: (n,), float32


def load_vector_index(path: Path) -> VectorIndex:
    if not path.exists():
        raise FileNotFoundError(f"Vector index not found: {path}")

    raw = json.loads(path.read_text(encoding="utf-8"))
    emb_model = str(raw.get("embedding_model", ""))
    chunk_ids = [str(x) for x in raw.get("chunk_ids", [])]
    texts = [str(x) for x in raw.get("texts", [])]
    metadatas = raw.get("metadatas", [])
    embeddings_list = raw.get("embeddings", [])

    if not isinstance(metadatas, list):
        metadatas = []

    if not chunk_ids or not texts or not embeddings_list:
        raise ValueError("Vector index file is missing required fields.")

    if not (len(chunk_ids) == len(texts) == len(metadatas) == len(embeddings_list)):
        raise ValueError("Vector index file has inconsistent array lengths.")

    embeddings = np.asarray(embeddings_list, dtype=np.float32)
    if embeddings.ndim != 2:
        raise ValueError("Embeddings must be a 2D matrix.")

    norms = np.linalg.norm(embeddings, axis=1, keepdims=False).astype(np.float32)
    norms = np.maximum(norms, 1e-8)

    return VectorIndex(
        embedding_model=emb_model,
        chunk_ids=chunk_ids,
        texts=texts,
        metadatas=[m if isinstance(m, dict) else {} for m in metadatas],
        embeddings=embeddings,
        norms=norms,
    )


def _cosine_top_k(index: VectorIndex, query: list[float], k: int, predicate) -> list[tuple[str, float]]:
    q = np.asarray(query, dtype=np.float32)
    qn = float(np.linalg.norm(q))
    if not math.isfinite(qn) or qn < 1e-8:
        return []

    sims = (index.embeddings @ q) / (index.norms * qn)

    scored: list[tuple[int, float]] = []
    for i, s in enumerate(sims.tolist()):
        if not predicate(i):
            continue
        scored.append((i, float(s)))

    scored.sort(key=lambda t: t[1], reverse=True)
    top = scored[: max(0, k)]

    out: list[tuple[str, float]] = []
    for i, s in top:
        out.append((index.chunk_ids[i], s))
    return out


def retrieve_chunks(
    *,
    query_embedding: list[float],
    recommended_model_ids: list[str],
    scoped_k: int = 4,
    global_k: int = 4,
    settings: Settings | None = None,
) -> list[dict[str, Any]]:
    settings = settings or get_settings()
    index = load_vector_index(settings.resolved_vector_index_path())

    ids = {m.strip().lower() for m in recommended_model_ids if m and m.strip()}

    def matches_recommendation(i: int) -> bool:
        if not ids:
            return False
        meta = index.metadatas[i]
        tags = str(meta.get("model_tags", "") or "")
        return any(f"|{mid}|" in tags for mid in ids)

    scoped_pairs = _cosine_top_k(index, query_embedding, scoped_k, predicate=matches_recommendation)
    global_pairs = _cosine_top_k(index, query_embedding, global_k, predicate=lambda _i: True)

    merged_ids: list[str] = []
    seen: set[str] = set()
    for cid, _s in scoped_pairs + global_pairs:
        if cid in seen:
            continue
        seen.add(cid)
        merged_ids.append(cid)

    id_to_i = {cid: i for i, cid in enumerate(index.chunk_ids)}
    out: list[dict[str, Any]] = []
    for cid in merged_ids:
        i = id_to_i.get(cid)
        if i is None:
            continue
        out.append(
            {
                "chunk_id": cid,
                "text": index.texts[i],
                "metadata": dict(index.metadatas[i]),
            }
        )
    return out
