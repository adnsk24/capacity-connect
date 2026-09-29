import uuid
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import (
    String,
    Text,
    Boolean,
    Integer,
    DateTime,
    ForeignKey,
    Index,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.course import Course, CourseModule, Resource
    from app.models.assessment import Assessment
    from app.models.user import User


class AIDocumentChunk(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Searchable document chunks extracted from approved course resources for Grounded RAG.
    Preserves exact provenance (document title, page number, section name) for factual citations.
    """
    __tablename__ = "ai_document_chunks"

    resource_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resources.id", ondelete="CASCADE"), index=True, nullable=False
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False
    )
    module_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("course_modules.id", ondelete="SET NULL"), index=True, nullable=True
    )

    document_title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    section_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    chunk_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)

    __table_args__ = (
        Index("ix_ai_chunks_resource_order", "resource_id", "chunk_index"),
    )

    # Relationships
    resource: Mapped["Resource"] = relationship("Resource", back_populates="ai_chunks")
    course: Mapped["Course"] = relationship("Course")
    module: Mapped[Optional["CourseModule"]] = relationship("CourseModule")


class AIGeneratedContent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    AI-generated artifacts (quizzes, study guides, FAQs, glossaries) subject to mandatory human review.
    Status starts as 'PENDING_REVIEW' and only enters active engines upon trainer approval.
    """
    __tablename__ = "ai_generated_content"

    content_type: Mapped[str] = mapped_column(
        String(50), index=True, nullable=False
    )  # QUIZ_QUESTION, STUDY_GUIDE, FAQ, GLOSSARY
    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False
    )
    module_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("course_modules.id", ondelete="SET NULL"), index=True, nullable=True
    )
    assessment_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("assessments.id", ondelete="SET NULL"), index=True, nullable=True
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(50), default="PENDING_REVIEW", index=True, nullable=False
    )  # PENDING_REVIEW, APPROVED, REJECTED
    reviewed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    payload: Mapped[str] = mapped_column(Text, nullable=False)  # JSON-encoded payload
    source_citation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    course: Mapped["Course"] = relationship("Course")
    module: Mapped[Optional["CourseModule"]] = relationship("CourseModule")
    assessment: Mapped[Optional["Assessment"]] = relationship("Assessment")
    creator: Mapped["User"] = relationship("User", foreign_keys=[created_by])
    reviewer: Mapped[Optional["User"]] = relationship("User", foreign_keys=[reviewed_by])


class AIAuditLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Security and observability audit log for AI interactions.
    Does NOT store API keys, JWT secrets, or sensitive user passwords.
    """
    __tablename__ = "ai_audit_logs"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    feature: Mapped[str] = mapped_column(
        String(100), index=True, nullable=False
    )  # NOTEBOOK, QUIZ_GENERATOR, COMPETENCY_DIAGNOSTIC, TRAINER_MATCHING, STUDY_GUIDE, FAQ_GLOSSARY
    source_resource_ids: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # SUCCESS, REFUSED_NO_EVIDENCE, ERROR, DISABLED
    latency_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User")
