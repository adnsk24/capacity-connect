import os
import re
import uuid
from datetime import date, datetime
from pathlib import Path
from typing import Optional, List, Tuple

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import qrcode

from app.models.user import User
from app.models.course import Course, CourseModule, Lesson, Enrollment
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.certificate import Certificate
from app.models.course import LessonCompletion
from app.schemas.certificate import (
    CertificateResponse,
    CertificateVerifyResponse,
    CertificateEligibilityResponse,
)

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
FONTS_DIR = STATIC_DIR / "fonts"
TEMPLATE_PATH = STATIC_DIR / "certificate_template.png"
UPLOADS_DIR = BASE_DIR.parent / "uploads"

# Ensure font is registered once
_FONT_REGISTERED = False


def _ensure_font_registered():
    global _FONT_REGISTERED
    if not _FONT_REGISTERED:
        font_file = FONTS_DIR / "GreatVibes-Regular.ttf"
        if font_file.exists():
            try:
                pdfmetrics.registerFont(TTFont("GreatVibes", str(font_file)))
                _FONT_REGISTERED = True
            except Exception as e:
                print(f"[CertificateService] Warning: Failed to register GreatVibes font: {e}")


def calculate_grade(score: Optional[float]) -> Optional[str]:
    if score is None:
        return None
    if score >= 90.0:
        return "O"  # Outstanding
    if score >= 80.0:
        return "A+"
    if score >= 70.0:
        return "A"
    if score >= 60.0:
        return "B"
    return "P"


def generate_course_code(course_title: str) -> str:
    """Extracts a short 3-4 letter uppercase abbreviation from course title."""
    clean = re.sub(r"[^a-zA-Z\s]", "", course_title).strip()
    words = [w for w in clean.split() if w.lower() not in ("in", "of", "and", "the", "for", "to")]
    if len(words) >= 3:
        code = "".join(w[0] for w in words[:4]).upper()
    elif len(words) == 2:
        code = (words[0][:2] + words[1][:2]).upper()
    elif len(words) == 1:
        code = words[0][:4].upper()
    else:
        code = "GEN"
    return code or "GEN"


class CertificateService:
    @classmethod
    def check_eligibility(
        cls, db: Session, user_id: uuid.UUID, course_id: uuid.UUID
    ) -> CertificateEligibilityResponse:
        """Evaluates whether a trainee meets all requirements for certificate issuance:
        1. Enrolled in course
        2. Required learning content (lessons) completed (100%)
        3. Required assessment(s) completed and passed (if any exist)
        4. Course completion status reached
        """
        # 1. Existing certificate check
        existing = (
            db.query(Certificate)
            .filter(Certificate.user_id == user_id, Certificate.course_id == course_id)
            .first()
        )
        if existing:
            return CertificateEligibilityResponse(
                eligible=True,
                reason="Certificate has already been issued.",
                enrollment_status="COMPLETED",
                progress_percentage=100.0,
                assessment_passed=True,
                assessment_score=existing.score,
                certificate_id=existing.id,
                certificate_number=existing.certificate_number,
            )

        # 2. Enrollment check
        enrollment = (
            db.query(Enrollment)
            .filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
            .first()
        )
        if not enrollment:
            return CertificateEligibilityResponse(
                eligible=False,
                reason="Trainee is not enrolled in this course.",
                enrollment_status=None,
                progress_percentage=0.0,
            )

        # 3. Learning content completion check
        total_lessons = (
            db.query(Lesson)
            .join(CourseModule, Lesson.module_id == CourseModule.id)
            .filter(CourseModule.course_id == course_id)
            .count()
        )
        completed_lessons = (
            db.query(LessonCompletion)
            .filter(LessonCompletion.enrollment_id == enrollment.id)
            .count()
        )

        progress_pct = (
            round((completed_lessons / total_lessons * 100.0), 1)
            if total_lessons > 0
            else 100.0
        )

        if enrollment.progress and enrollment.progress.completion_percentage:
            progress_pct = max(progress_pct, float(enrollment.progress.completion_percentage))

        if progress_pct < 100.0 and enrollment.status != "COMPLETED":
            return CertificateEligibilityResponse(
                eligible=False,
                reason=f"Learning content is incomplete ({progress_pct:.0f}% completed). All lessons must be finished.",
                enrollment_status=enrollment.status,
                progress_percentage=progress_pct,
            )

        # 4. Assessment check
        published_assessments = (
            db.query(Assessment)
            .filter(Assessment.course_id == course_id, Assessment.status == "PUBLISHED")
            .all()
        )

        best_score = None
        has_passed_assessment = True

        if published_assessments:
            assessment_ids = [a.id for a in published_assessments]
            passed_attempts = (
                db.query(AssessmentAttempt)
                .filter(
                    AssessmentAttempt.user_id == user_id,
                    AssessmentAttempt.assessment_id.in_(assessment_ids),
                    AssessmentAttempt.is_passed == True,
                )
                .all()
            )

            # Check if all required assessments are passed
            passed_assessment_ids = {att.assessment_id for att in passed_attempts}
            all_passed = all(a.id in passed_assessment_ids for a in published_assessments)

            if not all_passed:
                return CertificateEligibilityResponse(
                    eligible=False,
                    reason="Required course assessment has not been passed.",
                    enrollment_status=enrollment.status,
                    progress_percentage=progress_pct,
                    assessment_passed=False,
                )

            if passed_attempts:
                best_score = max((att.percentage or 0.0) for att in passed_attempts)

        # 5. Course Status check / update
        if enrollment.status != "COMPLETED":
            enrollment.status = "COMPLETED"
            if not enrollment.completed_at:
                enrollment.completed_at = datetime.utcnow()
            db.commit()

        return CertificateEligibilityResponse(
            eligible=True,
            reason="All course completion and assessment requirements met.",
            enrollment_status=enrollment.status,
            progress_percentage=progress_pct,
            assessment_passed=has_passed_assessment,
            assessment_score=best_score,
        )

    @classmethod
    def generate_certificate_number(cls, db: Session, course: Course, year: int) -> str:
        """Generates a unique permanent certificate number: CC-YYYY-COURSECODE-XXXXXX"""
        code = generate_course_code(course.title)
        prefix = f"CC-{year}-{code}-"

        # Count existing certificates with this prefix
        count = (
            db.query(Certificate)
            .filter(Certificate.certificate_number.like(f"{prefix}%"))
            .count()
        )
        seq = count + 1
        candidate = f"{prefix}{seq:06d}"

        # Ensure uniqueness
        while db.query(Certificate).filter(Certificate.certificate_number == candidate).first():
            seq += 1
            candidate = f"{prefix}{seq:06d}"

        return candidate

    @classmethod
    def render_pdf(
        cls,
        certificate: Certificate,
        user: User,
        course: Course,
        public_verify_base_url: str = "http://localhost:5173",
    ) -> Tuple[str, Path]:
        """Generates the certificate PDF using the master template and ReportLab.
        Returns: (relative_storage_url, absolute_file_path)
        """
        _ensure_font_registered()

        # Destination path: uploads/certificates/<user_id>/<certificate_number>.pdf
        dest_dir = UPLOADS_DIR / "certificates" / str(user.id)
        dest_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{certificate.certificate_number}.pdf"
        abs_pdf_path = dest_dir / filename
        rel_storage_url = f"/uploads/certificates/{user.id}/{filename}"

        # Standard A4 landscape dimensions in points
        w, h = 841.89, 595.28
        c = canvas.Canvas(str(abs_pdf_path), pagesize=(w, h))

        # 1. Full-page clean master background template (no placeholder text, seamless)
        template_file = STATIC_DIR / "certificate_clean_master.png"
        if not template_file.exists():
            template_file = TEMPLATE_PATH

        if template_file.exists():
            c.drawImage(str(template_file), 0, 0, width=w, height=h)

        # Exact horizontal midpoint of certificate text body
        center_x = 421.0

        # 2. Dynamic Trainee Name
        trainee_name = f"{user.first_name} {user.last_name}".strip()
        if not trainee_name:
            trainee_name = user.username

        name_font = "GreatVibes" if _FONT_REGISTERED else "Times-BoldItalic"
        font_size = 46

        # Auto-scale font size if name is long
        try:
            name_w = c.stringWidth(trainee_name, name_font, font_size)
            if name_w > 360:
                font_size = max(24, int(font_size * (360 / name_w)))
        except Exception:
            font_size = 40

        c.setFont(name_font, font_size)
        c.setFillColor(HexColor("#0B2545"))
        c.drawCentredString(center_x, 314.5, trainee_name)

        # 3. Dynamic Course Title
        course_title_formatted = f"“{course.title}”"
        title_font = "Times-Bold"
        title_font_size = 17

        title_w = c.stringWidth(course_title_formatted, title_font, title_font_size)
        if title_w > 400:
            title_font_size = max(11, int(title_font_size * (400 / title_w)))

        c.setFont(title_font, title_font_size)
        c.setFillColor(HexColor("#09234B"))
        c.drawCentredString(center_x, 247.0, course_title_formatted)

        # 4. Pills dynamic values (seamless pill background preserved)
        c.setFont("Times-Roman", 9.5)
        c.setFillColor(HexColor("#1A3250"))

        # Section 1: Duration
        start_str = (
            certificate.course_start_date.strftime("%d %b %Y")
            if certificate.course_start_date
            else certificate.issue_date.strftime("%d %b %Y")
        )
        end_str = (
            certificate.course_end_date.strftime("%d %b %Y")
            if certificate.course_end_date
            else certificate.issue_date.strftime("%d %b %Y")
        )
        c.drawString(277.5, 153.5, start_str)
        c.drawString(277.5, 142.5, f"to {end_str}")

        # Section 2: Mode
        c.drawString(433.0, 148.0, certificate.mode or "Online")

        # Section 3: Date of Issue
        issue_str = certificate.issue_date.strftime("%d %b %Y")
        c.drawString(579.5, 148.0, issue_str)

        # 5. Dynamic QR Code inside the pre-printed QR frame
        verify_url = f"{public_verify_base_url.rstrip('/')}/certificates/verify/{certificate.id}"
        qr = qrcode.QRCode(box_size=4, border=0)
        qr.add_data(verify_url)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")

        temp_qr_path = dest_dir / f"qr_{certificate.id}.png"
        qr_img.save(str(temp_qr_path))
        c.drawImage(str(temp_qr_path), 25.5, 66.8, width=48.0, height=48.0)

        # Remove temp QR image
        try:
            if temp_qr_path.exists():
                temp_qr_path.unlink()
        except Exception:
            pass

        # 6. Unobtrusive Certificate Number below "Scan the QR code"
        c.setFont("Helvetica-Bold", 6.5)
        c.setFillColor(HexColor("#475569"))
        c.drawCentredString(49.5, 37.0, certificate.certificate_number)

        c.save()
        return rel_storage_url, abs_pdf_path

    @classmethod
    def issue_certificate(
        cls, db: Session, user_id: uuid.UUID, course_id: uuid.UUID, public_verify_base_url: str = "http://localhost:5173"
    ) -> Certificate:
        """Verifies eligibility and generates/issues an accredited certificate."""
        eligibility = cls.check_eligibility(db, user_id, course_id)
        if not eligibility.eligible:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=eligibility.reason or "Course completion requirements not satisfied.",
            )

        # If already issued, return existing
        existing = (
            db.query(Certificate)
            .filter(Certificate.user_id == user_id, Certificate.course_id == course_id)
            .first()
        )
        if existing:
            # If PDF doesn't exist on disk, re-render it
            pdf_path = cls.get_pdf_path(existing)
            if not pdf_path.exists():
                user = db.query(User).filter(User.id == user_id).first()
                course = db.query(Course).filter(Course.id == course_id).first()
                if user and course:
                    rel_url, _ = cls.render_pdf(existing, user, course, public_verify_base_url)
                    existing.pdf_url = rel_url
                    db.commit()
            return existing

        user = db.query(User).filter(User.id == user_id).first()
        course = db.query(Course).filter(Course.id == course_id).first()
        enrollment = (
            db.query(Enrollment)
            .filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
            .first()
        )

        if not user or not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User or course not found.",
            )

        issue_date = date.today()
        course_start = (
            enrollment.started_at.date()
            if enrollment and enrollment.started_at
            else (course.created_at.date() if course.created_at else issue_date)
        )
        course_end = (
            enrollment.completed_at.date()
            if enrollment and enrollment.completed_at
            else issue_date
        )

        mode = getattr(course, "delivery_mode", None) or getattr(course, "mode", None) or "Online"
        if mode not in ("Online", "Offline", "Hybrid"):
            mode = "Online"

        score = eligibility.assessment_score
        grade = calculate_grade(score)
        cert_number = cls.generate_certificate_number(db, course, issue_date.year)
        token = uuid.uuid4().hex

        new_cert = Certificate(
            certificate_number=cert_number,
            user_id=user_id,
            course_id=course_id,
            issue_date=issue_date,
            course_start_date=course_start,
            course_end_date=course_end,
            mode=mode,
            score=score,
            grade=grade,
            verification_token=token,
            status="ISSUED",
        )
        db.add(new_cert)
        db.flush()

        # Render PDF
        rel_url, _ = cls.render_pdf(new_cert, user, course, public_verify_base_url)
        new_cert.pdf_url = rel_url

        db.commit()
        db.refresh(new_cert)
        return new_cert

    @classmethod
    def get_pdf_path(cls, certificate: Certificate) -> Path:
        """Returns the absolute path to the certificate PDF on disk."""
        filename = f"{certificate.certificate_number}.pdf"
        return UPLOADS_DIR / "certificates" / str(certificate.user_id) / filename

    @classmethod
    def get_user_certificates(cls, db: Session, user_id: uuid.UUID) -> List[CertificateResponse]:
        """Lists all certificates issued to a specific trainee."""
        certs = (
            db.query(Certificate)
            .filter(Certificate.user_id == user_id)
            .order_by(Certificate.issue_date.desc(), Certificate.created_at.desc())
            .all()
        )
        result = []
        for cert in certs:
            resp = CertificateResponse.model_validate(cert)
            resp.course_title = cert.course.title if cert.course else None
            resp.trainee_name = (
                f"{cert.user.first_name} {cert.user.last_name}".strip()
                if cert.user
                else None
            )
            result.append(resp)
        return result

    @classmethod
    def get_certificate_by_id(
        cls, db: Session, certificate_id: uuid.UUID, current_user: Optional[User] = None
    ) -> Certificate:
        """Fetches certificate by ID with strict ownership/RBAC check."""
        cert = db.query(Certificate).filter(Certificate.id == certificate_id).first()
        if not cert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Certificate not found.",
            )

        if current_user:
            role_name = current_user.role.name if current_user.role else "TRAINEE"
            if role_name not in ("ADMIN", "SUPERADMIN") and cert.user_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not authorized to view this certificate.",
                )

        return cert

    @classmethod
    def verify_certificate(
        cls, db: Session, identifier: str
    ) -> CertificateVerifyResponse:
        """Public verification endpoint (no auth required).
        Can query by certificate ID (UUID) or certificate number.
        """
        cert = None
        try:
            val_uuid = uuid.UUID(identifier)
            cert = db.query(Certificate).filter(Certificate.id == val_uuid).first()
        except ValueError:
            pass

        if not cert:
            cert = (
                db.query(Certificate)
                .filter(Certificate.certificate_number == identifier)
                .first()
            )

        if not cert:
            return CertificateVerifyResponse(
                verified=False,
                status="NOT_FOUND",
                message="Certificate Not Found",
            )

        trainee_name = (
            f"{cert.user.first_name} {cert.user.last_name}".strip()
            if cert.user
            else "Trainee"
        )
        course_title = cert.course.title if cert.course else "Training Course"

        if cert.status == "REVOKED":
            return CertificateVerifyResponse(
                verified=False,
                status="REVOKED",
                certificate_number=cert.certificate_number,
                trainee_name=trainee_name,
                course_title=course_title,
                issue_date=cert.issue_date,
                completion_date=cert.course_end_date,
                mode=cert.mode,
                message="Certificate Revoked",
            )

        return CertificateVerifyResponse(
            verified=True,
            status="ISSUED",
            certificate_number=cert.certificate_number,
            trainee_name=trainee_name,
            course_title=course_title,
            issue_date=cert.issue_date,
            completion_date=cert.course_end_date,
            mode=cert.mode,
            message="Verified Certificate",
        )

    @classmethod
    def revoke_certificate(
        cls, db: Session, certificate_id: uuid.UUID, admin_user: User
    ) -> Certificate:
        """Administrative action to revoke a certificate."""
        role_name = admin_user.role.name if admin_user.role else "TRAINEE"
        if role_name not in ("ADMIN", "SUPERADMIN"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators can revoke certificates.",
            )

        cert = db.query(Certificate).filter(Certificate.id == certificate_id).first()
        if not cert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Certificate not found.",
            )

        cert.status = "REVOKED"
        db.commit()
        db.refresh(cert)
        return cert

    @classmethod
    def list_all_certificates(
        cls, db: Session, search: Optional[str] = None, skip: int = 0, limit: int = 50
    ) -> Tuple[List[CertificateResponse], int]:
        """Admin query to list and search all issued certificates."""
        query = db.query(Certificate)
        if search:
            s = f"%{search.strip()}%"
            query = (
                query.join(User, Certificate.user_id == User.id)
                .join(Course, Certificate.course_id == Course.id)
                .filter(
                    (Certificate.certificate_number.ilike(s))
                    | (User.first_name.ilike(s))
                    | (User.last_name.ilike(s))
                    | (Course.title.ilike(s))
                )
            )

        total = query.count()
        certs = (
            query.order_by(Certificate.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        items = []
        for cert in certs:
            resp = CertificateResponse.model_validate(cert)
            resp.course_title = cert.course.title if cert.course else None
            resp.trainee_name = (
                f"{cert.user.first_name} {cert.user.last_name}".strip()
                if cert.user
                else None
            )
            items.append(resp)

        return items, total
