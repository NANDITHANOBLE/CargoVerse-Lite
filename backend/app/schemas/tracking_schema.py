
from pydantic import BaseModel

class TrackingStatus(BaseModel):
    booking_id: str
    status: str
    progress: int
