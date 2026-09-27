from app.routers.api_v1 import api_v1_router
from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router

__all__ = [
    "api_v1_router",
    "health_router",
    "auth_router",
    "admin_router",
]
