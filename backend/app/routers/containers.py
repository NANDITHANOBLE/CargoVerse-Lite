from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.database import get_db
from app.models.container import Container
from app.models.provider import Provider, ProviderStatus
from app.schemas.container_schema import ContainerCreate, ContainerOut, ContainerUpdate

router = APIRouter(prefix="/containers", tags=["Cargo Space Management"])

def _get_approved_provider_or_403(user, db: Session) -> Provider:
    provider = db.query(Provider).filter(Provider.user_id == user.id).first()
    if not provider:
        raise HTTPException(404, "Provider profile not found. Create one before listing cargo space.")
    if provider.status != ProviderStatus.approved:
        raise HTTPException(403, "Provider must be approved before listing cargo space")
    return provider

@router.post("/", response_model=ContainerOut)
def add_container(
    payload: ContainerCreate,
    user=Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    provider = _get_approved_provider_or_403(user, db)

    container = Container(provider_id=provider.id, **payload.dict())
    db.add(container)
    db.commit()
    db.refresh(container)
    return container

@router.get("/mine", response_model=list[ContainerOut])
def list_my_containers(
    user=Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    provider = db.query(Provider).filter(Provider.user_id == user.id).first()
    if not provider:
        raise HTTPException(404, "Provider profile not found")
    return db.query(Container).filter(Container.provider_id == provider.id).all()

@router.get("/{container_id}", response_model=ContainerOut)
def get_container(container_id: str, db: Session = Depends(get_db)):
    container = db.query(Container).filter(Container.id == container_id).first()
    if not container:
        raise HTTPException(404, "Container not found")
    return container

@router.patch("/{container_id}", response_model=ContainerOut)
def update_container(
    container_id: str,
    payload: ContainerUpdate,
    user=Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    provider = db.query(Provider).filter(Provider.user_id == user.id).first()
    container = db.query(Container).filter(Container.id == container_id).first()

    if not container:
        raise HTTPException(404, "Container not found")
    if not provider or container.provider_id != provider.id:
        raise HTTPException(403, "You do not own this container")

    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(container, field, value)

    db.commit()
    db.refresh(container)
    return container

@router.delete("/{container_id}")
def delete_container(
    container_id: str,
    user=Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    provider = db.query(Provider).filter(Provider.user_id == user.id).first()
    container = db.query(Container).filter(Container.id == container_id).first()

    if not container:
        raise HTTPException(404, "Container not found")
    if not provider or container.provider_id != provider.id:
        raise HTTPException(403, "You do not own this container")

    db.delete(container)
    db.commit()
    return {"message": f"Container {container_id} deleted successfully"}