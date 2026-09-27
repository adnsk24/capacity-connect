import uuid
from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict


class TrainerDashboardStats(BaseModel):
    courses_managed: int
    enrolled_trainees: int
    active_learners: int
    assessments_count: int
    average_assessment_score: float
    completion_rate: float
    recent_activity: List[Dict[str, Any]] = []
    upcoming_deadlines: List[Dict[str, Any]] = []


class TrainerCourseCreate(BaseModel):
    category_id: uuid.UUID
    title: str = Field(..., min_length=3, max_length=255)
    code: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None
    objectives: Optional[str] = None
    prerequisites: Optional[str] = None
    difficulty_level: str = "BEGINNER"
    duration_hours: int = Field(default=10, ge=1)
    status: str = "DRAFT"


class TrainerCourseUpdate(BaseModel):
    category_id: Optional[uuid.UUID] = None
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    code: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = None
    objectives: Optional[str] = None
    prerequisites: Optional[str] = None
    difficulty_level: Optional[str] = None
    duration_hours: Optional[int] = Field(None, ge=1)
    status: Optional[str] = None


class ModuleCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    order_index: int = 0


class LessonCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    content_type: str = "TEXT"
    content_body: Optional[str] = None
    duration_minutes: int = Field(default=15, ge=1)
    order_index: int = 0
    is_mandatory: bool = True


class ResourceCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    resource_type: str = "DOCUMENT"  # DOCUMENT, PDF, LINK, DATASET
    url_or_path: str = Field(..., min_length=1)
    description: Optional[str] = None


class TraineePerformanceItem(BaseModel):
    trainee_id: uuid.UUID
    trainee_name: str
    trainee_email: str
    course_id: uuid.UUID
    course_title: str
    enrollment_status: str
    enrolled_at: datetime
    progress_percentage: float
    completed_lessons: int
    total_lessons: int
    assessment_attempts_count: int
    latest_score: Optional[float] = None
    is_passed: Optional[bool] = None


class TraineePerformanceResponse(BaseModel):
    total_count: int
    page: int
    page_size: int
    items: List[TraineePerformanceItem]


class TrainerCourseListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    code: str
    description: Optional[str] = None
    category_id: uuid.UUID
    category_name: str
    difficulty_level: str
    duration_hours: int
    status: str
    thumbnail_url: Optional[str] = None
    enrolled_count: int = 0
    modules_count: int = 0
    published_at: Optional[datetime] = None


class TrainerCourseDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    title: str
    description: Optional[str] = None
    objectives: Optional[str] = None
    prerequisites: Optional[str] = None
    status: str
    difficulty_level: str
    duration_hours: int
    thumbnail_url: Optional[str] = None
    published_at: Optional[datetime] = None
    category_id: uuid.UUID
    category_name: str
    trainer_name: Optional[str] = None
    modules: List[Dict[str, Any]] = []
    resources: List[Dict[str, Any]] = []

