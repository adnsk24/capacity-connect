import time
import uuid
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.user import User
from app.models.subject import Subject
from app.services.competency_service import CompetencyEvaluationService
from app.services.ai.provider import get_ai_provider
from app.services.ai.audit_service import AIAuditService


class TrainerMatchingService:
    """
    Explainable Trainer Matching AI Assistant.
    AUTHORITY RULE:
    The existing 6-dimensional trainer recommendation engine in CompetencyEvaluationService
    is the SOLE SOURCE OF TRUTH.
    AI NEVER computes, modifies, or overrides:
    - match scores
    - competency alignment scores
    - experience years
    - candidate rankings
    AI strictly explains the mathematical evidence for administrative transparency.
    """

    SYSTEM_PROMPT = """You are the Capacity Connect Faculty Appointment Explainer for the India Meteorological Department.
MANDATE:
1. Explain why this trainer was matched to the subject based ONLY on the provided structured evidence metrics:
   - Competency Alignment Score
   - Experience Score
   - Academic Qualifications
   - Verified Professional Certifications
   - Assessment Track Record
   - Trainee Feedback Rating
2. NEVER invent credentials, degrees, experience years, or awards not in the evidence.
3. NEVER change or round the deterministic match score.
4. Conclude with a clear statement that final assignment remains with the administrator.
"""

    @classmethod
    async def explain_trainer_match(
        cls,
        db: Session,
        admin_or_trainer: User,
        subject_id: uuid.UUID,
        trainer_id: uuid.UUID,
    ) -> Dict[str, Any]:
        start_time = time.time()

        if not settings.AI_ENABLED:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI Intelligence layer is currently disabled by system administrator.",
            )

        role_name = admin_or_trainer.role.name.upper()
        if role_name not in ["ADMIN", "TRAINER"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: Only administrators and trainers can view match explanations.",
            )

        subject = db.query(Subject).filter(Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject domain not found.")

        # Get authoritative recommendations from existing engine
        rec_response = CompetencyEvaluationService.get_trainer_recommendations(db, subject_id)
        candidate = next((c for c in rec_response.candidates if c.trainer_id == trainer_id), None)

        if not candidate:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trainer candidate not found among evaluated candidates for this subject.",
            )

        # Build structured evidence envelope
        evidence_lines = [
            f"TRAINER_MATCHING_EVIDENCE",
            f"Subject Domain: {subject.name} ({subject.code})",
            f"Trainer Name: {candidate.name}",
            f"Designation: {candidate.designation}",
            f"Department: {candidate.department}",
            f"Overall Match Score: {candidate.overall_match_score:.1f}%",
            f"Competency Match: {candidate.competency_match:.1f}%",
            f"Experience Score: {candidate.experience_score:.1f}%",
            f"Qualification Score: {candidate.qualification_score:.1f}%",
            f"Certification Score: {candidate.certification_score:.1f}%",
            f"Assessment Track Record: {candidate.assessment_score:.1f}%",
            f"Trainee Feedback Score: {candidate.feedback_score:.1f}%",
            f"Aligned Competencies: {', '.join(candidate.matched_competencies[:3]) if candidate.matched_competencies else 'All required core subjects'}",
            f"Deterministic Summary: {candidate.explanation}",
        ]

        prompt = "\n".join(evidence_lines)

        provider = get_ai_provider()
        try:
            ai_explanation = await provider.generate(prompt, system_prompt=cls.SYSTEM_PROMPT)
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            AIAuditService.log_interaction(
                db=db,
                user_id=admin_or_trainer.id,
                feature="TRAINER_MATCHING",
                source_resource_ids=None,
                provider=settings.AI_PROVIDER,
                model=settings.AI_MODEL,
                status_code_str="ERROR",
                latency_ms=latency_ms,
            )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to generate trainer matching explanation: {str(e)}",
            )

        latency_ms = int((time.time() - start_time) * 1000)
        AIAuditService.log_interaction(
            db=db,
            user_id=admin_or_trainer.id,
            feature="TRAINER_MATCHING",
            source_resource_ids=None,
            provider=settings.AI_PROVIDER,
            model=settings.AI_MODEL,
            status_code_str="SUCCESS",
            latency_ms=latency_ms,
        )

        return {
            "trainer_id": str(candidate.trainer_id),
            "trainer_name": candidate.name,
            "designation": candidate.designation,
            "department": candidate.department,
            "subject_id": str(subject.id),
            "subject_name": subject.name,
            "overall_match_score": candidate.overall_match_score,
            "evidence_subscores": {
                "competency_match": candidate.competency_match,
                "experience_score": candidate.experience_score,
                "qualification_score": candidate.qualification_score,
                "certification_score": candidate.certification_score,
                "assessment_score": candidate.assessment_score,
                "feedback_score": candidate.feedback_score,
            },
            "matched_competencies": candidate.matched_competencies,
            "ai_explainable_rationale": ai_explanation.strip(),
            "authoritative_source": "Deterministic 6-Stream Trainer Recommendation Engine",
        }
