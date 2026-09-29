import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.config import settings
from app.core.dependencies import get_current_active_user, require_roles
from app.models.user import User
from app.models.ai import AIAuditLog
from app.schemas.ai import (
    AIStatusResponse,
    AINotebookAskRequest,
    AINotebookAskResponse,
    AIResourceItem,
    AIQuizGenerateRequest,
    AIQuizDraftItem,
    AIQuizDraftUpdateRequest,
    AIQuizApproveRequest,
    AICompetencyDiagnosticRequest,
    AICompetencyDiagnosticResponse,
    AITrainerMatchExplainRequest,
    AITrainerMatchExplainResponse,
    AIStudyGuideGenerateRequest,
    AIKnowledgeGenerateRequest,
    AIKnowledgeDraftUpdateRequest,
)
from app.services.ai.notebook_service import NotebookService
from app.services.ai.quiz_generator_service import QuizGeneratorService
from app.services.ai.competency_diagnostic_service import CompetencyDiagnosticService
from app.services.ai.trainer_matching_service import TrainerMatchingService
from app.services.ai.study_guide_service import StudyGuideService
from app.services.ai.faq_glossary_service import FaqGlossaryService

router = APIRouter(prefix="/ai", tags=["AI Intelligence Layer"])


@router.get("/status", response_model=AIStatusResponse)
def get_ai_status():
    """Returns AI intelligence subsystem configuration and operational availability."""
    return AIStatusResponse(
        ai_enabled=settings.AI_ENABLED,
        ai_provider=settings.AI_PROVIDER,
        ai_model=settings.AI_MODEL,
        grounding_enforced=True,
    )


# ==============================================================
# 1. AI CAPACITY NOTEBOOK / GROUNDED RAG
# ==============================================================

@router.post("/notebook/ask", response_model=AINotebookAskResponse)
async def ask_notebook(
    payload: AINotebookAskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Submits a natural language query against approved course resources.
    Guarantees strict factual grounding with source citations or refusal.
    """
    result = await NotebookService.ask_question(
        db=db,
        user=current_user,
        course_id=payload.course_id,
        question=payload.question,
        module_id=payload.module_id,
        resource_ids=payload.resource_ids,
    )
    return AINotebookAskResponse(**result)


@router.get("/notebook/resources", response_model=List[AIResourceItem])
def get_notebook_resources(
    course_id: uuid.UUID = Query(...),
    module_id: Optional[uuid.UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retrieves AI-approved resources for selection in the AI Notebook."""
    items = NotebookService.get_authorized_resources(
        db=db,
        user=current_user,
        course_id=course_id,
        module_id=module_id,
    )
    return [AIResourceItem(**i) for i in items]


# ==============================================================
# 2. AI QUIZ GENERATOR
# ==============================================================

@router.post("/quiz/generate", response_model=List[AIQuizDraftItem])
async def generate_quiz_questions(
    payload: AIQuizGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    """
    Generates Bloom L3 (Apply) or L4 (Analyze) MCQ questions in PENDING_REVIEW status.
    Mandatory human review ensures questions do not enter assessment bank automatically.
    """
    drafts = await QuizGeneratorService.generate_questions(
        db=db,
        user=current_user,
        course_id=payload.course_id,
        question_count=payload.question_count,
        difficulty=payload.difficulty,
        bloom_level=payload.bloom_level,
        module_id=payload.module_id,
        resource_ids=payload.resource_ids,
        target_assessment_id=payload.target_assessment_id,
    )
    return [AIQuizDraftItem(**d) for d in drafts]


@router.get("/quiz/drafts", response_model=List[AIQuizDraftItem])
def get_quiz_drafts(
    course_id: Optional[uuid.UUID] = Query(None),
    assessment_id: Optional[uuid.UUID] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    """Lists draft AI questions for trainer review."""
    drafts = QuizGeneratorService.get_drafts(
        db=db,
        user=current_user,
        course_id=course_id,
        assessment_id=assessment_id,
        status_filter=status_filter,
    )
    return [AIQuizDraftItem(**d) for d in drafts]


@router.put("/quiz/drafts/{draft_id}", response_model=AIQuizDraftItem)
def update_quiz_draft(
    draft_id: uuid.UUID = Path(...),
    payload: AIQuizDraftUpdateRequest = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    """Allows trainer to edit draft question, options, correct answer, or explanation."""
    data = payload.model_dump(exclude_unset=True)
    updated = QuizGeneratorService.update_draft(
        db=db,
        user=current_user,
        draft_id=draft_id,
        updated_data=data,
    )
    return AIQuizDraftItem(**updated)


@router.post("/quiz/drafts/{draft_id}/approve", response_model=AIQuizDraftItem)
def approve_quiz_draft(
    draft_id: uuid.UUID = Path(...),
    payload: Optional[AIQuizApproveRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    """
    Approves AI draft question and pushes it into the active assessment engine.
    Creates real Question and QuestionOption entries.
    """
    target_aid = payload.target_assessment_id if payload else None
    approved = QuizGeneratorService.approve_question(
        db=db,
        user=current_user,
        draft_id=draft_id,
        target_assessment_id=target_aid,
    )
    return AIQuizDraftItem(**approved)


@router.post("/quiz/drafts/{draft_id}/reject", response_model=AIQuizDraftItem)
def reject_quiz_draft(
    draft_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    """Rejects AI draft question."""
    rejected = QuizGeneratorService.reject_question(
        db=db,
        user=current_user,
        draft_id=draft_id,
    )
    return AIQuizDraftItem(**rejected)


@router.delete("/quiz/drafts/{draft_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz_draft(
    draft_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    """Deletes draft question."""
    QuizGeneratorService.delete_draft(
        db=db,
        user=current_user,
        draft_id=draft_id,
    )
    return None


# ==============================================================
# 3. AI COMPETENCY DIAGNOSTIC
# ==============================================================

@router.post("/competency/diagnostic", response_model=AICompetencyDiagnosticResponse)
async def generate_competency_diagnostic(
    payload: AICompetencyDiagnosticRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Generates explainable diagnostic narrative from deterministic competency evidence.
    AI does NOT calculate or modify any scores.
    """
    result = await CompetencyDiagnosticService.generate_diagnostic(
        db=db,
        user=current_user,
        target_user_id=payload.target_user_id,
        subject_id=payload.subject_id,
    )
    return AICompetencyDiagnosticResponse(**result)


# ==============================================================
# 4. EXPLAINABLE TRAINER MATCHING
# ==============================================================

@router.post("/trainer-matching/explain", response_model=AITrainerMatchExplainResponse)
async def explain_trainer_match(
    payload: AITrainerMatchExplainRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    """
    Generates transparent explainable rationale for a recommended trainer candidate.
    Uses strictly the structured evidence from the 6-stream deterministic recommendation engine.
    """
    result = await TrainerMatchingService.explain_trainer_match(
        db=db,
        admin_or_trainer=current_user,
        subject_id=payload.subject_id,
        trainer_id=payload.trainer_id,
    )
    return AITrainerMatchExplainResponse(**result)


# ==============================================================
# 5. AI STUDY GUIDE
# ==============================================================

@router.post("/study-guide/generate")
async def generate_study_guide(
    payload: AIStudyGuideGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Generates a 6-part grounded study guide with source citations for trainees."""
    return await StudyGuideService.generate_study_guide(
        db=db,
        user=current_user,
        course_id=payload.course_id,
        module_id=payload.module_id,
        resource_ids=payload.resource_ids,
    )


# ==============================================================
# 6. AI FAQ & GLOSSARY
# ==============================================================

@router.post("/knowledge/generate-faq")
async def generate_faqs(
    payload: AIKnowledgeGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    """Generates FAQs in PENDING_REVIEW status for trainer verification."""
    return await FaqGlossaryService.generate_faqs(
        db=db,
        user=current_user,
        course_id=payload.course_id,
        module_id=payload.module_id,
        resource_ids=payload.resource_ids,
    )


@router.post("/knowledge/generate-glossary")
async def generate_glossary(
    payload: AIKnowledgeGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    """Generates Glossary in PENDING_REVIEW status for trainer verification."""
    return await FaqGlossaryService.generate_glossary(
        db=db,
        user=current_user,
        course_id=payload.course_id,
        module_id=payload.module_id,
        resource_ids=payload.resource_ids,
    )


@router.get("/knowledge/drafts")
def get_knowledge_drafts(
    content_type: str = Query(..., pattern="^(FAQ|GLOSSARY)$"),
    course_id: Optional[uuid.UUID] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    """Retrieves FAQ or Glossary items for trainer review."""
    return FaqGlossaryService.get_drafts(
        db=db,
        user=current_user,
        content_type=content_type,
        course_id=course_id,
        status_filter=status_filter,
    )


@router.put("/knowledge/drafts/{draft_id}")
def update_knowledge_draft(
    draft_id: uuid.UUID = Path(...),
    payload: AIKnowledgeDraftUpdateRequest = ...,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    """Edits draft FAQ or Glossary item."""
    data = payload.model_dump(exclude_unset=True)
    return FaqGlossaryService.update_draft(
        db=db,
        user=current_user,
        draft_id=draft_id,
        data=data,
    )


@router.post("/knowledge/drafts/{draft_id}/approve")
def approve_knowledge_draft(
    draft_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    """Approves and publishes FAQ/Glossary item for trainees."""
    return FaqGlossaryService.approve_item(
        db=db,
        user=current_user,
        draft_id=draft_id,
    )


@router.post("/knowledge/drafts/{draft_id}/reject")
def reject_knowledge_draft(
    draft_id: uuid.UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    """Rejects FAQ/Glossary item."""
    return FaqGlossaryService.reject_item(
        db=db,
        user=current_user,
        draft_id=draft_id,
    )


@router.get("/knowledge/published")
def get_published_knowledge(
    course_id: uuid.UUID = Query(...),
    content_type: str = Query(..., pattern="^(FAQ|GLOSSARY)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retrieves published, approved FAQs or Glossaries for a course (accessible by trainees)."""
    return FaqGlossaryService.get_published_items(
        db=db,
        course_id=course_id,
        content_type=content_type,
    )


# ==============================================================
# 7. AI AUDIT LOGGING (Admin Observability)
# ==============================================================

@router.get("/audit/logs")
def get_ai_audit_logs(
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["ADMIN"])),
):
    """Administrative access to AI audit logs."""
    logs = db.query(AIAuditLog).order_by(AIAuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": str(log.id),
            "user_id": str(log.user_id),
            "feature": log.feature,
            "source_resource_ids": log.source_resource_ids,
            "provider": log.provider,
            "model": log.model,
            "status": log.status,
            "latency_ms": log.latency_ms,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]
