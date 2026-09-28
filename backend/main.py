from fastapi import Depends, FastAPI, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.database import Base, engine, get_db


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


@app.post(
    "/applications",
    response_model=schemas.ApplicationRead,
    status_code=status.HTTP_201_CREATED
)
def create_application(
    application: schemas.ApplicationCreate,
    db: Session = Depends(get_db)
):
    db_application = models.Application(
        **application.model_dump()
    )

    db.add(db_application)
    db.commit()
    db.refresh(db_application)

    return db_application


@app.get(
    "/applications",
    response_model=list[schemas.ApplicationRead]
)
def get_applications(
    db: Session = Depends(get_db)
):
    statement = select(models.Application).order_by(
        models.Application.id.desc()
    )

    applications = db.scalars(statement).all()

    return applications