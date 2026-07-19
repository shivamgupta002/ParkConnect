"""
Round-trip tests for all 9 ParkConnect Beanie models.

Uses mongomock-motor's AsyncMongoMockClient -- an in-memory Motor-compatible
client -- so these tests never touch a real MongoDB instance. Each test creates
one document of a given type with valid data, saves it, fetches it back by id,
and asserts the fields survived the round trip.

Note on Links: we deliberately do NOT pass fetch_links=True when reading
documents back. Beanie resolves fetch_links via a MongoDB aggregation $lookup
with a sub-pipeline, which mongomock (the in-memory fake used here) doesn't
implement. Plain document.linked_field.ref.id gives us the linked id directly
(no extra query needed), and document.linked_field.fetch() -- used once below
to prove it works -- resolves a single Link with a normal find_one, which
mongomock handles fine. Both approaches work identically against a real
MongoDB in production.
"""

from datetime import datetime, timedelta

import pytest
from beanie import init_beanie
from mongomock_motor import AsyncMongoMockClient

from app.models import (
    ALL_MODELS,
    AuditLog,
    Call,
    Notification,
    Payment,
    QRCode,
    Report,
    Subscription,
    User,
    Vehicle,
)


@pytest.fixture(autouse=True)
async def init_test_db():
    """Fresh in-memory database + Beanie registration for every test."""
    client = AsyncMongoMockClient()
    db = client["parkconnect_test"]
    await init_beanie(database=db, document_models=ALL_MODELS)
    yield


async def _make_user(suffix: str = "") -> User:
    user = User(
        full_name=f"Riya Sharma{suffix}",
        email=f"riya{suffix}@example.com",
        phone_number=f"+91987654{suffix or '3210'}",
        hashed_password="not-a-real-hash",
    )
    await user.insert()
    return user


async def _make_vehicle(owner: User, suffix: str = "") -> Vehicle:
    vehicle = Vehicle(
        owner=owner,
        vehicle_type="car",
        vehicle_number=f"KA01AB{suffix or '1234'}",
        brand="Hyundai",
        model="i20",
        color="White",
        emergency_contact="+919876500000",
    )
    await vehicle.insert()
    return vehicle


@pytest.mark.asyncio
async def test_user_roundtrip():
    user = await _make_user()
    fetched = await User.get(user.id)

    assert fetched is not None
    assert fetched.email == "riya@example.com"
    assert fetched.phone_number == "+919876543210"
    assert fetched.is_verified is False
    assert fetched.is_admin is False
    assert fetched.is_premium is False
    assert isinstance(fetched.created_at, datetime)
    assert isinstance(fetched.updated_at, datetime)


@pytest.mark.asyncio
async def test_vehicle_roundtrip():
    owner = await _make_user()
    vehicle = await _make_vehicle(owner)

    fetched = await Vehicle.get(vehicle.id)

    assert fetched is not None
    assert fetched.vehicle_type == "car"
    assert fetched.vehicle_number == "KA01AB1234"
    assert fetched.brand == "Hyundai"
    assert fetched.is_active is True
    assert fetched.qr_code_id is None
    assert fetched.owner.ref.id == owner.id

    # Prove the link actually resolves against the database, not just the id.
    resolved_owner = await fetched.owner.fetch()
    assert resolved_owner.email == owner.email


@pytest.mark.asyncio
async def test_qr_code_roundtrip_and_links_back_to_vehicle():
    owner = await _make_user()
    vehicle = await _make_vehicle(owner)

    qr = QRCode(vehicle=vehicle)
    await qr.insert()

    # Link the vehicle back to its QR code, proving the two-way relationship works.
    vehicle.qr_code_id = qr
    await vehicle.save()

    fetched_qr = await QRCode.get(qr.id)
    fetched_vehicle = await Vehicle.get(vehicle.id)

    assert fetched_qr is not None
    assert len(fetched_qr.token) > 0
    assert fetched_qr.is_active is True
    assert fetched_qr.scan_count == 0
    assert fetched_qr.vehicle.ref.id == vehicle.id

    assert fetched_vehicle.qr_code_id.ref.id == qr.id


@pytest.mark.asyncio
async def test_call_roundtrip():
    owner = await _make_user()
    vehicle = await _make_vehicle(owner)

    call = Call(
        vehicle=vehicle,
        owner=owner,
        twilio_call_sid="CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        status="completed",
        duration_seconds=42,
        scanner_masked_number="+91******89",
    )
    await call.insert()

    fetched = await Call.get(call.id)

    assert fetched is not None
    assert fetched.status == "completed"
    assert fetched.duration_seconds == 42
    assert fetched.vehicle.ref.id == vehicle.id
    assert fetched.owner.ref.id == owner.id
    assert fetched.scanner_masked_number == "+91******89"


@pytest.mark.asyncio
async def test_report_roundtrip():
    owner = await _make_user()
    vehicle = await _make_vehicle(owner)

    report = Report(
        vehicle=vehicle,
        report_type="accident",
        message="Minor scrape on the rear bumper, please move your car.",
        reporter_contact="+919000000000",
    )
    await report.insert()

    fetched = await Report.get(report.id)

    assert fetched is not None
    assert fetched.report_type == "accident"
    assert fetched.status == "open"
    assert fetched.vehicle.ref.id == vehicle.id


@pytest.mark.asyncio
async def test_notification_roundtrip():
    owner = await _make_user()

    notification = Notification(
        user=owner,
        type="call_completed",
        title="Your vehicle was called",
        message="Your vehicle was scanned and called at 3:42 PM.",
    )
    await notification.insert()

    fetched = await Notification.get(notification.id)

    assert fetched is not None
    assert fetched.type == "call_completed"
    assert fetched.is_read is False
    assert fetched.user.ref.id == owner.id


@pytest.mark.asyncio
async def test_subscription_roundtrip():
    owner = await _make_user()

    subscription = Subscription(
        user=owner,
        plan="premium",
        status="active",
        end_date=datetime.utcnow() + timedelta(days=30),
    )
    await subscription.insert()

    fetched = await Subscription.get(subscription.id)

    assert fetched is not None
    assert fetched.plan == "premium"
    assert fetched.status == "active"
    assert fetched.end_date is not None
    assert fetched.user.ref.id == owner.id


@pytest.mark.asyncio
async def test_payment_roundtrip():
    owner = await _make_user()
    subscription = Subscription(user=owner, plan="premium", status="active")
    await subscription.insert()

    payment = Payment(
        user=owner,
        subscription=subscription,
        amount=299.0,
        provider_order_id="order_test123",
        status="paid",
    )
    await payment.insert()

    fetched = await Payment.get(payment.id)

    assert fetched is not None
    assert fetched.amount == 299.0
    assert fetched.currency == "INR"
    assert fetched.provider == "razorpay"
    assert fetched.status == "paid"
    assert fetched.user.ref.id == owner.id
    assert fetched.subscription.ref.id == subscription.id


@pytest.mark.asyncio
async def test_audit_log_roundtrip():
    admin = await _make_user()
    admin.is_admin = True
    await admin.save()

    log = AuditLog(
        admin_user=admin,
        action="suspend_user",
        target_type="user",
        target_id="some-user-id",
        meta={"reason": "abuse report"},
    )
    await log.insert()

    fetched = await AuditLog.get(log.id)

    assert fetched is not None
    assert fetched.action == "suspend_user"
    assert fetched.meta == {"reason": "abuse report"}
    assert fetched.admin_user.ref.id == admin.id


@pytest.mark.asyncio
async def test_unique_index_rejects_duplicate_email():
    await _make_user()
    with pytest.raises(Exception):
        await _make_user()  # same email/phone -- should violate the unique index


@pytest.mark.asyncio
async def test_unique_index_rejects_duplicate_vehicle_number():
    owner1 = await _make_user(suffix="1")
    owner2 = await _make_user(suffix="2")
    await _make_vehicle(owner1, suffix="9999")
    with pytest.raises(Exception):
        await _make_vehicle(owner2, suffix="9999")  # same vehicle_number
