import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


# Question Option Schemas
class QuestionOptionCreate(BaseModel):
    option_text: str = Field(..., min_length=1, max_length=1000)
    is_correct: bool = False
    order_index: int = 0


class QuestionOptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    question_id: uuid.UUID
    option_text: str
    order_index: int
    is_correct: Optional[bool] = None  # None for trainee during test, populated on submission review


# Question Schemas
class QuestionCreate(BaseModel):
    question_text: str = Field(..., min_length=3)
    question_type: str = "MCQ_SINGLE"
    marks: float = Field(default=1.0, gt=0)
    explanation: Optional[str] = None
    order_index: int = 0
    options: List[QuestionOptionCreate] = Field(..., min_length=2)


class QuestionUpdate(BaseModel):
    question_text: Optional[str] = Field(None, min_length=3)
    question_type: Optional[str] = None
    marks: Optional[float] = Field(None, gt=0)
    explanation: Optional[str] = None
    order_index: Optional[int] = None
    options: Optional[List[QuestionOptionCreate]] = None


class QuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    assessment_id: uuid.UUID
    question_text: str
    question_type: str
    marks: float
    explanation: Optional[str] = None  # Hidden from trainee during exam
    order_index: int
    options: List[QuestionOptionResponse]


# Assessment Authoring & Listing Schemas
class AssessmentCreate(BaseModel):
    course_id: uuid.UUID
    module_id: Optional[uuid.UUID] = None
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    assessment_type: str = "MCQ"
    passing_percentage: float = Field(default=60.0, ge=0.0, le=100.0)
    total_marks: float = Field(default=100.0, gt=0.0)
    duration_minutes: Optional[int] = Field(default=30, ge=1)
    max_attempts: int = Field(default=3, ge=1)
    status: str = Field(default="DRAFT", pattern="^(DRAFT|PUBLISHED|ARCHIVED)$")
    due_at: Optional[datetime] = None


class AssessmentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    module_id: Optional[uuid.UUID] = None
    assessment_type: Optional[str] = None
    passing_percentage: Optional[float] = Field(None, ge=0.0, le=100.0)
    total_marks: Optional[float] = Field(None, gt=0.0)
    duration_minutes: Optional[int] = Field(None, ge=1)
    max_attempts: Optional[int] = Field(None, ge=1)
    status: Optional[str] = Field(None, pattern="^(DRAFT|PUBLISHED|ARCHIVED)$")
    due_at: Optional[datetime] = None


class AssessmentListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    course_title: str
    module_id: Optional[uuid.UUID] = None
    title: str
    description: Optional[str] = None
    assessment_type: str
    passing_percentage: float
    total_marks: float
    duration_minutes: Optional[int] = None
    max_attempts: int
    status: str
    due_at: Optional[datetime] = None
    questions_count: int = 0
    user_attempts_count: int = 0
    user_attempts_remaining: int = 0
    best_score: Optional[float] = None
    is_passed: Optional[bool] = None


class AssessmentDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    course_title: str
    module_id: Optional[uuid.UUID] = None
    title: str
    description: Optional[str] = None
    assessment_type: str
    passing_percentage: float
    total_marks: float
    duration_minutes: Optional[int] = None
    max_attempts: int
    status: str
    due_at: Optional[datetime] = None
    questions_count: int = 0
    questions: List[QuestionResponse] = []


# Examination / Attempt Execution Schemas
class AssessmentAttemptStartResponse(BaseModel):
    attempt_id: uuid.UUID
    assessment_id: uuid.UUID
    assessment_title: str
    attempt_number: int
    status: str
    started_at: datetime
    duration_minutes: Optional[int] = None
    remaining_seconds: Optional[int] = None
    total_questions: int
    total_marks: float
    passing_percentage: float
    questions: List[QuestionResponse]


class AnswerSubmissionItem(BaseModel):
    question_id: uuid.UUID
    selected_option_id: Optional[uuid.UUID] = None
    text_response: Optional[str] = None


class AssessmentSubmitRequest(BaseModel):
    answers: List[AnswerSubmissionItem] = []


class QuestionReviewItem(BaseModel):
    question_id: uuid.UUID
    question_text: str
    marks: float
    marks_awarded: float
    selected_option_id: Optional[uuid.UUID] = None
    is_correct: bool
    explanation: Optional[str] = None
    options: List[QuestionOptionResponse]


class AssessmentResultResponse(BaseModel):
    attempt_id: uuid.UUID
    assessment_id: uuid.UUID
    assessment_title: str
    course_title: str
    attempt_number: int
    status: str
    total_marks: float
    score_obtained: float
    percentage: float
    is_passed: bool
    started_at: datetime
    submitted_at: Optional[datetime] = None
    questions: List[QuestionReviewItem] = []


class AssessmentAttemptHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    attempt_id: uuid.UUID
    assessment_id: uuid.UUID
    assessment_title: str
    course_title: str
    attempt_number: int
    status: str
    total_marks: float
    score_obtained: Optional[float] = None
    percentage: Optional[float] = None
    is_passed: Optional[bool] = None
    started_at: datetime
    submitted_at: Optional[datetime] = None
