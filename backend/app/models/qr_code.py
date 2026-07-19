import secrets
from datetime import datetime
from typing import Optional

from beanie import Document, Link
from pydantic import Field
from pymongo import ASCENDING, IndexModel

from app.models.vehicle import Vehicle


class QRCode(Document):
    token: str = Field(default_factory=lambda: secrets.token_urlsafe(24))
    vehicle: Link[Vehicle]
    qr_image_url: Optional[str] = None
    is_active: bool = True
    scan_count: int = 0
    expires_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "qr_codes"
        indexes = [
            IndexModel([("token", ASCENDING)], unique=True),
        ]
