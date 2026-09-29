import uuid
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models.user import (
    User,
    TraineeProfile,
    Qualification,
    Experience,
    Skill,
    UserSkill,
    Certification,
)
from app.models.competency import UserCompetency, Competency
from app.models.course import Enrollment, CourseProgress
from app.models.organization import Organization, Department
from app.schemas.trainee import (
    TraineeProfileResponse,
    TraineeProfileUpdateRequest,
    TraineeDashboardResponse,
    QualificationItem,
    ExperienceItem,
    SkillItem,
    CompetencyOverviewItem,
    CertificateItem,
)
from app.services.enrollment_service import EnrollmentService


class TraineeService:
    @staticmethod
    def calculate_profile_completion(user: User) -> tuple[float, Dict[str, bool]]:
        tp = user.trainee_profile

        has_personal = bool(user.first_name and user.last_name and user.email and user.phone_number)
        has_professional = bool(
            tp and (tp.designation or tp.cadre or tp.posting_location or tp.bio)
        )
        has_qualifications = len(user.qualifications) > 0
        has_experience = len(user.experiences) > 0
        has_skills = len(user.user_skills) > 0

        score = 0.0
        if has_personal:
            score += 20.0
        elif user.first_name and user.last_name and user.email:
            score += 15.0  # partial personal

        if has_professional:
            score += 25.0
        if has_qualifications:
            score += 20.0
        if has_experience:
            score += 15.0
        if has_skills:
            score += 20.0

        breakdown = {
            "personal_info": has_personal,
            "professional_info": has_professional,
            "qualifications": has_qualifications,
            "experience": has_experience,
            "skills": has_skills,
        }

        return min(100.0, round(score, 1)), breakdown

    @staticmethod
    def get_profile(db: Session, current_user: User) -> TraineeProfileResponse:
        user = (
            db.query(User)
            .options(
                joinedload(User.role),
                joinedload(User.trainee_profile),
                joinedload(User.organization),
                joinedload(User.department),
                joinedload(User.qualifications),
                joinedload(User.experiences),
                joinedload(User.user_skills).joinedload(UserSkill.skill),
            )
            .filter(User.id == current_user.id)
            .first()
        )

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        tp = user.trainee_profile
        completion_pct, breakdown = TraineeService.calculate_profile_completion(user)

        qualifications_list = [
            QualificationItem.model_validate(q) for q in user.qualifications
        ]
        experiences_list = [
            ExperienceItem.model_validate(e) for e in user.experiences
        ]

        skills_list: List[SkillItem] = []
        for us in user.user_skills:
            if us.skill:
                skills_list.append(
                    SkillItem(
                        id=us.id,
                        skill_id=us.skill.id,
                        name=us.skill.name,
                        category=us.skill.category,
                        proficiency_level=us.proficiency_level,
                        years_of_experience=us.years_of_experience,
                        is_verified=us.is_verified,
                    )
                )

        return TraineeProfileResponse(
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
            organization_name=user.organization.name if user.organization else None,
            department_id=user.department_id,
            department_name=user.department.name if user.department else None,
            employee_id=tp.employee_id if tp else None,
            designation=tp.designation if tp else None,
            cadre=tp.cadre if tp else None,
            posting_location=tp.posting_location if tp else None,
            bio=tp.bio if tp else None,
            interests=tp.interests if tp else None,
            target_competency_level=tp.target_competency_level if tp else None,
            readiness_score=tp.readiness_score if tp else 0.0,
            qualifications=qualifications_list,
            experiences=experiences_list,
            skills=skills_list,
            profile_completion_percentage=completion_pct,
            completion_breakdown=breakdown,
        )

    @staticmethod
    def update_profile(
        db: Session,
        current_user: User,
        data: TraineeProfileUpdateRequest,
    ) -> TraineeProfileResponse:
        user = (
            db.query(User)
            .options(
                joinedload(User.trainee_profile),
                joinedload(User.qualifications),
                joinedload(User.experiences),
                joinedload(User.user_skills),
            )
            .filter(User.id == current_user.id)
            .first()
        )
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Update User fields
        if data.first_name is not None:
            user.first_name = data.first_name.strip()
        if data.last_name is not None:
            user.last_name = data.last_name.strip()
        if data.phone_number is not None:
            user.phone_number = data.phone_number.strip()
        if data.organization_id is not None:
            user.organization_id = data.organization_id
        if data.department_id is not None:
            user.department_id = data.department_id

        # Update TraineeProfile fields
        tp = user.trainee_profile
        if not tp:
            tp = TraineeProfile(user_id=user.id)
            db.add(tp)

        if data.designation is not None:
            tp.designation = data.designation.strip()
        if data.cadre is not None:
            tp.cadre = data.cadre.strip()
        if data.posting_location is not None:
            tp.posting_location = data.posting_location.strip()
        if data.bio is not None:
            tp.bio = data.bio.strip()
        if data.interests is not None:
            tp.interests = data.interests.strip()

        # Update qualifications if provided
        if data.qualifications is not None:
            user.qualifications.clear()
            for q_data in data.qualifications:
                q = Qualification(
                    user_id=user.id,
                    degree=q_data.degree,
                    field_of_study=q_data.field_of_study,
                    institution=q_data.institution,
                    year_of_passing=q_data.year_of_passing,
                    grade_or_percentage=q_data.grade_or_percentage,
                )
                db.add(q)

        # Update experiences if provided
        if data.experiences is not None:
            user.experiences.clear()
            for exp_data in data.experiences:
                exp = Experience(
                    user_id=user.id,
                    title=exp_data.title,
                    organization_name=exp_data.organization_name,
                    location=exp_data.location,
                    start_date=exp_data.start_date,
                    end_date=exp_data.end_date,
                    is_current=exp_data.is_current,
                    description=exp_data.description,
                )
                db.add(exp)

        # Update skills if provided
        if data.skills is not None:
            user.user_skills.clear()
            for s_data in data.skills:
                # Find or create skill
                skill = (
                    db.query(Skill)
                    .filter(func.lower(Skill.name) == s_data.name.strip().lower())
                    .first()
                )
                if not skill:
                    skill = Skill(name=s_data.name.strip(), category=s_data.category)
                    db.add(skill)
                    db.flush()

                user_skill = UserSkill(
                    user_id=user.id,
                    skill_id=skill.id,
                    proficiency_level=s_data.proficiency_level or "BEGINNER",
                    years_of_experience=s_data.years_of_experience,
                    is_verified=False,
                )
                db.add(user_skill)

        db.commit()
        return TraineeService.get_profile(db, user)

    @staticmethod
    def get_dashboard(db: Session, current_user: User) -> TraineeDashboardResponse:
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Counts
        enrolled_count = (
            db.query(Enrollment).filter(Enrollment.user_id == current_user.id).count()
        )
        completed_count = (
            db.query(Enrollment)
            .filter(
                Enrollment.user_id == current_user.id,
                Enrollment.status == "COMPLETED",
            )
            .count()
        )

        # Average Progress
        avg_progress = (
            db.query(func.avg(CourseProgress.completion_percentage))
            .join(Enrollment, CourseProgress.enrollment_id == Enrollment.id)
            .filter(Enrollment.user_id == current_user.id)
            .scalar()
        )
        avg_progress_val = round(float(avg_progress), 1) if avg_progress is not None else 0.0

        # Profile completion
        profile_completion_pct, _ = TraineeService.calculate_profile_completion(user)

        # Recent Learning (first 4 items)
        my_learning = EnrollmentService.get_my_learning(db, current_user)
        recent_learning = my_learning[:4]

        # Competencies
        user_comps = (
            db.query(UserCompetency)
            .options(joinedload(UserCompetency.competency))
            .filter(UserCompetency.user_id == current_user.id)
            .all()
        )
        competencies_overview: List[CompetencyOverviewItem] = []
        for uc in user_comps:
            if uc.competency:
                competencies_overview.append(
                    CompetencyOverviewItem(
                        id=uc.id,
                        competency_id=uc.competency.id,
                        name=uc.competency.name,
                        code=uc.competency.code,
                        category=uc.competency.category,
                        current_level=uc.current_level,
                        target_level=3,
                        confidence_score=uc.confidence_score,
                    )
                )

        # Accredited Course Completion Certificates
        from app.models.certificate import Certificate
        certs = (
            db.query(Certificate)
            .options(joinedload(Certificate.course))
            .filter(Certificate.user_id == current_user.id)
            .order_by(Certificate.issue_date.desc(), Certificate.created_at.desc())
            .all()
        )
        certificates: List[CertificateItem] = []
        for cert in certs:
            certificates.append(
                CertificateItem(
                    id=cert.id,
                    title=cert.course.title if cert.course else "Accredited Training Course",
                    course_id=cert.course_id,
                    course_title=cert.course.title if cert.course else None,
                    issuing_organization="India Meteorological Department (IMD)",
                    credential_id=cert.certificate_number,
                    issue_date=cert.issue_date,
                    verification_status=cert.status,
                )
            )

        user_summary = {
            "id": str(user.id),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "role": user.role.name if user.role else "TRAINEE",
            "account_status": user.account_status,
            "organization": user.organization.name if user.organization else "India Meteorological Department (IMD)",
            "department": user.department.name if user.department else "National Weather Forecasting Centre",
        }

        welcome_message = f"Welcome back, {user.first_name}!"

        return TraineeDashboardResponse(
            welcome_message=welcome_message,
            user_summary=user_summary,
            profile_completion_percentage=profile_completion_pct,
            courses_enrolled_count=enrolled_count,
            courses_completed_count=completed_count,
            average_progress_percentage=avg_progress_val,
            recent_learning=recent_learning,
            upcoming_assessments=[],  # Honest placeholder
            competencies=competencies_overview,
            certificates=certificates,
            notifications=[],  # Honest placeholder
        )
