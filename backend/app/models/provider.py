import datetime
import enum
import uuid

from sqlalchemy import JSON, Column, DateTime, Enum, Float, ForeignKey, Integer, String

from app.database import Base

class ProviderStatus(str, enum.Enum):
    pending = "pending"
    inspection_scheduled = "inspection_scheduled"
    approved = "approved"
    rejected = "rejected"

class TransportMode(str, enum.Enum):
    road = "road"
    rail = "rail"
    air = "air"
    sea = "sea"

class Provider(Base):
    __tablename__ = "providers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    company_name = Column(String, nullable=False)
    gst_number = Column(String, nullable=False)
    pan_number = Column(String, nullable=False)
    fleet_size = Column(Integer, default=0)
    transport_mode = Column(Enum(TransportMode), nullable=False)
    documents = Column(JSON, default={})
    status = Column(Enum(ProviderStatus), default=ProviderStatus.pending)

    doc_score = Column(Float, default=0)
    infra_score = Column(Float, default=0)
    compliance_score = Column(Float, default=0)
    fleet_score = Column(Float, default=0)
    final_score = Column(Float, default=0)
    trust_score = Column(Float, default=0)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    def compute_final_score(self) -> float:
        self.final_score = (
            self.doc_score * 0.30
            + self.infra_score * 0.30
            + self.compliance_score * 0.20
            + self.fleet_score * 0.20
        )
        self.status = (
            ProviderStatus.approved if self.final_score >= 80 else ProviderStatus.rejected
        )
        return self.final_score