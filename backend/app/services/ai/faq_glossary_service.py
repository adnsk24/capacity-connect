import json
import time
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.user import User
from app.models.course import Course, Resource
from app.models.ai import AIGeneratedContent
from app.services.ai.provider import get_ai_provider
from app.services.ai.rag_service import RAGService
from app.services.ai.audit_service import AIAuditService


class FaqGlossaryService:
    """Service handling AI FAQ and Glossary generation with mandatory Trainer review."""

    @classmethod
    def _verify_trainer_or_admin(cls, db: Session, user: User, course_id: uuid.UUID) -> Course:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

        role_name = user.role.name.upper()
        if role_name != "ADMIN" and course.trainer_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to generate content for this course.",
            )
        return course

    @classmethod
    async def generate_faqs(
        cls,
        db: Session,
        user: User,
        course_id: uuid.UUID,
        module_id: Optional[uuid.UUID] = None,
        resource_ids: Optional[List[uuid.UUID]] = None,
    ) -> List[Dict[str, Any]]:
        start_time = time.time()

        if not settings.AI_ENABLED:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI Intelligence layer is currently disabled by system administrator.",
            )

        course = cls._verify_trainer_or_admin(db, user, course_id)

        chunks = RAGService.retrieve_chunks(
            db=db,
            user=user,
            course_id=course_id,
            query="frequently asked operational meteorological procedures",
            module_id=module_id,
            resource_ids=resource_ids,
            top_k=5,
        )

        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No approved AI resources available in the selected module to generate FAQs.",
            )

        context_prompt = RAGService.format_context_prompt(chunks, "FAQ_GENERATOR")
        prompt = f"FAQ_GENERATOR\nCourse: {course.title}\n\n{context_prompt}"

        provider = get_ai_provider()
        try:
            faq_data = await provider.generate_structured(prompt, system_prompt="Generate grounded FAQs with questions, answers, and source citations.")
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            AIAuditService.log_interaction(
                db=db,
                user_id=user.id,
                feature="FAQ_GENERATOR",
                source_resource_ids=resource_ids,
                provider=settings.AI_PROVIDER,
                model=settings.AI_MODEL,
                status_code_str="ERROR",
                latency_ms=latency_ms,
            )
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Failed to generate FAQs: {str(e)}")

        created_items = []
        for item in faq_data.get("faqs", []):
            payload_dict = {
                "question": item.get("question"),
                "answer": item.get("answer"),
            }
            draft = AIGeneratedContent(
                id=uuid.uuid4(),
                content_type="FAQ",
                course_id=course_id,
                module_id=module_id,
                created_by=user.id,
                status="PENDING_REVIEW",
                payload=json.dumps(payload_dict),
                source_citation=item.get("source_citation"),
            )
            db.add(draft)
            created_items.append(draft)

        db.commit()

        latency_ms = int((time.time() - start_time) * 1000)
        AIAuditService.log_interaction(
            db=db,
            user_id=user.id,
            feature="FAQ_GENERATOR",
            source_resource_ids=resource_ids,
            provider=settings.AI_PROVIDER,
            model=settings.AI_MODEL,
            status_code_str="SUCCESS",
            latency_ms=latency_ms,
        )

        return [cls._serialize_item(d) for d in created_items]

    @classmethod
    async def generate_glossary(
        cls,
        db: Session,
        user: User,
        course_id: uuid.UUID,
        module_id: Optional[uuid.UUID] = None,
        resource_ids: Optional[List[uuid.UUID]] = None,
    ) -> List[Dict[str, Any]]:
        start_time = time.time()

        if not settings.AI_ENABLED:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI Intelligence layer is currently disabled by system administrator.",
            )

        course = cls._verify_trainer_or_admin(db, user, course_id)

        chunks = RAGService.retrieve_chunks(
            db=db,
            user=user,
            course_id=course_id,
            query="meteorological terminology definitions technical glossary",
            module_id=module_id,
            resource_ids=resource_ids,
            top_k=5,
        )

        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No approved AI resources available in the selected module to generate Glossary.",
            )

        context_prompt = RAGService.format_context_prompt(chunks, "GLOSSARY_GENERATOR")
        prompt = f"GLOSSARY_GENERATOR\nCourse: {course.title}\n\n{context_prompt}"

        provider = get_ai_provider()
        try:
            glossary_data = await provider.generate_structured(prompt, system_prompt="Generate grounded Glossary with terms, definitions, and citations.")
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            AIAuditService.log_interaction(
                db=db,
                user_id=user.id,
                feature="GLOSSARY_GENERATOR",
                source_resource_ids=resource_ids,
                provider=settings.AI_PROVIDER,
                model=settings.AI_MODEL,
                status_code_str="ERROR",
                latency_ms=latency_ms,
            )
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Failed to generate Glossary: {str(e)}")

        created_items = []
        for item in glossary_data.get("glossary", []):
            payload_dict = {
                "term": item.get("term"),
                "definition": item.get("definition"),
            }
            draft = AIGeneratedContent(
                id=uuid.uuid4(),
                content_type="GLOSSARY",
                course_id=course_id,
                module_id=module_id,
                created_by=user.id,
                status="PENDING_REVIEW",
                payload=json.dumps(payload_dict),
                source_citation=item.get("source_citation"),
            )
            db.add(draft)
            created_items.append(draft)

        db.commit()

        latency_ms = int((time.time() - start_time) * 1000)
        AIAuditService.log_interaction(
            db=db,
            user_id=user.id,
            feature="GLOSSARY_GENERATOR",
            source_resource_ids=resource_ids,
            provider=settings.AI_PROVIDER,
            model=settings.AI_MODEL,
            status_code_str="SUCCESS",
            latency_ms=latency_ms,
        )

        return [cls._serialize_item(d) for d in created_items]

    @classmethod
    def get_drafts(
        cls,
        db: Session,
        user: User,
        content_type: str,
        course_id: Optional[uuid.UUID] = None,
        status_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        query = db.query(AIGeneratedContent).filter(AIGeneratedContent.content_type == content_type.upper())

        if course_id:
            cls._verify_trainer_or_admin(db, user, course_id)
            query = query.filter(AIGeneratedContent.course_id == course_id)
        elif user.role.name.upper() != "ADMIN":
            owned_courses = db.query(Course.id).filter(Course.trainer_id == user.id).all()
            owned_ids = [c[0] for c in owned_courses]
            query = query.filter(AIGeneratedContent.course_id.in_(owned_ids))

        if status_filter:
            query = query.filter(AIGeneratedContent.status == status_filter.upper())

        items = query.order_by(AIGeneratedContent.created_at.desc()).all()
        return [cls._serialize_item(i) for i in items]

    @classmethod
    def update_draft(cls, db: Session, user: User, draft_id: uuid.UUID, data: Dict[str, Any]) -> Dict[str, Any]:
        draft = db.query(AIGeneratedContent).filter(AIGeneratedContent.id == draft_id).first()
        if not draft:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found.")

        cls._verify_trainer_or_admin(db, user, draft.course_id)

        current = json.loads(draft.payload)
        for k in ["question", "answer", "term", "definition"]:
            if k in data:
                current[k] = data[k]

        draft.payload = json.dumps(current)
        if "source_citation" in data:
            draft.source_citation = data["source_citation"]

        db.commit()
        return cls._serialize_item(draft)

    @classmethod
    def approve_item(cls, db: Session, user: User, draft_id: uuid.UUID) -> Dict[str, Any]:
        draft = db.query(AIGeneratedContent).filter(AIGeneratedContent.id == draft_id).first()
        if not draft:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found.")

        cls._verify_trainer_or_admin(db, user, draft.course_id)

        draft.status = "APPROVED"
        draft.reviewed_by = user.id
        draft.reviewed_at = datetime.now(timezone.utc)
        db.commit()
        return cls._serialize_item(draft)

    @classmethod
    def reject_item(cls, db: Session, user: User, draft_id: uuid.UUID) -> Dict[str, Any]:
        draft = db.query(AIGeneratedContent).filter(AIGeneratedContent.id == draft_id).first()
        if not draft:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Content not found.")

        cls._verify_trainer_or_admin(db, user, draft.course_id)

        draft.status = "REJECTED"
        draft.reviewed_by = user.id
        draft.reviewed_at = datetime.now(timezone.utc)
        db.commit()
        return cls._serialize_item(draft)

    @classmethod
    def get_published_items(
        cls,
        db: Session,
        course_id: uuid.UUID,
        content_type: str,
    ) -> List[Dict[str, Any]]:
        """Returns only APPROVED and published items for trainees and general learning."""
        items = (
            db.query(AIGeneratedContent)
            .filter(
                AIGeneratedContent.course_id == course_id,
                AIGeneratedContent.content_type == content_type.upper(),
                AIGeneratedContent.status == "APPROVED",
            )
            .order_by(AIGeneratedContent.created_at.desc())
            .all()
        )
        return [cls._serialize_item(i) for i in items]

    @classmethod
    def _serialize_item(cls, item: AIGeneratedContent) -> Dict[str, Any]:
        payload = json.loads(item.payload) if item.payload else {}
        return {
            "id": str(item.id),
            "content_type": item.content_type,
            "course_id": str(item.course_id),
            "module_id": str(item.module_id) if item.module_id else None,
            "status": item.status,
            "review_status": "AI GENERATED — PENDING REVIEW" if item.status == "PENDING_REVIEW" else item.status,
            "reviewed_by": str(item.reviewed_by) if item.reviewed_by else None,
            "reviewed_at": item.reviewed_at.isoformat() if item.reviewed_at else None,
            "source_citation": item.source_citation,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            # Payload fields
            "question": payload.get("question"),
            "answer": payload.get("answer"),
            "term": payload.get("term"),
            "definition": payload.get("definition"),
        }
