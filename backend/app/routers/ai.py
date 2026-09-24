from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.database import get_db
from app.ml.recommendation_engine import recommend_best
from app.models.container import Container
from app.models.provider import Provider
from app.schemas.ai_schema import RecommendationRequest, RecommendationResponse

router = APIRouter(prefix="/ai", tags=["AI - Recommendation Engine"])

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
    """
    Convenience endpoint: automatically pulls all approved-provider containers
    matching the given route and runs the recommendation engine on them,
    without requiring the client to manually assemble the candidates list.
    """
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