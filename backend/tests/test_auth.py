import uuid
from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.session import SessionLocal
from app.models.user import User, Role, AuthSession
from app.core.security import get_password_hash, create_access_token, hash_token
from app.services.auth import get_or_create_role

client = TestClient(app)


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_registration_succeeds_with_valid_data():
    """1. Registration succeeds with valid data."""
    unique_id = uuid.uuid4().hex[:6]
    payload = {
        "email": f"trainee_{unique_id}@example.com",
        "username": f"trainee_{unique_id}",
        "password": "SecurePassword123!",
        "password_confirm": "SecurePassword123!",
        "first_name": "Test",
        "last_name": "Trainee",
        "role": "TRAINEE",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["role"] == "TRAINEE"
    assert data["account_status"] == "PENDING"
    assert data["is_verified"] is False


def test_registration_rejects_invalid_email():
    """2. Registration rejects invalid email format."""
    payload = {
        "email": "not-an-email",
        "username": "invalid_email_user",
        "password": "SecurePassword123!",
        "password_confirm": "SecurePassword123!",
        "first_name": "Invalid",
        "last_name": "Email",
        "role": "TRAINEE",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_registration_rejects_weak_password():
    """3. Registration rejects weak password (< 8 chars)."""
    payload = {
        "email": "weak_pw@example.com",
        "username": "weak_pw_user",
        "password": "123",
        "password_confirm": "123",
        "first_name": "Weak",
        "last_name": "Password",
        "role": "TRAINEE",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_registration_rejects_password_mismatch():
    """4. Registration rejects mismatched password confirmation."""
    payload = {
        "email": "mismatch@example.com",
        "username": "mismatch_user",
        "password": "SecurePassword123!",
        "password_confirm": "DifferentPassword456!",
        "first_name": "Mismatch",
        "last_name": "User",
        "role": "TRAINEE",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_duplicate_email_rejected_safely():
    """5. Duplicate email is rejected safely."""
    unique_id = uuid.uuid4().hex[:6]
    payload = {
        "email": f"duplicate_{unique_id}@example.com",
        "username": f"dup1_{unique_id}",
        "password": "SecurePassword123!",
        "password_confirm": "SecurePassword123!",
        "first_name": "First",
        "last_name": "User",
        "role": "TRAINEE",
    }
    r1 = client.post("/api/v1/auth/register", json=payload)
    assert r1.status_code == 201

    payload["username"] = f"dup2_{unique_id}"
    r2 = client.post("/api/v1/auth/register", json=payload)
    assert r2.status_code == 400
    assert "already exists" in r2.json()["detail"].lower()


def test_public_user_cannot_register_as_admin():
    """6. Public user cannot register as ADMIN."""
    payload = {
        "email": "hacker_admin@example.com",
        "username": "hacker_admin",
        "password": "SecurePassword123!",
        "password_confirm": "SecurePassword123!",
        "first_name": "Hacker",
        "last_name": "Admin",
        "role": "ADMIN",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_password_stored_as_argon2id_hash(db_session):
    """7. Password is stored as Argon2id hash."""
    unique_id = uuid.uuid4().hex[:6]
    email = f"argon_check_{unique_id}@example.com"
    payload = {
        "email": email,
        "username": f"argon_{unique_id}",
        "password": "SecurePassword123!",
        "password_confirm": "SecurePassword123!",
        "first_name": "Argon",
        "last_name": "User",
        "role": "TRAINEE",
    }
    client.post("/api/v1/auth/register", json=payload)
    user = db_session.query(User).filter_by(email=email).first()
    assert user is not None
    assert user.hashed_password.startswith("$argon2id$")
    assert "SecurePassword123!" not in user.hashed_password


def test_login_succeeds_with_correct_credentials(db_session):
    """8. Login succeeds with correct credentials for active user."""
    unique_id = uuid.uuid4().hex[:6]
    email = f"active_{unique_id}@example.com"
    role = get_or_create_role(db_session, "TRAINEE")
    user = User(
        email=email,
        username=f"active_{unique_id}",
        hashed_password=get_password_hash("MySecretPassword!"),
        first_name="Active",
        last_name="User",
        role_id=role.id,
        account_status="ACTIVE",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={"username_or_email": email, "password": "MySecretPassword!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == email


def test_login_fails_with_incorrect_credentials():
    """9. Login fails with incorrect credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username_or_email": "nonexistent@example.com", "password": "WrongPassword!"},
    )
    assert response.status_code == 401


def test_pending_user_cannot_access_protected_route(db_session):
    """10. Pending user cannot log in while awaiting approval."""
    unique_id = uuid.uuid4().hex[:6]
    email = f"pending_{unique_id}@example.com"
    role = get_or_create_role(db_session, "TRAINEE")
    user = User(
        email=email,
        username=f"pending_{unique_id}",
        hashed_password=get_password_hash("ValidPassword123!"),
        first_name="Pending",
        last_name="User",
        role_id=role.id,
        account_status="PENDING",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={"username_or_email": email, "password": "ValidPassword123!"},
    )
    assert response.status_code == 403
    assert "pending administrator approval" in response.json()["detail"].lower()


def test_suspended_user_cannot_authenticate(db_session):
    """11. Suspended users cannot authenticate."""
    unique_id = uuid.uuid4().hex[:6]
    email = f"suspended_{unique_id}@example.com"
    role = get_or_create_role(db_session, "TRAINEE")
    user = User(
        email=email,
        username=f"suspended_{unique_id}",
        hashed_password=get_password_hash("ValidPassword123!"),
        first_name="Suspended",
        last_name="User",
        role_id=role.id,
        account_status="SUSPENDED",
        is_active=False,
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={"username_or_email": email, "password": "ValidPassword123!"},
    )
    assert response.status_code == 403
    assert "deactivated" in response.json()["detail"].lower() or "suspended" in response.json()["detail"].lower()


def test_access_token_works(db_session):
    """12. Access token works on protected endpoints."""
    unique_id = uuid.uuid4().hex[:6]
    role = get_or_create_role(db_session, "TRAINEE")
    user = User(
        email=f"tok_{unique_id}@example.com",
        username=f"tok_{unique_id}",
        hashed_password=get_password_hash("Password123!"),
        first_name="Token",
        last_name="User",
        role_id=role.id,
        account_status="ACTIVE",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    token = create_access_token(subject=str(user.id), role="TRAINEE")
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == user.email


def test_invalid_token_is_rejected():
    """13. Invalid access token is rejected."""
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.token.value"})
    assert response.status_code == 401


def test_expired_token_is_rejected(db_session):
    """14. Expired token is rejected."""
    token = create_access_token(
        subject=str(uuid.uuid4()),
        role="TRAINEE",
        expires_delta=timedelta(seconds=-10),  # expired 10 seconds ago
    )
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401


def test_get_me_requires_authentication():
    """15. GET /auth/me requires authentication."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_get_me_returns_correct_user(db_session):
    """16. GET /auth/me returns the authenticated user's profile."""
    unique_id = uuid.uuid4().hex[:6]
    role = get_or_create_role(db_session, "TRAINEE")
    user = User(
        email=f"me_{unique_id}@example.com",
        username=f"me_{unique_id}",
        first_name="Jane",
        last_name="Doe",
        role_id=role.id,
        account_status="ACTIVE",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    token = create_access_token(subject=str(user.id), role="TRAINEE")
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Jane"
    assert data["last_name"] == "Doe"
    assert "hashed_password" not in data


def test_trainee_cannot_access_admin_endpoint(db_session):
    """17. TRAINEE cannot access ADMIN endpoint."""
    unique_id = uuid.uuid4().hex[:6]
    role = get_or_create_role(db_session, "TRAINEE")
    user = User(
        email=f"trainee_guard_{unique_id}@example.com",
        username=f"tguard_{unique_id}",
        first_name="Trainee",
        last_name="Guard",
        role_id=role.id,
        account_status="ACTIVE",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    token = create_access_token(subject=str(user.id), role="TRAINEE")
    response = client.get("/api/v1/admin/users/pending", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_trainer_cannot_access_admin_endpoint(db_session):
    """18. TRAINER cannot access ADMIN endpoint."""
    unique_id = uuid.uuid4().hex[:6]
    role = get_or_create_role(db_session, "TRAINER")
    user = User(
        email=f"trainer_guard_{unique_id}@example.com",
        username=f"trainer_guard_{unique_id}",
        first_name="Trainer",
        last_name="Guard",
        role_id=role.id,
        account_status="ACTIVE",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    token = create_access_token(subject=str(user.id), role="TRAINER")
    response = client.get("/api/v1/admin/users/pending", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403


def test_admin_can_access_admin_endpoint(db_session):
    """19. ADMIN can access ADMIN endpoint."""
    unique_id = uuid.uuid4().hex[:6]
    role = get_or_create_role(db_session, "ADMIN")
    user = User(
        email=f"admin_{unique_id}@example.com",
        username=f"admin_{unique_id}",
        first_name="Admin",
        last_name="Master",
        role_id=role.id,
        account_status="ACTIVE",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    token = create_access_token(subject=str(user.id), role="ADMIN")
    response = client.get("/api/v1/admin/users/pending", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_logout_revokes_session(db_session):
    """20. Logout revokes the active session."""
    unique_id = uuid.uuid4().hex[:6]
    email = f"logout_{unique_id}@example.com"
    role = get_or_create_role(db_session, "TRAINEE")
    user = User(
        email=email,
        username=f"logout_{unique_id}",
        hashed_password=get_password_hash("Password123!"),
        first_name="Logout",
        last_name="User",
        role_id=role.id,
        account_status="ACTIVE",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    login_res = client.post(
        "/api/v1/auth/login",
        json={"username_or_email": email, "password": "Password123!"},
    )
    refresh_token = login_res.json()["refresh_token"]

    # Logout
    logout_res = client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token})
    assert logout_res.status_code == 200


def test_revoked_refresh_token_cannot_be_reused(db_session):
    """21. Revoked refresh token cannot be reused to refresh access token."""
    unique_id = uuid.uuid4().hex[:6]
    email = f"reuse_{unique_id}@example.com"
    role = get_or_create_role(db_session, "TRAINEE")
    user = User(
        email=email,
        username=f"reuse_{unique_id}",
        hashed_password=get_password_hash("Password123!"),
        first_name="Reuse",
        last_name="User",
        role_id=role.id,
        account_status="ACTIVE",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    login_res = client.post(
        "/api/v1/auth/login",
        json={"username_or_email": email, "password": "Password123!"},
    )
    refresh_token = login_res.json()["refresh_token"]

    # Logout to revoke
    client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token})

    # Attempt to refresh with revoked token
    refresh_res = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_res.status_code == 401


def test_forgot_password_does_not_reveal_existence():
    """22. Forgot password returns safe message regardless of email existence."""
    r1 = client.post("/api/v1/auth/forgot-password", json={"email": "nonexistent_email_12345@example.com"})
    assert r1.status_code == 200
    assert "if an account" in r1.json()["message"].lower()


def test_reset_token_expires(db_session):
    """23. Expired reset token is rejected."""
    unique_id = uuid.uuid4().hex[:6]
    email = f"expire_reset_{unique_id}@example.com"
    role = get_or_create_role(db_session, "TRAINEE")
    user = User(
        email=email,
        username=f"exp_{unique_id}",
        hashed_password=get_password_hash("OldPassword123!"),
        first_name="Expire",
        last_name="User",
        role_id=role.id,
        account_status="ACTIVE",
        is_active=True,
        reset_token_hash=hash_token("expired_token_123"),
        reset_token_expires_at=datetime.now(timezone.utc) - timedelta(hours=1),
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": "expired_token_123",
            "new_password": "BrandNewPassword123!",
            "new_password_confirm": "BrandNewPassword123!",
        },
    )
    assert response.status_code == 400


def test_reset_token_single_use_and_password_changed(db_session):
    """24 & 25. Reset token is single-use and changes password."""
    unique_id = uuid.uuid4().hex[:6]
    email = f"single_reset_{unique_id}@example.com"
    role = get_or_create_role(db_session, "TRAINEE")
    raw_token = f"valid_token_{unique_id}"
    user = User(
        email=email,
        username=f"sreset_{unique_id}",
        hashed_password=get_password_hash("OldPassword123!"),
        first_name="Single",
        last_name="Reset",
        role_id=role.id,
        account_status="ACTIVE",
        is_active=True,
        reset_token_hash=hash_token(raw_token),
        reset_token_expires_at=datetime.now(timezone.utc) + timedelta(hours=2),
    )
    db_session.add(user)
    db_session.commit()

    # First reset -> success
    r1 = client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": raw_token,
            "new_password": "NewUpdatedPassword123!",
            "new_password_confirm": "NewUpdatedPassword123!",
        },
    )
    assert r1.status_code == 200

    # Second reset with same token -> fails (single use)
    r2 = client.post(
        "/api/v1/auth/reset-password",
        json={
            "token": raw_token,
            "new_password": "AnotherPassword456!",
            "new_password_confirm": "AnotherPassword456!",
        },
    )
    assert r2.status_code == 400

    # Verify user can log in with new password
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username_or_email": email, "password": "NewUpdatedPassword123!"},
    )
    assert login_res.status_code == 200


def test_admin_approval_and_suspension_workflow(db_session):
    """26, 27 & 28. Admin can approve, suspend, and reactivate users."""
    unique_id = uuid.uuid4().hex[:6]
    admin_role = get_or_create_role(db_session, "ADMIN")
    trainee_role = get_or_create_role(db_session, "TRAINEE")

    admin = User(
        email=f"admin_approver_{unique_id}@example.com",
        username=f"approver_{unique_id}",
        first_name="Admin",
        last_name="Approver",
        role_id=admin_role.id,
        account_status="ACTIVE",
        is_active=True,
    )
    applicant = User(
        email=f"applicant_{unique_id}@example.com",
        username=f"applicant_{unique_id}",
        hashed_password=get_password_hash("AppPassword123!"),
        first_name="Applicant",
        last_name="User",
        role_id=trainee_role.id,
        account_status="PENDING",
        is_active=True,
    )
    db_session.add_all([admin, applicant])
    db_session.commit()

    admin_token = create_access_token(subject=str(admin.id), role="ADMIN")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 26. Admin approves applicant
    approve_res = client.post(f"/api/v1/admin/users/{applicant.id}/approve", headers=headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["account_status"] == "ACTIVE"

    # 27. Admin suspends applicant
    suspend_res = client.post(f"/api/v1/admin/users/{applicant.id}/suspend", headers=headers)
    assert suspend_res.status_code == 200
    assert suspend_res.json()["account_status"] == "SUSPENDED"

    # 28. Admin activates applicant
    activate_res = client.post(f"/api/v1/admin/users/{applicant.id}/activate", headers=headers)
    assert activate_res.status_code == 200
    assert activate_res.json()["account_status"] == "ACTIVE"
