from fastapi import FastAPI

from app.database import Base, engine
from app.models import booking as booking_model  # noqa: F401
from app.models import container as container_model  # noqa: F401
from app.models import payment as payment_model  # noqa: F401
from app.models import provider as provider_model  # noqa: F401
from app.models import user as user_model  # noqa: F401
from app.routers import auth, bookings, containers, marketplace, payments, providers

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CargoVerse AI Lite", version="0.1.0")

app.include_router(auth.router)
app.include_router(providers.router)
app.include_router(containers.router)
app.include_router(marketplace.router)
app.include_router(bookings.router)
app.include_router(payments.router)

@app.get("/health")
def health():
    return {"status": "online", "service": "CargoVerse AI Lite"}