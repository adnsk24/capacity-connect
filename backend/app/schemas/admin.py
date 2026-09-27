import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AdminDashboardStats(BaseModel):
    total_users: int
    pending_users: int
    active_trainees: int
    active_trainers: int
    total_courses: int
    published_courses: int
    total_enrollments: int
    assessment_attempts: int
    certifications_count: int
    overall_completion_rate: float
    users_by_role: Dict[str, int] = {}
    category_distribution: List[Dict[str, Any]] = []
    recent_activity: List[Dict[str, Any]] = []


class AdminUserUpdateStatus(BaseModel):
    status: str = Field(..., pattern="^(ACTIVE|SUSPENDED|REJECTED|PENDING)$")


class AdminUserUpdateRole(BaseModel):
    role: str = Field(..., pattern="^(TRAINEE|TRAINER|ADMIN)$")


class AdminCourseItem(BaseModel):
    id: uuid.UUID
    title: str
    code: str
    category_name: str
    trainer_name: Optional[str] = None
    status: str
    difficulty_level: str
    enrollments_count: int
    completion_rate: float
    created_at: datetime


class AdminAssessmentItem(BaseModel):
    id: uuid.UUID
    title: str
    course_title: str
    trainer_name: Optional[str] = None
    assessment_type: str
    duration_minutes: Optional[int] = None
    passing_percentage: float
    status: str
    attempts_count: int
    average_score: float
    pass_rate: float
