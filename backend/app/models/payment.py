import datetime
import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, String

from app.database import Base


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    failed = "failed"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String, ForeignKey("bookings.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    method = Column(String, default="mock_gateway")
    transaction_ref = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
