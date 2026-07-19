from datetime import datetime
from typing import Literal, Optional

from beanie import Document, Link
from pydantic import Field

from app.models.subscription import Subscription
from app.models.user import User

PaymentStatus = Literal["created", "paid", "failed"]


class Payment(Document):
    user: Link[User]
    subscription: Link[Subscription]
    amount: float
    currency: str = "INR"
    provider: str = "razorpay"
    provider_order_id: Optional[str] = None
    provider_payment_id: Optional[str] = None
    status: PaymentStatus = "created"

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "payments"
