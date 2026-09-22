
import datetime

from pydantic import BaseModel

class PaymentInitiate(BaseModel):
    booking_id: str
    method: str = "mock_gateway"

class PaymentOut(BaseModel):
    id: str
    booking_id: str
    amount: float
    status: str
    method: str
    transaction_ref: str | None
    created_at: datetime.datetime

    class Config:
        from_attributes = True
