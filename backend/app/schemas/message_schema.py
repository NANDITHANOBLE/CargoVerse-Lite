import datetime

from pydantic import BaseModel


class MessageOut(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    message: str
    file_url: str | None
    seen: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
