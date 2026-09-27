"""SQLAlchemy ORM models package for Capacity Connect.

Exports all 29 core domain entities to ensure they are registered with Base.metadata
for Alembic migrations and database operations.
"""

from app.database.base import Base

# Organization & User Management
from app.models.organization import (
    Organization,
    Department,
)
from app.models.user import (
    Role,
    User,
    TraineeProfile,
    TrainerProfile,
    Qualification,
    Experience,
    Skill,
    UserSkill,
    Certification,
    AuthSession,
)

# Course & Learning Management
from app.models.course import (
    CourseCategory,
    Course,
    CourseModule,
    Lesson,
    Resource,
    Enrollment,
    CourseProgress,
)

# Assessment System
from app.models.assessment import (
    Assessment,
    Question,
    QuestionOption,
    AssessmentAttempt,
    AssessmentAnswer,
)

# Feedback
from app.models.feedback import (
    Feedback,
)

# Competency System
from app.models.competency import (
    Competency,
    UserCompetency,
    CourseCompetency,
)

# Subject & Competency Requirements
from app.models.subject import (
    Subject,
    SubjectCompetencyRequirement,
)

__all__ = [
    "Base",
    # Organization & Users (11)
    "Organization",
    "Department",
    "Role",
    "User",
    "TraineeProfile",
    "TrainerProfile",
    "Qualification",
    "Experience",
    "Skill",
    "UserSkill",
    "Certification",
    "AuthSession",
    # Course & Learning Management (7)
    "CourseCategory",
    "Course",
    "CourseModule",
    "Lesson",
    "Resource",
    "Enrollment",
    "CourseProgress",
    # Assessment System (5)
    "Assessment",
    "Question",
    "QuestionOption",
    "AssessmentAttempt",
    "AssessmentAnswer",
    # Feedback (1)
    "Feedback",
    # Competency System (3)
    "Competency",
    "UserCompetency",
    "CourseCompetency",
    # Subject & Recommendation (2)
    "Subject",
    "SubjectCompetencyRequirement",
]
