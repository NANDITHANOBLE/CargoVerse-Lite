"""
Basic notification dispatcher.
Currently a no-op placeholder that logs to console — will be wired to
WebSockets (Module 9: Notification Center) in a later step.
"""

async def send_notification(user_id: str, message: str, channel: str = "in_app") -> dict:
    print(f"[NOTIFICATION -> {user_id}] ({channel}): {message}")
    return {"user_id": user_id, "message": message, "channel": channel}