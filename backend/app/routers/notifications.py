from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.notification import Notification
from app.schemas.notification_schema import NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notification Center"])

@router.get("/", response_model=list[NotificationOut])
def list_my_notifications(
    unread_only: bool = False,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Notification).filter(Notification.user_id == user.id)
    if unread_only:
        query = query.filter(Notification.is_read == False)  # noqa: E712
    return query.order_by(Notification.created_at.desc()).all()

@router.get("/unread-count")
def unread_count(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    count = (
        db.query(Notification)
        .filter(Notification.user_id == user.id, Notification.is_read == False)  # noqa: E712
        .count()
    )
    return {"unread_count": count}

@router.post("/{notification_id}/read", response_model=NotificationOut)
def mark_as_read(
    notification_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(404, "Notification not found")
    if notification.user_id != user.id:
        raise HTTPException(403, "This notification does not belong to you")

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

@router.post("/read-all")
def mark_all_as_read(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.query(Notification).filter(
        Notification.user_id == user.id, Notification.is_read == False  # noqa: E712
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}