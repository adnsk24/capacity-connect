from fastapi import APIRouter
from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.courses import router as courses_router
from app.routers.trainee import router as trainee_router
from app.routers.enrollments import router as enrollments_router
from app.routers.assessments import router as assessments_router
from app.routers.trainer import router as trainer_router
from app.routers.notifications import router as notifications_router
from app.routers.competencies import router as competencies_router
from app.routers.feedback import router as feedback_router
from app.routers.resources import router as resources_router

api_v1_router = APIRouter()

# Healthcheck
api_v1_router.include_router(health_router)

# Authentication & Session Management
api_v1_router.include_router(auth_router)

# Administrative User Approvals, Governance & Telemetry
api_v1_router.include_router(admin_router)

# Phase 3 Core Learning & Trainee Experience
api_v1_router.include_router(courses_router)
api_v1_router.include_router(trainee_router)
api_v1_router.include_router(enrollments_router)

# Phase 4 Assessment Engine, Trainer Portal & Notifications
api_v1_router.include_router(assessments_router)
api_v1_router.include_router(trainer_router)
api_v1_router.include_router(notifications_router)

# Phase 5 Competency Intelligence Engine & Trainer Recommendations
api_v1_router.include_router(competencies_router)

# Feedback & Course Evaluation System (MVP Item 8)
api_v1_router.include_router(feedback_router)

# Course Media & Learning Resources
from app.routers.certificates import router as certificates_router
from app.routers.ai import router as ai_router

api_v1_router.include_router(resources_router)

# Accredited Course Completion Certificates
api_v1_router.include_router(certificates_router)

# Phase 7 AI Intelligence Layer (Grounded RAG, Quiz Gen, Competency & Trainer Explanations)
api_v1_router.include_router(ai_router)

