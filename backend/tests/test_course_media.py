import io
import uuid
import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.main import app
from app.database.session import SessionLocal
from app.models.user import User, Role
from app.models.course import Course, CourseCategory, CourseModule, Lesson, Resource, Enrollment, ResourceCompletion
from app.core.security import get_password_hash, create_access_token


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.fixture(scope="module")
def test_setup(db_session):
    # Ensure roles exist
    roles = {r.name: r for r in db_session.query(Role).all()}

    # Create trainer 1
    t1_email = f"trainer1_{uuid.uuid4().hex[:6]}@imd.gov.in"
    trainer1 = User(
        email=t1_email,
        username=t1_email.split("@")[0],
        hashed_password=get_password_hash("TrainerPass123!"),
        first_name="Rajesh",
        last_name="Sharma",
        role_id=roles["TRAINER"].id,
        is_active=True,
        is_verified=True,
        account_status="ACTIVE",
    )
    db_session.add(trainer1)

    # Create trainer 2 (different trainer)
    t2_email = f"trainer2_{uuid.uuid4().hex[:6]}@imd.gov.in"
    trainer2 = User(
        email=t2_email,
        username=t2_email.split("@")[0],
        hashed_password=get_password_hash("TrainerPass123!"),
        first_name="Sunita",
        last_name="Verma",
        role_id=roles["TRAINER"].id,
        is_active=True,
        is_verified=True,
        account_status="ACTIVE",
    )
    db_session.add(trainer2)

    # Create trainee
    trainee_email = f"trainee_{uuid.uuid4().hex[:6]}@imd.gov.in"
    trainee = User(
        email=trainee_email,
        username=trainee_email.split("@")[0],
        hashed_password=get_password_hash("TraineePass123!"),
        first_name="Amit",
        last_name="Patel",
        role_id=roles["TRAINEE"].id,
        is_active=True,
        is_verified=True,
        account_status="ACTIVE",
    )
    db_session.add(trainee)

    # Create admin
    admin_email = f"admin_{uuid.uuid4().hex[:6]}@imd.gov.in"
    admin = User(
        email=admin_email,
        username=admin_email.split("@")[0],
        hashed_password=get_password_hash("AdminPass123!"),
        first_name="Admin",
        last_name="Officer",
        role_id=roles["ADMIN"].id,
        is_active=True,
        is_verified=True,
        account_status="ACTIVE",
    )
    db_session.add(admin)
    db_session.flush()

    # Create Category
    cat = db_session.query(CourseCategory).first()
    if not cat:
        cat = CourseCategory(name="Radar Meteorology Test", code="RAD-TEST")
        db_session.add(cat)
        db_session.flush()

    # Create Course owned by Trainer 1
    course1 = Course(
        title="DWR Calibration and Surveillance",
        code=f"DWR-{uuid.uuid4().hex[:4].upper()}",
        category_id=cat.id,
        trainer_id=trainer1.id,
        difficulty_level="INTERMEDIATE",
        duration_hours=20,
        status="PUBLISHED",
    )
    db_session.add(course1)
    db_session.flush()

    # Add module & lesson
    mod1 = CourseModule(
        course_id=course1.id,
        title="Module 1: DWR Basics",
        order_index=1,
    )
    db_session.add(mod1)
    db_session.flush()

    les1 = Lesson(
        module_id=mod1.id,
        title="Lesson 1: Radar Reflectivity Interpretation",
        duration_minutes=30,
        order_index=1,
    )
    db_session.add(les1)
    db_session.commit()

    return {
        "trainer1": trainer1,
        "trainer2": trainer2,
        "trainee": trainee,
        "admin": admin,
        "course": course1,
        "module": mod1,
        "lesson": les1,
    }


def auth_header(user: User):
    token = create_access_token(subject=str(user.id), role=user.role.name)
    return {"Authorization": f"Bearer {token}"}


class TestCourseMediaSecurityAndLifecycle:

    def test_trainer_can_create_resource(self, client, test_setup):
        """Trainer can create video/audio resource on course they manage."""
        t1 = test_setup["trainer1"]
        course = test_setup["course"]
        mod = test_setup["module"]
        les = test_setup["lesson"]

        payload = {
            "title": "Doppler Radar Volume Scan Tutorial",
            "description": "Explains VAD and PPI velocity profiles.",
            "resource_type": "EXTERNAL_VIDEO",
            "media_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "module_id": str(mod.id),
            "lesson_id": str(les.id),
            "duration_seconds": 720,
            "display_order": 1,
            "is_published": True,
        }

        resp = client.post(
            f"/api/v1/courses/{course.id}/resources",
            json=payload,
            headers=auth_header(t1),
        )
        assert resp.status_code == status.HTTP_201_CREATED
        data = resp.json()
        assert data["title"] == payload["title"]
        assert data["resource_type"] == "EXTERNAL_VIDEO"
        assert data["duration_seconds"] == 720
        assert data["is_published"] is True
        test_setup["resource_id"] = data["id"]

    def test_trainer_cannot_modify_another_trainers_course(self, client, test_setup):
        """Trainer 2 cannot add or modify resources on course owned by Trainer 1."""
        t2 = test_setup["trainer2"]
        course = test_setup["course"]
        res_id = test_setup.get("resource_id")

        # Attempt to create
        resp = client.post(
            f"/api/v1/courses/{course.id}/resources",
            json={
                "title": "Unauthorized Resource",
                "resource_type": "VIDEO",
                "media_url": "https://example.com/video.mp4",
            },
            headers=auth_header(t2),
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN

        # Attempt to delete
        if res_id:
            del_resp = client.delete(
                f"/api/v1/resources/{res_id}",
                headers=auth_header(t2),
            )
            assert del_resp.status_code == status.HTTP_403_FORBIDDEN

    def test_trainer_can_publish_and_unpublish_own_resource(self, client, test_setup):
        """Trainer can toggle draft vs published state."""
        t1 = test_setup["trainer1"]
        res_id = test_setup["resource_id"]

        # Unpublish
        resp = client.post(
            f"/api/v1/resources/{res_id}/publish",
            json={"is_published": False},
            headers=auth_header(t1),
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["is_published"] is False

        # Re-publish
        resp2 = client.post(
            f"/api/v1/resources/{res_id}/publish",
            json={"is_published": True},
            headers=auth_header(t1),
        )
        assert resp2.status_code == status.HTTP_200_OK
        assert resp2.json()["is_published"] is True

    def test_trainee_cannot_create_resource(self, client, test_setup):
        """Trainee role is blocked from creating resources."""
        trainee = test_setup["trainee"]
        course = test_setup["course"]

        resp = client.post(
            f"/api/v1/courses/{course.id}/resources",
            json={
                "title": "Hacker resource",
                "resource_type": "VIDEO",
                "media_url": "https://example.com/hacker.mp4",
            },
            headers=auth_header(trainee),
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_trainee_must_be_enrolled_to_access_resources(self, client, test_setup):
        """Unenrolled trainee receives 403 when trying to access course resources."""
        trainee = test_setup["trainee"]
        course = test_setup["course"]

        resp = client.get(
            f"/api/v1/courses/{course.id}/resources",
            headers=auth_header(trainee),
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN

    def test_trainee_cannot_access_draft_resource(self, client, test_setup, db_session):
        """Enrolled trainee sees only published resources, draft resources are filtered out."""
        trainee = test_setup["trainee"]
        course = test_setup["course"]
        t1 = test_setup["trainer1"]

        # Enroll trainee
        enrollment = db_session.query(Enrollment).filter(
            Enrollment.user_id == trainee.id, Enrollment.course_id == course.id
        ).first()
        if not enrollment:
            enrollment = Enrollment(user_id=trainee.id, course_id=course.id, status="ENROLLED")
            db_session.add(enrollment)
            db_session.commit()

        # Create draft resource
        draft_resp = client.post(
            f"/api/v1/courses/{course.id}/resources",
            json={
                "title": "Confidential Draft Radar Notes",
                "resource_type": "DOCUMENT",
                "media_url": "https://imd.gov.in/docs/draft.pdf",
                "is_published": False,
            },
            headers=auth_header(t1),
        )
        assert draft_resp.status_code == status.HTTP_201_CREATED
        draft_id = draft_resp.json()["id"]

        # Trainee gets resources
        resp = client.get(
            f"/api/v1/courses/{course.id}/resources",
            headers=auth_header(trainee),
        )
        assert resp.status_code == status.HTTP_200_OK
        ids = [r["id"] for r in resp.json()]
        assert draft_id not in ids

    def test_trainee_can_access_published_resource(self, client, test_setup):
        """Enrolled trainee sees published resource."""
        trainee = test_setup["trainee"]
        course = test_setup["course"]
        res_id = test_setup["resource_id"]

        resp = client.get(
            f"/api/v1/courses/{course.id}/resources",
            headers=auth_header(trainee),
        )
        assert resp.status_code == status.HTTP_200_OK
        ids = [r["id"] for r in resp.json()]
        assert res_id in ids

    def test_admin_can_manage_resources(self, client, test_setup):
        """Admin has full governance access to view, update, and manage resources."""
        admin = test_setup["admin"]
        course = test_setup["course"]
        res_id = test_setup["resource_id"]

        # Admin can update
        resp = client.put(
            f"/api/v1/resources/{res_id}",
            json={"title": "Admin Verified Radar Scan Tutorial"},
            headers=auth_header(admin),
        )
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json()["title"] == "Admin Verified Radar Scan Tutorial"

    def test_invalid_mime_rejected(self, client, test_setup):
        """Uploading an executable (.exe) or dangerous MIME is rejected."""
        t1 = test_setup["trainer1"]
        course = test_setup["course"]

        fake_file = io.BytesIO(b"MZ\x90\x00\x03\x00\x00\x00")
        resp = client.post(
            f"/api/v1/courses/{course.id}/resources/upload",
            files={"file": ("malware.exe", fake_file, "application/x-msdownload")},
            data={"title": "Malware file", "resource_type": "VIDEO"},
            headers=auth_header(t1),
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "Unsupported media MIME type" in resp.json()["detail"]

    def test_oversized_upload_rejected(self, client, test_setup):
        """Upload exceeding file size limit is rejected with 413."""
        t1 = test_setup["trainer1"]
        course = test_setup["course"]

        # Fake an oversized audio file (>30MB limit)
        oversized = io.BytesIO(b"0" * (31 * 1024 * 1024))
        resp = client.post(
            f"/api/v1/courses/{course.id}/resources/upload",
            files={"file": ("giant_lecture.mp3", oversized, "audio/mpeg")},
            data={"title": "Giant Audio Lecture", "resource_type": "AUDIO"},
            headers=auth_header(t1),
        )
        assert resp.status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE

    def test_invalid_external_url_rejected(self, client, test_setup):
        """Script protocols (javascript:) or non-http URLs are rejected."""
        t1 = test_setup["trainer1"]
        course = test_setup["course"]

        resp = client.post(
            f"/api/v1/courses/{course.id}/resources",
            json={
                "title": "XSS video",
                "resource_type": "EXTERNAL_VIDEO",
                "media_url": "javascript:alert(1)",
            },
            headers=auth_header(t1),
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_trainee_can_complete_resource(self, client, test_setup):
        """Enrolled trainee can mark resource as completed."""
        trainee = test_setup["trainee"]
        res_id = test_setup["resource_id"]

        resp = client.post(
            f"/api/v1/resources/{res_id}/complete",
            json={"is_completed": True, "progress_seconds": 650},
            headers=auth_header(trainee),
        )
        assert resp.status_code == status.HTTP_200_OK
        data = resp.json()
        assert data["is_completed"] is True
        assert data["progress_seconds"] == 650
