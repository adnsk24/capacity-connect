import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session, joinedload

from app.models.course import Course, CourseModule, Lesson, Resource, ResourceCompletion, Enrollment
from app.models.user import User
from app.schemas.course import (
    ResourceResponse,
    ResourceCreateRequest,
    ResourceUpdateRequest,
    ResourcePublishRequest,
    ResourceCompleteRequest,
)
from app.services.storage_service import StorageService


class ResourceService:

    @classmethod
    def _verify_course_ownership(cls, db: Session, course_id: uuid.UUID, user: User) -> Course:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

        if user.role.name != "ADMIN" and course.trainer_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to manage resources for this course.",
            )
        return course

    @classmethod
    def _verify_module_and_lesson(
        cls,
        db: Session,
        course_id: uuid.UUID,
        module_id: Optional[uuid.UUID],
        lesson_id: Optional[uuid.UUID],
    ):
        if module_id:
            module = db.query(CourseModule).filter(
                CourseModule.id == module_id,
                CourseModule.course_id == course_id,
            ).first()
            if not module:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Module does not belong to the specified course.",
                )

        if lesson_id:
            lesson_query = db.query(Lesson).join(CourseModule, Lesson.module_id == CourseModule.id).filter(
                Lesson.id == lesson_id,
                CourseModule.course_id == course_id,
            )
            if module_id:
                lesson_query = lesson_query.filter(Lesson.module_id == module_id)
            lesson = lesson_query.first()
            if not lesson:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Lesson does not belong to the specified course/module.",
                )

    @classmethod
    def _to_response(
        cls,
        res: Resource,
        is_completed: bool = False,
    ) -> ResourceResponse:
        return ResourceResponse(
            id=res.id,
            course_id=res.course_id,
            module_id=res.module_id,
            lesson_id=res.lesson_id,
            title=res.title,
            description=res.description,
            resource_type=res.resource_type,
            storage_url=res.storage_url,
            media_url=res.storage_url,
            file_url=res.storage_url,
            thumbnail_url=res.thumbnail_url,
            file_name=res.file_name,
            file_size_bytes=res.file_size_bytes,
            mime_type=res.mime_type,
            duration_seconds=res.duration_seconds,
            display_order=res.display_order,
            is_published=res.is_published,
            is_downloadable=res.is_downloadable,
            is_completed=is_completed,
            created_at=res.created_at,
            updated_at=res.updated_at,
        )

    @classmethod
    def create_resource(
        cls,
        db: Session,
        course_id: uuid.UUID,
        data: ResourceCreateRequest,
        current_user: User,
    ) -> ResourceResponse:
        """Create resource via JSON payload (e.g. external video URL, document link, etc.)."""
        course = cls._verify_course_ownership(db, course_id, current_user)
        cls._verify_module_and_lesson(db, course_id, data.module_id, data.lesson_id)

        target_url = (data.media_url or data.url_or_path or "").strip()
        if not target_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid media_url or url_or_path is required.",
            )

        # Validate URL if external video or link
        if data.resource_type in ("EXTERNAL_VIDEO", "LINK"):
            target_url = StorageService.validate_external_url(target_url)
        elif data.resource_type in ("VIDEO", "AUDIO") and not target_url.startswith("/uploads/"):
            target_url = StorageService.validate_external_url(target_url)

        res = Resource(
            course_id=course.id,
            module_id=data.module_id,
            lesson_id=data.lesson_id,
            title=data.title,
            description=data.description,
            resource_type=data.resource_type,
            storage_url=target_url,
            thumbnail_url=data.thumbnail_url,
            duration_seconds=data.duration_seconds,
            display_order=data.display_order,
            is_published=data.is_published,
            is_downloadable=data.is_downloadable,
            created_by=current_user.id,
        )
        db.add(res)
        db.commit()
        db.refresh(res)
        return cls._to_response(res)

    @classmethod
    async def upload_resource_file(
        cls,
        db: Session,
        course_id: uuid.UUID,
        current_user: User,
        file: UploadFile,
        title: str,
        resource_type: str,
        description: Optional[str] = None,
        module_id: Optional[uuid.UUID] = None,
        lesson_id: Optional[uuid.UUID] = None,
        thumbnail_file: Optional[UploadFile] = None,
        duration_seconds: Optional[int] = None,
        display_order: int = 0,
        is_published: bool = True,
    ) -> ResourceResponse:
        """Upload media file with strict MIME type and size checks."""
        course = cls._verify_course_ownership(db, course_id, current_user)
        cls._verify_module_and_lesson(db, course_id, module_id, lesson_id)

        storage_url, file_name, file_size_bytes, mime_type = await StorageService.save_uploaded_file(
            file, resource_type
        )

        thumbnail_url = None
        if thumbnail_file and thumbnail_file.filename:
            t_url, _, _, _ = await StorageService.save_uploaded_file(thumbnail_file, "THUMBNAIL")
            thumbnail_url = t_url

        res = Resource(
            course_id=course.id,
            module_id=module_id,
            lesson_id=lesson_id,
            title=title,
            description=description,
            resource_type=resource_type.upper(),
            storage_url=storage_url,
            thumbnail_url=thumbnail_url,
            file_name=file_name,
            file_size_bytes=file_size_bytes,
            mime_type=mime_type,
            duration_seconds=duration_seconds,
            display_order=display_order,
            is_published=is_published,
            is_downloadable=True,
            created_by=current_user.id,
        )
        db.add(res)
        db.commit()
        db.refresh(res)
        return cls._to_response(res)

    @classmethod
    def list_course_resources(
        cls,
        db: Session,
        course_id: uuid.UUID,
        current_user: User,
        module_id: Optional[uuid.UUID] = None,
        lesson_id: Optional[uuid.UUID] = None,
    ) -> List[ResourceResponse]:
        """List resources for course, module, or lesson enforcing trainee vs trainer visibility."""
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

        is_manager = current_user.role.name == "ADMIN" or (
            current_user.role.name == "TRAINER" and course.trainer_id == current_user.id
        )

        completed_resource_ids = set()
        if not is_manager:
            # Trainee must be enrolled
            enrollment = db.query(Enrollment).filter(
                Enrollment.course_id == course_id,
                Enrollment.user_id == current_user.id,
            ).first()
            if not enrollment:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You must be enrolled in this course to access its learning resources.",
                )
            # Find completions for trainee
            completions = db.query(ResourceCompletion.resource_id).filter(
                ResourceCompletion.enrollment_id == enrollment.id,
                ResourceCompletion.is_completed == True,
            ).all()
            completed_resource_ids = {c[0] for c in completions}

        query = db.query(Resource).filter(Resource.course_id == course_id)

        if not is_manager:
            # Trainees ONLY see published resources
            query = query.filter(Resource.is_published == True)

        if module_id:
            query = query.filter(Resource.module_id == module_id)
        if lesson_id:
            query = query.filter(Resource.lesson_id == lesson_id)

        resources = query.order_by(Resource.display_order.asc(), Resource.created_at.asc()).all()
        return [
            cls._to_response(r, is_completed=r.id in completed_resource_ids)
            for r in resources
        ]

    @classmethod
    def update_resource(
        cls,
        db: Session,
        resource_id: uuid.UUID,
        data: ResourceUpdateRequest,
        current_user: User,
    ) -> ResourceResponse:
        """Update resource metadata and status."""
        res = db.query(Resource).filter(Resource.id == resource_id).first()
        if not res:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

        cls._verify_course_ownership(db, res.course_id, current_user)
        cls._verify_module_and_lesson(db, res.course_id, data.module_id, data.lesson_id)

        if data.title is not None:
            res.title = data.title
        if data.description is not None:
            res.description = data.description
        if data.resource_type is not None:
            res.resource_type = data.resource_type
        if data.media_url is not None:
            url = data.media_url.strip()
            new_type = data.resource_type or res.resource_type
            if new_type in ("EXTERNAL_VIDEO", "LINK") or not url.startswith("/uploads/"):
                url = StorageService.validate_external_url(url)
            res.storage_url = url
        if data.thumbnail_url is not None:
            res.thumbnail_url = data.thumbnail_url
        if data.module_id is not None:
            res.module_id = data.module_id
        if data.lesson_id is not None:
            res.lesson_id = data.lesson_id
        if data.duration_seconds is not None:
            res.duration_seconds = data.duration_seconds
        if data.display_order is not None:
            res.display_order = data.display_order
        if data.is_published is not None:
            res.is_published = data.is_published
        if data.is_downloadable is not None:
            res.is_downloadable = data.is_downloadable

        db.commit()
        db.refresh(res)
        return cls._to_response(res)

    @classmethod
    def delete_resource(
        cls,
        db: Session,
        resource_id: uuid.UUID,
        current_user: User,
    ):
        """Delete resource by trainer or admin."""
        res = db.query(Resource).filter(Resource.id == resource_id).first()
        if not res:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

        cls._verify_course_ownership(db, res.course_id, current_user)
        db.delete(res)
        db.commit()
        return {"message": "Resource deleted successfully.", "id": str(resource_id)}

    @classmethod
    def set_published_status(
        cls,
        db: Session,
        resource_id: uuid.UUID,
        data: ResourcePublishRequest,
        current_user: User,
    ) -> ResourceResponse:
        """Publish or unpublish resource."""
        res = db.query(Resource).filter(Resource.id == resource_id).first()
        if not res:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

        cls._verify_course_ownership(db, res.course_id, current_user)
        res.is_published = data.is_published
        db.commit()
        db.refresh(res)
        return cls._to_response(res)

    @classmethod
    def complete_resource(
        cls,
        db: Session,
        resource_id: uuid.UUID,
        data: ResourceCompleteRequest,
        current_user: User,
    ) -> dict:
        """Mark resource completed by enrolled trainee."""
        res = db.query(Resource).filter(Resource.id == resource_id).first()
        if not res:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

        enrollment = db.query(Enrollment).filter(
            Enrollment.course_id == res.course_id,
            Enrollment.user_id == current_user.id,
        ).first()
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be enrolled in this course to mark this resource complete.",
            )

        completion = db.query(ResourceCompletion).filter(
            ResourceCompletion.enrollment_id == enrollment.id,
            ResourceCompletion.resource_id == resource_id,
        ).first()

        now = datetime.now(timezone.utc)
        if not completion:
            completion = ResourceCompletion(
                enrollment_id=enrollment.id,
                resource_id=resource_id,
                is_completed=data.is_completed,
                progress_seconds=data.progress_seconds,
                completed_at=now,
            )
            db.add(completion)
        else:
            completion.is_completed = data.is_completed
            if data.progress_seconds is not None:
                completion.progress_seconds = data.progress_seconds
            completion.completed_at = now

        db.commit()
        db.refresh(completion)
        return {
            "message": "Resource marked complete.",
            "resource_id": str(resource_id),
            "is_completed": completion.is_completed,
            "progress_seconds": completion.progress_seconds,
        }
