"""
Vehicle management endpoints, mounted at /vehicles. All endpoints require an
authenticated user (get_current_user) — there is no public vehicle listing;
the public, unauthenticated lookup is the separate GET /vehicle/{token} route
built in Phase 4.

Plan enforcement: a free-plan user may own at most 1 *active* vehicle. Soft-
deleted (is_active=False) vehicles don't count against that limit, so a user
who deletes their one vehicle can add a new one without upgrading.
"""
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_user
from app.models.qr_code import QRCode
from app.models.subscription import Subscription
from app.models.user import User
from app.models.vehicle import Vehicle
from app.schemas.vehicle import (
    VehicleCreateRequest,
    VehicleListResponse,
    VehicleResponse,
    VehicleUpdateRequest,
)

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


def _to_response(vehicle: Vehicle) -> VehicleResponse:
    return VehicleResponse(
        id=str(vehicle.id),
        vehicle_type=vehicle.vehicle_type,
        vehicle_number=vehicle.vehicle_number,
        brand=vehicle.brand,
        model=vehicle.model,
        color=vehicle.color,
        emergency_contact=vehicle.emergency_contact,
        is_active=vehicle.is_active,
        created_at=vehicle.created_at,
        updated_at=vehicle.updated_at,
    )


async def _get_owned_vehicle_or_404(vehicle_id: str, current_user: User) -> Vehicle:
    """Fetches a vehicle by id and confirms it belongs to current_user.

    Returns the same 404 whether the id doesn't exist at all OR it belongs to
    someone else — deliberately not distinguishing the two, so a caller can't
    use this endpoint to probe which vehicle ids exist for other users.
    """
    not_found = HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Vehicle not found",
    )

    try:
        oid = PydanticObjectId(vehicle_id)
    except Exception:
        # Malformed id -> same 404 rather than a raw DB/validation error.
        raise not_found

    # fetch_links=False so `vehicle.owner` stays a Link (with .ref.id) rather
    # than being auto-resolved into a full User object -- we only need the id
    # to check ownership, not the owner's other fields.
    vehicle = await Vehicle.get(oid, fetch_links=False)
    if vehicle is None:
        raise not_found

    if vehicle.owner.ref.id != current_user.id:
        raise not_found

    return vehicle


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    body: VehicleCreateRequest,
    current_user: User = Depends(get_current_user),
):
    # fetch_links=False: comparing Link fields against another document
    # requires comparing DBRefs directly (via .to_ref()) rather than dotted
    # "link.id == ..." field paths, which Beanie does not resolve into a
    # working Mongo query against a Link field.
    subscription = await Subscription.find_one(
        Subscription.user == current_user.to_ref(), fetch_links=False
    )
    plan = subscription.plan if subscription else "free"

    if plan == "free":
        active_count = await Vehicle.find(
            Vehicle.owner == current_user.to_ref(),
            Vehicle.is_active == True,  # noqa: E712
            fetch_links=False,
        ).count()
        if active_count >= 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Free plan is limited to 1 vehicle. Upgrade to Premium to "
                    "add more vehicles."
                ),
            )

    existing = await Vehicle.find_one(Vehicle.vehicle_number == body.vehicle_number)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A vehicle with this number is already registered.",
        )

    vehicle = Vehicle(
        owner=current_user,
        vehicle_type=body.vehicle_type,
        vehicle_number=body.vehicle_number,
        brand=body.brand,
        model=body.model,
        color=body.color,
        emergency_contact=body.emergency_contact,
    )
    await vehicle.insert()

    return _to_response(vehicle)


@router.get("", response_model=VehicleListResponse)
async def list_vehicles(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    query = Vehicle.find(Vehicle.owner == current_user.to_ref(), fetch_links=False)

    total = await query.count()
    vehicles = (
        await query.sort(-Vehicle.created_at).skip(skip).limit(limit).to_list()
    )

    return VehicleListResponse(
        total=total,
        skip=skip,
        limit=limit,
        vehicles=[_to_response(v) for v in vehicles],
    )


@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(
    vehicle_id: str,
    current_user: User = Depends(get_current_user),
):
    vehicle = await _get_owned_vehicle_or_404(vehicle_id, current_user)
    return _to_response(vehicle)


@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: str,
    body: VehicleUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    vehicle = await _get_owned_vehicle_or_404(vehicle_id, current_user)

    updates = body.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(vehicle, field, value)

    await vehicle.save()
    return _to_response(vehicle)


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(
    vehicle_id: str,
    current_user: User = Depends(get_current_user),
):
    vehicle = await _get_owned_vehicle_or_404(vehicle_id, current_user)

    # Soft-delete: preserves call/scan history tied to this vehicle for the
    # owner's records instead of destroying it.
    vehicle.is_active = False
    await vehicle.save()

    # Deactivate the linked QR code (if any) so old printed stickers stop
    # resolving via GET /vehicle/{token} once the vehicle itself is gone.
    if vehicle.qr_code_id is not None:
        qr = await QRCode.get(vehicle.qr_code_id.ref.id)
        if qr is not None and qr.is_active:
            qr.is_active = False
            await qr.save()

    return None
