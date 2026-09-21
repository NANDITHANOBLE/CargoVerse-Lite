import datetime
import uuid

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, String

from app.database import Base
from app.models.provider import TransportMode

def generate_container_id() -> str:
    return "CNT" + str(uuid.uuid4())[:6].upper()

class Container(Base):
    __tablename__ = "containers"

    id = Column(String, primary_key=True, default=generate_container_id)
    provider_id = Column(String, ForeignKey("providers.id"), nullable=False)
    mode = Column(Enum(TransportMode), nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_date = Column(DateTime, nullable=False)
    capacity_tons = Column(Float, nullable=False)
    available_space_cbm = Column(Float, nullable=False)
    price_per_cbm = Column(Float, nullable=False)
    transit_days = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)