import uuid
from datetime import date, datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    String,
    Float,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.course import Course


class Certificate(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Accredited course completion certificates generated via predefined master template."""
    __tablename__ = "certificates"

    certificate_number: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False
    )
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    course_start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    course_end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    mode: Mapped[str] = mapped_column(String(50), default="Online", nullable=False)
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    grade: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    verification_token: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    pdf_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="ISSUED", nullable=False
    )  # ISSUED, REVOKED

    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_user_course_certificate"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="issued_certificates")
    course: Mapped["Course"] = relationship("Course", back_populates="issued_certificates")
