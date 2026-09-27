from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.trainee import (
    TraineeProfileResponse,
    TraineeProfileUpdateRequest,
    TraineeDashboardResponse,
)
from app.schemas.enrollment import EnrolledCourseItem
from app.services.trainee_service import TraineeService
from app.services.enrollment_service import EnrollmentService

router = APIRouter(prefix="/trainee", tags=["Trainee"])


@router.get(
    "/dashboard",
    response_model=TraineeDashboardResponse,
    summary="Get authenticated trainee dashboard data and telemetry",
)
def get_trainee_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> TraineeDashboardResponse:
    """Returns aggregated real metrics for the trainee dashboard."""
    return TraineeService.get_dashboard(db=db, current_user=current_user)


@router.get(
    "/profile",
    response_model=TraineeProfileResponse,
    summary="Get authenticated trainee profile details and completion calculation",
)
def get_trainee_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> TraineeProfileResponse:
    """Returns profile information, qualifications, experiences, skills, and calculated completion percentage."""
    return TraineeService.get_profile(db=db, current_user=current_user)


@router.put(
    "/profile",
    response_model=TraineeProfileResponse,
    summary="Update authenticated trainee profile details",
)
def update_trainee_profile(
    data: TraineeProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> TraineeProfileResponse:
    """Updates profile credentials, background, qualifications, experiences, and skills."""
    return TraineeService.update_profile(
        db=db,
        current_user=current_user,
        data=data,
    )


@router.get(
    "/learning",
    response_model=List[EnrolledCourseItem],
    summary="Get all enrolled courses and granular progress for trainee",
)
def get_trainee_learning(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[EnrolledCourseItem]:
    """Returns all courses in which trainee is enrolled with progression status."""
    return EnrollmentService.get_my_learning(db=db, current_user=current_user)
