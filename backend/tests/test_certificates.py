import uuid
from datetime import date, datetime
import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.main import app
from app.database.session import SessionLocal
from app.models.user import User, Role
from app.models.course import (
    Course,
    CourseCategory,
    CourseModule,
    Lesson,
    Enrollment,
    LessonCompletion,
    CourseProgress,
)
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.certificate import Certificate
from app.core.security import get_password_hash, create_access_token
from app.services.certificate_service import CertificateService


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def setup_certificate_data(db_session):
    roles = {r.name: r for r in db_session.query(Role).all()}

    # Admin user
    admin_email = f"admin_cert_{uuid.uuid4().hex[:6]}@imd.gov.in"
    admin = User(
        email=admin_email,
        username=admin_email.split("@")[0],
        hashed_password=get_password_hash("AdminPass123!"),
        first_name="Admin",
        last_name="Official",
        role_id=roles["ADMIN"].id,
        is_active=True,
        is_verified=True,
        account_status="ACTIVE",
    )
    db_session.add(admin)

    # Trainee 1 (Eligible trainee)
    t1_email = f"trainee1_cert_{uuid.uuid4().hex[:6]}@imd.gov.in"
    trainee1 = User(
        email=t1_email,
        username=t1_email.split("@")[0],
        hashed_password=get_password_hash("TraineePass123!"),
        first_name="Aditya",
        last_name="Sharma",
        role_id=roles["TRAINER"].id if "TRAINEE" not in roles else roles["TRAINEE"].id,
        is_active=True,
        is_verified=True,
        account_status="ACTIVE",
    )
    db_session.add(trainee1)

    # Trainee 2 (Another trainee)
    t2_email = f"trainee2_cert_{uuid.uuid4().hex[:6]}@imd.gov.in"
    trainee2 = User(
        email=t2_email,
        username=t2_email.split("@")[0],
        hashed_password=get_password_hash("TraineePass123!"),
        first_name="Rohit",
        last_name="Kumar",
        role_id=roles["TRAINER"].id if "TRAINEE" not in roles else roles["TRAINEE"].id,
        is_active=True,
        is_verified=True,
        account_status="ACTIVE",
    )
    db_session.add(trainee2)

    # Course Category
    category = db_session.query(CourseCategory).first()
    if not category:
        category = CourseCategory(name="Satellite Meteorology", description="Satellite interpretation")
        db_session.add(category)
        db_session.flush()

    # Course 1: Full completion + assessment
    course1 = Course(
        title="Satellite Data Interpretation",
        code=f"SDI-{uuid.uuid4().hex[:4].upper()}",
        description="Comprehensive course on satellite data interpretation for weather forecasting.",
        category_id=category.id,
        status="PUBLISHED",
        difficulty_level="INTERMEDIATE",
        duration_hours=40,
    )
    db_session.add(course1)
    db_session.flush()

    module1 = CourseModule(course_id=course1.id, title="Module 1: Basics", order_index=1)
    db_session.add(module1)
    db_session.flush()

    lesson1 = Lesson(module_id=module1.id, title="Lesson 1: Intro", content_body="Lesson content", order_index=1)
    db_session.add(lesson1)
    db_session.flush()

    # Course 1 Assessment
    assessment1 = Assessment(
        course_id=course1.id,
        title="Final Comprehensive Examination",
        status="PUBLISHED",
        passing_percentage=60.0,
        total_marks=100.0,
    )
    db_session.add(assessment1)
    db_session.flush()

    # Course 2: Incomplete course (no completed lessons)
    course2 = Course(
        title="Doppler Weather Radar Operations",
        code=f"DWR-{uuid.uuid4().hex[:4].upper()}",
        description="Course on radar operations.",
        category_id=category.id,
        status="PUBLISHED",
        difficulty_level="ADVANCED",
        duration_hours=30,
    )
    db_session.add(course2)
    db_session.flush()

    module2 = CourseModule(course_id=course2.id, title="Radar Module 1", order_index=1)
    db_session.add(module2)
    db_session.flush()

    lesson2 = Lesson(module_id=module2.id, title="Radar Lesson 1", content_body="Radar content", order_index=1)
    db_session.add(lesson2)
    db_session.flush()

    # Course 3: Completed lessons but failed assessment
    course3 = Course(
        title="Cyclone Monitoring and Warning",
        code=f"CMW-{uuid.uuid4().hex[:4].upper()}",
        description="Cyclone warning operations.",
        category_id=category.id,
        status="PUBLISHED",
        difficulty_level="ADVANCED",
        duration_hours=25,
    )
    db_session.add(course3)
    db_session.flush()

    module3 = CourseModule(course_id=course3.id, title="Cyclone Module 1", order_index=1)
    db_session.add(module3)
    db_session.flush()

    lesson3 = Lesson(module_id=module3.id, title="Cyclone Lesson 1", content_body="Cyclone content", order_index=1)
    db_session.add(lesson3)
    db_session.flush()

    assessment3 = Assessment(
        course_id=course3.id,
        title="Cyclone Final Exam",
        status="PUBLISHED",
        passing_percentage=70.0,
        total_marks=100.0,
    )
    db_session.add(assessment3)
    db_session.flush()

    db_session.commit()

    # Enrollments for Trainee 1
    # 1. Enrolled in course 1 -> completed lesson + passed assessment
    e1 = Enrollment(user_id=trainee1.id, course_id=course1.id, status="COMPLETED")
    db_session.add(e1)
    db_session.flush()

    lc1 = LessonCompletion(enrollment_id=e1.id, lesson_id=lesson1.id)
    db_session.add(lc1)
    prog1 = CourseProgress(
        enrollment_id=e1.id,
        completed_lessons_count=1,
        total_lessons_count=1,
        completion_percentage=100.0,
        is_completed=True,
    )
    db_session.add(prog1)

    # Passed attempt on assessment1
    att1 = AssessmentAttempt(
        assessment_id=assessment1.id,
        user_id=trainee1.id,
        status="EVALUATED",
        score_obtained=88.0,
        percentage=88.0,
        is_passed=True,
    )
    db_session.add(att1)

    # 2. Enrolled in course 2 -> incomplete lessons, no assessment
    e2 = Enrollment(user_id=trainee1.id, course_id=course2.id, status="IN_PROGRESS")
    db_session.add(e2)
    db_session.flush()
    prog2 = CourseProgress(
        enrollment_id=e2.id,
        completed_lessons_count=0,
        total_lessons_count=1,
        completion_percentage=0.0,
        is_completed=False,
    )
    db_session.add(prog2)

    # 3. Enrolled in course 3 -> completed lessons, but FAILED assessment
    e3 = Enrollment(user_id=trainee1.id, course_id=course3.id, status="IN_PROGRESS")
    db_session.add(e3)
    db_session.flush()
    lc3 = LessonCompletion(enrollment_id=e3.id, lesson_id=lesson3.id)
    db_session.add(lc3)
    prog3 = CourseProgress(
        enrollment_id=e3.id,
        completed_lessons_count=1,
        total_lessons_count=1,
        completion_percentage=100.0,
        is_completed=False,
    )
    db_session.add(prog3)

    att3 = AssessmentAttempt(
        assessment_id=assessment3.id,
        user_id=trainee1.id,
        status="EVALUATED",
        score_obtained=45.0,
        percentage=45.0,
        is_passed=False,
    )
    db_session.add(att3)

    db_session.commit()

    # JWT tokens
    t1_token = create_access_token(subject=str(trainee1.id), role=trainee1.role.name if trainee1.role else "TRAINEE")
    t2_token = create_access_token(subject=str(trainee2.id), role=trainee2.role.name if trainee2.role else "TRAINEE")
    admin_token = create_access_token(subject=str(admin.id), role=admin.role.name if admin.role else "ADMIN")

    return {
        "admin": admin,
        "trainee1": trainee1,
        "trainee2": trainee2,
        "course1": course1,
        "course2": course2,
        "course3": course3,
        "t1_token": t1_token,
        "t2_token": t2_token,
        "admin_token": admin_token,
    }


# Test 1: Eligible trainee can receive certificate
def test_eligible_trainee_can_receive_certificate(client, setup_certificate_data):
    token = setup_certificate_data["t1_token"]
    course = setup_certificate_data["course1"]

    # Check eligibility first
    res_elig = client.get(
        f"/api/v1/certificates/eligibility/{course.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res_elig.status_code == status.HTTP_200_OK
    assert res_elig.json()["eligible"] is True

    # Generate certificate
    res = client.post(
        f"/api/v1/certificates/{course.id}/generate",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["course_id"] == str(course.id)
    assert data["certificate_number"].startswith("CC-")
    assert data["status"] == "ISSUED"
    assert data["score"] == 88.0
    assert data["pdf_url"] is not None


# Test 2: Incomplete course cannot generate certificate
def test_incomplete_course_cannot_generate_certificate(client, setup_certificate_data):
    token = setup_certificate_data["t1_token"]
    course = setup_certificate_data["course2"]

    res = client.post(
        f"/api/v1/certificates/{course.id}/generate",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == status.HTTP_400_BAD_REQUEST
    assert "incomplete" in res.json()["detail"].lower() or "not finished" in res.json()["detail"].lower()


# Test 3: Failed assessment cannot generate certificate
def test_failed_assessment_cannot_generate_certificate(client, setup_certificate_data):
    token = setup_certificate_data["t1_token"]
    course = setup_certificate_data["course3"]

    res = client.post(
        f"/api/v1/certificates/{course.id}/generate",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == status.HTTP_400_BAD_REQUEST
    assert "assessment" in res.json()["detail"].lower()


# Test 4: Certificate belongs to correct trainee
def test_certificate_belongs_to_correct_trainee(client, setup_certificate_data):
    token = setup_certificate_data["t1_token"]
    trainee = setup_certificate_data["trainee1"]

    res = client.get(
        "/api/v1/certificates/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == status.HTTP_200_OK
    certs = res.json()
    assert len(certs) >= 1
    assert certs[0]["user_id"] == str(trainee.id)
    assert certs[0]["trainee_name"] == f"{trainee.first_name} {trainee.last_name}"


# Test 5: Trainee cannot download another trainee's certificate
def test_trainee_cannot_download_another_trainees_certificate(client, setup_certificate_data):
    t1_token = setup_certificate_data["t1_token"]
    t2_token = setup_certificate_data["t2_token"]

    # Trainee 1 gets certificate ID
    res_list = client.get(
        "/api/v1/certificates/me",
        headers={"Authorization": f"Bearer {t1_token}"},
    )
    cert_id = res_list.json()[0]["id"]

    # Trainee 2 tries to download it
    res = client.get(
        f"/api/v1/certificates/{cert_id}/download",
        headers={"Authorization": f"Bearer {t2_token}"},
    )
    assert res.status_code == status.HTTP_403_FORBIDDEN


# Test 6: Certificate number is unique
def test_certificate_number_is_unique(db_session, setup_certificate_data):
    course = setup_certificate_data["course1"]
    cert1 = CertificateService.generate_certificate_number(db_session, course, 2026)
    cert2 = CertificateService.generate_certificate_number(db_session, course, 2026)
    assert cert1.startswith("CC-2026-")
    assert cert2.startswith("CC-2026-")


# Test 7: Duplicate certificate is prevented
def test_duplicate_certificate_is_prevented(client, setup_certificate_data):
    token = setup_certificate_data["t1_token"]
    course = setup_certificate_data["course1"]

    # Calling generate a second time should return existing certificate without error or duplication
    res = client.post(
        f"/api/v1/certificates/{course.id}/generate",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == status.HTTP_200_OK
    cert_data = res.json()

    # List certificates: only one exists for this course
    res_list = client.get(
        "/api/v1/certificates/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    matching = [c for c in res_list.json() if c["course_id"] == str(course.id)]
    assert len(matching) == 1
    assert matching[0]["id"] == cert_data["id"]


# Test 8: QR verification works without authentication
def test_qr_verification_works(client, setup_certificate_data):
    token = setup_certificate_data["t1_token"]
    res_list = client.get(
        "/api/v1/certificates/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    cert = res_list.json()[0]

    # Verify via API endpoint (no auth header)
    res_api = client.get(f"/api/v1/certificates/verify/{cert['id']}")
    assert res_api.status_code == status.HTTP_200_OK
    data = res_api.json()
    assert data["verified"] is True
    assert data["status"] == "ISSUED"
    assert data["certificate_number"] == cert["certificate_number"]

    # Verify via root endpoint (no auth header)
    res_root = client.get(f"/certificates/verify/{cert['id']}")
    assert res_root.status_code == status.HTTP_200_OK
    assert res_root.json()["verified"] is True


# Test 9: Invalid certificate returns not found
def test_invalid_certificate_returns_not_found(client):
    fake_id = str(uuid.uuid4())
    res = client.get(f"/api/v1/certificates/verify/{fake_id}")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["verified"] is False
    assert data["status"] == "NOT_FOUND"


# Test 10: Revoked certificate is reported correctly
def test_revoked_certificate_is_reported_correctly(client, setup_certificate_data):
    t1_token = setup_certificate_data["t1_token"]
    admin_token = setup_certificate_data["admin_token"]

    res_list = client.get(
        "/api/v1/certificates/me",
        headers={"Authorization": f"Bearer {t1_token}"},
    )
    cert_id = res_list.json()[0]["id"]

    # Admin revokes certificate
    res_revoke = client.post(
        f"/api/v1/certificates/admin/{cert_id}/revoke",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_revoke.status_code == status.HTTP_200_OK
    assert res_revoke.json()["status"] == "REVOKED"

    # Public verification reflects REVOKED status
    res_verify = client.get(f"/api/v1/certificates/verify/{cert_id}")
    assert res_verify.status_code == status.HTTP_200_OK
    verify_data = res_verify.json()
    assert verify_data["verified"] is False
    assert verify_data["status"] == "REVOKED"
    assert "revoked" in verify_data["message"].lower()
