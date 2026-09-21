from fastapi import FastAPI
app = FastAPI(TITLE="CargoVerse AI Lite",version = "0.1.0")
@app.get("/health")
def health():
    return {"status":"online","service":"CargoVerse AI Lite","version":"0.1.0"}