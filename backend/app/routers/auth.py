from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.auth import AuthService
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    VerifyEmailRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserSummaryResponse,
    MessageResponse,
)
from app.schemas.user import UserProfileResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserSummaryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New Account",
)
def register(
    req: RegisterRequest,
    db: Session = Depends(get_db),
) -> UserSummaryResponse:
    """Registers a new user (Trainee or Trainer) with Argon2id password hashing."""
    user, _ = AuthService.register_user(db, req)
    return UserSummaryResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role.name,
        account_status=user.account_status,
        is_active=user.is_active,
        is_verified=user.is_verified,
    )


@router.post(
    "/verify-email",
    response_model=MessageResponse,
    summary="Verify Email Address",
)
def verify_email(
    req: VerifyEmailRequest,
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Validates single-use email verification token."""
    AuthService.verify_email(db, req.token)
    return MessageResponse(
        message="Email successfully verified.",
        detail="Your email has been verified. Once your account status is ACTIVE, you can log in.",
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate & Obtain Access/Refresh Tokens",
)
def login(
    req: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Authenticates credentials and establishes a secure refresh session."""
    user_agent = request.headers.get("user-agent")
    client_ip = request.client.host if request.client else None

    user, access_token, refresh_token, expires_in = AuthService.authenticate_user(
        db,
        username_or_email=req.username_or_email,
        password=req.password,
        user_agent=user_agent,
        ip_address=client_ip,
    )

    user_summary = UserSummaryResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role.name,
        account_status=user.account_status,
        is_active=user.is_active,
        is_verified=user.is_verified,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in,
        user=user_summary,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Rotate Refresh Token & Issue New Access Token",
)
def refresh_token(
    req: RefreshTokenRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Refreshes an active session, rotating the refresh token."""
    user_agent = request.headers.get("user-agent")
    client_ip = request.client.host if request.client else None

    user, access_token, new_refresh, expires_in = AuthService.refresh_session(
        db,
        raw_refresh_token=req.refresh_token,
        user_agent=user_agent,
        ip_address=client_ip,
    )

    user_summary = UserSummaryResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role.name,
        account_status=user.account_status,
        is_active=user.is_active,
        is_verified=user.is_verified,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        token_type="bearer",
        expires_in=expires_in,
        user=user_summary,
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Revoke Current Refresh Session",
)
def logout(
    req: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Invalidates the provided refresh session on the server."""
    AuthService.logout(db, req.refresh_token)
    return MessageResponse(message="Successfully logged out.")


@router.post(
    "/logout-all",
    response_model=MessageResponse,
    summary="Revoke All Sessions for Authenticated User",
)
def logout_all(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Revokes all active sessions across all devices for the current user."""
    count = AuthService.logout_all(db, current_user.id)
    return MessageResponse(
        message=f"Successfully revoked {count} active session(s).",
    )


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get Authenticated User Profile",
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserProfileResponse:
    """Returns the authenticated user's profile without exposing secret fields."""
    return UserProfileResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        phone_number=current_user.phone_number,
        avatar_url=current_user.avatar_url,
        role=current_user.role.name,
        account_status=current_user.account_status,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        organization_id=current_user.organization_id,
        department_id=current_user.department_id,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request Password Reset Link",
)
def forgot_password(
    req: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Generates a secure password reset token without revealing if the account exists."""
    AuthService.forgot_password(db, req.email)
    return MessageResponse(
        message="If an account with that email address exists, password reset instructions have been generated.",
    )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset Password with Valid Token",
)
def reset_password(
    req: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Validates single-use reset token and updates password."""
    AuthService.reset_password(db, req.token, req.new_password)
    return MessageResponse(
        message="Password has been successfully updated. All previous sessions have been revoked.",
    )
