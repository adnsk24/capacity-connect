from fastapi import APIRouter
from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.courses import router as courses_router
from app.routers.trainee import router as trainee_router
from app.routers.enrollments import router as enrollments_router

api_v1_router = APIRouter()

# Healthcheck
api_v1_router.include_router(health_router)

# Authentication & Session Management
api_v1_router.include_router(auth_router)

# Administrative User Approvals & Governance
api_v1_router.include_router(admin_router)

# Phase 3 Core Learning & Trainee Experience
api_v1_router.include_router(courses_router)
api_v1_router.include_router(trainee_router)
api_v1_router.include_router(enrollments_router)
