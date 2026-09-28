import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.course import (
    ResourceResponse,
    ResourceUpdateRequest,
    ResourcePublishRequest,
    ResourceCompleteRequest,
)
from app.services.resource_service import ResourceService

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.put(
    "/{resource_id}",
    response_model=ResourceResponse,
    summary="Update a learning resource's metadata, visibility or ordering",
)
def update_resource(
    resource_id: uuid.UUID,
    data: ResourceUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ResourceResponse:
    """Updates resource metadata. Verifies trainer course ownership or admin role."""
    return ResourceService.update_resource(
        db=db,
        resource_id=resource_id,
        data=data,
        current_user=current_user,
    )


@router.delete(
    "/{resource_id}",
    summary="Delete a learning resource",
)
def delete_resource(
    resource_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Deletes resource from database. Verifies trainer course ownership or admin role."""
    return ResourceService.delete_resource(
        db=db,
        resource_id=resource_id,
        current_user=current_user,
    )


@router.post(
    "/{resource_id}/publish",
    response_model=ResourceResponse,
    summary="Toggle publication state of a course resource (DRAFT vs PUBLISHED)",
)
def publish_resource(
    resource_id: uuid.UUID,
    data: ResourcePublishRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ResourceResponse:
    """Sets publication status. Verifies trainer course ownership or admin role."""
    return ResourceService.set_published_status(
        db=db,
        resource_id=resource_id,
        data=data,
        current_user=current_user,
    )


@router.post(
    "/{resource_id}/complete",
    summary="Mark learning resource as completed by enrolled trainee",
)
def complete_resource(
    resource_id: uuid.UUID,
    data: ResourceCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Records media playback completion or manual review completion for enrolled trainee."""
    return ResourceService.complete_resource(
        db=db,
        resource_id=resource_id,
        data=data,
        current_user=current_user,
    )
