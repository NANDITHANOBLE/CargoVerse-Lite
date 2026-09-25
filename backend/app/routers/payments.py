import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.schemas.payment_schema import PaymentInitiate, PaymentOut
from app.utils.notifier import send_notification

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/initiate", response_model=PaymentOut)
async def initiate_payment(
    payload: PaymentInitiate,
    user=Depends(require_role("trader")),
    db: Session = Depends(get_db),
):
    booking = db.query(Booking).filter(Booking.id == payload.booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking.trader_id != user.id:
        raise HTTPException(403, "This booking does not belong to you")

    existing_success = (
        db.query(Payment)
        .filter(Payment.booking_id == booking.id, Payment.status == PaymentStatus.success)
        .first()
    )
    if existing_success:
        raise HTTPException(400, "This booking has already been paid for")

    payment = Payment(
        booking_id=booking.id,
        amount=booking.total_amount,
        method=payload.method,
        status=PaymentStatus.pending,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment

@router.post("/{payment_id}/confirm", response_model=PaymentOut)
async def confirm_payment(
    payment_id: str,
    user=Depends(require_role("trader")),
    db: Session = Depends(get_db),
):
    """
    Simulates a successful payment gateway callback.
    In production, this would be triggered by a webhook from Razorpay/Stripe/etc.
    """
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(404, "Payment not found")

    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if not booking or booking.trader_id != user.id:
        raise HTTPException(403, "Not authorized for this payment")

    payment.status = PaymentStatus.success
    payment.transaction_ref = f"TXN-{str(uuid.uuid4())[:8].upper()}"

    booking.status = BookingStatus.confirmed

    db.commit()
    db.refresh(payment)

    await send_notification(user.id, f"Payment successful for booking {booking.id}. Amount: ₹{payment.amount}")

    return payment

@router.post("/{payment_id}/fail", response_model=PaymentOut)
async def fail_payment(
    payment_id: str,
    user=Depends(require_role("trader")),
    db: Session = Depends(get_db),
):
    """Simulates a failed payment gateway callback (for testing failure flows)."""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(404, "Payment not found")

    payment.status = PaymentStatus.failed
    db.commit()
    db.refresh(payment)
    return payment

@router.get("/booking/{booking_id}", response_model=list[PaymentOut])
def get_payments_for_booking(
    booking_id: str,
    user=Depends(require_role("trader", "admin")),
    db: Session = Depends(get_db),
):
    return db.query(Payment).filter(Payment.booking_id == booking_id).all()
