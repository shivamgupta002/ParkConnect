from datetime import datetime
from typing import Literal, Optional

from beanie import Document, Link
from pydantic import Field

from app.models.vehicle import Vehicle

ReportType = Literal["wrong_parking", "lights_on", "accident", "emergency", "other"]
ReportStatus = Literal["open", "reviewed", "resolved"]


class Report(Document):
    vehicle: Link[Vehicle]
    report_type: ReportType
    message: str
    reporter_contact: Optional[str] = None
    status: ReportStatus = "open"

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reports"
