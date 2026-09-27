import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models.course import Course, CourseModule, Lesson, Enrollment, CourseProgress, LessonCompletion
from app.models.user import User
from app.schemas.enrollment import EnrollmentResponse, EnrolledCourseItem, CourseProgressResponse


class EnrollmentService:
    @staticmethod
    def enroll_in_course(
        db: Session,
        current_user: User,
        course_id: uuid.UUID,
    ) -> EnrollmentResponse:
        # Check course existence and published status
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )

        if course.status != "PUBLISHED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot enroll in an unpublished course.",
            )

        # Check existing enrollment
        existing_enrollment = (
            db.query(Enrollment)
            .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == course_id)
            .first()
        )
        if existing_enrollment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already enrolled in this course.",
            )

        # Count total lessons in this course
        total_lessons = (
            db.query(Lesson)
            .join(CourseModule, Lesson.module_id == CourseModule.id)
            .filter(CourseModule.course_id == course_id)
            .count()
        )

        enrollment = Enrollment(
            user_id=current_user.id,
            course_id=course_id,
            status="ENROLLED",
        )
        db.add(enrollment)
        db.flush()

        progress = CourseProgress(
            enrollment_id=enrollment.id,
            completion_percentage=0.0,
            completed_lessons_count=0,
            total_lessons_count=total_lessons,
            is_completed=False,
        )
        db.add(progress)
        db.commit()
        db.refresh(enrollment)

        return EnrollmentResponse(
            id=enrollment.id,
            user_id=enrollment.user_id,
            course_id=enrollment.course_id,
            status=enrollment.status,
            enrolled_at=enrollment.enrolled_at,
            started_at=enrollment.started_at,
            completed_at=enrollment.completed_at,
            final_grade=enrollment.final_grade,
            progress=CourseProgressResponse.model_validate(progress),
        )

    @staticmethod
    def get_my_learning(
        db: Session,
        current_user: User,
    ) -> List[EnrolledCourseItem]:
        enrollments = (
            db.query(Enrollment)
            .options(
                joinedload(Enrollment.course).joinedload(Course.category),
                joinedload(Enrollment.course).joinedload(Course.modules).joinedload(CourseModule.lessons),
                joinedload(Enrollment.progress),
            )
            .filter(Enrollment.user_id == current_user.id)
            .order_by(Enrollment.enrolled_at.desc())
            .all()
        )

        items: List[EnrolledCourseItem] = []
        for en in enrollments:
            course = en.course
            progress = en.progress

            # Find next lesson
            completed_lesson_ids = {
                c.lesson_id
                for c in db.query(LessonCompletion.lesson_id)
                .filter(LessonCompletion.enrollment_id == en.id)
                .all()
            }

            next_lesson_id: Optional[uuid.UUID] = None
            next_lesson_title: Optional[str] = None
            for mod in sorted(course.modules, key=lambda m: m.order_index):
                for les in sorted(mod.lessons, key=lambda l: l.order_index):
                    if les.id not in completed_lesson_ids:
                        next_lesson_id = les.id
                        next_lesson_title = les.title
                        break
                if next_lesson_id:
                    break

            items.append(
                EnrolledCourseItem(
                    course_id=course.id,
                    enrollment_id=en.id,
                    title=course.title,
                    code=course.code,
                    thumbnail_url=course.thumbnail_url,
                    category_name=course.category.name if course.category else "General",
                    difficulty_level=course.difficulty_level,
                    duration_hours=course.duration_hours,
                    status=en.status,
                    enrolled_at=en.enrolled_at,
                    last_accessed_at=progress.last_accessed_at if progress else None,
                    progress_percentage=round(progress.completion_percentage, 1) if progress else 0.0,
                    completed_lessons_count=progress.completed_lessons_count if progress else 0,
                    total_lessons_count=progress.total_lessons_count if progress else 0,
                    next_lesson_id=next_lesson_id,
                    next_lesson_title=next_lesson_title,
                )
            )

        return items
