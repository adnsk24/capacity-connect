from fastapi import APIRouter
from app.routers.health import router as health_router

api_v1_router = APIRouter()

# Mount health routes under /api/v1/health
api_v1_router.include_router(health_router)

# Future modules will be mounted here:
# api_v1_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
# api_v1_router.include_router(users_router, prefix="/users", tags=["Users"])
# api_v1_router.include_router(courses_router, prefix="/courses", tags=["Courses"])
# api_v1_router.include_router(assessments_router, prefix="/assessments", tags=["Assessments"])
# api_v1_router.include_router(competencies_router, prefix="/competencies", tags=["Competencies"])
