"""
ParkConnect backend entrypoint.

Phase 0 scope only: app wiring, CORS, DB init on startup, and a single
GET /health endpoint. No business logic, no auth, no models beyond the
empty Beanie registration in database.py.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown: nothing to clean up yet (Motor's client closes with the process).


app = FastAPI(
    title="ParkConnect API",
    description="Privacy-based vehicle owner contact system.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS origins are read from config so production can add the real frontend
# domain later without a code change (see Settings.cors_origins).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Basic liveness check, also used by the frontend to prove the two
    servers are wired together during Phase 0."""
    return {"status": "ok"}
