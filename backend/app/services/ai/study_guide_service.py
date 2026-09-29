import json
import time
import uuid
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.user import User
from app.models.course import Course
from app.models.ai import AIGeneratedContent
from app.services.ai.provider import get_ai_provider
from app.services.ai.rag_service import RAGService
from app.services.ai.audit_service import AIAuditService


class StudyGuideService:
    """Service generating grounded AI Study Guides for Trainees."""

    STUDY_GUIDE_SYSTEM_PROMPT = """You are the Capacity Connect Study Guide Architect for the India Meteorological Department.
GROUNDING MANDATE:
Generate a structured, exhaustive study guide based EXCLUSIVELY on the provided training materials.
You MUST output valid JSON conforming strictly to the requested schema:
- "topic_overview": Comprehensive synthesis of the module's core operational domain.
- "key_concepts": List of 3-5 core physical and meteorological principles.
- "important_terminology": List of objects with {"term": str, "definition": str}.
- "concept_explanations": List of objects with {"title": str, "explanation": str}.
- "revision_points": List of high-priority checklist points for operational recall.
- "self_check_questions": List of objects with {"question": str, "hint": str}.
- "source_citation": Exact citation [[Source: <Doc Title>, Page: <Page>, Section: "<Section>"]]
"""

    @classmethod
    async def generate_study_guide(
        cls,
        db: Session,
        user: User,
        course_id: uuid.UUID,
        module_id: Optional[uuid.UUID] = None,
        resource_ids: Optional[List[uuid.UUID]] = None,
    ) -> Dict[str, Any]:
        start_time = time.time()

        if not settings.AI_ENABLED:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI Intelligence layer is currently disabled by system administrator.",
            )

        course = RAGService.verify_user_course_access(db, user, course_id)

        # 1. Retrieve authorized chunks
        chunks = RAGService.retrieve_chunks(
            db=db,
            user=user,
            course_id=course_id,
            query="meteorological concepts overview procedures definitions",
            module_id=module_id,
            resource_ids=resource_ids,
            top_k=6,
        )

        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No approved AI resources available in the selected module to generate a study guide.",
            )

        context_prompt = RAGService.format_context_prompt(chunks, "STUDY_GUIDE")
        prompt = (
            f"STUDY_GUIDE\n"
            f"Course: {course.title}\n\n"
            f"{context_prompt}"
        )

        provider = get_ai_provider()
        try:
            guide_data = await provider.generate_structured(prompt, system_prompt=cls.STUDY_GUIDE_SYSTEM_PROMPT)
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            AIAuditService.log_interaction(
                db=db,
                user_id=user.id,
                feature="STUDY_GUIDE",
                source_resource_ids=resource_ids,
                provider=settings.AI_PROVIDER,
                model=settings.AI_MODEL,
                status_code_str="ERROR",
                latency_ms=latency_ms,
            )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to generate study guide: {str(e)}",
            )

        # Save record in ai_generated_content
        saved_record = AIGeneratedContent(
            id=uuid.uuid4(),
            content_type="STUDY_GUIDE",
            course_id=course_id,
            module_id=module_id,
            created_by=user.id,
            status="APPROVED",  # Personal study guide
            payload=json.dumps(guide_data),
            source_citation=guide_data.get("source_citation"),
        )
        db.add(saved_record)
        db.commit()

        latency_ms = int((time.time() - start_time) * 1000)
        AIAuditService.log_interaction(
            db=db,
            user_id=user.id,
            feature="STUDY_GUIDE",
            source_resource_ids=resource_ids,
            provider=settings.AI_PROVIDER,
            model=settings.AI_MODEL,
            status_code_str="SUCCESS",
            latency_ms=latency_ms,
        )

        return {
            "id": str(saved_record.id),
            "course_id": str(course_id),
            "course_title": course.title,
            "module_id": str(module_id) if module_id else None,
            "guide": guide_data,
            "created_at": saved_record.created_at.isoformat(),
        }
