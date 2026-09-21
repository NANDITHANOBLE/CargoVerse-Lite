from fastapi import FastAPI
from app.database import Base, engine
from app.models import user

Base.metadata.create_all(bind=engine)
  # noqa: I001
app = FastAPI(TITLE="CargoVerse AI Lite",version = "0.1.0")
@app.get("/health")
def health():
    return {"status":"online","service":"CargoVerse AI Lite","version":"0.1.0"}