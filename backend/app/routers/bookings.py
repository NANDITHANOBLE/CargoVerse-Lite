from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.core.websocket_manager import capacity_manager
from app.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.container import Container
from app.schemas.booking_schema import BookingCreate, BookingOut, PriceBreakdown

router = APIRouter(prefix="/bookings", tags=["Booking Engine"])

GST_RATE = 0.18
INSURANCE_RATE = 0.02
DOCUMENTATION_FEE = 250

def calculate_price(volume_cbm: float, price_per_cbm: float) -> PriceBreakdown:
    base_amount = round(volume_cbm * price_per_cbm, 2)
    gst = round(base_amount * GST_RATE, 2)
    insurance = round(base_amount * INSURANCE_RATE, 2)
    total = round(base_amount + gst + insurance + DOCUMENTATION_FEE, 2)
    return PriceBreakdown(
        base_amount=base_amount,
        gst=gst,
        insurance_fee=insurance,
        documentation_fee=DOCUMENTATION_FEE,
        total_amount=total,
    )

@router.get("/quote/{container_id}", response_model=PriceBreakdown)
def get_price_quote(
    container_id: str,
    volume_cbm: float,
    db: Session = Depends(get_db),
):
    container = db.query(Container).filter(Container.id == container_id).first()
    if not container:
        raise HTTPException(404, "Container not found")
    if volume_cbm > container.available_space_cbm:
        raise HTTPException(400, "Requested volume exceeds available space")

    return calculate_price(volume_cbm, container.price_per_cbm)

@router.post("/", response_model=BookingOut)
async def create_booking(
    payload: BookingCreate,
    user=Depends(require_role("trader")),
    db: Session = Depends(get_db),
):
    container = db.query(Container).filter(Container.id == payload.container_id).first()
    if not container:
        raise HTTPException(404, "Container not found")

    if container.available_space_cbm < payload.volume_cbm:
        raise HTTPException(400, "Insufficient available space for this booking")

    pricing = calculate_price(payload.volume_cbm, container.price_per_cbm)

    booking = Booking(
        container_id=container.id,
        trader_id=user.id,
        volume_cbm=payload.volume_cbm,
        weight_tons=payload.weight_tons,
        base_amount=pricing.base_amount,
        gst=pricing.gst,
        insurance_fee=pricing.insurance_fee,
        documentation_fee=pricing.documentation_fee,
        total_amount=pricing.total_amount,
        status=BookingStatus.booked,
    )

    container.available_space_cbm -= payload.volume_cbm

    db.add(booking)
    db.commit()
    db.refresh(booking)
    db.refresh(container)

    # Real-time broadcast: notify any connected WebSocket clients watching this container
    await capacity_manager.broadcast(
        container.id,
        {
            "type": "capacity_update",
            "container_id": container.id,
            "available_space_cbm": container.available_space_cbm,
        },
    )

    return booking

@router.get("/mine", response_model=list[BookingOut])
def list_my_bookings(
    user=Depends(require_role("trader")),
    db: Session = Depends(get_db),
):
    return db.query(Booking).filter(Booking.trader_id == user.id).all()

@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(
    booking_id: str,
    user=Depends(require_role("trader", "admin", "provider")),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    return booking
