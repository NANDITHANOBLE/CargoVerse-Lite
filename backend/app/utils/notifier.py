"""
Notification dispatcher: persists notifications to the database
and pushes them live to connected users via WebSocket (chat_manager's
per-user socket registry is reused here for a single unified live channel).
"""

from sqlalchemy.orm import Session

from app.core.websocket_manager import chat_manager
from app.database import SessionLocal
from app.models.notification import Notification


async def send_notification(user_id: str, message: str, channel: str = "in_app") -> dict:
    db: Session = SessionLocal()
    try:
        notification = Notification(user_id=user_id, message=message, channel=channel)
        db.add(notification)
        db.commit()
        db.refresh(notification)

        payload = {
            "type": "notification",
            "id": notification.id,
            "message": notification.message,
            "channel": notification.channel.value,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat(),
        }

        await chat_manager.send_to_user(user_id, payload)

        if channel == "email":
            print(f"[EMAIL SIMULATION -> {user_id}]: {message}")

        return payload
    finally:
        db.close()
