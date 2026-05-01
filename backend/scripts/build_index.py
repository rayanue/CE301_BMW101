from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

from app.chunking import build_chunks
from app.embeddings import embed_texts
from app.settings import get_settings


def _batched(items: list[str], batch_size: int) -> list[list[str]]:
    return [items[i : i + batch_size] for i in range(0, len(items), batch_size)]


def main() -> None:
    load_dotenv(dotenv_path=BACKEND_DIR / ".env")

    parser = argparse.ArgumentParser(description="Build/refresh the local vector index for BMW Assistant.")
    parser.add_argument("--batch-size", type=int, default=32)
    args = parser.parse_args()

    settings = get_settings()
    knowledge_dir = settings.resolved_knowledge_dir()

    chunks = build_chunks(knowledge_dir)
    if not chunks:
        raise SystemExit(f"No chunks produced from knowledge dir: {knowledge_dir}")

    texts = [c["text"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]
    ids = [c["chunk_id"] for c in chunks]

    embeddings: list[list[float]] = []
    for batch in _batched(texts, args.batch_size):
        embeddings.extend(embed_texts(batch, settings=settings))

    out_path = settings.resolved_vector_index_path()
    out_path.parent.mkdir(parents=True, exist_ok=True)

    payload = {
        "embedding_model": settings.embedding_model,
        "chunk_ids": ids,
        "texts": texts,
        "metadatas": metadatas,
        "embeddings": embeddings,
    }
    out_path.write_text(json.dumps(payload), encoding="utf-8")

    print(f"Wrote {len(ids)} chunks to vector index: {out_path}")


if __name__ == "__main__":
    main()
