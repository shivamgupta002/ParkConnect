from datetime import datetime
from typing import Literal, Optional

from beanie import Document, Link
from pydantic import Field

from app.models.user import User
from app.models.vehicle import Vehicle

CallStatus = Literal[
    "initiating", "ringing", "in-progress", "completed", "no-answer", "failed"
]


class Call(Document):
    vehicle: Link[Vehicle]
    owner: Link[User]
    twilio_call_sid: Optional[str] = None
    status: CallStatus = "initiating"
    duration_seconds: Optional[int] = None
    # Only ever store a redacted form of the scanner's number (see Phase 5) —
    # never the full number, even here in the owner's own call history.
    scanner_masked_number: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = None

    class Settings:
        name = "calls"
