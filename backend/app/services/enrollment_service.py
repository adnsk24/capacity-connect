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
        from app.models.certificate import Certificate
        from app.models.assessment import Assessment, AssessmentAttempt

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

        # Batch query all certificates for this user
        certs = (
            db.query(Certificate)
            .filter(Certificate.user_id == current_user.id)
            .all()
        )
        cert_by_course: Dict[uuid.UUID, Certificate] = {c.course_id: c for c in certs}

        # Batch query published assessments and attempts for this user
        course_ids = [en.course_id for en in enrollments]
        published_assessments = (
            db.query(Assessment)
            .filter(Assessment.course_id.in_(course_ids), Assessment.status == "PUBLISHED")
            .all()
        ) if course_ids else []

        passed_attempts = (
            db.query(AssessmentAttempt)
            .filter(
                AssessmentAttempt.user_id == current_user.id,
                AssessmentAttempt.is_passed == True,
            )
            .all()
        ) if course_ids else []
        passed_asmt_ids = {pa.assessment_id for pa in passed_attempts}

        # Group assessments by course
        asmts_by_course: Dict[uuid.UUID, List[Assessment]] = {}
        for a in published_assessments:
            asmts_by_course.setdefault(a.course_id, []).append(a)

        items: List[EnrolledCourseItem] = []
        for en in enrollments:
            course = en.course
            progress = en.progress
            cert = cert_by_course.get(course.id)

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

            # Check if there is an unpassed assessment for this course
            course_asmts = asmts_by_course.get(course.id, [])
            unpassed = [a for a in course_asmts if a.id not in passed_asmt_ids]
            has_pending_asmt = bool(unpassed) and not cert
            pending_asmt = unpassed[0] if unpassed else None

            # Auto-reconcile: If course is 100% complete, no cert exists yet, and no pending assessments,
            # auto-issue certificate right now so it instantly appears in My Learnings!
            progress_pct = round(progress.completion_percentage, 1) if progress else 0.0
            if (progress_pct >= 100.0 or en.status == "COMPLETED") and not cert and not has_pending_asmt:
                try:
                    from app.services.certificate_service import CertificateService
                    eligibility = CertificateService.check_eligibility(db, current_user.id, course.id)
                    if eligibility.eligible:
                        cert = CertificateService.issue_certificate(db, current_user.id, course.id)
                        cert_by_course[course.id] = cert
                except Exception as auto_issue_err:
                    print(f"[get_my_learning] Auto-reconciliation notice for course {course.id}: {auto_issue_err}")

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
                    progress_percentage=progress_pct,
                    completed_lessons_count=progress.completed_lessons_count if progress else 0,
                    total_lessons_count=progress.total_lessons_count if progress else 0,
                    next_lesson_id=next_lesson_id,
                    next_lesson_title=next_lesson_title,
                    certificate_id=cert.id if cert else None,
                    certificate_number=cert.certificate_number if cert else None,
                    certificate_pdf_url=cert.pdf_url if cert else None,
                    certificate_issue_date=cert.issue_date if cert else None,
                    certificate_status=cert.status if cert else None,
                    has_pending_assessment=has_pending_asmt,
                    pending_assessment_id=pending_asmt.id if pending_asmt else None,
                    pending_assessment_title=pending_asmt.title if pending_asmt else None,
                )
            )

        return items
