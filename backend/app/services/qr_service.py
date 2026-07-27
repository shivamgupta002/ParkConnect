### handles PNG generation, Cloudinary upload, and the "deactivate old QR → create new one → link to vehicle" workflow.
"""
QR code generation and issuance.

Two responsibilities live here rather than in the router:
  1. Rendering a token into a PNG and uploading it to Cloudinary (the parts
     that talk to an external SDK, so tests can mock this module cleanly).
  2. issue_qr_for_vehicle(): the actual "create a new QR, deactivate the old
     one, link it to the vehicle" workflow, so the router stays thin and this
     logic is reusable/testable on its own.
"""
import io
import secrets

import cloudinary
import cloudinary.uploader
import qrcode

from app.config import settings
from app.models.qr_code import QRCode
from app.models.vehicle import Vehicle

# cloudinary.config() reads CLOUDINARY_URL from the environment automatically,
# but we pass it explicitly from settings so the app fails at startup (via
# Settings validation) rather than silently no-op-ing an upload later if the
# env var is missing.

# cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL) 
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)



def generate_qr_png_bytes(data: str) -> bytes:
    """Renders `data` (the public scan URL) into a PNG and returns raw bytes."""
    img = qrcode.make(data)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


def upload_qr_image(png_bytes: bytes, public_id: str) -> str:
    """Uploads PNG bytes to Cloudinary and returns the secure_url."""
    result = cloudinary.uploader.upload(
        io.BytesIO(png_bytes),
        public_id=public_id,
        folder="parkconnect/qr_codes",
        overwrite=True,
        resource_type="image",
    )
    return result["secure_url"]


async def issue_qr_for_vehicle(vehicle: Vehicle) -> QRCode:
    """
    Creates a new active QRCode for `vehicle`, deactivating any prior active
    QR the vehicle had (rather than deleting it, so old scan/call history
    stays attributable to a real QR document instead of a dangling id).

    Returns the newly created QRCode document (already saved, with
    qr_image_url populated and vehicle.qr_code_id pointed at it).
    """
    # Deactivate the vehicle's current QR, if any, before issuing a new one.
    if vehicle.qr_code_id is not None:
        old_qr = await QRCode.get(vehicle.qr_code_id.ref.id)
        if old_qr is not None and old_qr.is_active:
            old_qr.is_active = False
            await old_qr.save()

    token = secrets.token_urlsafe(24)

    qr = QRCode(token=token, vehicle=vehicle, is_active=True)
    await qr.insert()

    scan_url = f"{settings.FRONTEND_URL}/vehicle/{token}"
    png_bytes = generate_qr_png_bytes(scan_url)
    qr.qr_image_url = upload_qr_image(png_bytes, public_id=str(qr.id))
    await qr.save()

    vehicle.qr_code_id = qr
    await vehicle.save()

    return qr

