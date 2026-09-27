import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Integer, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base, UUIDPrimaryKeyMixin, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.course import Course


class Feedback(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Evaluation feedback submitted by trainees for courses, content, and trainer effectiveness."""
    __tablename__ = "feedbacks"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    course_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), index=True, nullable=True
    )
    trainer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )

    course_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    trainer_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    content_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    comments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    suggestions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "course_rating IS NULL OR (course_rating >= 1 AND course_rating <= 5)",
            name="chk_feedback_course_rating_range",
        ),
        CheckConstraint(
            "trainer_rating IS NULL OR (trainer_rating >= 1 AND trainer_rating <= 5)",
            name="chk_feedback_trainer_rating_range",
        ),
        CheckConstraint(
            "content_rating IS NULL OR (content_rating >= 1 AND content_rating <= 5)",
            name="chk_feedback_content_rating_range",
        ),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="feedbacks_given")
    trainer: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[trainer_id], back_populates="feedbacks_received"
    )
    course: Mapped[Optional["Course"]] = relationship("Course", back_populates="feedbacks")
