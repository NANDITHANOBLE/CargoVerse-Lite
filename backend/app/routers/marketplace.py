import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.container import Container
from app.models.provider import Provider, ProviderStatus
from app.schemas.marketplace_schema import MarketplaceResult

router = APIRouter(prefix="/marketplace", tags=["Cargo Marketplace"])

@router.get("/search", response_model=list[MarketplaceResult])
def search_containers(
    origin: str | None = Query(default=None),
    destination: str | None = Query(default=None),
    mode: str | None = Query(default=None, description="road, rail, air, or sea"),
    date_from: datetime.datetime | None = Query(default=None),
    min_volume: float = Query(default=0, ge=0, description="Minimum required CBM"),
    min_weight: float = Query(default=0, ge=0, description="Minimum required tons"),
    max_price: float | None = Query(default=None, gt=0, description="Max price per CBM"),
    sort_by: str = Query(default="price", description="price, trust_score, or transit_days"),
    db: Session = Depends(get_db),
):
    query = (
        db.query(Container, Provider)
        .join(Provider, Container.provider_id == Provider.id)
        .filter(Provider.status == ProviderStatus.approved)
    )

    if origin:
        query = query.filter(Container.origin.ilike(f"%{origin}%"))
    if destination:
        query = query.filter(Container.destination.ilike(f"%{destination}%"))
    if mode:
        query = query.filter(Container.mode == mode)
    if date_from:
        query = query.filter(Container.departure_date >= date_from)
    if max_price:
        query = query.filter(Container.price_per_cbm <= max_price)

    query = query.filter(Container.available_space_cbm >= min_volume)
    query = query.filter(Container.capacity_tons >= min_weight)

    results = []
    for container, provider in query.all():
        results.append(
            MarketplaceResult(
                container_id=container.id,
                provider_name=provider.company_name,
                route=f"{container.origin} → {container.destination}",
                mode=container.mode.value if hasattr(container.mode, "value") else container.mode,
                departure_date=container.departure_date,
                available_space_cbm=container.available_space_cbm,
                capacity_tons=container.capacity_tons,
                price_per_cbm=container.price_per_cbm,
                transit_days=container.transit_days,
                trust_score=provider.trust_score,
            )
        )

    reverse = sort_by == "trust_score"
    if sort_by in ("price", "transit_days"):
        results.sort(key=lambda r: getattr(r, "price_per_cbm" if sort_by == "price" else "transit_days"))
    elif sort_by == "trust_score":
        results.sort(key=lambda r: r.trust_score, reverse=True)

    return results

@router.get("/routes", response_model=list[str])
def list_available_routes(db: Session = Depends(get_db)):
    """Returns unique origin-destination pairs currently listed, for building UI filter dropdowns."""
    containers = (
        db.query(Container)
        .join(Provider, Container.provider_id == Provider.id)
        .filter(Provider.status == ProviderStatus.approved)
        .all()
    )
    routes = sorted({f"{c.origin} → {c.destination}" for c in containers})
    return routes