import uuid
from datetime import date, datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, ConfigDict
from app.schemas.enrollment import EnrolledCourseItem


class QualificationItem(BaseModel):
    id: Optional[uuid.UUID] = None
    degree: str
    field_of_study: Optional[str] = None
    institution: str
    year_of_passing: Optional[int] = None
    grade_or_percentage: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ExperienceItem(BaseModel):
    id: Optional[uuid.UUID] = None
    title: str
    organization_name: str
    location: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SkillItem(BaseModel):
    id: Optional[uuid.UUID] = None
    skill_id: Optional[uuid.UUID] = None
    name: str
    category: Optional[str] = None
    proficiency_level: str = "BEGINNER"
    years_of_experience: Optional[float] = None
    is_verified: bool = False

    model_config = ConfigDict(from_attributes=True)


class TraineeProfileResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    account_status: str
    is_active: bool
    is_verified: bool
    organization_id: Optional[uuid.UUID] = None
    organization_name: Optional[str] = None
    department_id: Optional[uuid.UUID] = None
    department_name: Optional[str] = None

    # Trainee Profile Specific Fields
    employee_id: Optional[str] = None
    designation: Optional[str] = None
    cadre: Optional[str] = None
    posting_location: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[str] = None
    target_competency_level: Optional[str] = None
    readiness_score: float = 0.0

    # Associated Arrays
    qualifications: List[QualificationItem] = []
    experiences: List[ExperienceItem] = []
    skills: List[SkillItem] = []

    # Calculated metrics
    profile_completion_percentage: float = 0.0
    completion_breakdown: Dict[str, bool] = {}

    model_config = ConfigDict(from_attributes=True)


class TraineeProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    designation: Optional[str] = None
    cadre: Optional[str] = None
    posting_location: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[str] = None
    organization_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None
    qualifications: Optional[List[QualificationItem]] = None
    experiences: Optional[List[ExperienceItem]] = None
    skills: Optional[List[SkillItem]] = None


class CompetencyOverviewItem(BaseModel):
    id: uuid.UUID
    competency_id: uuid.UUID
    name: str
    code: str
    category: str
    current_level: int
    target_level: int = 3
    confidence_score: float

    model_config = ConfigDict(from_attributes=True)


class CertificateItem(BaseModel):
    id: uuid.UUID
    title: str
    course_id: Optional[uuid.UUID] = None
    course_title: Optional[str] = None
    issuing_organization: str
    credential_id: Optional[str] = None
    issue_date: date
    verification_status: str

    model_config = ConfigDict(from_attributes=True)


class TraineeDashboardResponse(BaseModel):
    welcome_message: str
    user_summary: Dict[str, Any]
    profile_completion_percentage: float
    courses_enrolled_count: int
    courses_completed_count: int
    average_progress_percentage: float
    recent_learning: List[EnrolledCourseItem]
    upcoming_assessments: List[Dict[str, Any]] = []  # Honest empty state if none
    competencies: List[CompetencyOverviewItem] = []
    certificates: List[CertificateItem] = []
    notifications: List[Dict[str, Any]] = []

    model_config = ConfigDict(from_attributes=True)
