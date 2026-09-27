import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc

from app.models.user import User, TraineeProfile
from app.models.course import (
    Course,
    CourseModule,
    Lesson,
    Resource,
    Enrollment,
    CourseProgress,
)
from app.models.assessment import Assessment, AssessmentAttempt
from app.schemas.trainer import (
    TrainerDashboardStats,
    TrainerCourseCreate,
    TrainerCourseUpdate,
    ModuleCreate,
    LessonCreate,
    ResourceCreate,
    TraineePerformanceItem,
    TraineePerformanceResponse,
)


class TrainerService:
    @staticmethod
    def get_dashboard_stats(db: Session, trainer: User) -> TrainerDashboardStats:
        """Aggregate institutional telemetry for trainer-managed courses and trainees."""
        trainer_course_ids_query = db.query(Course.id).filter(Course.trainer_id == trainer.id)
        trainer_course_ids = [c[0] for c in trainer_course_ids_query.all()]

        courses_count = len(trainer_course_ids)

        if not trainer_course_ids:
            return TrainerDashboardStats(
                courses_managed=0,
                enrolled_trainees=0,
                active_learners=0,
                assessments_count=0,
                average_assessment_score=0.0,
                completion_rate=0.0,
                recent_activity=[],
                upcoming_deadlines=[],
            )

        # Enrolled trainees count (distinct users)
        enrolled_trainees = (
            db.query(func.count(func.distinct(Enrollment.user_id)))
            .filter(Enrollment.course_id.in_(trainer_course_ids))
            .scalar()
            or 0
        )

        # Completed enrollments count
        completed_enrollments = (
            db.query(func.count(Enrollment.id))
            .filter(
                Enrollment.course_id.in_(trainer_course_ids),
                Enrollment.status == "COMPLETED",
            )
            .scalar()
            or 0
        )
        total_enrollments = (
            db.query(func.count(Enrollment.id))
            .filter(Enrollment.course_id.in_(trainer_course_ids))
            .scalar()
            or 0
        )
        completion_rate = round((completed_enrollments / total_enrollments * 100.0), 1) if total_enrollments > 0 else 0.0

        # Assessments count
        assessments_count = (
            db.query(func.count(Assessment.id))
            .filter(Assessment.course_id.in_(trainer_course_ids))
            .scalar()
            or 0
        )

        # Average assessment score
        avg_score = (
            db.query(func.avg(AssessmentAttempt.percentage))
            .join(Assessment, AssessmentAttempt.assessment_id == Assessment.id)
            .filter(
                Assessment.course_id.in_(trainer_course_ids),
                AssessmentAttempt.status == "EVALUATED",
            )
            .scalar()
        )
        average_assessment_score = round(float(avg_score), 1) if avg_score is not None else 0.0

        # Active learners (trainees with at least 1 lesson progress)
        active_learners = (
            db.query(func.count(CourseProgress.id))
            .join(Enrollment, CourseProgress.enrollment_id == Enrollment.id)
            .filter(
                Enrollment.course_id.in_(trainer_course_ids),
                CourseProgress.completed_lessons_count > 0,
            )
            .scalar()
            or 0
        )

        # Recent activity (latest enrollments and attempts)
        recent_activity: List[Dict[str, Any]] = []
        recent_enrollments = (
            db.query(Enrollment)
            .options(joinedload(Enrollment.user), joinedload(Enrollment.course))
            .filter(Enrollment.course_id.in_(trainer_course_ids))
            .order_by(Enrollment.enrolled_at.desc())
            .limit(5)
            .all()
        )
        for e in recent_enrollments:
            recent_activity.append({
                "type": "ENROLLMENT",
                "title": f"{e.user.first_name} {e.user.last_name} enrolled in {e.course.title}",
                "timestamp": e.enrolled_at.isoformat() if e.enrolled_at else None,
            })

        recent_attempts = (
            db.query(AssessmentAttempt)
            .options(joinedload(AssessmentAttempt.user), joinedload(AssessmentAttempt.assessment))
            .join(Assessment, AssessmentAttempt.assessment_id == Assessment.id)
            .filter(
                Assessment.course_id.in_(trainer_course_ids),
                AssessmentAttempt.status == "EVALUATED",
            )
            .order_by(AssessmentAttempt.submitted_at.desc())
            .limit(5)
            .all()
        )
        for a in recent_attempts:
            recent_activity.append({
                "type": "ASSESSMENT_SUBMISSION",
                "title": f"{a.user.first_name} {a.user.last_name} completed {a.assessment.title} ({a.percentage}%)",
                "timestamp": a.submitted_at.isoformat() if a.submitted_at else None,
            })

        # Sort recent activity by timestamp desc
        recent_activity.sort(key=lambda x: x["timestamp"] or "", reverse=True)
        recent_activity = recent_activity[:8]

        # Upcoming deadlines
        now = datetime.now(timezone.utc)
        upcoming_assessments = (
            db.query(Assessment)
            .options(joinedload(Assessment.course))
            .filter(
                Assessment.course_id.in_(trainer_course_ids),
                Assessment.due_at >= now,
            )
            .order_by(Assessment.due_at.asc())
            .limit(5)
            .all()
        )
        upcoming_deadlines = [
            {
                "id": str(ass.id),
                "title": ass.title,
                "course_title": ass.course.title if ass.course else "",
                "due_at": ass.due_at.isoformat() if ass.due_at else None,
            }
            for ass in upcoming_assessments
        ]

        return TrainerDashboardStats(
            courses_managed=courses_count,
            enrolled_trainees=enrolled_trainees,
            active_learners=active_learners,
            assessments_count=assessments_count,
            average_assessment_score=average_assessment_score,
            completion_rate=completion_rate,
            recent_activity=recent_activity,
            upcoming_deadlines=upcoming_deadlines,
        )

    @staticmethod
    def list_courses(db: Session, trainer: User) -> List[Course]:
        """List all courses managed by trainer."""
        query = db.query(Course).options(
            joinedload(Course.category),
            joinedload(Course.modules),
            joinedload(Course.enrollments),
            joinedload(Course.assessments),
        )
        if trainer.role.name != "ADMIN":
            query = query.filter(Course.trainer_id == trainer.id)
        return query.order_by(Course.created_at.desc()).all()

    @staticmethod
    def create_course(db: Session, data: TrainerCourseCreate, trainer: User) -> Course:
        """Create a new course offering."""
        existing = db.query(Course).filter(Course.code == data.code).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Course code '{data.code}' already exists.",
            )

        course = Course(
            category_id=data.category_id,
            trainer_id=trainer.id,
            title=data.title,
            code=data.code,
            description=data.description,
            objectives=data.objectives,
            prerequisites=data.prerequisites,
            difficulty_level=data.difficulty_level,
            duration_hours=data.duration_hours,
            status=data.status,
            published_at=datetime.now(timezone.utc) if data.status == "PUBLISHED" else None,
        )
        db.add(course)
        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def get_course(db: Session, course_id: uuid.UUID, trainer: User) -> Course:
        """Get course detail for management."""
        course = (
            db.query(Course)
            .options(
                joinedload(Course.category),
                joinedload(Course.modules).joinedload(CourseModule.lessons),
                joinedload(Course.resources),
                joinedload(Course.assessments),
            )
            .filter(Course.id == course_id)
            .first()
        )
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

        if trainer.role.name != "ADMIN" and course.trainer_id != trainer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this course.")

        return course

    @staticmethod
    def update_course(
        db: Session,
        course_id: uuid.UUID,
        data: TrainerCourseUpdate,
        trainer: User,
    ) -> Course:
        """Update existing course attributes."""
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

        if trainer.role.name != "ADMIN" and course.trainer_id != trainer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this course.")

        update_dict = data.model_dump(exclude_unset=True)
        if "status" in update_dict and update_dict["status"] == "PUBLISHED" and course.status != "PUBLISHED":
            course.published_at = datetime.now(timezone.utc)

        for k, v in update_dict.items():
            setattr(course, k, v)

        db.commit()
        db.refresh(course)
        return course

    @staticmethod
    def add_module(db: Session, course_id: uuid.UUID, data: ModuleCreate, trainer: User) -> CourseModule:
        """Add instructional module to a course."""
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

        if trainer.role.name != "ADMIN" and course.trainer_id != trainer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        module = CourseModule(
            course_id=course_id,
            title=data.title,
            description=data.description,
            order_index=data.order_index,
        )
        db.add(module)
        db.commit()
        db.refresh(module)
        return module

    @staticmethod
    def add_lesson(
        db: Session,
        course_id: uuid.UUID,
        module_id: uuid.UUID,
        data: LessonCreate,
        trainer: User,
    ) -> Lesson:
        """Add instructional lesson to module."""
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

        if trainer.role.name != "ADMIN" and course.trainer_id != trainer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        module = db.query(CourseModule).filter(CourseModule.id == module_id, CourseModule.course_id == course_id).first()
        if not module:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found.")

        lesson = Lesson(
            module_id=module_id,
            title=data.title,
            description=data.description,
            content_type=data.content_type,
            content_body=data.content_body,
            duration_minutes=data.duration_minutes,
            order_index=data.order_index,
            is_mandatory=data.is_mandatory,
        )
        db.add(lesson)
        db.commit()
        db.refresh(lesson)
        return lesson

    @staticmethod
    def add_resource(db: Session, course_id: uuid.UUID, data: ResourceCreate, trainer: User) -> Resource:
        """Add learning asset or document to course."""
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

        if trainer.role.name != "ADMIN" and course.trainer_id != trainer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

        res = Resource(
            course_id=course_id,
            title=data.title,
            resource_type=data.resource_type,
            file_url=data.url_or_path,
            description=data.description,
        )
        db.add(res)
        db.commit()
        db.refresh(res)
        return res

    @staticmethod
    def get_trainee_performance(
        db: Session,
        trainer: User,
        course_id: Optional[uuid.UUID] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> TraineePerformanceResponse:
        """Tabular performance tracking for trainees enrolled in trainer's courses."""
        trainer_course_ids = [
            c[0] for c in db.query(Course.id).filter(Course.trainer_id == trainer.id).all()
        ]
        if trainer.role.name == "ADMIN":
            trainer_course_ids = [c[0] for c in db.query(Course.id).all()]

        if not trainer_course_ids:
            return TraineePerformanceResponse(total_count=0, page=page, page_size=page_size, items=[])

        query = (
            db.query(Enrollment)
            .options(
                joinedload(Enrollment.user),
                joinedload(Enrollment.progress),
                joinedload(Enrollment.course).joinedload(Course.modules).joinedload(CourseModule.lessons),
            )
            .filter(Enrollment.course_id.in_(trainer_course_ids))
        )

        if course_id:
            query = query.filter(Enrollment.course_id == course_id)

        if search:
            query = query.join(User, Enrollment.user_id == User.id).filter(
                (User.first_name.ilike(f"%{search}%"))
                | (User.last_name.ilike(f"%{search}%"))
                | (User.email.ilike(f"%{search}%"))
            )

        total_count = query.count()
        enrollments = (
            query.order_by(Enrollment.enrolled_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        items = []
        for e in enrollments:
            # Count total lessons in course
            all_lessons = [
                lesson
                for module in e.course.modules
                for lesson in module.lessons
            ]
            total_lessons = len(all_lessons)
            completed_lessons = e.progress.completed_lessons_count if e.progress else 0
            progress_pct = (
                e.progress.completion_percentage
                if e.progress
                else (round((completed_lessons / total_lessons * 100.0), 1) if total_lessons > 0 else 0.0)
            )

            # Assessment attempts in this course
            attempts = (
                db.query(AssessmentAttempt)
                .join(Assessment, AssessmentAttempt.assessment_id == Assessment.id)
                .filter(
                    Assessment.course_id == e.course_id,
                    AssessmentAttempt.user_id == e.user_id,
                    AssessmentAttempt.status == "EVALUATED",
                )
                .order_by(AssessmentAttempt.submitted_at.desc())
                .all()
            )
            latest_attempt = attempts[0] if attempts else None

            items.append(
                TraineePerformanceItem(
                    trainee_id=e.user.id,
                    trainee_name=f"{e.user.first_name} {e.user.last_name}",
                    trainee_email=e.user.email,
                    course_id=e.course.id,
                    course_title=e.course.title,
                    enrollment_status=e.status,
                    enrolled_at=e.enrolled_at,
                    progress_percentage=progress_pct,
                    completed_lessons=completed_lessons,
                    total_lessons=total_lessons,
                    assessment_attempts_count=len(attempts),
                    latest_score=latest_attempt.percentage if latest_attempt else None,
                    is_passed=latest_attempt.is_passed if latest_attempt else None,
                )
            )

        return TraineePerformanceResponse(
            total_count=total_count,
            page=page,
            page_size=page_size,
            items=items,
        )
