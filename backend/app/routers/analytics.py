from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_role
from app.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.container import Container
from app.models.payment import Payment, PaymentStatus
from app.models.provider import Provider, ProviderStatus
from app.schemas.analytics_schema import AdminAnalytics, ProviderAnalytics, TraderAnalytics

router = APIRouter(prefix="/analytics", tags=["Analytics Dashboard"])

@router.get("/admin", response_model=AdminAnalytics)
def admin_dashboard(
    user=Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    total_revenue = (
        db.query(func.sum(Payment.amount))
        .filter(Payment.status == PaymentStatus.success)
        .scalar()
        or 0
    )
    total_providers = (
        db.query(Provider).filter(Provider.status == ProviderStatus.approved).count()
    )
    total_bookings = db.query(Booking).count()
    pending_approvals = (
        db.query(Provider).filter(Provider.status == ProviderStatus.pending).count()
    )

    total_capacity = db.query(func.sum(Container.capacity_tons)).scalar() or 1
    available_capacity = db.query(func.sum(Container.available_space_cbm)).scalar() or 0
    occupancy_rate = round((1 - (available_capacity / total_capacity)) * 100, 1)
    occupancy_rate = max(occupancy_rate, 0.0)

    return AdminAnalytics(
        total_revenue=total_revenue,
        providers=total_providers,
        bookings=total_bookings,
        pending_approvals=pending_approvals,
        occupancy_rate=occupancy_rate,
    )

@router.get("/provider", response_model=ProviderAnalytics)
def provider_dashboard(
    user=Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    provider = db.query(Provider).filter(Provider.user_id == user.id).first()
    if not provider:
        raise HTTPException(404, "Provider profile not found")

    containers = db.query(Container).filter(Container.provider_id == provider.id).all()
    container_ids = [c.id for c in containers]

    bookings = (
        db.query(Booking).filter(Booking.container_id.in_(container_ids)).all()
        if container_ids
        else []
    )

    revenue = sum(b.total_amount for b in bookings)
    available_capacity = sum(c.available_space_cbm for c in containers)

    return ProviderAnalytics(
        revenue=revenue,
        available_capacity_cbm=available_capacity,
        total_bookings=len(bookings),
        customer_rating=provider.trust_score,
    )

@router.get("/trader", response_model=TraderAnalytics)
def trader_dashboard(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bookings = db.query(Booking).filter(Booking.trader_id == user.id).all()

    expenses = sum(b.total_amount for b in bookings)
    active = len([b for b in bookings if b.status != BookingStatus.delivered])
    saved_cost_estimate = round(expenses * 0.15, 2)

    return TraderAnalytics(
        bookings=len(bookings),
        expenses=expenses,
        active_shipments=active,
        saved_cost_estimate=saved_cost_estimate,
    )