from fastapi import FastAPI
from app.database import Base, engine
from app.models import user  # noqa: F401 — ensures model is registered
from app.routers import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CargoVerse AI Lite", version="0.1.0")

app.include_router(auth.router)

@app.get("/health")
def health():
    return {"status": "online", "service": "CargoVerse AI Lite"}