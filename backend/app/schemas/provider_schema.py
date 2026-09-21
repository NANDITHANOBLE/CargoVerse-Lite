from pydantic import BaseModel, Field

class ProviderCreate(BaseModel):
    company_name: str
    gst_number: str
    pan_number: str
    fleet_size: int
    transport_mode: str

class ProviderInspection(BaseModel):
    doc_score: float = Field(ge=0, le=100)
    infra_score: float = Field(ge=0, le=100)
    compliance_score: float = Field(ge=0, le=100)
    fleet_score: float = Field(ge=0, le=100)

class ProviderOut(BaseModel):
    id: str
    company_name: str
    gst_number: str
    pan_number: str
    fleet_size: int
    transport_mode: str
    status: str
    doc_score: float
    infra_score: float
    compliance_score: float
    fleet_score: float
    final_score: float
    trust_score: float

    class Config:
        from_attributes = True