import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_active_user, require_admin
from app.models.user import User
from app.models.course import Course
from app.models.certificate import Certificate
from app.schemas.certificate import (
    CertificateResponse,
    CertificateVerifyResponse,
    CertificateEligibilityResponse,
    CertificateGenerateRequest,
    CertificateListResponse,
    CertificateRevokeRequest,
)
from app.services.certificate_service import CertificateService

router = APIRouter(prefix="/certificates", tags=["Certificates"])


@router.get("/me", response_model=List[CertificateResponse], summary="List all certificates for authenticated trainee")
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Returns all certificates issued to the authenticated trainee."""
    return CertificateService.get_user_certificates(db, current_user.id)


@router.get("/verify/{certificate_id}", response_model=CertificateVerifyResponse, summary="Public certificate verification (no auth)")
def verify_certificate_public(
    certificate_id: str,
    db: Session = Depends(get_db),
):
    """Cryptographic/public verification of an issued certificate.
    Does not require login. Safe for QR code scanner usage.
    """
    return CertificateService.verify_certificate(db, certificate_id)


@router.get("/eligibility/{course_id}", response_model=CertificateEligibilityResponse, summary="Check certificate eligibility")
def check_course_eligibility(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Checks whether the authenticated trainee is eligible to receive a certificate for the course."""
    return CertificateService.check_eligibility(db, current_user.id, course_id)


@router.post("/generate", response_model=CertificateResponse, summary="Generate certificate for course")
def generate_certificate_by_payload(
    payload: CertificateGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Issues certificate if all course completion requirements are met."""
    cert = CertificateService.issue_certificate(db, current_user.id, payload.course_id)
    resp = CertificateResponse.model_validate(cert)
    resp.course_title = cert.course.title if cert.course else None
    resp.trainee_name = f"{cert.user.first_name} {cert.user.last_name}".strip() if cert.user else None
    return resp


@router.post("/{course_or_cert_id}/generate", response_model=CertificateResponse, summary="Generate certificate for course or re-issue")
def generate_certificate_by_id(
    course_or_cert_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Issues certificate if all requirements are met.
    Accepts either a course UUID or existing certificate UUID.
    """
    try:
        val_uuid = uuid.UUID(course_or_cert_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid identifier format.")

    # Check if this is a course_id
    course = db.query(Course).filter(Course.id == val_uuid).first()
    if course:
        cert = CertificateService.issue_certificate(db, current_user.id, course.id)
    else:
        # Check if it's already an existing certificate_id
        cert = db.query(Certificate).filter(Certificate.id == val_uuid).first()
        if not cert:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course or certificate not found.")
        if cert.user_id != current_user.id:
            role_name = current_user.role.name if current_user.role else "TRAINEE"
            if role_name not in ("ADMIN", "SUPERADMIN"):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized.")

    resp = CertificateResponse.model_validate(cert)
    resp.course_title = cert.course.title if cert.course else None
    resp.trainee_name = f"{cert.user.first_name} {cert.user.last_name}".strip() if cert.user else None
    return resp


@router.get("/admin/all", response_model=CertificateListResponse, summary="Admin: List all certificates")
def admin_list_all_certificates(
    search: Optional[str] = Query(None, description="Search by cert number, trainee name, or course title"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Allows administrators to search and inspect all issued certificates across the portal."""
    items, total = CertificateService.list_all_certificates(db, search=search, skip=skip, limit=limit)
    return CertificateListResponse(certificates=items, total=total)


@router.post("/admin/{certificate_id}/revoke", response_model=CertificateResponse, summary="Admin: Revoke certificate")
def admin_revoke_certificate(
    certificate_id: uuid.UUID,
    payload: Optional[CertificateRevokeRequest] = None,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """Revokes a previously issued certificate."""
    cert = CertificateService.revoke_certificate(db, certificate_id, admin_user)
    resp = CertificateResponse.model_validate(cert)
    resp.course_title = cert.course.title if cert.course else None
    resp.trainee_name = f"{cert.user.first_name} {cert.user.last_name}".strip() if cert.user else None
    return resp


@router.get("/{certificate_id}", response_model=CertificateResponse, summary="Get certificate details")
def get_certificate_detail(
    certificate_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retrieves certificate details. Enforces ownership check (trainee owns it or user is admin)."""
    cert = CertificateService.get_certificate_by_id(db, certificate_id, current_user)
    resp = CertificateResponse.model_validate(cert)
    resp.course_title = cert.course.title if cert.course else None
    resp.trainee_name = f"{cert.user.first_name} {cert.user.last_name}".strip() if cert.user else None
    return resp


@router.get("/{certificate_id}/download", summary="Download certificate PDF")
def download_certificate(
    certificate_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Securely downloads the generated PDF certificate.
    Enforces ownership server-side.
    Filename: Capacity_Connect_Certificate_<CertificateNumber>.pdf
    """
    cert = CertificateService.get_certificate_by_id(db, certificate_id, current_user)
    pdf_path = CertificateService.get_pdf_path(cert)

    if not pdf_path.exists():
        # Re-render if file is somehow missing from disk
        user = db.query(User).filter(User.id == cert.user_id).first()
        course = db.query(Course).filter(Course.id == cert.course_id).first()
        if user and course:
            CertificateService.render_pdf(cert, user, course)
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate source not found.")

    download_filename = f"Capacity_Connect_Certificate_{cert.certificate_number}.pdf"
    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=download_filename,
    )
