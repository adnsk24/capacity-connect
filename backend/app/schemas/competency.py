import uuid
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CompetencyLevelInfo(BaseModel):
    level: int
    name: str
    descriptor: str
    badge_color: str


class CompetencyEvidenceItem(BaseModel):
    type: str = Field(..., description="ASSESSMENT, COURSE, SKILL, EXPERIENCE, CERTIFICATION, QUALIFICATION")
    title: str
    score: float = Field(..., description="Normalized evidence percentage or rating (0.0 to 100.0)")
    contribution: float = Field(..., description="Weighted contribution to the 5-point scale")
    detail: str


class UserCompetencyResponse(BaseModel):
    competency_id: uuid.UUID
    code: str
    name: str
    category: str
    description: Optional[str] = None
    current_level: float = Field(..., description="Demonstrated continuous competency level from 0.0 to 5.0")
    integer_level: int = Field(..., description="Rounded framework level 0 to 5")
    level_name: str
    badge_color: str
    target_level: int = 4
    confidence_score: float = 1.0
    evidence: List[CompetencyEvidenceItem] = []
    summary_explanation: str


class SkillGapItem(BaseModel):
    competency_id: uuid.UUID
    code: str
    name: str
    category: str
    current_level: float
    required_level: float
    gap: float
    priority: str = Field(..., description="HIGH, MEDIUM, LOW")
    weight: float
    evidence_summary: str


class TrainingReadinessBreakdownItem(BaseModel):
    competency_id: uuid.UUID
    code: str
    name: str
    current_level: float
    required_level: float
    gap: float
    is_met: bool
    weight: float


class TrainingReadinessResponse(BaseModel):
    overall_readiness_percentage: float
    target_role_or_subject: str
    required_competencies_count: int
    met_competencies_count: int
    gaps_count: int
    competency_breakdown: List[TrainingReadinessBreakdownItem]
    formula_explanation: str


class PersonalizedCourseRecommendation(BaseModel):
    course_id: uuid.UUID
    code: str
    title: str
    difficulty_level: str
    duration_hours: int
    match_score: float = Field(..., description="Relevance match percentage based on missing gaps")
    addressed_gaps: List[str]
    why_recommended: str
    covered_competencies: List[str]


class CompetencyGrowthPoint(BaseModel):
    date: str
    level: float
    event_type: str
    description: str


class CompetencyGrowthResponse(BaseModel):
    competency_id: uuid.UUID
    code: str
    name: str
    growth_points: List[CompetencyGrowthPoint]


class TrainerRecommendationCandidate(BaseModel):
    trainer_id: uuid.UUID
    name: str
    email: str
    designation: Optional[str] = None
    department: Optional[str] = None
    overall_match_score: float = Field(..., description="Total matching score percentage (0.0 to 100.0)")
    competency_match: float
    experience_score: float
    qualification_score: float
    certification_score: float
    assessment_score: float
    feedback_score: float
    matched_competencies: List[str]
    missing_competencies: List[str]
    explanation: str


class TrainerRecommendationResponse(BaseModel):
    subject_id: uuid.UUID
    subject_name: str
    subject_code: str
    domain: Optional[str] = None
    candidate_count: int
    candidates: List[TrainerRecommendationCandidate]


class SubjectRequirementItem(BaseModel):
    competency_id: uuid.UUID
    competency_code: str
    competency_name: str
    category: str
    required_level: int
    weight: float


class SubjectDetailResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    description: Optional[str] = None
    domain: Optional[str] = None
    is_active: bool
    requirements: List[SubjectRequirementItem] = []


class CompetencyCatalogueItem(BaseModel):
    id: uuid.UUID
    code: str
    name: str
    category: str
    description: Optional[str] = None
    level_descriptions: Optional[str] = None
