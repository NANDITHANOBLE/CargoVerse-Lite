import datetime

from pydantic import BaseModel


class MarketplaceResult(BaseModel):
    container_id: str
    provider_name: str
    route: str
    mode: str
    departure_date: datetime.datetime
    available_space_cbm: float
    capacity_tons: float
    price_per_cbm: float
    transit_days: float
    trust_score: float
