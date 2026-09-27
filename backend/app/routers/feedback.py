import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.core.dependencies import (
    get_current_active_user,
    require_admin,
    require_roles,
)
from app.models.user import User
from app.models.course import Course, Enrollment
from app.models.feedback import Feedback
from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackResponse,
    CourseFeedbackSummary,
    TrainerFeedbackSummary,
)

router = APIRouter(tags=["Feedback"])


@router.post(
    "/courses/{course_id}/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit or update course & instructor evaluation feedback",
)
def submit_course_feedback(
    course_id: uuid.UUID,
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> FeedbackResponse:
    """Submits student feedback and rating for a course and its assigned instructor."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} not found.",
        )

    # Check enrollment
    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == course_id)
        .first()
    )
    if not enrollment and current_user.role.name == "TRAINEE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be enrolled in this course to submit feedback.",
        )

    # Check for existing feedback by this user for this course
    existing_feedback = (
        db.query(Feedback)
        .filter(Feedback.user_id == current_user.id, Feedback.course_id == course_id)
        .first()
    )

    if existing_feedback:
        existing_feedback.course_rating = payload.course_rating
        existing_feedback.trainer_rating = payload.trainer_rating
        existing_feedback.content_rating = payload.content_rating
        existing_feedback.comments = payload.comments
        existing_feedback.suggestions = payload.suggestions
        feedback = existing_feedback
    else:
        feedback = Feedback(
            user_id=current_user.id,
            course_id=course_id,
            trainer_id=course.trainer_id,
            course_rating=payload.course_rating,
            trainer_rating=payload.trainer_rating,
            content_rating=payload.content_rating,
            comments=payload.comments,
            suggestions=payload.suggestions,
        )
        db.add(feedback)

    db.commit()
    db.refresh(feedback)

    user_name = f"{current_user.first_name} {current_user.last_name}".strip()
    return FeedbackResponse(
        id=feedback.id,
        user_id=feedback.user_id,
        user_name=user_name,
        course_id=feedback.course_id,
        course_title=course.title,
        trainer_id=feedback.trainer_id,
        course_rating=feedback.course_rating,
        trainer_rating=feedback.trainer_rating,
        content_rating=feedback.content_rating,
        comments=feedback.comments,
        suggestions=feedback.suggestions,
        created_at=feedback.created_at,
    )


@router.get(
    "/courses/{course_id}/feedback",
    response_model=CourseFeedbackSummary,
    summary="Get aggregated feedback summary and ratings for a course",
)
def get_course_feedback(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> CourseFeedbackSummary:
    """Returns average rating metrics and recent feedback submissions for a course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} not found.",
        )

    feedbacks = (
        db.query(Feedback)
        .filter(Feedback.course_id == course_id)
        .order_by(Feedback.created_at.desc())
        .limit(20)
        .all()
    )

    ratings = [f.course_rating for f in feedbacks if f.course_rating is not None]
    trainer_ratings = [f.trainer_rating for f in feedbacks if f.trainer_rating is not None]

    avg_course = round(sum(ratings) / len(ratings), 1) if ratings else 0.0
    avg_trainer = round(sum(trainer_ratings) / len(trainer_ratings), 1) if trainer_ratings else 0.0

    serialized_feedbacks = []
    for f in feedbacks:
        user = db.query(User).filter(User.id == f.user_id).first()
        uname = f"{user.first_name} {user.last_name}".strip() if user else "Anonymous Trainee"
        serialized_feedbacks.append(
            FeedbackResponse(
                id=f.id,
                user_id=f.user_id,
                user_name=uname,
                course_id=f.course_id,
                course_title=course.title,
                trainer_id=f.trainer_id,
                course_rating=f.course_rating,
                trainer_rating=f.trainer_rating,
                content_rating=f.content_rating,
                comments=f.comments,
                suggestions=f.suggestions,
                created_at=f.created_at,
            )
        )

    return CourseFeedbackSummary(
        course_id=course.id,
        course_title=course.title,
        average_course_rating=avg_course,
        average_trainer_rating=avg_trainer,
        feedback_count=len(feedbacks),
        feedbacks=serialized_feedbacks,
    )


@router.get(
    "/trainer/feedback",
    response_model=TrainerFeedbackSummary,
    summary="Get feedback evaluations received by the authenticated trainer",
)
def get_trainer_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
) -> TrainerFeedbackSummary:
    """Returns feedback and instructional ratings submitted by trainees for this trainer."""
    feedbacks = (
        db.query(Feedback)
        .filter(Feedback.trainer_id == current_user.id)
        .order_by(Feedback.created_at.desc())
        .limit(50)
        .all()
    )

    ratings = [f.trainer_rating for f in feedbacks if f.trainer_rating is not None]
    avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0.0

    serialized = []
    for f in feedbacks:
        course = db.query(Course).filter(Course.id == f.course_id).first()
        user = db.query(User).filter(User.id == f.user_id).first()
        uname = f"{user.first_name} {user.last_name}".strip() if user else "Trainee"
        serialized.append(
            FeedbackResponse(
                id=f.id,
                user_id=f.user_id,
                user_name=uname,
                course_id=f.course_id,
                course_title=course.title if course else "Course",
                trainer_id=f.trainer_id,
                course_rating=f.course_rating,
                trainer_rating=f.trainer_rating,
                content_rating=f.content_rating,
                comments=f.comments,
                suggestions=f.suggestions,
                created_at=f.created_at,
            )
        )

    trainer_name = f"{current_user.first_name} {current_user.last_name}".strip()
    return TrainerFeedbackSummary(
        trainer_id=current_user.id,
        trainer_name=trainer_name,
        average_trainer_rating=avg_rating,
        feedback_count=len(feedbacks),
        feedbacks=serialized,
    )


@router.get(
    "/admin/feedback",
    response_model=List[FeedbackResponse],
    summary="List recent institutional feedback records across all portal courses",
)
def get_admin_feedback_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> List[FeedbackResponse]:
    """Administrative inspection of recent institutional feedback and evaluations."""
    feedbacks = (
        db.query(Feedback)
        .order_by(Feedback.created_at.desc())
        .limit(100)
        .all()
    )

    serialized = []
    for f in feedbacks:
        course = db.query(Course).filter(Course.id == f.course_id).first()
        user = db.query(User).filter(User.id == f.user_id).first()
        uname = f"{user.first_name} {user.last_name}".strip() if user else "Trainee"
        serialized.append(
            FeedbackResponse(
                id=f.id,
                user_id=f.user_id,
                user_name=uname,
                course_id=f.course_id,
                course_title=course.title if course else "Course",
                trainer_id=f.trainer_id,
                course_rating=f.course_rating,
                trainer_rating=f.trainer_rating,
                content_rating=f.content_rating,
                comments=f.comments,
                suggestions=f.suggestions,
                created_at=f.created_at,
            )
        )

    return serialized
