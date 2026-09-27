import uuid
from datetime import date, datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import (
    String,
    Text,
    Boolean,
    Integer,
    Float,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.organization import Organization, Department
    from app.models.course import Course, Enrollment
    from app.models.assessment import AssessmentAttempt
    from app.models.feedback import Feedback
    from app.models.competency import UserCompetency


class Role(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """System role supporting extensible Role-Based Access Control (RBAC)."""
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_system_role: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    users: Mapped[List["User"]] = relationship("User", back_populates="role")


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Core platform user actor (Trainee, Trainer, or Admin)."""
    __tablename__ = "users"

    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("organizations.id", ondelete="SET NULL"), index=True, nullable=True
    )
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("departments.id", ondelete="SET NULL"), index=True, nullable=True
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("roles.id", ondelete="RESTRICT"), index=True, nullable=False
    )

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(25), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    account_status: Mapped[str] = mapped_column(
        String(50), default="PENDING", index=True, nullable=False
    )  # PENDING, ACTIVE, SUSPENDED, REJECTED
    verification_token_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    verification_token_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    reset_token_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reset_token_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    organization: Mapped[Optional["Organization"]] = relationship("Organization", back_populates="users")
    department: Mapped[Optional["Department"]] = relationship("Department", back_populates="users")
    role: Mapped["Role"] = relationship("Role", back_populates="users")

    trainee_profile: Mapped[Optional["TraineeProfile"]] = relationship(
        "TraineeProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    trainer_profile: Mapped[Optional["TrainerProfile"]] = relationship(
        "TrainerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    qualifications: Mapped[List["Qualification"]] = relationship(
        "Qualification", back_populates="user", cascade="all, delete-orphan"
    )
    experiences: Mapped[List["Experience"]] = relationship(
        "Experience", back_populates="user", cascade="all, delete-orphan"
    )
    user_skills: Mapped[List["UserSkill"]] = relationship(
        "UserSkill", back_populates="user", cascade="all, delete-orphan"
    )
    certifications: Mapped[List["Certification"]] = relationship(
        "Certification", back_populates="user", cascade="all, delete-orphan"
    )
    enrollments: Mapped[List["Enrollment"]] = relationship(
        "Enrollment", back_populates="user", cascade="all, delete-orphan"
    )
    authored_courses: Mapped[List["Course"]] = relationship(
        "Course", back_populates="trainer"
    )
    assessment_attempts: Mapped[List["AssessmentAttempt"]] = relationship(
        "AssessmentAttempt", back_populates="user", cascade="all, delete-orphan"
    )
    feedbacks_given: Mapped[List["Feedback"]] = relationship(
        "Feedback", foreign_keys="Feedback.user_id", back_populates="user"
    )
    feedbacks_received: Mapped[List["Feedback"]] = relationship(
        "Feedback", foreign_keys="Feedback.trainer_id", back_populates="trainer"
    )
    user_competencies: Mapped[List["UserCompetency"]] = relationship(
        "UserCompetency", back_populates="user", cascade="all, delete-orphan"
    )
    auth_sessions: Mapped[List["AuthSession"]] = relationship(
        "AuthSession", back_populates="user", cascade="all, delete-orphan"
    )


class TraineeProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Detailed profile representation for trainee personnel."""
    __tablename__ = "trainee_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    employee_id: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)
    designation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    cadre: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    posting_location: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    interests: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    target_competency_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    readiness_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="trainee_profile")


class TrainerProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Profile representation and metrics for trainers/subject matter experts."""
    __tablename__ = "trainer_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    employee_id: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)
    designation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    specialization: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    years_of_experience: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_available_for_training: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    max_active_courses: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    average_rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_ratings_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="trainer_profile")


class Qualification(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Academic and professional credentials possessed by a user."""
    __tablename__ = "qualifications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    degree: Mapped[str] = mapped_column(String(150), nullable=False)
    field_of_study: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    institution: Mapped[str] = mapped_column(String(200), nullable=False)
    year_of_passing: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    grade_or_percentage: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="qualifications")


class Experience(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Work and operational experience history for trainees and trainers."""
    __tablename__ = "experiences"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    organization_name: Mapped[str] = mapped_column(String(200), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="experiences")


class Skill(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Catalog of discrete skills (technical, observational, domain-specific)."""
    __tablename__ = "skills"

    name: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    user_skills: Mapped[List["UserSkill"]] = relationship(
        "UserSkill", back_populates="skill", cascade="all, delete-orphan"
    )


class UserSkill(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Association linking users to cataloged skills with verified proficiencies."""
    __tablename__ = "user_skills"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"), index=True, nullable=False
    )
    proficiency_level: Mapped[str] = mapped_column(
        String(50), default="BEGINNER", nullable=False
    )  # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    years_of_experience: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="user_skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="user_skills")


class Certification(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Accredited credentials and internal/external training certificates."""
    __tablename__ = "certifications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    course_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("courses.id", ondelete="SET NULL"), index=True, nullable=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    issuing_organization: Mapped[str] = mapped_column(String(200), nullable=False)
    credential_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    credential_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    expiry_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    verification_status: Mapped[str] = mapped_column(
        String(50), default="VERIFIED", nullable=False
    )  # PENDING, VERIFIED, REVOKED

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="certifications")
    course: Mapped[Optional["Course"]] = relationship("Course", back_populates="certifications")


class AuthSession(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Tracks refresh token sessions and revocation status for active logins."""
    __tablename__ = "auth_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    refresh_token_hash: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="auth_sessions")

