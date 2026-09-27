import uuid
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import (
    String,
    Text,
    Boolean,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.course import Course, CourseModule
    from app.models.user import User


class Assessment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Timed, modular, or course-final examinations and practical evaluations."""
    __tablename__ = "assessments"

    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False
    )
    module_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("course_modules.id", ondelete="SET NULL"), index=True, nullable=True
    )

    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    assessment_type: Mapped[str] = mapped_column(
        String(50), default="MCQ", nullable=False
    )  # MCQ, PRACTICAL, ASSIGNMENT, PROJECT
    passing_percentage: Mapped[float] = mapped_column(Float, default=60.0, nullable=False)
    total_marks: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    max_attempts: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="DRAFT", index=True, nullable=False
    )  # DRAFT, PUBLISHED, ARCHIVED
    due_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="assessments")
    module: Mapped[Optional["CourseModule"]] = relationship("CourseModule", back_populates="assessments")
    questions: Mapped[List["Question"]] = relationship(
        "Question", back_populates="assessment", cascade="all, delete-orphan", order_by="Question.order_index"
    )
    attempts: Mapped[List["AssessmentAttempt"]] = relationship(
        "AssessmentAttempt", back_populates="assessment", cascade="all, delete-orphan"
    )


class Question(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Question item within an assessment bank with rubric or automated scoring parameters."""
    __tablename__ = "questions"

    assessment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("assessments.id", ondelete="CASCADE"), index=True, nullable=False
    )
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(
        String(50), default="MCQ_SINGLE", nullable=False
    )  # MCQ_SINGLE, MCQ_MULTIPLE, TRUE_FALSE, DESCRIPTIVE
    marks: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="questions")
    options: Mapped[List["QuestionOption"]] = relationship(
        "QuestionOption", back_populates="question", cascade="all, delete-orphan", order_by="QuestionOption.order_index"
    )
    answers: Mapped[List["AssessmentAnswer"]] = relationship(
        "AssessmentAnswer", back_populates="question", cascade="all, delete-orphan"
    )


class QuestionOption(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Selectable answer choice for MCQ questions."""
    __tablename__ = "question_options"

    question_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    option_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    __table_args__ = (
        UniqueConstraint("question_id", "order_index", name="uq_question_option_order"),
    )

    # Relationships
    question: Mapped["Question"] = relationship("Question", back_populates="options")
    answers: Mapped[List["AssessmentAnswer"]] = relationship(
        "AssessmentAnswer", back_populates="selected_option"
    )


class AssessmentAttempt(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """User examination session capturing start time, scores, and evaluation verdict."""
    __tablename__ = "assessment_attempts"

    assessment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("assessments.id", ondelete="CASCADE"), index=True, nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    attempt_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default="IN_PROGRESS", index=True, nullable=False
    )  # IN_PROGRESS, SUBMITTED, EVALUATED, ABANDONED
    score_obtained: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    percentage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_passed: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("assessment_id", "user_id", "attempt_number", name="uq_user_assessment_attempt"),
    )

    # Relationships
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="attempts")
    user: Mapped["User"] = relationship("User", back_populates="assessment_attempts")
    answers: Mapped[List["AssessmentAnswer"]] = relationship(
        "AssessmentAnswer", back_populates="attempt", cascade="all, delete-orphan"
    )


class AssessmentAnswer(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Recorded response for a specific question within an assessment attempt."""
    __tablename__ = "assessment_answers"

    attempt_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("assessment_attempts.id", ondelete="CASCADE"), index=True, nullable=False
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("questions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    selected_option_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("question_options.id", ondelete="SET NULL"), index=True, nullable=True
    )
    text_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_correct: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    marks_awarded: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    __table_args__ = (
        UniqueConstraint("attempt_id", "question_id", name="uq_attempt_question_answer"),
    )

    # Relationships
    attempt: Mapped["AssessmentAttempt"] = relationship("AssessmentAttempt", back_populates="answers")
    question: Mapped["Question"] = relationship("Question", back_populates="answers")
    selected_option: Mapped[Optional["QuestionOption"]] = relationship("QuestionOption", back_populates="answers")
