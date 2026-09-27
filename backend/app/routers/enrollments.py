import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.enrollment import EnrollmentResponse, EnrolledCourseItem
from app.services.enrollment_service import EnrollmentService

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])


@router.get(
    "/my-learning",
    response_model=List[EnrolledCourseItem],
    summary="Get enrolled courses for authenticated user",
)
def get_user_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[EnrolledCourseItem]:
    """Returns active enrollments and progression metrics for the logged-in user."""
    return EnrollmentService.get_my_learning(db=db, current_user=current_user)


@router.post(
    "/{course_id}",
    response_model=EnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enroll authenticated user into a course",
)
def create_enrollment(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> EnrollmentResponse:
    """Creates a new enrollment record for the course."""
    return EnrollmentService.enroll_in_course(
        db=db,
        current_user=current_user,
        course_id=course_id,
    )
