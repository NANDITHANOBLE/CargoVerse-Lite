from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.database import get_db
from app.models.booking import Booking, BookingStatus
from app.schemas.tracking_schema import TrackingStatus
from app.utils.notifier import send_notification

router = APIRouter(prefix="/tracking", tags=["Shipment Tracking"])

STATUS_FLOW = [
    BookingStatus.booked,
    BookingStatus.confirmed,
    BookingStatus.in_transit,
    BookingStatus.arrived,
    BookingStatus.delivered,
]

STATUS_MESSAGES = {
    BookingStatus.confirmed: "Your booking has been confirmed.",
    BookingStatus.in_transit: "Your shipment is now in transit.",
    BookingStatus.arrived: "Your shipment has arrived at the destination port.",
    BookingStatus.delivered: "Your shipment has been delivered. Thank you for using CargoVerse!",
}

def _progress_for(status: BookingStatus) -> int:
    idx = STATUS_FLOW.index(status)
    return round((idx + 1) / len(STATUS_FLOW) * 100)

@router.get("/{booking_id}", response_model=TrackingStatus)
def get_status(
    booking_id: str,
    user=Depends(require_role("trader", "provider", "admin")),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")

    return TrackingStatus(
        booking_id=booking.id,
        status=booking.status.value,
        progress=_progress_for(booking.status),
    )

@router.post("/{booking_id}/advance", response_model=TrackingStatus)
async def advance_status(
    booking_id: str,
    user=Depends(require_role("provider", "admin")),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")

    current_idx = STATUS_FLOW.index(booking.status)
    if current_idx + 1 >= len(STATUS_FLOW):
        raise HTTPException(400, "Shipment has already been delivered - no further status to advance to")

    new_status = STATUS_FLOW[current_idx + 1]
    booking.status = new_status
    db.commit()
    db.refresh(booking)

    message = STATUS_MESSAGES.get(new_status, f"Shipment status updated: {new_status.value}")
    await send_notification(booking.trader_id, message)

    return TrackingStatus(
        booking_id=booking.id,
        status=booking.status.value,
        progress=_progress_for(booking.status),
    )