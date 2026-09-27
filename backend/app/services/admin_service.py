import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models.user import User, Role, AuthSession
from app.models.course import Course, CourseCategory, Enrollment
from app.models.assessment import Assessment, AssessmentAttempt
from app.schemas.admin import (
    AdminDashboardStats,
    AdminCourseItem,
    AdminAssessmentItem,
)
from app.schemas.user import UserProfileResponse


class AdminService:
    @staticmethod
    def get_dashboard_stats(db: Session) -> AdminDashboardStats:
        """Aggregate platform-wide telemetry and operational analytics."""
        total_users = db.query(func.count(User.id)).scalar() or 0
        pending_users = db.query(func.count(User.id)).filter(User.account_status == "PENDING").scalar() or 0

        trainee_role = db.query(Role).filter(Role.name == "TRAINEE").first()
        trainer_role = db.query(Role).filter(Role.name == "TRAINER").first()
        admin_role = db.query(Role).filter(Role.name == "ADMIN").first()

        active_trainees = (
            db.query(func.count(User.id))
            .filter(User.role_id == trainee_role.id, User.account_status == "ACTIVE")
            .scalar()
            or 0
            if trainee_role
            else 0
        )
        active_trainers = (
            db.query(func.count(User.id))
            .filter(User.role_id == trainer_role.id, User.account_status == "ACTIVE")
            .scalar()
            or 0
            if trainer_role
            else 0
        )

        users_by_role = {
            "TRAINEE": db.query(func.count(User.id)).filter(User.role_id == trainee_role.id).scalar() or 0 if trainee_role else 0,
            "TRAINER": db.query(func.count(User.id)).filter(User.role_id == trainer_role.id).scalar() or 0 if trainer_role else 0,
            "ADMIN": db.query(func.count(User.id)).filter(User.role_id == admin_role.id).scalar() or 0 if admin_role else 0,
        }

        total_courses = db.query(func.count(Course.id)).scalar() or 0
        published_courses = db.query(func.count(Course.id)).filter(Course.status == "PUBLISHED").scalar() or 0

        total_enrollments = db.query(func.count(Enrollment.id)).scalar() or 0
        completed_enrollments = (
            db.query(func.count(Enrollment.id)).filter(Enrollment.status == "COMPLETED").scalar() or 0
        )
        overall_completion_rate = (
            round((completed_enrollments / total_enrollments * 100.0), 1) if total_enrollments > 0 else 0.0
        )

        assessment_attempts = (
            db.query(func.count(AssessmentAttempt.id))
            .filter(AssessmentAttempt.status == "EVALUATED")
            .scalar()
            or 0
        )

        # Category distribution
        categories = db.query(CourseCategory).options(joinedload(CourseCategory.courses)).all()
        category_distribution = [
            {"category": cat.name, "count": len(cat.courses)}
            for cat in categories
        ]

        # Recent activity
        recent_activity: List[Dict[str, Any]] = []
        recent_users = (
            db.query(User)
            .options(joinedload(User.role))
            .order_by(User.created_at.desc())
            .limit(5)
            .all()
        )
        for u in recent_users:
            recent_activity.append({
                "type": "USER_REGISTRATION",
                "title": f"New user {u.first_name} {u.last_name} registered as {u.role.name}",
                "timestamp": u.created_at.isoformat() if u.created_at else None,
            })

        recent_submissions = (
            db.query(AssessmentAttempt)
            .options(joinedload(AssessmentAttempt.user), joinedload(AssessmentAttempt.assessment))
            .filter(AssessmentAttempt.status == "EVALUATED")
            .order_by(AssessmentAttempt.submitted_at.desc())
            .limit(5)
            .all()
        )
        for s in recent_submissions:
            recent_activity.append({
                "type": "ASSESSMENT_SUBMISSION",
                "title": f"{s.user.first_name} {s.user.last_name} scored {s.percentage}% on {s.assessment.title}",
                "timestamp": s.submitted_at.isoformat() if s.submitted_at else None,
            })

        recent_activity.sort(key=lambda x: x["timestamp"] or "", reverse=True)
        recent_activity = recent_activity[:8]

        return AdminDashboardStats(
            total_users=total_users,
            pending_users=pending_users,
            active_trainees=active_trainees,
            active_trainers=active_trainers,
            total_courses=total_courses,
            published_courses=published_courses,
            total_enrollments=total_enrollments,
            assessment_attempts=assessment_attempts,
            certifications_count=completed_enrollments,
            overall_completion_rate=overall_completion_rate,
            users_by_role=users_by_role,
            category_distribution=category_distribution,
            recent_activity=recent_activity,
        )

    @staticmethod
    def list_users(
        db: Session,
        role_filter: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 50,
    ) -> List[UserProfileResponse]:
        """Query and paginate users with status, role, and keyword filters."""
        query = db.query(User).options(joinedload(User.role))

        if role_filter:
            query = query.join(Role).filter(Role.name == role_filter)

        if status_filter:
            query = query.filter(User.account_status == status_filter)

        if search:
            query = query.filter(
                (User.first_name.ilike(f"%{search}%"))
                | (User.last_name.ilike(f"%{search}%"))
                | (User.email.ilike(f"%{search}%"))
                | (User.username.ilike(f"%{search}%"))
            )

        users = (
            query.order_by(User.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return [
            UserProfileResponse(
                id=u.id,
                email=u.email,
                username=u.username,
                first_name=u.first_name,
                last_name=u.last_name,
                phone_number=u.phone_number,
                avatar_url=u.avatar_url,
                role=u.role.name,
                account_status=u.account_status,
                is_active=u.is_active,
                is_verified=u.is_verified,
                organization_id=u.organization_id,
                department_id=u.department_id,
                created_at=u.created_at,
                updated_at=u.updated_at,
            )
            for u in users
        ]

    @staticmethod
    def update_user_status(
        db: Session,
        user_id: uuid.UUID,
        new_status: str,
        admin: User,
    ) -> UserProfileResponse:
        """Update user account status with self-protection safeguards."""
        if admin.id == user_id and new_status in ["SUSPENDED", "REJECTED"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Administrators cannot suspend or reject their own account.",
            )

        user = db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        user.account_status = new_status
        user.is_active = new_status == "ACTIVE"

        if new_status == "SUSPENDED":
            now = datetime.now(timezone.utc)
            db.query(AuthSession).filter(
                AuthSession.user_id == user.id,
                AuthSession.revoked_at.is_(None),
            ).update({AuthSession.revoked_at: now}, synchronize_session=False)

        db.commit()
        db.refresh(user)

        return UserProfileResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            phone_number=user.phone_number,
            avatar_url=user.avatar_url,
            role=user.role.name,
            account_status=user.account_status,
            is_active=user.is_active,
            is_verified=user.is_verified,
            organization_id=user.organization_id,
            department_id=user.department_id,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    @staticmethod
    def update_user_role(
        db: Session,
        user_id: uuid.UUID,
        new_role_name: str,
        admin: User,
    ) -> UserProfileResponse:
        """Change user role with self-demotion safeguards."""
        if admin.id == user_id and new_role_name != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Administrators cannot demote themselves.",
            )

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        target_role = db.query(Role).filter(Role.name == new_role_name).first()
        if not target_role:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid role '{new_role_name}'.")

        user.role_id = target_role.id
        db.commit()
        db.refresh(user)

        return UserProfileResponse(
            id=user.id,
            email=user.email,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            phone_number=user.phone_number,
            avatar_url=user.avatar_url,
            role=target_role.name,
            account_status=user.account_status,
            is_active=user.is_active,
            is_verified=user.is_verified,
            organization_id=user.organization_id,
            department_id=user.department_id,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    @staticmethod
    def list_courses(db: Session) -> List[AdminCourseItem]:
        """List all courses across the institution with metrics."""
        courses = (
            db.query(Course)
            .options(
                joinedload(Course.category),
                joinedload(Course.trainer),
                joinedload(Course.enrollments),
            )
            .order_by(Course.created_at.desc())
            .all()
        )

        results = []
        for c in courses:
            total_enr = len(c.enrollments)
            comp_enr = len([e for e in c.enrollments if e.status == "COMPLETED"])
            comp_rate = round((comp_enr / total_enr * 100.0), 1) if total_enr > 0 else 0.0

            results.append(
                AdminCourseItem(
                    id=c.id,
                    title=c.title,
                    code=c.code,
                    category_name=c.category.name if c.category else "",
                    trainer_name=f"{c.trainer.first_name} {c.trainer.last_name}" if c.trainer else "Unassigned",
                    status=c.status,
                    difficulty_level=c.difficulty_level,
                    enrollments_count=total_enr,
                    completion_rate=comp_rate,
                    created_at=c.created_at,
                )
            )
        return results

    @staticmethod
    def update_course_status(db: Session, course_id: uuid.UUID, new_status: str) -> AdminCourseItem:
        """Publish, unpublish, or archive a course."""
        course = (
            db.query(Course)
            .options(joinedload(Course.category), joinedload(Course.trainer), joinedload(Course.enrollments))
            .filter(Course.id == course_id)
            .first()
        )
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

        course.status = new_status
        if new_status == "PUBLISHED" and not course.published_at:
            course.published_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(course)

        total_enr = len(course.enrollments)
        comp_enr = len([e for e in course.enrollments if e.status == "COMPLETED"])
        comp_rate = round((comp_enr / total_enr * 100.0), 1) if total_enr > 0 else 0.0

        return AdminCourseItem(
            id=course.id,
            title=course.title,
            code=course.code,
            category_name=course.category.name if course.category else "",
            trainer_name=f"{course.trainer.first_name} {course.trainer.last_name}" if course.trainer else "Unassigned",
            status=course.status,
            difficulty_level=course.difficulty_level,
            enrollments_count=total_enr,
            completion_rate=comp_rate,
            created_at=course.created_at,
        )

    @staticmethod
    def list_assessments(db: Session) -> List[AdminAssessmentItem]:
        """List all assessments with cross-institutional attempt metrics."""
        assessments = (
            db.query(Assessment)
            .options(
                joinedload(Assessment.course).joinedload(Course.trainer),
                joinedload(Assessment.attempts),
            )
            .order_by(Assessment.created_at.desc())
            .all()
        )

        results = []
        for a in assessments:
            eval_attempts = [att for att in a.attempts if att.status == "EVALUATED"]
            attempts_count = len(eval_attempts)
            avg_score = (
                round(sum(att.percentage for att in eval_attempts) / attempts_count, 1)
                if attempts_count > 0
                else 0.0
            )
            passed_count = len([att for att in eval_attempts if att.is_passed is True])
            pass_rate = round((passed_count / attempts_count * 100.0), 1) if attempts_count > 0 else 0.0

            trainer_name = "Unassigned"
            if a.course and a.course.trainer:
                trainer_name = f"{a.course.trainer.first_name} {a.course.trainer.last_name}"

            results.append(
                AdminAssessmentItem(
                    id=a.id,
                    title=a.title,
                    course_title=a.course.title if a.course else "",
                    trainer_name=trainer_name,
                    assessment_type=a.assessment_type,
                    duration_minutes=a.duration_minutes,
                    passing_percentage=a.passing_percentage,
                    status=a.status,
                    attempts_count=attempts_count,
                    average_score=avg_score,
                    pass_rate=pass_rate,
                )
            )
        return results
