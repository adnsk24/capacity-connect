import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, model_validator, ConfigDict


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    password: str = Field(min_length=8, max_length=128)
    password_confirm: str = Field(min_length=8, max_length=128)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    role: str = Field(default="TRAINEE", description="Requested role: TRAINEE or TRAINER")
    organization_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None

    @model_validator(mode="after")
    def validate_passwords_and_role(self):
        if self.password != self.password_confirm:
            raise ValueError("Passwords do not match.")
        
        # Enforce basic complexity: at least 8 chars
        if len(self.password) < 8:
            raise ValueError("Password must be at least 8 characters long.")

        # Strict security constraint: Public users cannot register as ADMIN
        normalized_role = self.role.upper().strip()
        if normalized_role == "ADMIN":
            raise ValueError("Registration for the ADMIN role is restricted.")
        if normalized_role not in {"TRAINEE", "TRAINER"}:
            raise ValueError("Invalid role requested. Allowed roles: TRAINEE, TRAINER.")
        self.role = normalized_role
        return self


class LoginRequest(BaseModel):
    username_or_email: str
    password: str


class UserSummaryResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    first_name: str
    last_name: str
    role: str
    account_status: str
    is_active: bool
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserSummaryResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class VerifyEmailRequest(BaseModel):
    token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)
    new_password_confirm: str = Field(min_length=8, max_length=128)

    @model_validator(mode="after")
    def validate_password_match(self):
        if self.new_password != self.new_password_confirm:
            raise ValueError("New passwords do not match.")
        return self


class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None
