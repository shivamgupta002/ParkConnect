from datetime import datetime
from typing import Literal, Optional

from beanie import Document, Link
from pydantic import Field

from app.models.user import User

SubscriptionPlan = Literal["free", "premium"]
SubscriptionStatus = Literal["active", "expired", "cancelled"]


class Subscription(Document):
    user: Link[User]
    plan: SubscriptionPlan = "free"
    status: SubscriptionStatus = "active"
    start_date: datetime = Field(default_factory=datetime.utcnow)
    end_date: Optional[datetime] = None

    class Settings:
        name = "subscriptions"
