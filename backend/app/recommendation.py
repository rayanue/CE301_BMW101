from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .schemas import PowertrainPreference, RecommendRequest, RecommendationItem


@dataclass
class _ModelRow:
    model_id: str
    model_name: str
    price_gbp: float
    body_type: str
    powertrain: str
    range_miles: int | None
    seats: int
    performance_score: int
    family_score: int
    luxury_score: int


def _parse_int_maybe_empty(value: str) -> int | None:
    v = (value or "").strip()
    if v == "":
        return None
    return int(float(v))


def _parse_int(value: str) -> int:
    return int(float((value or "").strip()))


def _parse_float(value: str) -> float:
    return float((value or "").strip())


def load_models_rows(csv_path: str) -> list[dict[str, Any]]:
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"Models CSV not found: {csv_path}")

    required = {
        "model_id",
        "model_name",
        "price_gbp",
        "body_type",
        "powertrain",
        "range_miles",
        "seats",
        "performance_score",
        "family_score",
        "luxury_score",
    }

    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames is None:
            raise ValueError("bmw_models.csv appears empty or invalid.")

        missing = required - set([h.strip() for h in reader.fieldnames if h])
        if missing:
            raise ValueError(f"bmw_models.csv missing columns: {sorted(missing)}")

        for raw in reader:
            row = {k.strip(): (v or "").strip() for k, v in raw.items() if k}
            if not row.get("model_id"):
                continue

            rows.append(
                {
                    "model_id": row["model_id"].lower(),
                    "model_name": row["model_name"],
                    "price_gbp": _parse_float(row["price_gbp"]),
                    "body_type": row["body_type"].lower(),
                    "powertrain": row["powertrain"].lower(),
                    "range_miles": _parse_int_maybe_empty(row.get("range_miles", "")),
                    "seats": _parse_int(row["seats"]),
                    "performance_score": _parse_int(row["performance_score"]),
                    "family_score": _parse_int(row["family_score"]),
                    "luxury_score": _parse_int(row["luxury_score"]),
                }
            )

    if not rows:
        raise ValueError("bmw_models.csv contains no rows.")

    return rows


def _row_to_model(row: dict[str, Any]) -> _ModelRow:
    return _ModelRow(
        model_id=str(row["model_id"]),
        model_name=str(row["model_name"]),
        price_gbp=float(row["price_gbp"]),
        body_type=str(row["body_type"]),
        powertrain=str(row["powertrain"]),
        range_miles=row.get("range_miles"),
        seats=int(row["seats"]),
        performance_score=int(row["performance_score"]),
        family_score=int(row["family_score"]),
        luxury_score=int(row["luxury_score"]),
    )


def _powertrain_penalty(powertrain: str, pref: PowertrainPreference) -> float:
    pt = powertrain.lower()
    if pref == PowertrainPreference.ANY:
        return 0.0
    if pref == PowertrainPreference.EV_ONLY:
        return 0.0 if pt == "ev" else 6.0
    if pref == PowertrainPreference.NO_EV:
        return 6.0 if pt == "ev" else 0.0
    if pref == PowertrainPreference.HYBRID_OK:
        if pt in {"ev", "hybrid", "petrol", "diesel"}:
            return 0.0
        return 3.0
    return 0.0


def _importance_weights(req: RecommendRequest) -> tuple[float, float, float]:
    fam = req.family_weight
    lux = req.luxury_weight
    perf = req.performance_weight

    if fam is None:
        fam = 0.75 if req.family_important else 0.0
    if lux is None:
        lux = 0.75 if req.luxury_important else 0.0
    if perf is None:
        perf = 0.75 if req.performance_important else 0.0

    return fam, lux, perf


def _ideal_scores(fam_w: float, lux_w: float, perf_w: float) -> tuple[float, float, float]:
    # weight 0 -> target 3/5 so the "distance from ideal" bit barely fires
    ideal_family = 4.0 * fam_w + 3.0 * (1.0 - fam_w)
    ideal_luxury = 4.0 * lux_w + 3.0 * (1.0 - lux_w)
    ideal_performance = 4.0 * perf_w + 3.0 * (1.0 - perf_w)
    return ideal_family, ideal_luxury, ideal_performance


def recommend_models(rows: list[dict[str, Any]], req: RecommendRequest) -> tuple[list[RecommendationItem], dict[str, Any]]:
    # everyone gets a score; budget/seat stuff is penalties not hard filters; top 3 out
    fam_w, lux_w, perf_w = _importance_weights(req)
    ideal_f, ideal_l, ideal_p = _ideal_scores(fam_w, lux_w, perf_w)

    preferred_bodies = {b.strip().lower() for b in req.preferred_body_types if b and b.strip()}

    debug_rows: dict[str, Any] = {}

    scored: list[tuple[float, _ModelRow, list[str], dict[str, float]]] = []

    for row in rows:
        m = _row_to_model(row)
        bullets: list[str] = []
        penalties: dict[str, float] = {}

        priority_match = fam_w * m.family_score + lux_w * m.luxury_score + perf_w * m.performance_score
        penalties["priority_match"] = round(priority_match, 3)

        if m.price_gbp > req.max_budget_gbp:
            over = m.price_gbp - req.max_budget_gbp
            p = 3.0 + min(8.0, over / 2500.0)
            penalties["over_budget_penalty"] = round(p, 3)
            bullets.append(f"Over your max budget by ~£{over:,.0f} (soft penalty; still shown for transparency).")
        else:
            penalties["over_budget_penalty"] = 0.0
            under = req.max_budget_gbp - m.price_gbp
            bonus = min(2.0, max(0.0, under / 15000.0))
            penalties["budget_headroom_bonus"] = round(bonus, 3)
            bullets.append("Within your stated max budget (with headroom scoring).")

        if req.min_seats is not None and m.seats < req.min_seats:
            p = 4.0 + 1.5 * (req.min_seats - m.seats)
            penalties["under_seat_penalty"] = round(p, 3)
            bullets.append(f"Seats ({m.seats}) are below your minimum ({req.min_seats}) - soft penalty.")
        elif req.min_seats is not None:
            penalties["under_seat_penalty"] = 0.0
            bullets.append(f"Meets your minimum seat requirement ({req.min_seats}+).")
        else:
            penalties["under_seat_penalty"] = 0.0

        pt_pen = _powertrain_penalty(m.powertrain, req.powertrain_preference)
        penalties["powertrain_penalty"] = round(pt_pen, 3)
        if pt_pen > 0:
            bullets.append(f"Powertrain ({m.powertrain}) is not a perfect match for preference '{req.powertrain_preference.value}'.")
        else:
            bullets.append(f"Powertrain ({m.powertrain}) matches your preference '{req.powertrain_preference.value}' well.")

        if preferred_bodies:
            if m.body_type in preferred_bodies:
                bonuses = 2.0
                penalties["body_type_bonus"] = round(bonuses, 3)
                bullets.append(f"Body type matches your preference ({m.body_type}).")
            else:
                p = 2.5
                penalties["body_type_penalty"] = round(p, 3)
                bullets.append(f"Body type is {m.body_type}, which wasn't in your preferred list - small penalty.")
        else:
            penalties["body_type_penalty"] = 0.0
            penalties["body_type_bonus"] = 0.0
            bullets.append("No body-type filter specified; all body styles treated neutrally.")

        dist = 0.0
        dist += fam_w * abs(m.family_score - ideal_f)
        dist += lux_w * abs(m.luxury_score - ideal_l)
        dist += perf_w * abs(m.performance_score - ideal_p)
        shape_pen = 0.8 * dist
        penalties["priority_distance_penalty"] = round(shape_pen, 3)
        if fam_w or lux_w or perf_w:
            bullets.append(
                "Balanced against your stated priorities (family/luxury/performance) using transparent distance penalties."
            )

        if m.powertrain == "ev" and m.range_miles is not None and fam_w > 0:
            rng_bonus = min(1.5, max(0.0, (m.range_miles - 180) / 600.0))
            weighted = fam_w * rng_bonus
            penalties["ev_range_bonus"] = round(weighted, 3)
            bullets.append(f"EV range considered ({m.range_miles} miles) because family practicality is weighted.")
        else:
            penalties["ev_range_bonus"] = 0.0

        bonus_sum = (
            penalties.get("budget_headroom_bonus", 0.0)
            + penalties.get("body_type_bonus", 0.0)
            + penalties.get("ev_range_bonus", 0.0)
        )
        penalty_sum = (
            penalties.get("over_budget_penalty", 0.0)
            + penalties.get("under_seat_penalty", 0.0)
            + penalties.get("powertrain_penalty", 0.0)
            + penalties.get("body_type_penalty", 0.0)
            + penalties.get("priority_distance_penalty", 0.0)
        )

        total = float(penalties["priority_match"] + bonus_sum - penalty_sum)

        dedup_bullets: list[str] = []
        seen = set()
        for b in bullets:
            if b in seen:
                continue
            seen.add(b)
            dedup_bullets.append(b)

        scored.append((total, m, dedup_bullets, penalties))
        debug_rows[m.model_id] = {
            "total_score": round(total, 4),
            "penalties": penalties,
            "bullets": dedup_bullets,
        }

    scored.sort(key=lambda x: x[0], reverse=True)

    top = scored[:3]
    items: list[RecommendationItem] = []
    for total, m, bullets, _pen in top:
        items.append(
            RecommendationItem(
                model_id=m.model_id,
                model_name=m.model_name,
                price_gbp=m.price_gbp,
                body_type=m.body_type,
                powertrain=m.powertrain,
                range_miles=m.range_miles,
                seats=m.seats,
                performance_score=m.performance_score,
                family_score=m.family_score,
                luxury_score=m.luxury_score,
                total_score=float(round(total, 4)),
                explanation_bullets=bullets,
            )
        )

    debug = {"models": debug_rows, "ideal_scores": {"family": ideal_f, "luxury": ideal_l, "performance": ideal_p}}
    return items, debug


def models_preview(rows: list[dict[str, Any]], n: int = 5) -> Any:
    return rows[:n]
