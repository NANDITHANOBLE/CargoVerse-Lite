from pydantic import BaseModel, Field

class RouteOptimizationRequest(BaseModel):
    distance_km: float = Field(gt=0)
    current_mode: str = Field(description="road, rail, sea, or air")

class RouteOption(BaseModel):
    route: str
    cost_per_kg: float
    transit_days: float

class RouteOptimizationResponse(BaseModel):
    current_route: str
    current_cost_per_kg: float
    current_transit_days: float
    best_route: str
    best_cost_per_kg: float
    best_transit_days: float
    cost_reduced_pct: float
    delivery_faster_days: float
    delivery_slower_days: float
    all_options: list[RouteOption]