from datetime import datetime
from typing import Any

from beanie import Document, Link
from pydantic import Field

from app.models.user import User


class AuditLog(Document):
    """Not one of the original 8 collections — added to satisfy the audit-log
    requirement in the Security Design section. Used by the admin panel (Phase 8)
    to record every suspend/unsuspend, report status change, etc."""

    admin_user: Link[User]
    action: str
    target_type: str
    target_id: str
    meta: dict[str, Any] = Field(default_factory=dict)

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "audit_logs"
