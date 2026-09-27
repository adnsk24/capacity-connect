import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, require_admin, require_trainer
from app.models.user import User
from app.core.competency_config import COMPETENCY_LEVELS
from app.services.competency_service import CompetencyEvaluationService
from app.schemas.competency import (
    CompetencyCatalogueItem,
    CompetencyLevelInfo,
    UserCompetencyResponse,
    SkillGapItem,
    TrainingReadinessResponse,
    PersonalizedCourseRecommendation,
    CompetencyGrowthResponse,
    TrainerRecommendationResponse,
    SubjectDetailResponse,
)

router = APIRouter(prefix="/competencies", tags=["Competency Intelligence Engine"])


@router.get("", response_model=List[CompetencyCatalogueItem])
def list_competencies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves all standard WMO/IMD competencies in the catalog."""
    return CompetencyEvaluationService.get_all_competencies(db)


@router.get("/levels", response_model=List[CompetencyLevelInfo])
def get_competency_framework_levels(
    current_user: User = Depends(get_current_user),
):
    """Retrieves standard competency framework levels (0 to 5) with definitions."""
    return [
        CompetencyLevelInfo(
            level=lvl,
            name=data["name"],
            descriptor=data["descriptor"],
            badge_color=data["badge_color"],
        )
        for lvl, data in COMPETENCY_LEVELS.items()
    ]


@router.get("/me", response_model=List[UserCompetencyResponse])
def get_my_competencies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evaluates current user's demonstrated competency levels across
    assessments, course progress, skills, certifications, qualifications, and operational experience.
    """
    return CompetencyEvaluationService.get_user_competencies(db, current_user.id)


@router.get("/me/gaps", response_model=List[SkillGapItem])
def get_my_skill_gaps(
    subject_id: Optional[uuid.UUID] = Query(None, description="Optional subject to compare against"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns prioritized competency gaps comparing current demonstrated proficiency
    against target/required operational standards.
    """
    return CompetencyEvaluationService.get_skill_gaps(db, current_user.id, subject_id)


@router.get("/me/readiness", response_model=TrainingReadinessResponse)
def get_my_training_readiness(
    subject_id: Optional[uuid.UUID] = Query(None, description="Optional subject to evaluate readiness for"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Calculates overall Training Readiness Score (%) and breakdown against required competencies.
    """
    return CompetencyEvaluationService.calculate_readiness_score(db, current_user.id, subject_id)


@router.get("/me/recommendations", response_model=List[PersonalizedCourseRecommendation])
def get_my_course_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Provides explainable, personalized course recommendations to address identified competency skill gaps.
    """
    return CompetencyEvaluationService.get_personalized_recommendations(db, current_user.id)


@router.get("/me/growth/{competency_id}", response_model=CompetencyGrowthResponse)
def get_my_competency_growth(
    competency_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns historical milestone timeline showing progression in a specific competency.
    """
    try:
        return CompetencyEvaluationService.get_competency_growth(db, current_user.id, competency_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/subjects", response_model=List[SubjectDetailResponse])
def list_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists operational subjects and their competency requirements."""
    return CompetencyEvaluationService.get_all_subjects(db)


@router.get("/trainer-recommendations", response_model=TrainerRecommendationResponse)
def get_trainer_recommendations(
    subject_id: uuid.UUID = Query(..., description="Subject domain requiring trainer assignment"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Ranks eligible trainers for a subject based on 6-dimensional matching:
    Competency Match, Experience, Qualifications, Certifications, Assessments, and Feedback.
    Accessible to Trainers and Administrators.
    """
    if current_user.role.name not in ["ADMIN", "TRAINER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Instructor or Administrator authorization required.",
        )
    try:
        return CompetencyEvaluationService.get_trainer_recommendations(db, subject_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/user/{user_id}", response_model=List[UserCompetencyResponse])
def get_user_competencies_admin(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Allows Trainers and Admins to inspect any trainee's verified competency matrix.
    """
    if current_user.role.name not in ["ADMIN", "TRAINER"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative or Instructor privileges required.",
        )
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return CompetencyEvaluationService.get_user_competencies(db, user_id)
