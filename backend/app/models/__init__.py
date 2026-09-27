"""SQLAlchemy ORM models package for Capacity Connect.

Domain models (User, Role, Profile, Course, Assessment, Competency, etc.)
will be implemented in Phase 1 and registered here for Alembic migrations.
"""

from app.database.base import Base

__all__ = ["Base"]
