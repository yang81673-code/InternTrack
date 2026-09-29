from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend import models, schemas
from backend.database import Base, engine, get_db


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="InternTrack API",
    version="0.1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
@app.delete("/applications/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db)
):
    application = db.get(
        models.Application,
        application_id
    )

    if application is None:
        return {
            "success": False,
            "message": "投递记录不存在"
        }

    db.delete(application)
    db.commit()

    return {
        "success": True,
        "message": "删除成功"
    }
@app.put(
    "/applications/{application_id}",
    response_model=schemas.ApplicationRead
)
def update_application(
    application_id: int,
    application_data: schemas.ApplicationCreate,
    db: Session = Depends(get_db)
):
    application = db.get(
        models.Application,
        application_id
    )

    if application is None:
        raise HTTPException(
            status_code=404,
            detail="投递记录不存在"
        )

    application.company = application_data.company
    application.position = application_data.position
    application.category = application_data.category
    application.city = application_data.city
    application.status = application_data.status
    application.source = application_data.source
    application.job_url = application_data.job_url
    application.apply_date = application_data.apply_date
    application.notes = application_data.notes

    db.commit()
    db.refresh(application)

    return application