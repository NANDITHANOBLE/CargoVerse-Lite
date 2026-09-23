import datetime
import uuid

from sqlalchemy import Boolean, Column, DateTime, String, Text

from app.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = Column(String, nullable=False)
    receiver_id = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    file_url = Column(String, nullable=True)
    seen = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
