from pydantic import BaseModel

class ContainerCandidate(BaseModel):
    container_id: str
    price_per_cbm: float
    transit_days: float
    trust_score: float
    available_space_cbm: float

class RecommendationRequest(BaseModel):
    candidates: list[ContainerCandidate]
    current_choice_id: str

class RecommendationResponse(BaseModel):
    best_container_id: str
    value_score: float
    savings_per_cbm: float
    faster_by_days: float
    is_current_already_best: bool