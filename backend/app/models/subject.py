import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import (
    String,
    Text,
    Boolean,
    Integer,
    Float,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.competency import Competency


class Subject(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Subject domain area against which trainer eligibility and competency requirements are evaluated."""
    __tablename__ = "subjects"

    name: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    domain: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    competency_requirements: Mapped[List["SubjectCompetencyRequirement"]] = relationship(
        "SubjectCompetencyRequirement", back_populates="subject", cascade="all, delete-orphan"
    )


class SubjectCompetencyRequirement(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Required competency benchmark mapping for subject teaching qualification (Recommendation Engine)."""
    __tablename__ = "subject_competency_requirements"

    subject_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("subjects.id", ondelete="CASCADE"), index=True, nullable=False
    )
    competency_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("competencies.id", ondelete="CASCADE"), index=True, nullable=False
    )
    required_level: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)

    __table_args__ = (
        UniqueConstraint("subject_id", "competency_id", name="uq_subject_competency_req"),
        CheckConstraint("required_level >= 1 AND required_level <= 5", name="chk_subj_req_level_range"),
        CheckConstraint("weight > 0.0 AND weight <= 1.0", name="chk_subj_req_weight_range"),
    )

    # Relationships
    subject: Mapped["Subject"] = relationship("Subject", back_populates="competency_requirements")
    competency: Mapped["Competency"] = relationship("Competency", back_populates="subject_requirements")
