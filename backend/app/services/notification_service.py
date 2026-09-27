import uuid
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse, NotificationListResponse


class NotificationService:
    @staticmethod
    def list_notifications(db: Session, user: User, limit: int = 50) -> NotificationListResponse:
        """Fetch chronological notifications for authenticated user."""
        notifications = (
            db.query(Notification)
            .filter(Notification.user_id == user.id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
            .all()
        )
        unread_count = (
            db.query(Notification)
            .filter(Notification.user_id == user.id, Notification.is_read == False)
            .count()
        )

        items = [
            NotificationResponse(
                id=n.id,
                title=n.title,
                message=n.message,
                notification_type=n.notification_type,
                link_url=n.link_url,
                is_read=n.is_read,
                created_at=n.created_at,
            )
            for n in notifications
        ]

        return NotificationListResponse(unread_count=unread_count, items=items)

    @staticmethod
    def mark_as_read(db: Session, notification_id: uuid.UUID, user: User) -> NotificationResponse:
        """Mark single notification as read."""
        notification = (
            db.query(Notification)
            .filter(Notification.id == notification_id, Notification.user_id == user.id)
            .first()
        )
        if not notification:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

        notification.is_read = True
        db.commit()
        db.refresh(notification)

        return NotificationResponse(
            id=notification.id,
            title=notification.title,
            message=notification.message,
            notification_type=notification.notification_type,
            link_url=notification.link_url,
            is_read=notification.is_read,
            created_at=notification.created_at,
        )

    @staticmethod
    def mark_all_as_read(db: Session, user: User):
        """Mark all notifications for user as read."""
        db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.is_read == False,
        ).update({Notification.is_read: True}, synchronize_session=False)
        db.commit()
        return {"message": "All notifications marked as read."}
