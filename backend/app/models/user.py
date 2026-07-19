from datetime import datetime

from beanie import Document, Insert, Replace, before_event
from pydantic import EmailStr, Field
from pymongo import ASCENDING, IndexModel


class User(Document):
    full_name: str
    email: EmailStr
    phone_number: str  # E.164 format, e.g. "+919876543210"
    hashed_password: str
    is_verified: bool = False
    is_admin: bool = False
    is_premium: bool = False

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = [
            IndexModel([("email", ASCENDING)], unique=True),
            IndexModel([("phone_number", ASCENDING)], unique=True),
        ]

    @before_event(Insert)
    async def _stamp_on_insert(self) -> None:
        now = datetime.utcnow()
        self.created_at = now
        self.updated_at = now

    @before_event(Replace)
    async def _stamp_on_update(self) -> None:
        self.updated_at = datetime.utcnow()
