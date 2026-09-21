import datetime

from pydantic import BaseModel, Field

class ContainerCreate(BaseModel):
    mode: str
    origin: str
    destination: str
    departure_date: datetime.datetime
    capacity_tons: float = Field(gt=0)
    available_space_cbm: float = Field(gt=0)
    price_per_cbm: float = Field(gt=0)
    transit_days: float = Field(ge=0, default=0)

class ContainerUpdate(BaseModel):
    available_space_cbm: float | None = Field(default=None, gt=0)
    price_per_cbm: float | None = Field(default=None, gt=0)
    departure_date: datetime.datetime | None = None

class ContainerOut(BaseModel):
    id: str
    provider_id: str
    mode: str
    origin: str
    destination: str
    departure_date: datetime.datetime
    capacity_tons: float
    available_space_cbm: float
    price_per_cbm: float
    transit_days: float

    class Config:
        from_attributes = True