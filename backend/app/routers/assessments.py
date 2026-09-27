import uuid
from typing import List, Union
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_active_user, require_role, require_roles
from app.models.user import User
from app.schemas.assessment import (
    AssessmentListItem,
    AssessmentDetail,
    AssessmentAttemptStartResponse,
    AssessmentSubmitRequest,
    AssessmentResultResponse,
    AssessmentAttemptHistoryItem,
)
from app.services.assessment_service import AssessmentService

router = APIRouter(prefix="", tags=["Assessments & Examination Engine"])


@router.get(
    "/assessments",
    response_model=List[AssessmentListItem],
    summary="List assessments for enrolled courses",
)
def list_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return AssessmentService.list_trainee_assessments(db, current_user)


@router.get(
    "/trainee/assessments",
    response_model=List[AssessmentListItem],
    summary="List trainee assessments",
)
def list_trainee_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("TRAINEE")),
):
    return AssessmentService.list_trainee_assessments(db, current_user)


@router.get(
    "/trainee/assessments/history",
    response_model=List[AssessmentAttemptHistoryItem],
    summary="Trainee attempt history",
)
def list_attempt_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("TRAINEE")),
):
    return AssessmentService.list_trainee_history(db, current_user)


@router.get(
    "/assessments/{assessment_id}",
    response_model=AssessmentDetail,
    summary="Get assessment instructions and details",
)
def get_assessment(
    assessment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return AssessmentService.get_assessment_for_trainee(db, assessment_id, current_user)


@router.post(
    "/assessments/{assessment_id}/attempts",
    response_model=AssessmentAttemptStartResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start an assessment attempt",
)
def start_attempt(
    assessment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINEE", "ADMIN"])),
):
    return AssessmentService.start_attempt(db, assessment_id, current_user)


@router.get(
    "/assessments/attempts/{attempt_id}",
    response_model=Union[AssessmentAttemptStartResponse, AssessmentResultResponse],
    summary="Get attempt state or evaluated review",
)
def get_attempt_state(
    attempt_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return AssessmentService.get_attempt_state(db, attempt_id, current_user)


@router.post(
    "/assessments/attempts/{attempt_id}/submit",
    response_model=AssessmentResultResponse,
    summary="Submit answers and receive deterministic grade",
)
def submit_attempt(
    attempt_id: uuid.UUID,
    payload: AssessmentSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return AssessmentService.submit_attempt(db, attempt_id, payload, current_user)
