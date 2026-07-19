"""QR code model — maps a public token to a vehicle."""
from datetime import datetime
from typing import Optional

import pymongo
from beanie import Document, Link
from pydantic import Field

from app.models.vehicle import Vehicle


class QRCode(Document):
    token: str  # secrets.token_urlsafe(24), public-facing identifier
    vehicle: Link[Vehicle]
    qr_image_url: Optional[str] = None
    is_active: bool = True
    scan_count: int = 0
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "qr_codes"
        indexes = [
            pymongo.IndexModel("token", unique=True),
        ]
