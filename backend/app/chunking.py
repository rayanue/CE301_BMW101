from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class RawDoc:
    source_file: str
    text: str
    frontmatter: dict[str, Any]


_FRONTMATTER_RE = re.compile(r"^\s*---\s*$", re.MULTILINE)


def _parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    # optional --- ... --- header; key: value and model_ids list only
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, text

    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return {}, text

    fm_lines = lines[1:end_idx]
    body = "\n".join(lines[end_idx + 1 :]).lstrip("\n")

    fm: dict[str, Any] = {}
    for raw in fm_lines:
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        key = k.strip()
        val = v.strip()

        if key == "model_ids":
            try:
                parsed = json.loads(val.replace("'", '"'))
                if isinstance(parsed, list):
                    fm[key] = [str(x).strip() for x in parsed if str(x).strip()]
            except Exception:
                fm[key] = [p.strip() for p in val.strip("[]").split(",") if p.strip()]
            continue

        fm[key] = val

    return fm, body


def _infer_model_ids_from_filename(filename: str) -> list[str]:
    # ix1-foo.md -> ix1
    stem = Path(filename).stem
    if "-" not in stem:
        return []
    slug = stem.split("-", 1)[0].strip().lower()
    return [slug] if slug else []


def _model_tags(model_ids: list[str]) -> str:
    slugs = sorted({m.strip().lower() for m in model_ids if m and m.strip()})
    if not slugs:
        return ""
    return "|" + "|".join(slugs) + "|"


def _split_paragraphs(text: str) -> list[str]:
    parts = [p.strip() for p in re.split(r"\n\s*\n+", text.strip()) if p.strip()]
    return parts if parts else [text.strip()]


def _merge_small_paragraphs(paragraphs: list[str], target_chars: int, max_chars: int) -> list[str]:
    merged: list[str] = []
    buf = ""

    for p in paragraphs:
        if not buf:
            buf = p
            continue

        if len(buf) + 2 + len(p) <= target_chars:
            buf = f"{buf}\n\n{p}"
        else:
            merged.append(buf)
            buf = p

        while len(buf) > max_chars:
            merged.append(buf[:max_chars])
            buf = buf[max_chars:]

    if buf:
        merged.append(buf)

    out: list[str] = []
    for chunk in merged:
        if len(chunk) <= max_chars:
            out.append(chunk)
            continue
        start = 0
        while start < len(chunk):
            out.append(chunk[start : start + max_chars])
            start += max_chars
    return out


def load_knowledge_docs(knowledge_dir: Path) -> list[RawDoc]:
    if not knowledge_dir.exists():
        raise FileNotFoundError(f"Knowledge directory not found: {knowledge_dir}")

    docs: list[RawDoc] = []
    for path in sorted(knowledge_dir.glob("*")):
        if path.suffix.lower() not in {".md", ".txt"}:
            continue
        text = path.read_text(encoding="utf-8")
        fm, body = _parse_frontmatter(text)
        docs.append(RawDoc(source_file=path.name, text=body, frontmatter=fm))
    return docs


def build_chunks(knowledge_dir: Path, target_chars: int = 1000, max_chars: int = 1200) -> list[dict[str, Any]]:
    raw_docs = load_knowledge_docs(knowledge_dir)
    chunks: list[dict[str, Any]] = []

    for doc in raw_docs:
        fm_ids = doc.frontmatter.get("model_ids")
        if isinstance(fm_ids, list):
            model_ids = [str(x).strip().lower() for x in fm_ids if str(x).strip()]
        else:
            model_ids = _infer_model_ids_from_filename(doc.source_file)

        paragraphs = _split_paragraphs(doc.text)
        merged = _merge_small_paragraphs(paragraphs, target_chars=target_chars, max_chars=max_chars)

        for idx, chunk_text in enumerate(merged):
            chunk_id = f"{Path(doc.source_file).stem}__{idx:04d}"
            chunks.append(
                {
                    "chunk_id": chunk_id,
                    "text": chunk_text.strip(),
                    "metadata": {
                        "source_file": doc.source_file,
                        "chunk_id": chunk_id,
                        "model_ids_json": json.dumps(model_ids),
                        "model_tags": _model_tags(model_ids),
                    },
                }
            )

    return chunks
