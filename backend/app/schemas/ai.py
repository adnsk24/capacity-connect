import uuid
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# AI Status
class AIStatusResponse(BaseModel):
    ai_enabled: bool
    ai_provider: str
    ai_model: str
    grounding_enforced: bool = True
    active_features: List[str] = [
        "AI Capacity Notebook",
        "AI Quiz Generator",
        "AI Competency Diagnostic",
        "Explainable Trainer Matching",
        "AI Study Guide",
        "AI FAQ / Glossary Generator",
    ]


# AI Capacity Notebook
class AINotebookAskRequest(BaseModel):
    course_id: uuid.UUID
    question: str = Field(..., min_length=2, max_length=1500)
    module_id: Optional[uuid.UUID] = None
    resource_ids: Optional[List[uuid.UUID]] = None


class AINotebookAskResponse(BaseModel):
    answer: str
    evidence_found: bool
    citations: List[str] = []
    retrieved_chunk_count: int = 0


class AIResourceItem(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str] = None
    resource_type: str
    module_id: Optional[uuid.UUID] = None
    ai_enabled: bool = True
    ai_approved: bool = True


# AI Quiz Generator
class AIQuizOption(BaseModel):
    option_text: str
    is_correct: bool = False


class AIQuizGenerateRequest(BaseModel):
    course_id: uuid.UUID
    question_count: int = Field(default=3, ge=1, le=10)
    difficulty: str = Field(default="INTERMEDIATE")  # BEGINNER, INTERMEDIATE, ADVANCED
    bloom_level: str = Field(default="Bloom Level 3 — Apply")  # "Bloom Level 3 — Apply", "Bloom Level 4 — Analyze"
    module_id: Optional[uuid.UUID] = None
    resource_ids: Optional[List[uuid.UUID]] = None
    target_assessment_id: Optional[uuid.UUID] = None


class AIQuizDraftItem(BaseModel):
    id: uuid.UUID
    content_type: str
    course_id: uuid.UUID
    module_id: Optional[uuid.UUID] = None
    assessment_id: Optional[uuid.UUID] = None
    created_by: uuid.UUID
    status: str
    review_status: str
    reviewed_by: Optional[uuid.UUID] = None
    reviewed_at: Optional[str] = None
    question: str
    options: List[Dict[str, Any]]
    correct_answer: str
    explanation: Optional[str] = None
    difficulty: str
    bloom_level: str
    marks: float = 1.0
    source_citation: Optional[str] = None
    created_at: Optional[str] = None
    injected_question_id: Optional[str] = None


class AIQuizDraftUpdateRequest(BaseModel):
    question: Optional[str] = None
    options: Optional[List[Dict[str, Any]]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    difficulty: Optional[str] = None
    bloom_level: Optional[str] = None
    marks: Optional[float] = None
    source_citation: Optional[str] = None


class AIQuizApproveRequest(BaseModel):
    target_assessment_id: Optional[uuid.UUID] = None


# AI Competency Diagnostic
class AICompetencyDiagnosticRequest(BaseModel):
    target_user_id: Optional[uuid.UUID] = None
    subject_id: Optional[uuid.UUID] = None


class AICompetencyDiagnosticResponse(BaseModel):
    user_id: uuid.UUID
    user_name: str
    readiness_percentage: float
    target_role_or_subject: str
    met_competencies_count: int
    total_competencies_count: int
    gaps: List[Dict[str, Any]]
    top_recommended_course: Optional[Dict[str, Any]] = None
    ai_diagnostic_explanation: str
    closed_loop_framework: List[Dict[str, Any]]
    authoritative_source: str = "Deterministic Competency Evaluation Engine"


# Explainable Trainer Matching
class AITrainerMatchExplainRequest(BaseModel):
    subject_id: uuid.UUID
    trainer_id: uuid.UUID


class AITrainerMatchExplainResponse(BaseModel):
    trainer_id: uuid.UUID
    trainer_name: str
    designation: str
    department: str
    subject_id: uuid.UUID
    subject_name: str
    overall_match_score: float
    evidence_subscores: Dict[str, float]
    matched_competencies: List[str]
    ai_explainable_rationale: str
    authoritative_source: str = "Deterministic 6-Stream Trainer Recommendation Engine"


# AI Study Guide
class AIStudyGuideGenerateRequest(BaseModel):
    course_id: uuid.UUID
    module_id: Optional[uuid.UUID] = None
    resource_ids: Optional[List[uuid.UUID]] = None


# AI Knowledge (FAQ / Glossary)
class AIKnowledgeGenerateRequest(BaseModel):
    course_id: uuid.UUID
    module_id: Optional[uuid.UUID] = None
    resource_ids: Optional[List[uuid.UUID]] = None


class AIKnowledgeDraftUpdateRequest(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    term: Optional[str] = None
    definition: Optional[str] = None
    source_citation: Optional[str] = None
