import datetime

from pydantic import BaseModel, Field


class BookingCreate(BaseModel):
    container_id: str
    volume_cbm: float = Field(gt=0)
    weight_tons: float = Field(gt=0)

class BookingOut(BaseModel):
    id: str
    container_id: str
    trader_id: str
    volume_cbm: float
    weight_tons: float
    base_amount: float
    gst: float
    insurance_fee: float
    documentation_fee: float
    total_amount: float
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class PriceBreakdown(BaseModel):
    base_amount: float
    gst: float
    insurance_fee: float
    documentation_fee: float
    total_amount: float
