from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ApplicationCreate(BaseModel):
    company: str
    position: str
    category: str | None = None
    city: str | None = None
    status: str
    source: str | None = None
    job_url: str | None = None
    apply_date: date | None = None
    notes: str | None = None


class ApplicationRead(ApplicationCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)