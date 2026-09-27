import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class FeedbackCreate(BaseModel):
    """Payload for submitting feedback on a course and instructor."""
    course_rating: int = Field(..., ge=1, le=5, description="Course rating from 1 to 5 stars")
    trainer_rating: Optional[int] = Field(None, ge=1, le=5, description="Instructor rating from 1 to 5 stars")
    content_rating: Optional[int] = Field(None, ge=1, le=5, description="Content clarity rating from 1 to 5 stars")
    comments: Optional[str] = Field(None, max_length=2000, description="Qualitative feedback comments")
    suggestions: Optional[str] = Field(None, max_length=2000, description="Suggestions for syllabus or delivery improvements")


class FeedbackResponse(BaseModel):
    """Serialized feedback record."""
    id: uuid.UUID
    user_id: uuid.UUID
    user_name: Optional[str] = None
    course_id: Optional[uuid.UUID] = None
    course_title: Optional[str] = None
    trainer_id: Optional[uuid.UUID] = None
    course_rating: Optional[int] = None
    trainer_rating: Optional[int] = None
    content_rating: Optional[int] = None
    comments: Optional[str] = None
    suggestions: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CourseFeedbackSummary(BaseModel):
    """Aggregated feedback metrics for an individual course."""
    course_id: uuid.UUID
    course_title: str
    average_course_rating: float
    average_trainer_rating: float
    feedback_count: int
    feedbacks: List[FeedbackResponse] = []


class TrainerFeedbackSummary(BaseModel):
    """Aggregated feedback metrics for an instructor."""
    trainer_id: uuid.UUID
    trainer_name: str
    average_trainer_rating: float
    feedback_count: int
    feedbacks: List[FeedbackResponse] = []
