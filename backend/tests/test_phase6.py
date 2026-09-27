import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.database.session import SessionLocal
from app.models.user import User, Role
from app.models.course import Course, Enrollment
from app.models.feedback import Feedback
from app.core.security import create_access_token

client = TestClient(app)


@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture(scope="module")
def demo_users(db_session: Session):
    admin = db_session.query(User).filter(User.email == "admin.demo@imd.gov.in").first()
    trainer = db_session.query(User).filter(User.email == "trainer.demo@imd.gov.in").first()
    trainee = db_session.query(User).filter(User.email == "trainee.demo@imd.gov.in").first()

    return {
        "admin": admin,
        "trainer": trainer,
        "trainee": trainee,
    }


@pytest.fixture(scope="module")
def auth_headers(demo_users):
    admin_token = create_access_token(str(demo_users["admin"].id), "ADMIN")
    trainer_token = create_access_token(str(demo_users["trainer"].id), "TRAINER")
    trainee_token = create_access_token(str(demo_users["trainee"].id), "TRAINEE")

    return {
        "admin": {"Authorization": f"Bearer {admin_token}"},
        "trainer": {"Authorization": f"Bearer {trainer_token}"},
        "trainee": {"Authorization": f"Bearer {trainee_token}"},
    }


# ==========================================
# 1. FEEDBACK SYSTEM TESTS (MVP DELIVERABLE #8)
# ==========================================

def test_course_feedback_submission_and_aggregation(db_session, auth_headers, demo_users):
    """Verifies that an enrolled trainee can submit feedback and it aggregates into course rating."""
    course = db_session.query(Course).first()
    assert course is not None, "At least one course must exist in database"

    # Ensure enrollment exists
    enrollment = (
        db_session.query(Enrollment)
        .filter(Enrollment.user_id == demo_users["trainee"].id, Enrollment.course_id == course.id)
        .first()
    )
    if not enrollment:
        enrollment = Enrollment(
            user_id=demo_users["trainee"].id,
            course_id=course.id,
            status="IN_PROGRESS",
        )
        db_session.add(enrollment)
        db_session.commit()

    # Submit feedback
    payload = {
        "course_rating": 5,
        "trainer_rating": 5,
        "content_rating": 4,
        "comments": "Excellent radar interpretation module with clear operational examples.",
        "suggestions": "Add more real-time satellite animation case studies.",
    }

    res = client.post(
        f"/api/v1/courses/{course.id}/feedback",
        json=payload,
        headers=auth_headers["trainee"],
    )
    assert res.status_code == 201, res.text
    data = res.json()
    assert data["course_rating"] == 5
    assert data["trainer_rating"] == 5
    assert "radar" in data["comments"].lower()

    # Get course feedback summary
    summary_res = client.get(f"/api/v1/courses/{course.id}/feedback")
    assert summary_res.status_code == 200
    summary_data = summary_res.json()
    assert summary_data["feedback_count"] >= 1
    assert summary_data["average_course_rating"] >= 1.0


def test_trainer_feedback_retrieval(auth_headers):
    """Verifies that a trainer can inspect feedback evaluations received for their courses."""
    res = client.get("/api/v1/trainer/feedback", headers=auth_headers["trainer"])
    assert res.status_code == 200
    data = res.json()
    assert "trainer_id" in data
    assert "average_trainer_rating" in data
    assert "feedbacks" in data


def test_admin_feedback_overview(auth_headers):
    """Verifies that an admin can inspect institutional feedback records across all courses."""
    res = client.get("/api/v1/admin/feedback", headers=auth_headers["admin"])
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)


def test_trainee_cannot_access_admin_feedback(auth_headers):
    """Security negative test: Trainee cannot access admin feedback overview."""
    res = client.get("/api/v1/admin/feedback", headers=auth_headers["trainee"])
    assert res.status_code == 403


# ==========================================
# 2. RBAC & ROLE SECURITY HARDENING AUDIT
# ==========================================

def test_unauthenticated_requests_rejected():
    """Security negative test: 401 is returned when accessing protected routes without token."""
    res_profile = client.get("/api/v1/trainee/profile")
    assert res_profile.status_code == 401

    res_admin = client.get("/api/v1/admin/users")
    assert res_admin.status_code == 401

    res_trainer = client.get("/api/v1/trainer/dashboard")
    assert res_trainer.status_code == 401

    res_comp_me = client.get("/api/v1/competencies/me")
    assert res_comp_me.status_code == 401


def test_trainee_cannot_access_trainer_or_admin_routes(auth_headers):
    """Security negative test: Trainee receives 403 Forbidden on Trainer and Admin routes."""
    # Trainer endpoints
    assert client.get("/api/v1/trainer/dashboard", headers=auth_headers["trainee"]).status_code == 403
    assert client.get("/api/v1/trainer/performance", headers=auth_headers["trainee"]).status_code == 403

    # Admin endpoints
    assert client.get("/api/v1/admin/users", headers=auth_headers["trainee"]).status_code == 403
    assert client.get("/api/v1/admin/dashboard", headers=auth_headers["trainee"]).status_code == 403


def test_trainer_cannot_access_admin_routes(auth_headers):
    """Security negative test: Trainer receives 403 Forbidden on Admin routes."""
    assert client.get("/api/v1/admin/users", headers=auth_headers["trainer"]).status_code == 403
    assert client.get("/api/v1/admin/dashboard", headers=auth_headers["trainer"]).status_code == 403


def test_trainee_ownership_isolation(auth_headers, demo_users):
    """Security ownership test: Trainee cannot inspect another user's competency profile."""
    # Attempting to access admin user competency inspection endpoint as a trainee
    target_user_id = str(demo_users["trainer"].id)
    res = client.get(f"/api/v1/competencies/user/{target_user_id}", headers=auth_headers["trainee"])
    assert res.status_code == 403


# ==========================================
# 3. END-TO-END VERIFICATION OF CORE FLOWS
# ==========================================

def test_e2e_trainee_competency_readiness_and_gap_flow(auth_headers):
    """Validates complete analytical flow: Competencies -> Readiness -> Gaps -> Recommendations."""
    # 1. My Competencies
    comp_res = client.get("/api/v1/competencies/me", headers=auth_headers["trainee"])
    assert comp_res.status_code == 200
    competencies = comp_res.json()
    assert len(competencies) > 0

    # 2. Readiness Score
    readiness_res = client.get("/api/v1/competencies/me/readiness", headers=auth_headers["trainee"])
    assert readiness_res.status_code == 200
    readiness = readiness_res.json()
    assert 0.0 <= readiness["overall_readiness_percentage"] <= 100.0

    # 3. Skill Gaps
    gaps_res = client.get("/api/v1/competencies/me/gaps", headers=auth_headers["trainee"])
    assert gaps_res.status_code == 200
    gaps = gaps_res.json()
    assert isinstance(gaps, list)

    # 4. Recommendations
    rec_res = client.get("/api/v1/competencies/me/recommendations", headers=auth_headers["trainee"])
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert isinstance(recs, list)


def test_e2e_admin_trainer_recommendations_flow(auth_headers, db_session):
    """Validates admin faculty nomination flow with 6-dimension evaluation."""
    from app.models.subject import Subject
    subj = db_session.query(Subject).first()
    assert subj is not None, "Subject must exist"

    res = client.get(
        f"/api/v1/competencies/trainer-recommendations?subject_id={subj.id}",
        headers=auth_headers["admin"],
    )
    assert res.status_code == 200
    data = res.json()
    assert data["subject_id"] == str(subj.id)
    assert "candidates" in data
    assert len(data["candidates"]) > 0

    top_candidate = data["candidates"][0]
    assert "overall_match_score" in top_candidate
    assert "competency_match" in top_candidate
    assert "explanation" in top_candidate
