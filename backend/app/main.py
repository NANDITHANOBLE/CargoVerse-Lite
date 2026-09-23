from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import booking as booking_model  # noqa: F401
from app.models import container as container_model  # noqa: F401
from app.models import message as message_model  # noqa: F401
from app.models import notification as notification_model  # noqa: F401
from app.models import payment as payment_model  # noqa: F401
from app.models import provider as provider_model  # noqa: F401
from app.models import user as user_model  # noqa: F401
from app.routers import (
    auth,
    bookings,
    chat,
    containers,
    marketplace,
    notifications,
    payments,
    providers,
    tracking,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CargoVerse AI Lite", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(providers.router)
app.include_router(containers.router)
app.include_router(marketplace.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(chat.router)
app.include_router(tracking.router)
app.include_router(notifications.router)

@app.get("/health")
def health():
    return {"status": "online", "service": "CargoVerse AI Lite"}