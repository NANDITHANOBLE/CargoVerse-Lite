import datetime

from pydantic import BaseModel

class NotificationOut(BaseModel):
    id: str
    user_id: str
    message: str
    channel: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
