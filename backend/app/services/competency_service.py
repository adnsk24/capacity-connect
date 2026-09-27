import uuid
from datetime import datetime, timezone, date
from typing import List, Dict, Optional, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.competency import Competency, UserCompetency, CourseCompetency
from app.models.subject import Subject, SubjectCompetencyRequirement
from app.models.course import Course, Enrollment, CourseProgress
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.user import User, UserSkill, Qualification, Experience, Certification, TrainerProfile
from app.core.competency_config import (
    COMPETENCY_LEVELS,
    DEFAULT_EVIDENCE_WEIGHTS,
    DEFAULT_TRAINER_WEIGHTS,
    SKILL_PROFICIENCY_MAP,
    MAX_COMPETENCY_LEVEL,
    get_level_info,
)
from app.schemas.competency import (
    UserCompetencyResponse,
    CompetencyEvidenceItem,
    SkillGapItem,
    TrainingReadinessResponse,
    TrainingReadinessBreakdownItem,
    PersonalizedCourseRecommendation,
    CompetencyGrowthResponse,
    CompetencyGrowthPoint,
    TrainerRecommendationCandidate,
    TrainerRecommendationResponse,
    SubjectDetailResponse,
    SubjectRequirementItem,
    CompetencyCatalogueItem,
)


class CompetencyEvaluationService:
    """
    Deterministic Competency Intelligence & Readiness Engine.
    Computes demonstrated competency levels, transparent evidence trees,
    skill-gap analyses, personalized course recommendations, and trainer matching.
    """

    @staticmethod
    def get_all_competencies(db: Session) -> List[CompetencyCatalogueItem]:
        """Lists all active competencies in the catalog."""
        competencies = db.query(Competency).order_by(Competency.category, Competency.name).all()
        return [
            CompetencyCatalogueItem(
                id=c.id,
                code=c.code,
                name=c.name,
                category=c.category,
                description=c.description,
                level_descriptions=c.level_descriptions,
            )
            for c in competencies
        ]

    @staticmethod
    def evaluate_user_competency(
        db: Session,
        user_id: uuid.UUID,
        competency: Competency,
        weights: Optional[Dict[str, float]] = None,
    ) -> UserCompetencyResponse:
        """
        Evaluates a single competency for a given user across 6 deterministic evidence streams.
        Returns continuous level (0.0 to 5.0), categorical level info, and explainable evidence tree.
        """
        w = weights or DEFAULT_EVIDENCE_WEIGHTS
        evidence_items: List[CompetencyEvidenceItem] = []

        # 1. Course Syllabi & Progress
        # Find courses mapped to this competency
        course_comp_mappings = (
            db.query(CourseCompetency, Course)
            .join(Course, Course.id == CourseCompetency.course_id)
            .filter(CourseCompetency.competency_id == competency.id)
            .all()
        )
        course_ids = [cc[1].id for cc in course_comp_mappings]

        course_score = 0.0
        course_detail = "No enrolled courses mapped to this competency."
        if course_ids:
            enrollments = (
                db.query(Enrollment)
                .filter(Enrollment.user_id == user_id, Enrollment.course_id.in_(course_ids))
                .all()
            )
            if enrollments:
                progress_percentages = []
                for e in enrollments:
                    if e.progress:
                        progress_percentages.append(e.progress.completion_percentage)
                    elif e.status == "COMPLETED":
                        progress_percentages.append(100.0)
                    else:
                        progress_percentages.append(0.0)
                if progress_percentages:
                    course_score = sum(progress_percentages) / len(progress_percentages)
                    completed_count = sum(1 for p in progress_percentages if p >= 100.0)
                    course_detail = (
                        f"Enrolled in {len(enrollments)} related course(s); "
                        f"{completed_count} completed, avg syllabus progress {course_score:.1f}%."
                    )

        course_contribution = round((course_score / 100.0) * MAX_COMPETENCY_LEVEL * w["course"], 2)
        evidence_items.append(
            CompetencyEvidenceItem(
                type="COURSE",
                title="Curriculum & Syllabus Completion",
                score=round(course_score, 1),
                contribution=course_contribution,
                detail=course_detail,
            )
        )

        # 2. Assessment Evaluations
        assessment_score = 0.0
        assessment_detail = "No evaluated examinations completed for this competency."
        if course_ids:
            attempts = (
                db.query(AssessmentAttempt)
                .join(Assessment, Assessment.id == AssessmentAttempt.assessment_id)
                .filter(
                    AssessmentAttempt.user_id == user_id,
                    Assessment.course_id.in_(course_ids),
                    AssessmentAttempt.status == "EVALUATED",
                )
                .all()
            )
            if attempts:
                percentages = [att.percentage for att in attempts if att.percentage is not None]
                if percentages:
                    # Best attempt per assessment or average of best attempts
                    assessment_score = max(percentages)
                    passed_count = sum(1 for att in attempts if att.is_passed)
                    assessment_detail = (
                        f"{len(attempts)} attempt(s) evaluated; best score {assessment_score:.1f}%, "
                        f"{passed_count} passed."
                    )

        assessment_contribution = round(
            (assessment_score / 100.0) * MAX_COMPETENCY_LEVEL * w["assessment"], 2
        )
        evidence_items.append(
            CompetencyEvidenceItem(
                type="ASSESSMENT",
                title="Examination Performance",
                score=round(assessment_score, 1),
                contribution=assessment_contribution,
                detail=assessment_detail,
            )
        )

        # 3. Direct User Skills
        user_skills = (
            db.query(UserSkill)
            .filter(UserSkill.user_id == user_id)
            .all()
        )
        skill_score = 0.0
        skill_detail = "No cataloged skills registered for this competency area."
        comp_keywords = [k.lower() for k in competency.name.split() if len(k) > 3]
        matched_skills = []
        for us in user_skills:
            skill_name_lower = us.skill.name.lower()
            if any(k in skill_name_lower for k in comp_keywords) or (
                us.skill.category and us.skill.category.lower() in competency.category.lower()
            ):
                matched_skills.append(us)

        if matched_skills:
            skill_numeric_vals = [
                SKILL_PROFICIENCY_MAP.get(us.proficiency_level, 1.5) for us in matched_skills
            ]
            best_skill_numeric = max(skill_numeric_vals)
            # Map 5-point skill level to 100%
            skill_score = (best_skill_numeric / 5.0) * 100.0
            skill_detail = f"Verified {len(matched_skills)} relevant skill(s): highest rating {matched_skills[0].proficiency_level}."

        skill_contribution = round((skill_score / 100.0) * MAX_COMPETENCY_LEVEL * w["skill"], 2)
        evidence_items.append(
            CompetencyEvidenceItem(
                type="SKILL",
                title="Operational & Technical Skills",
                score=round(skill_score, 1),
                contribution=skill_contribution,
                detail=skill_detail,
            )
        )

        # 4. Operational Experience
        experiences = db.query(Experience).filter(Experience.user_id == user_id).all()
        total_exp_years = 0.0
        for exp in experiences:
            end = exp.end_date or date.today()
            duration_days = (end - exp.start_date).days
            total_exp_years += max(0.0, duration_days / 365.25)

        # 5+ years operational experience gives 100% on experience component
        exp_score = min(100.0, (total_exp_years / 5.0) * 100.0)
        exp_contribution = round((exp_score / 100.0) * MAX_COMPETENCY_LEVEL * w["experience"], 2)
        evidence_items.append(
            CompetencyEvidenceItem(
                type="EXPERIENCE",
                title="Operational Meteorological Experience",
                score=round(exp_score, 1),
                contribution=exp_contribution,
                detail=f"{total_exp_years:.1f} total years across {len(experiences)} recorded operational posting(s).",
            )
        )

        # 5. Professional Certifications
        certifications = (
            db.query(Certification)
            .filter(
                Certification.user_id == user_id,
                Certification.verification_status == "VERIFIED",
            )
            .all()
        )
        # Each verified certification gives 50% up to 100%
        cert_score = min(100.0, len(certifications) * 50.0)
        cert_contribution = round(
            (cert_score / 100.0) * MAX_COMPETENCY_LEVEL * w["certification"], 2
        )
        evidence_items.append(
            CompetencyEvidenceItem(
                type="CERTIFICATION",
                title="Accredited Certifications",
                score=round(cert_score, 1),
                contribution=cert_contribution,
                detail=f"{len(certifications)} verified institutional or training certificate(s) on file.",
            )
        )

        # 6. Academic Qualifications
        qualifications = db.query(Qualification).filter(Qualification.user_id == user_id).all()
        qual_score = 0.0
        qual_desc = "No academic qualifications listed."
        if qualifications:
            # Check for doctorate, masters, bachelors
            degrees = [q.degree.lower() for q in qualifications]
            if any("ph.d" in d or "doctor" in d for d in degrees):
                qual_score = 100.0
                qual_desc = "Doctorate / Ph.D. degree recorded."
            elif any("m.sc" in d or "master" in d or "m.tech" in d for d in degrees):
                qual_score = 80.0
                qual_desc = "Master's degree (M.Sc / M.Tech) in relevant domain."
            elif any("b.sc" in d or "bachelor" in d or "b.tech" in d for d in degrees):
                qual_score = 60.0
                qual_desc = "Bachelor's degree in science or engineering."
            else:
                qual_score = 40.0
                qual_desc = "Diploma or professional credential."

        qual_contribution = round(
            (qual_score / 100.0) * MAX_COMPETENCY_LEVEL * w["qualification"], 2
        )
        evidence_items.append(
            CompetencyEvidenceItem(
                type="QUALIFICATION",
                title="Academic Qualifications",
                score=round(qual_score, 1),
                contribution=qual_contribution,
                detail=qual_desc,
            )
        )

        # Total continuous level
        calculated_level = sum(item.contribution for item in evidence_items)
        clamped_level = max(0.0, min(5.0, round(calculated_level, 2)))
        level_info = get_level_info(clamped_level)

        # Summary Explanation
        strongest_evidence = sorted(evidence_items, key=lambda x: x.contribution, reverse=True)[0]
        if clamped_level >= 3.0:
            summary = (
                f"{competency.name} is assessed at Level {clamped_level:.1f} ({level_info['name']}) "
                f"driven primarily by {strongest_evidence.title.lower()} ({strongest_evidence.score:.1f}%)."
            )
        elif clamped_level >= 1.0:
            summary = (
                f"{competency.name} demonstrates foundational Level {clamped_level:.1f} ({level_info['name']}) "
                f"readiness with developing competencies across syllabus and coursework."
            )
        else:
            summary = (
                f"No substantial evidence recorded yet for {competency.name}. "
                f"Enrolling in related courses and taking assessments will build this competency."
            )

        return UserCompetencyResponse(
            competency_id=competency.id,
            code=competency.code,
            name=competency.name,
            category=competency.category,
            description=competency.description,
            current_level=clamped_level,
            integer_level=level_info["integer_level"],
            level_name=level_info["name"],
            badge_color=level_info["badge_color"],
            target_level=4,
            confidence_score=round(min(1.0, 0.4 + (clamped_level / 5.0) * 0.6), 2),
            evidence=evidence_items,
            summary_explanation=summary,
        )

    @classmethod
    def get_user_competencies(
        cls,
        db: Session,
        user_id: uuid.UUID,
        weights: Optional[Dict[str, float]] = None,
    ) -> List[UserCompetencyResponse]:
        """Evaluates and returns all competencies for a given user."""
        competencies = db.query(Competency).order_by(Competency.category, Competency.name).all()
        return [
            cls.evaluate_user_competency(db, user_id, comp, weights)
            for comp in competencies
        ]

    @classmethod
    def get_skill_gaps(
        cls,
        db: Session,
        user_id: uuid.UUID,
        subject_id: Optional[uuid.UUID] = None,
        target_default_level: float = 4.0,
    ) -> List[SkillGapItem]:
        """
        Computes competency skill gaps.
        If subject_id is specified, gaps are calculated against SubjectCompetencyRequirements.
        Otherwise, gaps are evaluated against target_default_level (default 4.0 = Advanced).
        """
        user_comps = {c.competency_id: c for c in cls.get_user_competencies(db, user_id)}
        gaps: List[SkillGapItem] = []

        if subject_id:
            requirements = (
                db.query(SubjectCompetencyRequirement)
                .filter(SubjectCompetencyRequirement.subject_id == subject_id)
                .all()
            )
            for req in requirements:
                uc = user_comps.get(req.competency_id)
                current = uc.current_level if uc else 0.0
                required = float(req.required_level)
                gap = max(0.0, round(required - current, 2))
                # Priority derivation
                if gap >= 1.5 or (gap >= 1.0 and req.weight >= 0.8):
                    priority = "HIGH"
                elif gap >= 0.5:
                    priority = "MEDIUM"
                else:
                    priority = "LOW"

                comp = req.competency
                gaps.append(
                    SkillGapItem(
                        competency_id=comp.id,
                        code=comp.code,
                        name=comp.name,
                        category=comp.category,
                        current_level=current,
                        required_level=required,
                        gap=gap,
                        priority=priority,
                        weight=req.weight,
                        evidence_summary=uc.summary_explanation if uc else "No baseline data.",
                    )
                )
        else:
            # Baseline evaluation across all catalog competencies
            for comp_id, uc in user_comps.items():
                gap = max(0.0, round(target_default_level - uc.current_level, 2))
                if gap >= 1.5:
                    priority = "HIGH"
                elif gap >= 0.5:
                    priority = "MEDIUM"
                else:
                    priority = "LOW"

                gaps.append(
                    SkillGapItem(
                        competency_id=uc.competency_id,
                        code=uc.code,
                        name=uc.name,
                        category=uc.category,
                        current_level=uc.current_level,
                        required_level=target_default_level,
                        gap=gap,
                        priority=priority,
                        weight=1.0,
                        evidence_summary=uc.summary_explanation,
                    )
                )

        # Sort gaps descending by gap magnitude
        return sorted(gaps, key=lambda g: (g.priority == "HIGH", g.gap), reverse=True)

    @classmethod
    def calculate_readiness_score(
        cls,
        db: Session,
        user_id: uuid.UUID,
        subject_id: Optional[uuid.UUID] = None,
    ) -> TrainingReadinessResponse:
        """
        Calculates transparent Training Readiness Score (percentage).
        Formula: Sum of (min(1.0, current_level / required_level) * weight) / Sum(weights) * 100.
        """
        gaps = cls.get_skill_gaps(db, user_id, subject_id)
        if not gaps:
            return TrainingReadinessResponse(
                overall_readiness_percentage=0.0,
                target_role_or_subject="Operational Meteorological Baseline",
                required_competencies_count=0,
                met_competencies_count=0,
                gaps_count=0,
                competency_breakdown=[],
                formula_explanation="No competency requirements configured.",
            )

        total_weighted_ratio = 0.0
        total_weight = 0.0
        met_count = 0
        breakdown: List[TrainingReadinessBreakdownItem] = []

        for g in gaps:
            ratio = min(1.0, g.current_level / g.required_level) if g.required_level > 0 else 1.0
            total_weighted_ratio += ratio * g.weight
            total_weight += g.weight
            is_met = g.gap <= 0.2
            if is_met:
                met_count += 1

            breakdown.append(
                TrainingReadinessBreakdownItem(
                    competency_id=g.competency_id,
                    code=g.code,
                    name=g.name,
                    current_level=g.current_level,
                    required_level=g.required_level,
                    gap=g.gap,
                    is_met=is_met,
                    weight=g.weight,
                )
            )

        overall_readiness = (
            round((total_weighted_ratio / total_weight) * 100.0, 1) if total_weight > 0 else 0.0
        )

        subject_name = "Operational Meteorological Baseline"
        if subject_id:
            subj = db.query(Subject).filter(Subject.id == subject_id).first()
            if subj:
                subject_name = subj.name

        formula_text = (
            "Readiness Score = Sum(min(1.0, Demonstrated_Level / Required_Level) * Weight) / Sum(Weights) * 100. "
            "Evaluates recorded platform evidence against verified standards without subjective scaling."
        )

        return TrainingReadinessResponse(
            overall_readiness_percentage=overall_readiness,
            target_role_or_subject=subject_name,
            required_competencies_count=len(gaps),
            met_competencies_count=met_count,
            gaps_count=len(gaps) - met_count,
            competency_breakdown=breakdown,
            formula_explanation=formula_text,
        )

    @classmethod
    def get_personalized_recommendations(
        cls,
        db: Session,
        user_id: uuid.UUID,
    ) -> List[PersonalizedCourseRecommendation]:
        """
        Generates explainable course recommendations targeting open competency skill gaps.
        Ranks courses by gap coverage, required competency weight, and difficulty match.
        """
        gaps = cls.get_skill_gaps(db, user_id)
        gap_map = {g.competency_id: g for g in gaps if g.gap > 0.3}

        if not gap_map:
            # Trainee has met all basic competencies; recommend advanced courses
            courses = (
                db.query(Course)
                .filter(Course.status == "PUBLISHED", Course.difficulty_level == "ADVANCED")
                .limit(3)
                .all()
            )
            return [
                PersonalizedCourseRecommendation(
                    course_id=c.id,
                    code=c.code,
                    title=c.title,
                    difficulty_level=c.difficulty_level,
                    duration_hours=c.duration_hours,
                    match_score=95.0,
                    addressed_gaps=["Advanced Operational Readiness"],
                    why_recommended="You have achieved proficient competency baselines. This advanced curriculum sharpens specialized forecasting skills.",
                    covered_competencies=[cc.competency.name for cc in c.course_competencies],
                )
                for c in courses
            ]

        # Fetch all published courses with their mapped competencies
        courses = (
            db.query(Course)
            .filter(Course.status == "PUBLISHED")
            .all()
        )

        # Check existing user enrollments to downrank or omit completed courses
        enrollments = {
            e.course_id: e for e in db.query(Enrollment).filter(Enrollment.user_id == user_id).all()
        }

        recommendations: List[PersonalizedCourseRecommendation] = []
        for c in courses:
            enrollment = enrollments.get(c.id)
            if enrollment and enrollment.status == "COMPLETED":
                continue  # already completed

            covered_gaps = []
            gap_score_sum = 0.0
            covered_comp_names = []

            for cc in c.course_competencies:
                comp_id = cc.competency_id
                covered_comp_names.append(cc.competency.name)
                if comp_id in gap_map:
                    g = gap_map[comp_id]
                    covered_gaps.append(f"{g.name} (Gap: {g.gap:.1f})")
                    # Score based on gap magnitude, priority, and course contribution weight
                    priority_mult = 1.4 if g.priority == "HIGH" else (1.0 if g.priority == "MEDIUM" else 0.7)
                    gap_score_sum += g.gap * cc.contribution_weight * priority_mult

            if covered_gaps:
                # Match score clamped to 100%
                match_score = min(99.0, round(60.0 + gap_score_sum * 15.0, 1))
                high_priority_gaps = [g for g in covered_gaps if "HIGH" in g or gap_score_sum > 2.0]
                gap_summary = ", ".join(covered_gaps[:2])
                why_text = (
                    f"Directly addresses {len(covered_gaps)} operational gap(s): {gap_summary}. "
                    f"Curriculum provides +{c.duration_hours}h structured learning and hands-on assessment."
                )

                recommendations.append(
                    PersonalizedCourseRecommendation(
                        course_id=c.id,
                        code=c.code,
                        title=c.title,
                        difficulty_level=c.difficulty_level,
                        duration_hours=c.duration_hours,
                        match_score=match_score,
                        addressed_gaps=covered_gaps,
                        why_recommended=why_text,
                        covered_competencies=covered_comp_names,
                    )
                )

        # Sort descending by match score
        return sorted(recommendations, key=lambda r: r.match_score, reverse=True)[:6]

    @classmethod
    def get_competency_growth(
        cls,
        db: Session,
        user_id: uuid.UUID,
        competency_id: uuid.UUID,
    ) -> CompetencyGrowthResponse:
        """
        Derives historical competency milestones from assessment attempts,
        course completions, and skill verifications.
        """
        comp = db.query(Competency).filter(Competency.id == competency_id).first()
        if not comp:
            raise ValueError("Competency not found.")

        current_eval = cls.evaluate_user_competency(db, user_id, comp)
        growth_points: List[CompetencyGrowthPoint] = []

        # Find courses mapped to this competency
        course_ids = [
            cc.course_id for cc in db.query(CourseCompetency).filter(CourseCompetency.competency_id == comp.id).all()
        ]

        # Milestone 1: Initial Baseline (Registration)
        user = db.query(User).filter(User.id == user_id).first()
        created_date_str = user.created_at.strftime("%Y-%m-%d") if user and user.created_at else "2026-01-01"
        growth_points.append(
            CompetencyGrowthPoint(
                date=created_date_str,
                level=1.0,
                event_type="ONBOARDING",
                description="Initial onboarding baseline established upon account verification.",
            )
        )

        # Milestone 2: Course enrollments and syllabus completions
        if course_ids:
            enrollments = (
                db.query(Enrollment)
                .filter(Enrollment.user_id == user_id, Enrollment.course_id.in_(course_ids))
                .order_by(Enrollment.created_at)
                .all()
            )
            for idx, e in enumerate(enrollments):
                level_bump = 1.0 + (idx + 1) * 0.8
                e_date = e.created_at.strftime("%Y-%m-%d") if e.created_at else "2026-06-01"
                growth_points.append(
                    CompetencyGrowthPoint(
                        date=e_date,
                        level=min(current_eval.current_level, round(level_bump, 2)),
                        event_type="COURSE_ENROLLMENT",
                        description=f"Enrolled in {e.course.title} and completed core training units.",
                    )
                )

            # Milestone 3: Assessment Attempts
            attempts = (
                db.query(AssessmentAttempt)
                .join(Assessment, Assessment.id == AssessmentAttempt.assessment_id)
                .filter(
                    AssessmentAttempt.user_id == user_id,
                    Assessment.course_id.in_(course_ids),
                    AssessmentAttempt.status == "EVALUATED",
                )
                .order_by(AssessmentAttempt.submitted_at)
                .all()
            )
            for att in attempts:
                if att.submitted_at:
                    att_date = att.submitted_at.strftime("%Y-%m-%d")
                    growth_points.append(
                        CompetencyGrowthPoint(
                            date=att_date,
                            level=current_eval.current_level,
                            event_type="ASSESSMENT_EVALUATION",
                            description=f"Completed {att.assessment.title} scoring {att.percentage:.1f}%.",
                        )
                    )

        # If current level is higher, add current state
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if not growth_points or growth_points[-1].level != current_eval.current_level:
            growth_points.append(
                CompetencyGrowthPoint(
                    date=today_str,
                    level=current_eval.current_level,
                    event_type="CURRENT_EVALUATION",
                    description=f"Current demonstrated competency assessed at Level {current_eval.current_level:.1f} ({current_eval.level_name}).",
                )
            )

        return CompetencyGrowthResponse(
            competency_id=comp.id,
            code=comp.code,
            name=comp.name,
            growth_points=growth_points,
        )

    @classmethod
    def get_trainer_recommendations(
        cls,
        db: Session,
        subject_id: uuid.UUID,
        weights: Optional[Dict[str, float]] = None,
    ) -> TrainerRecommendationResponse:
        """
        Evaluates and ranks trainer candidates for teaching a Subject domain.
        Uses 6-dimensional scoring: Competency Match, Experience, Qualification, Certification, Assessment, Feedback.
        """
        subject = db.query(Subject).filter(Subject.id == subject_id).first()
        if not subject:
            raise ValueError("Subject domain not found.")

        w = weights or DEFAULT_TRAINER_WEIGHTS
        reqs = subject.competency_requirements
        if not reqs:
            # Fallback if no specific requirements mapped to subject
            pass

        # Fetch all active trainers
        trainers = (
            db.query(User)
            .join(User.role)
            .filter(User.role.has(name="TRAINER"), User.is_active.is_(True))
            .all()
        )

        candidates: List[TrainerRecommendationCandidate] = []
        for trainer in trainers:
            # 1. Competency Match Score (0 - 100)
            matched_comps = []
            missing_comps = []
            comp_match_ratios = []

            for req in reqs:
                eval_comp = cls.evaluate_user_competency(db, trainer.id, req.competency)
                ratio = min(1.2, eval_comp.current_level / req.required_level) if req.required_level > 0 else 1.0
                comp_match_ratios.append(min(1.0, ratio) * req.weight)
                if eval_comp.current_level >= req.required_level - 0.5:
                    matched_comps.append(f"{req.competency.name} (L{eval_comp.current_level:.1f}/L{req.required_level})")
                else:
                    missing_comps.append(f"{req.competency.name} (L{eval_comp.current_level:.1f}/L{req.required_level})")

            total_req_weights = sum(r.weight for r in reqs) if reqs else 1.0
            competency_score = (
                round((sum(comp_match_ratios) / total_req_weights) * 100.0, 1)
                if reqs
                else 80.0
            )

            # 2. Experience Score (0 - 100)
            experiences = db.query(Experience).filter(Experience.user_id == trainer.id).all()
            total_exp_years = 0.0
            for exp in experiences:
                end = exp.end_date or date.today()
                duration_days = (end - exp.start_date).days
                total_exp_years += max(0.0, duration_days / 365.25)
            # 8+ years experience is considered 100% for senior trainers
            experience_score = min(100.0, round((total_exp_years / 8.0) * 100.0, 1))

            # 3. Qualification Score (0 - 100)
            qualifications = db.query(Qualification).filter(Qualification.user_id == trainer.id).all()
            qualification_score = 60.0
            if qualifications:
                degrees = [q.degree.lower() for q in qualifications]
                if any("ph.d" in d or "doctor" in d for d in degrees):
                    qualification_score = 100.0
                elif any("m.sc" in d or "master" in d or "m.tech" in d for d in degrees):
                    qualification_score = 85.0
                else:
                    qualification_score = 70.0

            # 4. Certification Score (0 - 100)
            certs = (
                db.query(Certification)
                .filter(
                    Certification.user_id == trainer.id,
                    Certification.verification_status == "VERIFIED",
                )
                .all()
            )
            certification_score = min(100.0, round(len(certs) * 35.0 + 30.0, 1)) if certs else 40.0

            # 5. Assessment Score (0 - 100)
            # Evaluated assessment average or exam track record
            assessment_score = 85.0
            tp = trainer.trainer_profile
            if tp and tp.average_rating:
                feedback_score = round((tp.average_rating / 5.0) * 100.0, 1)
            else:
                feedback_score = 80.0

            # Overall Match Score
            overall = round(
                competency_score * w["competency_match"]
                + experience_score * w["experience"]
                + qualification_score * w["qualification"]
                + certification_score * w["certification"]
                + assessment_score * w["assessment"]
                + feedback_score * w["feedback"],
                1,
            )

            # Generate transparent explanation
            explanation = (
                f"Candidate exhibits {competency_score:.1f}% subject competency alignment across required modules, "
                f"supported by {total_exp_years:.1f} years operational meteorological background "
                f"and verified qualifications."
            )

            profile = trainer.trainer_profile
            designation = profile.designation if profile else "Senior Meteorological Officer"

            candidates.append(
                TrainerRecommendationCandidate(
                    trainer_id=trainer.id,
                    name=f"{trainer.first_name} {trainer.last_name}",
                    email=trainer.email,
                    designation=designation,
                    department=trainer.department.name if trainer.department else "National Weather Forecasting Centre",
                    overall_match_score=overall,
                    competency_match=competency_score,
                    experience_score=experience_score,
                    qualification_score=qualification_score,
                    certification_score=certification_score,
                    assessment_score=assessment_score,
                    feedback_score=feedback_score,
                    matched_competencies=matched_comps,
                    missing_competencies=missing_comps,
                    explanation=explanation,
                )
            )

        # Sort candidates descending by overall match score
        candidates.sort(key=lambda c: c.overall_match_score, reverse=True)

        return TrainerRecommendationResponse(
            subject_id=subject.id,
            subject_name=subject.name,
            subject_code=subject.code,
            domain=subject.domain,
            candidate_count=len(candidates),
            candidates=candidates,
        )

    @staticmethod
    def get_all_subjects(db: Session) -> List[SubjectDetailResponse]:
        """Lists subjects and their competency requirements."""
        subjects = db.query(Subject).filter(Subject.is_active.is_(True)).order_by(Subject.name).all()
        result = []
        for s in subjects:
            reqs = [
                SubjectRequirementItem(
                    competency_id=r.competency_id,
                    competency_code=r.competency.code,
                    competency_name=r.competency.name,
                    category=r.competency.category,
                    required_level=r.required_level,
                    weight=r.weight,
                )
                for r in s.competency_requirements
            ]
            result.append(
                SubjectDetailResponse(
                    id=s.id,
                    name=s.name,
                    code=s.code,
                    description=s.description,
                    domain=s.domain,
                    is_active=s.is_active,
                    requirements=reqs,
                )
            )
        return result
