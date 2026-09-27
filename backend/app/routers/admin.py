import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import require_role
from app.models.user import User, AuthSession
from app.schemas.user import UserProfileResponse, AdminUserActionRequest
from app.schemas.admin import (
    AdminDashboardStats,
    AdminUserUpdateStatus,
    AdminUserUpdateRole,
    AdminCourseItem,
    AdminAssessmentItem,
)
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Administration & Governance"])


@router.get(
    "/dashboard",
    response_model=AdminDashboardStats,
    summary="Get platform operational telemetry and governance metrics (Admin Only)",
)
def get_admin_dashboard(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
) -> AdminDashboardStats:
    return AdminService.get_dashboard_stats(db)


@router.get(
    "/analytics",
    response_model=AdminDashboardStats,
    summary="Get institutional analytics (Admin Only)",
)
def get_admin_analytics(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
) -> AdminDashboardStats:
    return AdminService.get_dashboard_stats(db)


@router.get(
    "/users",
    response_model=List[UserProfileResponse],
    summary="List and filter users across the platform (Admin Only)",
)
def list_users(
    role: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
) -> List[UserProfileResponse]:
    return AdminService.list_users(
        db, role_filter=role, status_filter=status, search=search, page=page, page_size=page_size
    )


@router.patch(
    "/users/{user_id}/status",
    response_model=UserProfileResponse,
    summary="Update user status with self-protection guard (Admin Only)",
)
def update_user_status(
    user_id: uuid.UUID,
    data: AdminUserUpdateStatus,
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    return AdminService.update_user_status(db, user_id, data.status, admin)


@router.patch(
    "/users/{user_id}/role",
    response_model=UserProfileResponse,
    summary="Update user role with self-demotion guard (Admin Only)",
)
def update_user_role(
    user_id: uuid.UUID,
    data: AdminUserUpdateRole,
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    return AdminService.update_user_role(db, user_id, data.role, admin)


@router.get(
    "/courses",
    response_model=List[AdminCourseItem],
    summary="List all courses across the institution (Admin Only)",
)
def list_courses(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
) -> List[AdminCourseItem]:
    return AdminService.list_courses(db)


@router.patch(
    "/courses/{course_id}/status",
    response_model=AdminCourseItem,
    summary="Publish, unpublish, or archive a course (Admin Only)",
)
def update_course_status(
    course_id: uuid.UUID,
    status_payload: AdminUserUpdateStatus,
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
) -> AdminCourseItem:
    return AdminService.update_course_status(db, course_id, status_payload.status)


@router.get(
    "/assessments",
    response_model=List[AdminAssessmentItem],
    summary="List all assessments across the institution (Admin Only)",
)
def list_assessments(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
) -> List[AdminAssessmentItem]:
    return AdminService.list_assessments(db)


# Existing routes for backward compatibility with Phase 2/3 tests
@router.get(
    "/users/pending",
    response_model=List[UserProfileResponse],
    summary="List Pending User Registrations (Admin Only)",
)
def list_pending_users(
    admin: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
) -> List[UserProfileResponse]:
    return AdminService.list_users(db, status_filter="PENDING")


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
    return AdminService.update_user_status(db, user_id, "ACTIVE", admin)


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
    return AdminService.update_user_status(db, user_id, "REJECTED", admin)


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
    return AdminService.update_user_status(db, user_id, "SUSPENDED", admin)


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
    return AdminService.update_user_status(db, user_id, "ACTIVE", admin)
