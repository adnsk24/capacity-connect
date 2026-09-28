import uuid
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import (
    String,
    Text,
    Boolean,
    Integer,
    BigInteger,
    Float,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User, Certification
    from app.models.assessment import Assessment
    from app.models.feedback import Feedback
    from app.models.competency import CourseCompetency
    from app.models.certificate import Certificate


class CourseCategory(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Categorization taxonomy for courses (e.g., Radar Meteorology, Satellite Ops)."""
    __tablename__ = "course_categories"

    name: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("course_categories.id", ondelete="SET NULL"), index=True, nullable=True
    )

    # Relationships
    parent_category: Mapped[Optional["CourseCategory"]] = relationship(
        "CourseCategory", remote_side="CourseCategory.id", back_populates="sub_categories"
    )
    sub_categories: Mapped[List["CourseCategory"]] = relationship(
        "CourseCategory", back_populates="parent_category"
    )
    courses: Mapped[List["Course"]] = relationship("Course", back_populates="category")


class Course(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Core learning course offering with modular curriculum and competency tags."""
    __tablename__ = "courses"

    category_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("course_categories.id", ondelete="RESTRICT"), index=True, nullable=False
    )
    trainer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )

    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    objectives: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    prerequisites: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="DRAFT", index=True, nullable=False
    )  # DRAFT, PUBLISHED, ARCHIVED
    difficulty_level: Mapped[str] = mapped_column(
        String(50), default="BEGINNER", nullable=False
    )  # BEGINNER, INTERMEDIATE, ADVANCED
    duration_hours: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    category: Mapped["CourseCategory"] = relationship("CourseCategory", back_populates="courses")
    trainer: Mapped[Optional["User"]] = relationship("User", back_populates="authored_courses")
    modules: Mapped[List["CourseModule"]] = relationship(
        "CourseModule", back_populates="course", cascade="all, delete-orphan", order_by="CourseModule.order_index"
    )
    resources: Mapped[List["Resource"]] = relationship(
        "Resource", back_populates="course", cascade="all, delete-orphan"
    )
    enrollments: Mapped[List["Enrollment"]] = relationship(
        "Enrollment", back_populates="course", cascade="all, delete-orphan"
    )
    assessments: Mapped[List["Assessment"]] = relationship(
        "Assessment", back_populates="course", cascade="all, delete-orphan"
    )
    certifications: Mapped[List["Certification"]] = relationship(
        "Certification", back_populates="course"
    )
    issued_certificates: Mapped[List["Certificate"]] = relationship(
        "Certificate", back_populates="course", cascade="all, delete-orphan"
    )
    feedbacks: Mapped[List["Feedback"]] = relationship(
        "Feedback", back_populates="course", cascade="all, delete-orphan"
    )
    course_competencies: Mapped[List["CourseCompetency"]] = relationship(
        "CourseCompetency", back_populates="course", cascade="all, delete-orphan"
    )


class CourseModule(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Top-level thematic section or unit within a course syllabus."""
    __tablename__ = "course_modules"

    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    __table_args__ = (
        UniqueConstraint("course_id", "order_index", name="uq_course_module_order"),
    )

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="modules")
    lessons: Mapped[List["Lesson"]] = relationship(
        "Lesson", back_populates="module", cascade="all, delete-orphan", order_by="Lesson.order_index"
    )
    resources: Mapped[List["Resource"]] = relationship(
        "Resource", back_populates="module"
    )
    assessments: Mapped[List["Assessment"]] = relationship(
        "Assessment", back_populates="module"
    )


class Lesson(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Individual instructional lesson containing learning media or narrative."""
    __tablename__ = "lessons"

    module_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("course_modules.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content_type: Mapped[str] = mapped_column(
        String(50), default="TEXT", nullable=False
    )  # TEXT, VIDEO, DOCUMENT, INTERACTIVE
    content_body: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    __table_args__ = (
        UniqueConstraint("module_id", "order_index", name="uq_module_lesson_order"),
    )

    # Relationships
    module: Mapped["CourseModule"] = relationship("CourseModule", back_populates="lessons")
    resources: Mapped[List["Resource"]] = relationship("Resource", back_populates="lesson")


class Resource(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Learning asset metadata (lecture slides, manuals, datasets, media) stored in cloud/Supabase."""
    __tablename__ = "resources"

    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False
    )
    module_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("course_modules.id", ondelete="SET NULL"), index=True, nullable=True
    )
    lesson_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("lessons.id", ondelete="SET NULL"), index=True, nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resource_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # VIDEO, AUDIO, DOCUMENT, PRESENTATION, EXTERNAL_VIDEO, PDF, PPT, LINK, OTHER
    storage_url: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    file_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_downloadable: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    @property
    def media_url(self) -> str:
        return self.storage_url

    @media_url.setter
    def media_url(self, value: str):
        self.storage_url = value

    @property
    def file_url(self) -> str:
        return self.storage_url

    @file_url.setter
    def file_url(self, value: str):
        self.storage_url = value

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="resources")
    module: Mapped[Optional["CourseModule"]] = relationship("CourseModule", back_populates="resources")
    lesson: Mapped[Optional["Lesson"]] = relationship("Lesson", back_populates="resources")
    creator: Mapped[Optional["User"]] = relationship("User")
    completions: Mapped[List["ResourceCompletion"]] = relationship(
        "ResourceCompletion", back_populates="resource", cascade="all, delete-orphan"
    )


class ResourceCompletion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Tracks completed resources (videos, audios, documents) per trainee enrollment."""
    __tablename__ = "resource_completions"

    enrollment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("enrollments.id", ondelete="CASCADE"), index=True, nullable=False
    )
    resource_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resources.id", ondelete="CASCADE"), index=True, nullable=False
    )
    is_completed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    progress_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("enrollment_id", "resource_id", name="uq_enrollment_resource_completion"),
    )

    # Relationships
    enrollment: Mapped["Enrollment"] = relationship("Enrollment", back_populates="resource_completions")
    resource: Mapped["Resource"] = relationship("Resource", back_populates="completions")


class Enrollment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Enrollment mapping connecting trainee users to cohort or self-paced courses."""
    __tablename__ = "enrollments"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(50), default="ENROLLED", index=True, nullable=False
    )  # ENROLLED, IN_PROGRESS, COMPLETED, DROPPED
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    final_grade: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_user_course_enrollment"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="enrollments")
    course: Mapped["Course"] = relationship("Course", back_populates="enrollments")
    progress: Mapped[Optional["CourseProgress"]] = relationship(
        "CourseProgress", back_populates="enrollment", uselist=False, cascade="all, delete-orphan"
    )
    lesson_completions: Mapped[List["LessonCompletion"]] = relationship(
        "LessonCompletion", back_populates="enrollment", cascade="all, delete-orphan"
    )
    resource_completions: Mapped[List["ResourceCompletion"]] = relationship(
        "ResourceCompletion", back_populates="enrollment", cascade="all, delete-orphan"
    )


class CourseProgress(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Granular course progression metrics, completion tracking, and telemetry."""
    __tablename__ = "course_progress"

    enrollment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("enrollments.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    completion_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completed_lessons_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_lessons_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_accessed_lesson_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True
    )
    last_accessed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    enrollment: Mapped["Enrollment"] = relationship("Enrollment", back_populates="progress")
    last_accessed_lesson: Mapped[Optional["Lesson"]] = relationship("Lesson")


class LessonCompletion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Tracks completed individual lessons for each course enrollment."""
    __tablename__ = "lesson_completions"

    enrollment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("enrollments.id", ondelete="CASCADE"), index=True, nullable=False
    )
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"), index=True, nullable=False
    )
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("enrollment_id", "lesson_id", name="uq_enrollment_lesson_completion"),
    )

    # Relationships
    enrollment: Mapped["Enrollment"] = relationship("Enrollment", back_populates="lesson_completions")
    lesson: Mapped["Lesson"] = relationship("Lesson")

