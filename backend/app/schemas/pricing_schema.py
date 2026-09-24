from pydantic import BaseModel, Field

class PricingForecastRequest(BaseModel):
    demand_index: float = Field(ge=0, le=100, description="0 = very low demand, 100 = extremely high demand")
    season_factor: float = Field(ge=0, le=1, description="0 = off-season, 1 = peak season")
    distance_km: float = Field(gt=0)
    days_to_departure: float = Field(ge=0, description="How many days until the container departs")

class PricingForecastResponse(BaseModel):
    trend: str
    confidence: float
    recommendation: str