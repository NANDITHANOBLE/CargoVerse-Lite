from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.database import get_db
from app.ml.pricing_model import predictor
from app.ml.recommendation_engine import recommend_best
from app.ml.route_optimizer import optimize_route
from app.models.container import Container
from app.models.provider import Provider
from app.schemas.ai_schema import RecommendationRequest, RecommendationResponse
from app.schemas.pricing_schema import PricingForecastRequest, PricingForecastResponse
from app.schemas.route_schema import RouteOptimizationRequest, RouteOptimizationResponse

router = APIRouter(prefix="/ai", tags=["AI Modules"])

VALID_MODES = {"road", "rail", "sea", "air"}

@router.post("/recommend", response_model=RecommendationResponse)
def recommend_container(
    payload: RecommendationRequest,
    user=Depends(require_role("trader")),
):
    if len(payload.candidates) < 2:
        raise HTTPException(400, "At least 2 candidate containers are required for a meaningful recommendation")

    ids = [c.container_id for c in payload.candidates]
    if payload.current_choice_id not in ids:
        raise HTTPException(400, "current_choice_id must be one of the provided candidates")

    candidates_dicts = [c.dict() for c in payload.candidates]
    result = recommend_best(candidates_dicts, payload.current_choice_id)
    return result

@router.get("/recommend/by-route", response_model=RecommendationResponse)
def recommend_for_route(
    origin: str,
    destination: str,
    current_choice_id: str,
    user=Depends(require_role("trader")),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(Container, Provider)
        .join(Provider, Container.provider_id == Provider.id)
        .filter(Container.origin.ilike(f"%{origin}%"))
        .filter(Container.destination.ilike(f"%{destination}%"))
        .all()
    )

    if len(rows) < 2:
        raise HTTPException(400, "At least 2 containers on this route are required for a recommendation")

    candidates_dicts = [
        {
            "container_id": container.id,
            "price_per_cbm": container.price_per_cbm,
            "transit_days": container.transit_days,
            "trust_score": provider.trust_score,
            "available_space_cbm": container.available_space_cbm,
        }
        for container, provider in rows
    ]

    ids = [c["container_id"] for c in candidates_dicts]
    if current_choice_id not in ids:
        raise HTTPException(400, "current_choice_id not found among containers on this route")

    result = recommend_best(candidates_dicts, current_choice_id)
    return result

@router.post("/pricing-forecast", response_model=PricingForecastResponse)
def pricing_forecast(
    payload: PricingForecastRequest,
    user=Depends(require_role("trader")),
):
    result = predictor.predict(payload.dict())
    return result

@router.post("/optimize-route", response_model=RouteOptimizationResponse)
def optimize_route_endpoint(
    payload: RouteOptimizationRequest,
    user=Depends(require_role("trader")),
):
    mode = payload.current_mode.lower()
    if mode not in VALID_MODES:
        raise HTTPException(400, f"current_mode must be one of {sorted(VALID_MODES)}")

    result = optimize_route(payload.distance_km, mode)
    return result