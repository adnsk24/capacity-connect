import uuid
from datetime import date, datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict


class CertificateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    certificate_number: str
    user_id: uuid.UUID
    course_id: uuid.UUID
    course_title: Optional[str] = None
    trainee_name: Optional[str] = None
    issue_date: date
    course_start_date: Optional[date] = None
    course_end_date: Optional[date] = None
    mode: str = "Online"
    score: Optional[float] = None
    grade: Optional[str] = None
    verification_token: str
    pdf_url: Optional[str] = None
    status: str = "ISSUED"
    created_at: datetime
    updated_at: datetime


class CertificateVerifyResponse(BaseModel):
    verified: bool
    status: str  # ISSUED, REVOKED, NOT_FOUND
    certificate_number: Optional[str] = None
    trainee_name: Optional[str] = None
    course_title: Optional[str] = None
    issue_date: Optional[date] = None
    completion_date: Optional[date] = None
    mode: Optional[str] = None
    issuing_organization: str = "India Meteorological Department"
    message: Optional[str] = None


class CertificateEligibilityResponse(BaseModel):
    eligible: bool
    reason: Optional[str] = None
    enrollment_status: Optional[str] = None
    progress_percentage: Optional[float] = None
    assessment_passed: Optional[bool] = None
    assessment_score: Optional[float] = None
    certificate_id: Optional[uuid.UUID] = None
    certificate_number: Optional[str] = None


class CertificateGenerateRequest(BaseModel):
    course_id: uuid.UUID


class CertificateListResponse(BaseModel):
    certificates: List[CertificateResponse]
    total: int


class CertificateRevokeRequest(BaseModel):
    reason: Optional[str] = "Revoked by administrative authority"
