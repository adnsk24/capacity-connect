from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers.api_v1 import api_v1_router
from app.routers.health import router as health_router


from pathlib import Path
from fastapi import Request
from fastapi.responses import JSONResponse

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Phase 0 initialization logging
    print(f"[Capacity Connect] Starting {settings.APP_NAME} v{settings.APP_VERSION} ({settings.ENVIRONMENT})")
    
    # Auto-run database migrations and ensure AI tables/columns exist on startup
    try:
        from alembic.config import Config
        from alembic import command
        alembic_ini_path = Path(__file__).resolve().parent.parent / "alembic.ini"
        if alembic_ini_path.exists():
            cfg = Config(str(alembic_ini_path))
            cfg.set_main_option("script_location", str(alembic_ini_path.parent / "alembic"))
            command.upgrade(cfg, "head")
            print("[Capacity Connect] Alembic database migration applied successfully on startup.")
    except Exception as e:
        print(f"[Capacity Connect] Alembic startup migration warning: {e}")
        # DDL Fallback to ensure AI columns and tables exist even if Alembic was bypassed
        try:
            from app.database.session import SessionLocal, engine
            from app.database.base import Base
            from sqlalchemy import text
            with SessionLocal() as db:
                db.execute(text("ALTER TABLE resources ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT TRUE NOT NULL;"))
                db.execute(text("ALTER TABLE resources ADD COLUMN IF NOT EXISTS ai_approved BOOLEAN DEFAULT TRUE NOT NULL;"))
                db.commit()
            Base.metadata.create_all(bind=engine)
            print("[Capacity Connect] Fallback DDL executed successfully.")
        except Exception as fallback_e:
            print(f"[Capacity Connect] Fallback DDL warning: {fallback_e}")

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

from fastapi.staticfiles import StaticFiles

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_origin_regex=r"https://.*\.pages\.dev",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    origin = request.headers.get("origin")
    headers = {}
    if origin:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Headers"] = "*"
        headers["Access-Control-Allow-Methods"] = "*"
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {type(exc).__name__} - {str(exc)}"},
        headers=headers,
    )

# Static media uploads directory
upload_dir = Path(__file__).resolve().parent.parent / "uploads"
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

# Versioned API routes (/api/v1/health, etc.)
app.include_router(api_v1_router, prefix="/api/v1")

# Convenience route matching GET /api/health
app.include_router(health_router, prefix="/api")


from app.database.session import get_db
from app.services.certificate_service import CertificateService
from sqlalchemy.orm import Session
from fastapi import Depends

# Direct public certificate verification route matching GET /certificates/verify/{certificate_id}
@app.get("/certificates/verify/{certificate_id}", tags=["Certificates"])
def root_verify_certificate(certificate_id: str, db: Session = Depends(get_db)):
    """Public certificate verification endpoint accessible at root path without authentication."""
    return CertificateService.verify_certificate(db, certificate_id)


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

