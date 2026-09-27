from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers.api_v1 import api_v1_router
from app.routers.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Phase 0 initialization logging
    print(f"[Capacity Connect] Starting {settings.APP_NAME} v{settings.APP_VERSION} ({settings.ENVIRONMENT})")
    yield
    print(f"[Capacity Connect] Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Capacity Connect - Digital Capacity Building and Learning Management Portal API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Versioned API routes (/api/v1/health, etc.)
app.include_router(api_v1_router, prefix="/api/v1")

# Convenience route matching GET /api/health
app.include_router(health_router, prefix="/api")


@app.get("/", tags=["Root"])
def root_endpoint():
    """Root entrypoint providing basic portal API details."""
    return {
        "portal": "Capacity Connect",
        "description": "Digital Capacity Building and Learning Management Portal API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/v1/health",
    }
