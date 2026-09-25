import datetime
import enum
import uuid

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, String

from app.database import Base


class BookingStatus(str, enum.Enum):
    booked = "booked"
    confirmed = "confirmed"
    in_transit = "in_transit"
    arrived = "arrived"
    delivered = "delivered"

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    container_id = Column(String, ForeignKey("containers.id"), nullable=False)
    trader_id = Column(String, ForeignKey("users.id"), nullable=False)
    volume_cbm = Column(Float, nullable=False)
    weight_tons = Column(Float, nullable=False)
    base_amount = Column(Float, nullable=False)
    gst = Column(Float, default=0)
    insurance_fee = Column(Float, default=0)
    documentation_fee = Column(Float, default=250)
    total_amount = Column(Float, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.booked)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
