import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.config import settings
from app.core.security import (
    get_password_hash,
    verify_password,
    hash_token,
    generate_secure_token,
    create_access_token,
)
from app.models.user import User, Role, TraineeProfile, TrainerProfile, AuthSession
from app.schemas.auth import RegisterRequest


def get_or_create_role(db: Session, role_name: str) -> Role:
    """Ensures the specified system role exists in the database."""
    normalized_name = role_name.upper().strip()
    role = db.query(Role).filter_by(name=normalized_name).first()
    if not role:
        role = Role(
            name=normalized_name,
            description=f"System role for {normalized_name}",
            is_system_role=True,
        )
        db.add(role)
        db.flush()
    return role


class AuthService:
    @staticmethod
    def register_user(db: Session, req: RegisterRequest) -> Tuple[User, str]:
        """Registers a new user in the platform with Argon2id password hash."""
        # Check for existing email
        existing_email = db.query(User).filter_by(email=req.email.lower().strip()).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists.",
            )

        # Check for existing username
        existing_username = db.query(User).filter_by(username=req.username.strip()).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this username already exists.",
            )

        # Ensure role exists and is allowed for public registration
        role = get_or_create_role(db, req.role)

        # Determine initial account status
        # If admin approval is required, accounts enter PENDING status
        initial_status = "PENDING" if settings.REQUIRE_ADMIN_APPROVAL else "ACTIVE"

        # Generate email verification token
        raw_verification_token = generate_secure_token(32)
        verification_hash = hash_token(raw_verification_token)
        verification_expires = datetime.now(timezone.utc) + timedelta(
            hours=settings.VERIFICATION_TOKEN_EXPIRE_HOURS
        )

        user = User(
            email=req.email.lower().strip(),
            username=req.username.strip(),
            hashed_password=get_password_hash(req.password),
            first_name=req.first_name.strip(),
            last_name=req.last_name.strip(),
            role_id=role.id,
            organization_id=req.organization_id,
            department_id=req.department_id,
            account_status=initial_status,
            is_active=True,
            is_verified=False,
            verification_token_hash=verification_hash,
            verification_token_expires_at=verification_expires,
        )
        db.add(user)
        db.flush()

        # Initialize corresponding profile shell
        if role.name == "TRAINEE":
            profile = TraineeProfile(user_id=user.id)
            db.add(profile)
        elif role.name == "TRAINER":
            profile = TrainerProfile(user_id=user.id)
            db.add(profile)

        db.commit()
        db.refresh(user)

        # Development notification hook (safe inspection without paid email provider)
        if settings.DEBUG:
            print(f"[AUTH DEV] New user registered: {user.email}. Verification Token: {raw_verification_token}")

        return user, raw_verification_token

    @staticmethod
    def verify_email(db: Session, raw_token: str) -> User:
        """Validates an email verification token and marks account as verified."""
        token_hash = hash_token(raw_token)
        now = datetime.now(timezone.utc)

        user = (
            db.query(User)
            .filter(
                User.verification_token_hash == token_hash,
                User.verification_token_expires_at > now,
            )
            .first()
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification token is invalid or has expired.",
            )

        user.is_verified = True
        user.verification_token_hash = None
        user.verification_token_expires_at = None
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(
        db: Session,
        username_or_email: str,
        password: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Tuple[User, str, str, int]:
        """Authenticates credentials, validates account state, and issues access & refresh tokens."""
        identifier = username_or_email.strip()
        user = (
            db.query(User)
            .filter(
                or_(
                    User.email == identifier.lower(),
                    User.username == identifier,
                )
            )
            .first()
        )

        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username/email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Account status validation
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated.",
            )
        if user.account_status == "PENDING" and settings.REQUIRE_ADMIN_APPROVAL:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is pending administrator approval.",
            )
        if user.account_status == "SUSPENDED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account is suspended. Please contact the administrator.",
            )
        if user.account_status == "REJECTED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account registration was not approved.",
            )

        # Generate refresh session
        raw_refresh_token = generate_secure_token(48)
        refresh_hash = hash_token(raw_refresh_token)
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        session = AuthSession(
            user_id=user.id,
            refresh_token_hash=refresh_hash,
            user_agent=user_agent[:500] if user_agent else None,
            ip_address=ip_address[:45] if ip_address else None,
            expires_at=expires_at,
            last_used_at=now,
        )
        db.add(session)
        db.commit()
        db.refresh(session)

        # Generate access token
        access_token = create_access_token(
            subject=str(user.id),
            role=user.role.name,
            session_id=str(session.id),
        )
        expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

        return user, access_token, raw_refresh_token, expires_in

    @staticmethod
    def refresh_session(
        db: Session,
        raw_refresh_token: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Tuple[User, str, str, int]:
        """Rotates a refresh token session and issues a fresh access token."""
        refresh_hash = hash_token(raw_refresh_token)
        now = datetime.now(timezone.utc)

        session = (
            db.query(AuthSession)
            .filter(
                AuthSession.refresh_token_hash == refresh_hash,
                AuthSession.revoked_at.is_(None),
                AuthSession.expires_at > now,
            )
            .first()
        )
        if not session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token is invalid, expired, or has been revoked.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = session.user
        if not user.is_active or user.account_status != "ACTIVE":
            session.revoked_at = now
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is no longer active.",
            )

        # Refresh token rotation for security
        new_raw_refresh = generate_secure_token(48)
        session.refresh_token_hash = hash_token(new_raw_refresh)
        session.last_used_at = now
        session.expires_at = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        if user_agent:
            session.user_agent = user_agent[:500]
        if ip_address:
            session.ip_address = ip_address[:45]

        db.commit()

        new_access_token = create_access_token(
            subject=str(user.id),
            role=user.role.name,
            session_id=str(session.id),
        )
        expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

        return user, new_access_token, new_raw_refresh, expires_in

    @staticmethod
    def logout(db: Session, raw_refresh_token: str) -> None:
        """Revokes the specific refresh session associated with the provided token."""
        refresh_hash = hash_token(raw_refresh_token)
        session = db.query(AuthSession).filter_by(refresh_token_hash=refresh_hash).first()
        if session and not session.revoked_at:
            session.revoked_at = datetime.now(timezone.utc)
            db.commit()

    @staticmethod
    def logout_all(db: Session, user_id: uuid.UUID) -> int:
        """Revokes all active refresh sessions for the user across all devices."""
        now = datetime.now(timezone.utc)
        count = (
            db.query(AuthSession)
            .filter(AuthSession.user_id == user_id, AuthSession.revoked_at.is_(None))
            .update({AuthSession.revoked_at: now}, synchronize_session=False)
        )
        db.commit()
        return count

    @staticmethod
    def forgot_password(db: Session, email: str) -> Optional[str]:
        """Generates a secure password reset token without revealing account existence."""
        user = db.query(User).filter_by(email=email.lower().strip()).first()
        if not user:
            return None

        raw_reset_token = generate_secure_token(32)
        user.reset_token_hash = hash_token(raw_reset_token)
        user.reset_token_expires_at = datetime.now(timezone.utc) + timedelta(
            hours=settings.RESET_TOKEN_EXPIRE_HOURS
        )
        db.commit()

        if settings.DEBUG:
            print(f"[AUTH DEV] Password reset for {user.email}: Token = {raw_reset_token}")

        return raw_reset_token

    @staticmethod
    def reset_password(db: Session, raw_token: str, new_password: str) -> User:
        """Validates reset token, updates password, and revokes all active sessions."""
        token_hash = hash_token(raw_token)
        now = datetime.now(timezone.utc)

        user = (
            db.query(User)
            .filter(
                User.reset_token_hash == token_hash,
                User.reset_token_expires_at > now,
            )
            .first()
        )
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset token is invalid or has expired.",
            )

        # Update password and clear reset token (single-use)
        user.hashed_password = get_password_hash(new_password)
        user.reset_token_hash = None
        user.reset_token_expires_at = None

        # Revoke all active sessions on password change
        db.query(AuthSession).filter(
            AuthSession.user_id == user.id, AuthSession.revoked_at.is_(None)
        ).update({AuthSession.revoked_at: now}, synchronize_session=False)

        db.commit()
        db.refresh(user)
        return user
