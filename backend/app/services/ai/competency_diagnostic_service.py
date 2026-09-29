import time
import uuid
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.user import User
from app.services.competency_service import CompetencyEvaluationService
from app.services.ai.provider import get_ai_provider
from app.services.ai.audit_service import AIAuditService


class CompetencyDiagnosticService:
    """
    AI Competency Diagnostic Assistant.
    AUTHORITY RULE:
    The deterministic CompetencyEvaluationService is the SOLE SOURCE OF TRUTH.
    AI NEVER computes, modifies, or overrides:
    - readiness percentages
    - competency levels
    - skill gap calculations
    - recommendation scores
    AI strictly explains and synthesizes the authoritative system evidence.
    """

    SYSTEM_PROMPT = """You are the Capacity Connect Competency Intelligence Diagnostic Assistant.
AUTHORITY MANDATE:
1. All scores, readiness percentages, and skill gaps provided to you are mathematically authoritative and final.
2. You MUST NEVER calculate, modify, or estimate scores.
3. Your role is strictly to explain WHY the gap exists based on the provided evidence items, and how the recommended learning path closes this gap within the IMD closed-loop training framework.
4. Formulate the response with clear, professional sections:
   - Executive Diagnostic Summary
   - Competency Gap Analysis (directly referencing provided gaps)
   - Closed-Loop Remediation Path (Training -> Assessment -> Update)
"""

    CLOSED_LOOP_STAGES = [
        {"stage": 1, "title": "Structured Training", "description": "Curriculum completion across modules and instructional lessons"},
        {"stage": 2, "title": "Diagnostic Assessment", "description": "Objective MCQ evaluation and practical examinations"},
        {"stage": 3, "title": "Competency Evaluation", "description": "Deterministic multi-stream scoring across 6 evidence sources"},
        {"stage": 4, "title": "Skill Gap Identification", "description": "Target vs demonstrated proficiency discrepancy analysis"},
        {"stage": 5, "title": "Recommended Learning", "description": "Personalized curriculum aligned with priority skill deficits"},
        {"stage": 6, "title": "AI Learning Assistance", "description": "Grounded AI Capacity Notebook & Study Guides for targeted remediation"},
        {"stage": 7, "title": "Additional Training", "description": "Mastering recommended operational modules and exercises"},
        {"stage": 8, "title": "Re-Assessment", "description": "Post-remediation assessment validating updated mastery"},
        {"stage": 9, "title": "Competency Update", "description": "Autonomous update to verified competency baseline and readiness score"}
    ]

    @classmethod
    async def generate_diagnostic(
        cls,
        db: Session,
        user: User,
        target_user_id: Optional[uuid.UUID] = None,
        subject_id: Optional[uuid.UUID] = None,
    ) -> Dict[str, Any]:
        start_time = time.time()

        if not settings.AI_ENABLED:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI Intelligence layer is currently disabled by system administrator.",
            )

        # RBAC: Trainees can only run diagnostic on themselves; Trainers/Admins can inspect others
        target_id = target_user_id or user.id
        if user.role.name.upper() == "TRAINEE" and target_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Trainees can only access their own competency diagnostic.",
            )

        target_user = db.query(User).filter(User.id == target_id).first()
        if not target_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        # 1. Authoritative deterministic calculations from existing engine
        readiness_resp = CompetencyEvaluationService.calculate_readiness_score(db, target_id, subject_id)
        gaps = CompetencyEvaluationService.get_skill_gaps(db, target_id, subject_id)
        recommendations = CompetencyEvaluationService.get_personalized_recommendations(db, target_id)

        # Format structured evidence envelope for LLM
        evidence_lines = [
            f"Trainee: {target_user.first_name} {target_user.last_name}",
            f"Department: {target_user.department.name if target_user.department else 'Operational Meteorology'}",
            f"Target Focus: {readiness_resp.target_role_or_subject}",
            f"Readiness Score: {readiness_resp.overall_readiness_percentage:.1f}%",
            f"Required Competencies Met: {readiness_resp.met_competencies_count} of {readiness_resp.required_competencies_count}",
            "\nIdentified Skill Gaps:"
        ]

        top_gaps = gaps[:3]
        for g in top_gaps:
            evidence_lines.append(
                f"- Competency: {g.name} ({g.code}) | Current Level: {g.current_level:.1f} / Target: {g.required_level:.1f} | Gap: {g.gap:.1f} | Priority: {g.priority}"
            )

        top_rec = recommendations[0] if recommendations else None
        if top_rec:
            evidence_lines.append(f"\nRecommended Course: {top_rec.title} ({top_rec.code}) | Match: {top_rec.match_score:.1f}%")
            evidence_lines.append(f"Addressed Gaps: {', '.join(top_rec.addressed_gaps)}")

        prompt = "COMPETENCY_EVIDENCE\n" + "\n".join(evidence_lines)

        provider = get_ai_provider()
        try:
            explanation = await provider.generate(prompt, system_prompt=cls.SYSTEM_PROMPT)
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            AIAuditService.log_interaction(
                db=db,
                user_id=user.id,
                feature="COMPETENCY_DIAGNOSTIC",
                source_resource_ids=None,
                provider=settings.AI_PROVIDER,
                model=settings.AI_MODEL,
                status_code_str="ERROR",
                latency_ms=latency_ms,
            )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI explanation generation failed: {str(e)}",
            )

        latency_ms = int((time.time() - start_time) * 1000)
        AIAuditService.log_interaction(
            db=db,
            user_id=user.id,
            feature="COMPETENCY_DIAGNOSTIC",
            source_resource_ids=None,
            provider=settings.AI_PROVIDER,
            model=settings.AI_MODEL,
            status_code_str="SUCCESS",
            latency_ms=latency_ms,
        )

        return {
            "user_id": str(target_id),
            "user_name": f"{target_user.first_name} {target_user.last_name}",
            "readiness_percentage": readiness_resp.overall_readiness_percentage,
            "target_role_or_subject": readiness_resp.target_role_or_subject,
            "met_competencies_count": readiness_resp.met_competencies_count,
            "total_competencies_count": readiness_resp.required_competencies_count,
            "gaps": [
                {
                    "competency_id": str(g.competency_id),
                    "code": g.code,
                    "name": g.name,
                    "current_level": g.current_level,
                    "required_level": g.required_level,
                    "gap": g.gap,
                    "priority": g.priority,
                }
                for g in top_gaps
            ],
            "top_recommended_course": {
                "course_id": str(top_rec.course_id),
                "title": top_rec.title,
                "code": top_rec.code,
                "match_score": top_rec.match_score,
            } if top_rec else None,
            "ai_diagnostic_explanation": explanation.strip(),
            "closed_loop_framework": cls.CLOSED_LOOP_STAGES,
            "authoritative_source": "Deterministic Competency Evaluation Engine",
        }
