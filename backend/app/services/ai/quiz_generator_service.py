import json
import time
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.user import User
from app.models.course import Course, CourseModule, Resource
from app.models.assessment import Assessment, Question, QuestionOption
from app.models.ai import AIGeneratedContent
from app.services.ai.provider import get_ai_provider
from app.services.ai.rag_service import RAGService
from app.services.ai.audit_service import AIAuditService


class QuizGeneratorService:
    """Service handling AI Quiz Generation with mandatory human-in-the-loop review workflow."""

    QUIZ_SYSTEM_PROMPT = """You are the Capacity Connect Question Generator for the India Meteorological Department.
ROLE:
Generate high-fidelity, grounded MCQ questions reflecting real meteorological and operational forecasting problems.

COGNITIVE LEVEL INSTRUCTIONS:
- If 'Bloom Level 3 — Apply': Questions MUST present a practical scenario or calculation where the candidate applies standard operational formulas, SOP rules, or chart interpretation methods.
- If 'Bloom Level 4 — Analyze': Questions MUST present multi-source conflicting data, radar vs satellite discrepancies, or model tendency shifts requiring diagnostic analysis, error deduction, or risk ranking.
- Do NOT produce basic Level 1 recall or Level 2 comprehension questions disguised as L3/L4.

FORMAT REQUIREMENTS:
Return valid JSON with key "questions" containing a list of objects, each having:
- "question": scenario or analytical prompt
- "options": list of 4 options (each an object with "option_text" and "is_correct": boolean)
- "correct_answer": matching text
- "explanation": step-by-step diagnostic justification
- "difficulty": "BEGINNER", "INTERMEDIATE", or "ADVANCED"
- "bloom_level": "Bloom Level 3 — Apply" or "Bloom Level 4 — Analyze"
- "source_citation": source citation formatted as [[Source: <Document Title>, Page: <Page>, Section: "<Section>"]]
"""

    @classmethod
    def _verify_trainer_or_admin(cls, db: Session, user: User, course_id: uuid.UUID) -> Course:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

        role_name = user.role.name.upper()
        if role_name != "ADMIN" and course.trainer_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to generate or manage quizzes for this course.",
            )
        return course

    @classmethod
    async def generate_questions(
        cls,
        db: Session,
        user: User,
        course_id: uuid.UUID,
        question_count: int = 3,
        difficulty: str = "INTERMEDIATE",
        bloom_level: str = "Bloom Level 3 — Apply",
        module_id: Optional[uuid.UUID] = None,
        resource_ids: Optional[List[uuid.UUID]] = None,
        target_assessment_id: Optional[uuid.UUID] = None,
    ) -> List[Dict[str, Any]]:
        """Generates draft questions in PENDING_REVIEW status."""
        start_time = time.time()

        if not settings.AI_ENABLED:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI Intelligence layer is currently disabled by system administrator.",
            )

        course = cls._verify_trainer_or_admin(db, user, course_id)

        # 1. Retrieve chunks for context
        chunks = RAGService.retrieve_chunks(
            db=db,
            user=user,
            course_id=course_id,
            query="operational meteorological concepts and analysis",
            module_id=module_id,
            resource_ids=resource_ids,
            top_k=6,
        )

        if not chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No approved AI training materials found for the selected course/module to generate questions.",
            )

        # 2. Build prompt
        context_prompt = RAGService.format_context_prompt(chunks, "QUIZ_GENERATOR")
        prompt = (
            f"QUIZ_GENERATOR\n"
            f"Course: {course.title}\n"
            f"Question Count: {question_count}\n"
            f"Difficulty: {difficulty}\n"
            f"Bloom Level: {bloom_level}\n\n"
            f"{context_prompt}"
        )

        provider = get_ai_provider()
        try:
            structured_data = await provider.generate_structured(prompt, system_prompt=cls.QUIZ_SYSTEM_PROMPT)
        except Exception as e:
            latency_ms = int((time.time() - start_time) * 1000)
            AIAuditService.log_interaction(
                db=db,
                user_id=user.id,
                feature="QUIZ_GENERATOR",
                source_resource_ids=resource_ids,
                provider=settings.AI_PROVIDER,
                model=settings.AI_MODEL,
                status_code_str="ERROR",
                latency_ms=latency_ms,
            )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to generate structured quiz questions: {str(e)}",
            )

        raw_questions = structured_data.get("questions", [])
        if not raw_questions:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="AI provider did not produce valid questions.",
            )

        created_drafts = []
        for q in raw_questions:
            payload_dict = {
                "question": q.get("question"),
                "options": q.get("options", []),
                "correct_answer": q.get("correct_answer"),
                "explanation": q.get("explanation"),
                "difficulty": q.get("difficulty", difficulty),
                "bloom_level": q.get("bloom_level", bloom_level),
                "marks": 1.0,
            }

            draft = AIGeneratedContent(
                id=uuid.uuid4(),
                content_type="QUIZ_QUESTION",
                course_id=course_id,
                module_id=module_id,
                assessment_id=target_assessment_id,
                created_by=user.id,
                status="PENDING_REVIEW",
                payload=json.dumps(payload_dict),
                source_citation=q.get("source_citation"),
            )
            db.add(draft)
            created_drafts.append(draft)

        db.commit()

        latency_ms = int((time.time() - start_time) * 1000)
        AIAuditService.log_interaction(
            db=db,
            user_id=user.id,
            feature="QUIZ_GENERATOR",
            source_resource_ids=resource_ids,
            provider=settings.AI_PROVIDER,
            model=settings.AI_MODEL,
            status_code_str="SUCCESS",
            latency_ms=latency_ms,
        )

        return [cls._serialize_draft(d) for d in created_drafts]

    @classmethod
    def get_drafts(
        cls,
        db: Session,
        user: User,
        course_id: Optional[uuid.UUID] = None,
        assessment_id: Optional[uuid.UUID] = None,
        status_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Retrieves quiz question drafts."""
        query = db.query(AIGeneratedContent).filter(AIGeneratedContent.content_type == "QUIZ_QUESTION")

        if course_id:
            cls._verify_trainer_or_admin(db, user, course_id)
            query = query.filter(AIGeneratedContent.course_id == course_id)
        elif user.role.name.upper() != "ADMIN":
            # Filter courses owned by trainer
            owned_courses = db.query(Course.id).filter(Course.trainer_id == user.id).all()
            owned_ids = [c[0] for c in owned_courses]
            query = query.filter(AIGeneratedContent.course_id.in_(owned_ids))

        if assessment_id:
            query = query.filter(AIGeneratedContent.assessment_id == assessment_id)

        if status_filter:
            query = query.filter(AIGeneratedContent.status == status_filter.upper())

        drafts = query.order_by(AIGeneratedContent.created_at.desc()).all()
        return [cls._serialize_draft(d) for d in drafts]

    @classmethod
    def update_draft(
        cls,
        db: Session,
        user: User,
        draft_id: uuid.UUID,
        updated_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Allows trainer to edit draft question, options, answer, and explanation."""
        draft = db.query(AIGeneratedContent).filter(AIGeneratedContent.id == draft_id).first()
        if not draft:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft question not found.")

        cls._verify_trainer_or_admin(db, user, draft.course_id)

        current_payload = json.loads(draft.payload)
        for key in ["question", "options", "correct_answer", "explanation", "difficulty", "bloom_level", "marks"]:
            if key in updated_data:
                current_payload[key] = updated_data[key]

        draft.payload = json.dumps(current_payload)
        if "source_citation" in updated_data:
            draft.source_citation = updated_data["source_citation"]

        db.commit()
        return cls._serialize_draft(draft)

    @classmethod
    def approve_question(
        cls,
        db: Session,
        user: User,
        draft_id: uuid.UUID,
        target_assessment_id: Optional[uuid.UUID] = None,
    ) -> Dict[str, Any]:
        """
        Approves AI-generated question and pushes it directly into the existing assessment engine.
        Creates records in existing Question and QuestionOption tables.
        """
        draft = db.query(AIGeneratedContent).filter(AIGeneratedContent.id == draft_id).first()
        if not draft:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft question not found.")

        cls._verify_trainer_or_admin(db, user, draft.course_id)

        final_assessment_id = target_assessment_id or draft.assessment_id
        if not final_assessment_id:
            # Pick first available assessment in this course
            assessment = db.query(Assessment).filter(Assessment.course_id == draft.course_id).first()
            if not assessment:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Please specify a target assessment to inject approved questions.",
                )
            final_assessment_id = assessment.id
        else:
            assessment = db.query(Assessment).filter(Assessment.id == final_assessment_id).first()
            if not assessment:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target assessment not found.")

        payload = json.loads(draft.payload)

        # Count current questions in assessment to calculate next order_index
        order_idx = db.query(Question).filter(Question.assessment_id == final_assessment_id).count()

        # Create real Question in existing assessment engine
        q_entity = Question(
            id=uuid.uuid4(),
            assessment_id=final_assessment_id,
            question_text=payload.get("question", "Operational Evaluation Item"),
            question_type="MCQ_SINGLE",
            marks=float(payload.get("marks", 1.0)),
            explanation=f"{payload.get('explanation', '')} [Source: {draft.source_citation or 'Approved Syllabus'}]",
            order_index=order_idx,
        )
        db.add(q_entity)

        # Create options in existing QuestionOption table
        options = payload.get("options", [])
        for opt_idx, opt in enumerate(options):
            opt_entity = QuestionOption(
                id=uuid.uuid4(),
                question_id=q_entity.id,
                option_text=opt.get("option_text", f"Option {opt_idx+1}"),
                is_correct=bool(opt.get("is_correct", False)),
                order_index=opt_idx,
            )
            db.add(opt_entity)

        # Update draft review state
        draft.status = "APPROVED"
        draft.reviewed_by = user.id
        draft.reviewed_at = datetime.now(timezone.utc)
        draft.assessment_id = final_assessment_id

        db.commit()

        serialized = cls._serialize_draft(draft)
        serialized["injected_question_id"] = str(q_entity.id)
        return serialized

    @classmethod
    def reject_question(cls, db: Session, user: User, draft_id: uuid.UUID) -> Dict[str, Any]:
        """Rejects draft question without pushing to the assessment engine."""
        draft = db.query(AIGeneratedContent).filter(AIGeneratedContent.id == draft_id).first()
        if not draft:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft question not found.")

        cls._verify_trainer_or_admin(db, user, draft.course_id)

        draft.status = "REJECTED"
        draft.reviewed_by = user.id
        draft.reviewed_at = datetime.now(timezone.utc)
        db.commit()

        return cls._serialize_draft(draft)

    @classmethod
    def delete_draft(cls, db: Session, user: User, draft_id: uuid.UUID):
        """Deletes draft question."""
        draft = db.query(AIGeneratedContent).filter(AIGeneratedContent.id == draft_id).first()
        if not draft:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Draft question not found.")

        cls._verify_trainer_or_admin(db, user, draft.course_id)
        db.delete(draft)
        db.commit()

    @classmethod
    def _serialize_draft(cls, draft: AIGeneratedContent) -> Dict[str, Any]:
        payload = json.loads(draft.payload) if draft.payload else {}
        return {
            "id": str(draft.id),
            "content_type": draft.content_type,
            "course_id": str(draft.course_id),
            "module_id": str(draft.module_id) if draft.module_id else None,
            "assessment_id": str(draft.assessment_id) if draft.assessment_id else None,
            "created_by": str(draft.created_by),
            "status": draft.status,
            "review_status": "AI GENERATED — PENDING REVIEW" if draft.status == "PENDING_REVIEW" else draft.status,
            "reviewed_by": str(draft.reviewed_by) if draft.reviewed_by else None,
            "reviewed_at": draft.reviewed_at.isoformat() if draft.reviewed_at else None,
            "question": payload.get("question"),
            "options": payload.get("options", []),
            "correct_answer": payload.get("correct_answer"),
            "explanation": payload.get("explanation"),
            "difficulty": payload.get("difficulty"),
            "bloom_level": payload.get("bloom_level"),
            "marks": payload.get("marks", 1.0),
            "source_citation": draft.source_citation,
            "created_at": draft.created_at.isoformat() if draft.created_at else None,
        }
