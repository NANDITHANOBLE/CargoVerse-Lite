from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.database import get_db
from app.models.provider import Provider, ProviderStatus
from app.schemas.provider_schema import ProviderCreate, ProviderInspection, ProviderOut

router = APIRouter(prefix="/providers", tags=["Provider Verification"])

@router.post("/", response_model=ProviderOut)
def create_provider_profile(
    payload: ProviderCreate,
    user=Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    existing = db.query(Provider).filter(Provider.user_id == user.id).first()
    if existing:
        raise HTTPException(400, "Provider profile already exists for this account")

    provider = Provider(user_id=user.id, **payload.dict())
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider

@router.get("/me", response_model=ProviderOut)
def get_my_provider_profile(
    user=Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    provider = db.query(Provider).filter(Provider.user_id == user.id).first()
    if not provider:
        raise HTTPException(404, "Provider profile not found")
    return provider

@router.get("/pending", response_model=list[ProviderOut])
def list_pending(
    user=Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    return db.query(Provider).filter(Provider.status == ProviderStatus.pending).all()

@router.get("/", response_model=list[ProviderOut])
def list_all_providers(
    user=Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    return db.query(Provider).all()

@router.post("/{provider_id}/schedule-inspection", response_model=ProviderOut)
def schedule_inspection(
    provider_id: str,
    user=Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(404, "Provider not found")

    provider.status = ProviderStatus.inspection_scheduled
    db.commit()
    db.refresh(provider)
    return provider

@router.post("/{provider_id}/score", response_model=ProviderOut)
def submit_inspection_score(
    provider_id: str,
    scores: ProviderInspection,
    user=Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    provider = db.query(Provider).filter(Provider.id == provider_id).first()
    if not provider:
        raise HTTPException(404, "Provider not found")

    provider.doc_score = scores.doc_score
    provider.infra_score = scores.infra_score
    provider.compliance_score = scores.compliance_score
    provider.fleet_score = scores.fleet_score
    provider.compute_final_score()
    provider.trust_score = round(provider.final_score / 10, 1)

    db.commit()
    db.refresh(provider)
    return provider
