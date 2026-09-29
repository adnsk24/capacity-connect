import uuid
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class CourseProgressResponse(BaseModel):
    id: uuid.UUID
    enrollment_id: uuid.UUID
    completion_percentage: float
    completed_lessons_count: int
    total_lessons_count: int
    last_accessed_lesson_id: Optional[uuid.UUID] = None
    last_accessed_at: Optional[datetime] = None
    is_completed: bool
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class EnrollmentResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    course_id: uuid.UUID
    status: str
    enrolled_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    final_grade: Optional[str] = None
    progress: Optional[CourseProgressResponse] = None

    model_config = ConfigDict(from_attributes=True)


class LessonCompletionResponse(BaseModel):
    id: uuid.UUID
    enrollment_id: uuid.UUID
    lesson_id: uuid.UUID
    completed_at: datetime
    progress: CourseProgressResponse

    model_config = ConfigDict(from_attributes=True)


class EnrolledCourseItem(BaseModel):
    course_id: uuid.UUID
    enrollment_id: uuid.UUID
    title: str
    code: str
    thumbnail_url: Optional[str] = None
    category_name: str
    difficulty_level: str
    duration_hours: int
    status: str  # ENROLLED, IN_PROGRESS, COMPLETED
    enrolled_at: datetime
    last_accessed_at: Optional[datetime] = None
    progress_percentage: float
    completed_lessons_count: int
    total_lessons_count: int
    next_lesson_id: Optional[uuid.UUID] = None
    next_lesson_title: Optional[str] = None
    # Certificate & Credential integration
    certificate_id: Optional[uuid.UUID] = None
    certificate_number: Optional[str] = None
    certificate_pdf_url: Optional[str] = None
    certificate_issue_date: Optional[date] = None
    certificate_status: Optional[str] = None
    # Assessment guidance
    has_pending_assessment: bool = False
    pending_assessment_id: Optional[uuid.UUID] = None
    pending_assessment_title: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

