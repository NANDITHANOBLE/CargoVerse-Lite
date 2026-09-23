import datetime
import enum
import uuid

from sqlalchemy import Boolean, Column, DateTime, Enum, String

from app.database import Base

class NotificationChannel(str, enum.Enum):
    in_app = "in_app"
    email = "email"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    message = Column(String, nullable=False)
    channel = Column(Enum(NotificationChannel), default=NotificationChannel.in_app)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)