import uuid
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import require_role
from app.models.user import User, AuthSession
from app.schemas.user import UserProfileResponse, AdminUserActionRequest
from app.schemas.auth import MessageResponse

router = APIRouter(prefix="/admin", tags=["Administration"])


@router.get(
    "/users/pending",
    response_model=List[UserProfileResponse],
    summary="List Pending User Registrations (Admin Only)",
)
def list_pending_users(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
) -> List[UserProfileResponse]:
    """Retrieves all user registrations currently awaiting administrative approval."""
    users = (
        db.query(User)
        .filter(User.account_status == "PENDING")
        .order_by(User.created_at.asc())
        .all()
    )
    return [
        UserProfileResponse(
            id=u.id,
            email=u.email,
            username=u.username,
            first_name=u.first_name,
            last_name=u.last_name,
            phone_number=u.phone_number,
            avatar_url=u.avatar_url,
            role=u.role.name,
            account_status=u.account_status,
            is_active=u.is_active,
            is_verified=u.is_verified,
            organization_id=u.organization_id,
            department_id=u.department_id,
            created_at=u.created_at,
            updated_at=u.updated_at,
        )
        for u in users
    ]


@router.post(
    "/users/{user_id}/approve",
    response_model=UserProfileResponse,
    summary="Approve Pending User Account (Admin Only)",
)
def approve_user(
    user_id: uuid.UUID,
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """Activates a pending user account."""
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    user.account_status = "ACTIVE"
    user.is_active = True
    db.commit()
    db.refresh(user)

    return UserProfileResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        avatar_url=user.avatar_url,
        role=user.role.name,
        account_status=user.account_status,
        is_active=user.is_active,
        is_verified=user.is_verified,
        organization_id=user.organization_id,
        department_id=user.department_id,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.post(
    "/users/{user_id}/reject",
    response_model=UserProfileResponse,
    summary="Reject User Registration (Admin Only)",
)
def reject_user(
    user_id: uuid.UUID,
    action: AdminUserActionRequest = None,
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """Rejects a pending user registration."""
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    user.account_status = "REJECTED"
    user.is_active = False
    db.commit()
    db.refresh(user)

    return UserProfileResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        avatar_url=user.avatar_url,
        role=user.role.name,
        account_status=user.account_status,
        is_active=user.is_active,
        is_verified=user.is_verified,
        organization_id=user.organization_id,
        department_id=user.department_id,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.post(
    "/users/{user_id}/suspend",
    response_model=UserProfileResponse,
    summary="Suspend User Account (Admin Only)",
)
def suspend_user(
    user_id: uuid.UUID,
    action: AdminUserActionRequest = None,
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """Suspends an active user account and immediately invalidates all active sessions."""
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    user.account_status = "SUSPENDED"
    user.is_active = False

    # Revoke all active login sessions immediately
    now = datetime.now(timezone.utc)
    db.query(AuthSession).filter(
        AuthSession.user_id == user.id, AuthSession.revoked_at.is_(None)
    ).update({AuthSession.revoked_at: now}, synchronize_session=False)

    db.commit()
    db.refresh(user)

    return UserProfileResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        avatar_url=user.avatar_url,
        role=user.role.name,
        account_status=user.account_status,
        is_active=user.is_active,
        is_verified=user.is_verified,
        organization_id=user.organization_id,
        department_id=user.department_id,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.post(
    "/users/{user_id}/activate",
    response_model=UserProfileResponse,
    summary="Activate Suspended User Account (Admin Only)",
)
def activate_user(
    user_id: uuid.UUID,
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """Restores a suspended or inactive account back to ACTIVE status."""
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    user.account_status = "ACTIVE"
    user.is_active = True
    db.commit()
    db.refresh(user)

    return UserProfileResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        avatar_url=user.avatar_url,
        role=user.role.name,
        account_status=user.account_status,
        is_active=user.is_active,
        is_verified=user.is_verified,
        organization_id=user.organization_id,
        department_id=user.department_id,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )
