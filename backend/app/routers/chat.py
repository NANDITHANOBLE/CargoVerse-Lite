from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.websocket_manager import chat_manager
from app.database import get_db
from app.models.message import Message
from app.schemas.message_schema import MessageOut

router = APIRouter(prefix="/chat", tags=["Real-Time Chat"])

@router.websocket("/ws/{user_id}")
async def chat_ws(websocket: WebSocket, user_id: str, db: Session = Depends(get_db)):
    await chat_manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "message")

            if msg_type == "typing":
                await chat_manager.send_to_user(
                    data["receiver_id"], {"type": "typing", "sender_id": user_id}
                )
                continue

            msg = Message(
                sender_id=user_id,
                receiver_id=data["receiver_id"],
                message=data.get("message", ""),
                file_url=data.get("file_url"),
            )
            db.add(msg)
            db.commit()
            db.refresh(msg)

            payload = {
                "type": "message",
                "id": msg.id,
                "sender_id": user_id,
                "receiver_id": msg.receiver_id,
                "message": msg.message,
                "file_url": msg.file_url,
                "seen": msg.seen,
                "created_at": msg.created_at.isoformat(),
            }

            delivered = await chat_manager.send_to_user(data["receiver_id"], payload)

            await websocket.send_json({**payload, "delivered": delivered})

    except WebSocketDisconnect:
        chat_manager.disconnect(user_id)

@router.get("/history/{other_user_id}", response_model=list[MessageOut])
def get_chat_history(
    other_user_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    messages = (
        db.query(Message)
        .filter(
            ((Message.sender_id == user.id) & (Message.receiver_id == other_user_id))
            | ((Message.sender_id == other_user_id) & (Message.receiver_id == user.id))
        )
        .order_by(Message.created_at.asc())
        .all()
    )
    return messages

@router.post("/seen/{message_id}", response_model=MessageOut)
def mark_seen(
    message_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(404, "Message not found")
    if msg.receiver_id != user.id:
        raise HTTPException(403, "Only the receiver can mark a message as seen")

    msg.seen = True
    db.commit()
    db.refresh(msg)
    return msg
