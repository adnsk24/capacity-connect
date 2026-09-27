import uuid
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import (
    String,
    Text,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.course import Course
    from app.models.subject import SubjectCompetencyRequirement


class Competency(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Core organizational capability standard, supporting 3D competency networks and skill gap audits."""
    __tablename__ = "competencies"

    name: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    level_descriptions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user_competencies: Mapped[List["UserCompetency"]] = relationship(
        "UserCompetency", back_populates="competency", cascade="all, delete-orphan"
    )
    course_competencies: Mapped[List["CourseCompetency"]] = relationship(
        "CourseCompetency", back_populates="competency", cascade="all, delete-orphan"
    )
    subject_requirements: Mapped[List["SubjectCompetencyRequirement"]] = relationship(
        "SubjectCompetencyRequirement", back_populates="competency", cascade="all, delete-orphan"
    )


class UserCompetency(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Verified capability evidence associating individual personnel with evaluated competency proficiencies."""
    __tablename__ = "user_competencies"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    competency_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("competencies.id", ondelete="CASCADE"), index=True, nullable=False
    )
    current_level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    assessed_level: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    evidence_source: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )  # ASSESSMENT, CERTIFICATION, EXPERIENCE, SUPERVISOR_EVALUATION
    confidence_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    last_assessed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "competency_id", name="uq_user_competency"),
        CheckConstraint("current_level >= 1 AND current_level <= 5", name="chk_user_comp_level_range"),
        CheckConstraint("confidence_score >= 0.0 AND confidence_score <= 1.0", name="chk_user_comp_confidence_range"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="user_competencies")
    competency: Mapped["Competency"] = relationship("Competency", back_populates="user_competencies")


class CourseCompetency(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Curriculum mapping defining how course completion contributes to organizational competencies."""
    __tablename__ = "course_competencies"

    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False
    )
    competency_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("competencies.id", ondelete="CASCADE"), index=True, nullable=False
    )
    contribution_weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    target_level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    __table_args__ = (
        UniqueConstraint("course_id", "competency_id", name="uq_course_competency"),
        CheckConstraint("target_level >= 1 AND target_level <= 5", name="chk_course_comp_target_level"),
        CheckConstraint("contribution_weight > 0.0 AND contribution_weight <= 1.0", name="chk_course_comp_weight_range"),
    )

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="course_competencies")
    competency: Mapped["Competency"] = relationship("Competency", back_populates="course_competencies")
