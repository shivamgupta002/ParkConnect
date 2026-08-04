from pydantic import BaseModel


class SuspendUserRequest(BaseModel):
    suspended: bool