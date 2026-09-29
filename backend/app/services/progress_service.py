import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.course import Course, CourseModule, Lesson, Enrollment, CourseProgress, LessonCompletion
from app.models.user import User
from app.schemas.enrollment import LessonCompletionResponse, CourseProgressResponse
from app.schemas.course import CourseDetailResponse
from app.services.course_service import CourseService


class ProgressService:
    @staticmethod
    def complete_lesson(
        db: Session,
        current_user: User,
        course_id: uuid.UUID,
        lesson_id: uuid.UUID,
    ) -> LessonCompletionResponse:
        # Check enrollment
        enrollment = (
            db.query(Enrollment)
            .options(joinedload(Enrollment.progress))
            .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == course_id)
            .first()
        )
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not enrolled in this course.",
            )

        # Check lesson belongs to course
        lesson = (
            db.query(Lesson)
            .join(CourseModule, Lesson.module_id == CourseModule.id)
            .filter(Lesson.id == lesson_id, CourseModule.course_id == course_id)
            .first()
        )
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lesson does not belong to this course.",
            )

        # Create LessonCompletion if not already present
        completion = (
            db.query(LessonCompletion)
            .filter(
                LessonCompletion.enrollment_id == enrollment.id,
                LessonCompletion.lesson_id == lesson_id,
            )
            .first()
        )

        now = datetime.now(timezone.utc)
        if not completion:
            completion = LessonCompletion(
                enrollment_id=enrollment.id,
                lesson_id=lesson_id,
                completed_at=now,
            )
            db.add(completion)
            db.flush()

        # Recalculate progress
        completed_count = (
            db.query(LessonCompletion)
            .filter(LessonCompletion.enrollment_id == enrollment.id)
            .count()
        )

        total_lessons = (
            db.query(Lesson)
            .join(CourseModule, Lesson.module_id == CourseModule.id)
            .filter(CourseModule.course_id == course_id)
            .count()
        )

        pct = (completed_count / total_lessons * 100.0) if total_lessons > 0 else 100.0

        progress = enrollment.progress
        if not progress:
            progress = CourseProgress(enrollment_id=enrollment.id)
            db.add(progress)

        progress.completed_lessons_count = completed_count
        progress.total_lessons_count = total_lessons
        progress.completion_percentage = round(pct, 1)
        progress.last_accessed_lesson_id = lesson_id
        progress.last_accessed_at = now

        if pct >= 100.0:
            progress.is_completed = True
            progress.completed_at = now
            enrollment.status = "COMPLETED"
            enrollment.completed_at = now
            db.flush()

            # Check eligibility and trigger automatic certificate generation if all requirements are met
            try:
                from app.services.certificate_service import CertificateService
                eligibility = CertificateService.check_eligibility(db, enrollment.user_id, course_id)
                if eligibility.eligible:
                    CertificateService.issue_certificate(db, enrollment.user_id, course_id)
            except Exception as cert_err:
                print(f"[ProgressService] Certificate auto-issuance notice: {cert_err}")
        else:
            enrollment.status = "IN_PROGRESS"
            if not enrollment.started_at:
                enrollment.started_at = now

        db.commit()
        db.refresh(completion)
        db.refresh(progress)

        return LessonCompletionResponse(
            id=completion.id,
            enrollment_id=enrollment.id,
            lesson_id=lesson_id,
            completed_at=completion.completed_at,
            progress=CourseProgressResponse.model_validate(progress),
        )

    @staticmethod
    def get_learning_content(
        db: Session,
        current_user: User,
        course_id: uuid.UUID,
    ) -> CourseDetailResponse:
        # Check enrollment
        enrollment = (
            db.query(Enrollment)
            .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == course_id)
            .first()
        )
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be enrolled to access learning content.",
            )

        return CourseService.get_course_details(db, course_id, current_user=current_user)
