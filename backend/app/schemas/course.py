import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CourseCategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    description: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None
    course_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class ResourceResponse(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    module_id: Optional[uuid.UUID] = None
    lesson_id: Optional[uuid.UUID] = None
    title: str
    description: Optional[str] = None
    resource_type: str
    storage_url: str
    media_url: Optional[str] = None
    file_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size_bytes: Optional[int] = None
    mime_type: Optional[str] = None
    duration_seconds: Optional[int] = None
    display_order: int = 0
    is_published: bool = True
    is_downloadable: bool = True
    is_completed: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ResourceCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    resource_type: str = "VIDEO"
    media_url: Optional[str] = None
    url_or_path: Optional[str] = None
    thumbnail_url: Optional[str] = None
    module_id: Optional[uuid.UUID] = None
    lesson_id: Optional[uuid.UUID] = None
    duration_seconds: Optional[int] = Field(None, ge=0)
    display_order: int = 0
    is_published: bool = True
    is_downloadable: bool = True


class ResourceUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    resource_type: Optional[str] = None
    media_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    module_id: Optional[uuid.UUID] = None
    lesson_id: Optional[uuid.UUID] = None
    duration_seconds: Optional[int] = Field(None, ge=0)
    display_order: Optional[int] = None
    is_published: Optional[bool] = None
    is_downloadable: Optional[bool] = None


class ResourcePublishRequest(BaseModel):
    is_published: bool


class ResourceCompleteRequest(BaseModel):
    is_completed: bool = True
    progress_seconds: Optional[int] = None


class LessonResponse(BaseModel):
    id: uuid.UUID
    module_id: uuid.UUID
    title: str
    description: Optional[str] = None
    content_type: str = "TEXT"
    content_body: Optional[str] = None
    order_index: int = 0
    duration_minutes: int = 0
    is_mandatory: bool = True
    is_completed: bool = False
    resources: List[ResourceResponse] = []

    model_config = ConfigDict(from_attributes=True)


class CourseModuleResponse(BaseModel):
    id: uuid.UUID
    course_id: uuid.UUID
    title: str
    description: Optional[str] = None
    order_index: int = 0
    lessons: List[LessonResponse] = []
    resources: List[ResourceResponse] = []

    model_config = ConfigDict(from_attributes=True)


class TrainerSummaryResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    email: str
    avatar_url: Optional[str] = None
    designation: Optional[str] = None
    specialization: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CompetencyTagResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: str
    category: str
    target_level: int = 1
    contribution_weight: float = 1.0

    model_config = ConfigDict(from_attributes=True)


class CourseCardResponse(BaseModel):
    id: uuid.UUID
    code: str
    title: str
    description: Optional[str] = None
    category_id: uuid.UUID
    category_name: str
    category_code: str
    difficulty_level: str
    duration_hours: int
    thumbnail_url: Optional[str] = None
    trainer: Optional[TrainerSummaryResponse] = None
    total_modules: int = 0
    total_lessons: int = 0
    competencies: List[str] = []
    is_enrolled: bool = False
    enrollment_status: Optional[str] = None
    progress_percentage: Optional[float] = None
    module_names: List[str] = []
    assessment_types: List[str] = []
    passing_marks: Optional[str] = "60% Pass Mark"
    enrollment_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class CourseDetailResponse(BaseModel):
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
    category: CourseCategoryResponse
    trainer: Optional[TrainerSummaryResponse] = None
    modules: List[CourseModuleResponse] = []
    resources: List[ResourceResponse] = []
    competencies: List[CompetencyTagResponse] = []
    is_enrolled: bool = False
    enrollment_id: Optional[uuid.UUID] = None
    enrollment_status: Optional[str] = None
    progress_percentage: Optional[float] = None
    completed_lessons_count: int = 0
    total_lessons_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class CourseCatalogueResponse(BaseModel):
    items: List[CourseCardResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    categories: List[CourseCategoryResponse] = []
