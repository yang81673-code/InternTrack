from fastapi import FastAPI

from backend import models
from backend.database import Base, engine


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="InternTrack API",
    version="0.1.0"
)


@app.get("/")
def home():
    return {
        "message": "Welcome to InternTrack"
    }