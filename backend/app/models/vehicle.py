from datetime import datetime
from typing import TYPE_CHECKING, Literal, Optional

from beanie import Document, Insert, Link, Replace, before_event
from pydantic import Field
from pymongo import ASCENDING, IndexModel

from app.models.user import User

if TYPE_CHECKING:
    # Only needed for type checkers/IDEs — at runtime this is a deferred forward
    # reference, resolved in app/models/__init__.py via Vehicle.model_rebuild()
    # once QRCode has also been imported. This avoids vehicle.py <-> qr_code.py
    # trying to import each other directly at module load time.
    from app.models.qr_code import QRCode


class Vehicle(Document):
    owner: Link[User]
    vehicle_type: Literal["car", "bike"]
    vehicle_number: str
    brand: str
    model: str
    color: str
    emergency_contact: str
    qr_code_id: Optional[Link["QRCode"]] = None
    is_active: bool = True

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "vehicles"
        indexes = [
            IndexModel([("vehicle_number", ASCENDING)], unique=True),
        ]

    @before_event(Insert)
    async def _stamp_on_insert(self) -> None:
        now = datetime.utcnow()
        self.created_at = now
        self.updated_at = now

    @before_event(Replace)
    async def _stamp_on_update(self) -> None:
        self.updated_at = datetime.utcnow()
