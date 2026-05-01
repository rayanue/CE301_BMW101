from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class PowertrainPreference(str, Enum):
    ANY = "any"
    EV_ONLY = "ev_only"
    NO_EV = "no_ev"
    HYBRID_OK = "hybrid_ok"


class RecommendRequest(BaseModel):
    max_budget_gbp: float = Field(..., gt=0)
    min_seats: int | None = Field(default=None, ge=1, le=9)

    preferred_body_types: list[str] = Field(default_factory=list)
    powertrain_preference: PowertrainPreference = Field(default=PowertrainPreference.ANY)

    family_important: bool = False
    luxury_important: bool = False
    performance_important: bool = False

    # weights optional; if null, recommend_models maps the booleans to 0.75
    family_weight: float | None = Field(default=None, ge=0, le=1)
    luxury_weight: float | None = Field(default=None, ge=0, le=1)
    performance_weight: float | None = Field(default=None, ge=0, le=1)


class RecommendationItem(BaseModel):
    model_id: str
    model_name: str
    price_gbp: float
    body_type: str
    powertrain: str
    range_miles: int | None = None
    seats: int

    performance_score: int
    family_score: int
    luxury_score: int

    total_score: float
    explanation_bullets: list[str]


class RecommendResponse(BaseModel):
    recommendations: list[RecommendationItem]
    preferences_echo: RecommendRequest
    debug_scores: dict[str, Any] | None = None


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    recommended_model_ids: list[str] = Field(default_factory=list)


class SourceItem(BaseModel):
    text: str
    metadata: dict[str, Any]


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceItem]
