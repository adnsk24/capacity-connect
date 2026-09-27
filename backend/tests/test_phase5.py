import uuid
import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.database.session import SessionLocal
from app.models.user import User, Role, UserSkill, Skill, Qualification, Experience, Certification, TrainerProfile
from app.models.organization import Organization, Department
from app.models.competency import Competency, CourseCompetency
from app.models.subject import Subject, SubjectCompetencyRequirement
from app.models.course import Course, Enrollment, CourseProgress
from app.core.security import create_access_token, get_password_hash
from app.services.competency_service import CompetencyEvaluationService


client = TestClient(app)


@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def auth_headers(db: Session):
    """Provides authorization headers for trainee, trainer, and admin."""
    trainee = db.query(User).filter(User.email == "trainee.demo@imd.gov.in").first()
    trainer = db.query(User).filter(User.email == "trainer.demo@imd.gov.in").first()
    admin = db.query(User).filter(User.email == "admin.demo@imd.gov.in").first()

    trainee_token = create_access_token(str(trainee.id), "TRAINEE")
    trainer_token = create_access_token(str(trainer.id), "TRAINER")
    admin_token = create_access_token(str(admin.id), "ADMIN")

    return {
        "trainee": {"Authorization": f"Bearer {trainee_token}"},
        "trainer": {"Authorization": f"Bearer {trainer_token}"},
        "admin": {"Authorization": f"Bearer {admin_token}"},
        "trainee_user": trainee,
        "trainer_user": trainer,
        "admin_user": admin,
    }


def test_competency_catalog_listing(auth_headers):
    """Test retrieving all competencies from the catalog."""
    resp = client.get("/api/v1/competencies", headers=auth_headers["trainee"])
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 7
    codes = [c["code"] for c in data]
    assert "COMP-SYNOPTIC" in codes
    assert "COMP-DOPPLER" in codes
    assert "COMP-SAT" in codes


def test_competency_levels_framework(auth_headers):
    """Test retrieving standard framework level definitions (0 to 5)."""
    resp = client.get("/api/v1/competencies/levels", headers=auth_headers["trainee"])
    assert resp.status_code == 200
    levels = resp.json()
    assert len(levels) == 6
    level_nums = [lvl["level"] for lvl in levels]
    assert level_nums == [0, 1, 2, 3, 4, 5]
    names = [lvl["name"] for lvl in levels]
    assert "Not Demonstrated" in names
    assert "Advanced" in names
    assert "Expert" in names


def test_my_competencies_evaluation_and_evidence(auth_headers):
    """Test trainee competency evaluation and multi-source evidence generation."""
    resp = client.get("/api/v1/competencies/me", headers=auth_headers["trainee"])
    assert resp.status_code == 200
    comps = resp.json()
    assert len(comps) >= 7

    for c in comps:
        assert 0.0 <= c["current_level"] <= 5.0
        assert 0 <= c["integer_level"] <= 5
        assert c["level_name"] is not None
        assert len(c["evidence"]) == 6  # 6 evidence dimensions
        evidence_types = [e["type"] for e in c["evidence"]]
        assert "ASSESSMENT" in evidence_types
        assert "COURSE" in evidence_types
        assert "SKILL" in evidence_types
        assert "EXPERIENCE" in evidence_types
        assert "CERTIFICATION" in evidence_types
        assert "QUALIFICATION" in evidence_types
        assert len(c["summary_explanation"]) > 10

    # Synoptic weather analysis should be strongly demonstrated due to demo seed
    synoptic = next(c for c in comps if c["code"] == "COMP-SYNOPTIC")
    assert synoptic["current_level"] >= 1.5


def test_skill_gap_analysis(auth_headers):
    """Test prioritized skill-gap calculation against target levels."""
    resp = client.get("/api/v1/competencies/me/gaps", headers=auth_headers["trainee"])
    assert resp.status_code == 200
    gaps = resp.json()
    assert len(gaps) >= 7

    for g in gaps:
        assert g["gap"] >= 0.0
        assert g["priority"] in ["HIGH", "MEDIUM", "LOW"]
        assert g["required_level"] >= 1.0
        assert g["evidence_summary"] is not None

    # Should be sorted so high gaps come first
    assert gaps[0]["gap"] >= gaps[-1]["gap"]


def test_subject_specific_skill_gaps(auth_headers, db: Session):
    """Test skill-gap analysis tailored to a specific operational subject."""
    radar_subj = db.query(Subject).filter(Subject.code == "SUBJ-DWR-OPS").first()
    assert radar_subj is not None

    resp = client.get(
        f"/api/v1/competencies/me/gaps?subject_id={radar_subj.id}",
        headers=auth_headers["trainee"],
    )
    assert resp.status_code == 200
    gaps = resp.json()
    assert len(gaps) == 2  # COMP-DOPPLER and COMP-SYNOPTIC
    gap_codes = [g["code"] for g in gaps]
    assert "COMP-DOPPLER" in gap_codes
    assert "COMP-SYNOPTIC" in gap_codes


def test_training_readiness_calculation(auth_headers):
    """Test transparent Training Readiness Score calculation."""
    resp = client.get("/api/v1/competencies/me/readiness", headers=auth_headers["trainee"])
    assert resp.status_code == 200
    readiness = resp.json()
    assert 0.0 <= readiness["overall_readiness_percentage"] <= 100.0
    assert readiness["required_competencies_count"] >= 7
    assert readiness["met_competencies_count"] >= 0
    assert "formula_explanation" in readiness
    assert len(readiness["competency_breakdown"]) >= 7


def test_personalized_course_recommendations(auth_headers):
    """Test personalized course recommendations addressing open gaps."""
    resp = client.get("/api/v1/competencies/me/recommendations", headers=auth_headers["trainee"])
    assert resp.status_code == 200
    recs = resp.json()
    assert isinstance(recs, list)
    assert len(recs) > 0
    for r in recs:
        assert r["match_score"] > 0.0
        assert len(r["addressed_gaps"]) > 0
        assert "why_recommended" in r
        assert len(r["why_recommended"]) > 10


def test_competency_growth_progression(auth_headers, db: Session):
    """Test historical competency growth milestone points."""
    synoptic = db.query(Competency).filter(Competency.code == "COMP-SYNOPTIC").first()
    assert synoptic is not None

    resp = client.get(
        f"/api/v1/competencies/me/growth/{synoptic.id}",
        headers=auth_headers["trainee"],
    )
    assert resp.status_code == 200
    growth = resp.json()
    assert growth["code"] == "COMP-SYNOPTIC"
    assert len(growth["growth_points"]) >= 2
    for p in growth["growth_points"]:
        assert p["level"] >= 0.0
        assert p["event_type"] in ["ONBOARDING", "COURSE_ENROLLMENT", "ASSESSMENT_EVALUATION", "CURRENT_EVALUATION"]


def test_subject_listing_with_requirements(auth_headers):
    """Test listing operational subjects and their requirement profiles."""
    resp = client.get("/api/v1/competencies/subjects", headers=auth_headers["trainee"])
    assert resp.status_code == 200
    subjects = resp.json()
    assert len(subjects) >= 3
    subj_codes = [s["code"] for s in subjects]
    assert "SUBJ-DWR-OPS" in subj_codes
    assert "SUBJ-SAT-CYCLONE" in subj_codes


def test_trainer_recommendation_calculation(auth_headers, db: Session):
    """Test 6-dimensional trainer matching and ranking for a subject."""
    sat_subj = db.query(Subject).filter(Subject.code == "SUBJ-SAT-CYCLONE").first()
    assert sat_subj is not None

    # Admin access
    resp = client.get(
        f"/api/v1/competencies/trainer-recommendations?subject_id={sat_subj.id}",
        headers=auth_headers["admin"],
    )
    assert resp.status_code == 200
    rec_data = resp.json()
    assert rec_data["subject_code"] == "SUBJ-SAT-CYCLONE"
    assert rec_data["candidate_count"] >= 2
    candidates = rec_data["candidates"]
    assert len(candidates) >= 2

    # Dr. Meenakshi Sundaram should rank top for Satellite Remote Sensing due to Ph.D + WMO Certification + 14 yrs experience
    assert "Meenakshi" in candidates[0]["name"]
    assert candidates[0]["overall_match_score"] >= candidates[1]["overall_match_score"]
    assert candidates[0]["qualification_score"] == 100.0  # Ph.D.
    assert candidates[0]["certification_score"] >= 65.0   # Verified WMO cert
    assert len(candidates[0]["explanation"]) > 20


def test_trainee_cannot_access_trainer_recommendations(auth_headers, db: Session):
    """Verify trainee cannot access sensitive trainer candidate recommendations (RBAC 403)."""
    sat_subj = db.query(Subject).filter(Subject.code == "SUBJ-SAT-CYCLONE").first()
    resp = client.get(
        f"/api/v1/competencies/trainer-recommendations?subject_id={sat_subj.id}",
        headers=auth_headers["trainee"],
    )
    assert resp.status_code == 403


def test_trainer_can_access_trainer_recommendations(auth_headers, db: Session):
    """Verify trainer can access peer recommendations for syllabus coordination."""
    sat_subj = db.query(Subject).filter(Subject.code == "SUBJ-SAT-CYCLONE").first()
    resp = client.get(
        f"/api/v1/competencies/trainer-recommendations?subject_id={sat_subj.id}",
        headers=auth_headers["trainer"],
    )
    assert resp.status_code == 200


def test_admin_inspect_user_competencies(auth_headers):
    """Test administrative inspection of any user's competency matrix."""
    trainee = auth_headers["trainee_user"]
    resp = client.get(
        f"/api/v1/competencies/user/{trainee.id}",
        headers=auth_headers["admin"],
    )
    assert resp.status_code == 200
    comps = resp.json()
    assert len(comps) >= 7


def test_trainee_cannot_inspect_other_user_competencies(auth_headers):
    """Test trainee cannot inspect another user's competency matrix (RBAC 403)."""
    trainee = auth_headers["trainee_user"]
    resp = client.get(
        f"/api/v1/competencies/user/{trainee.id}",
        headers=auth_headers["trainee"],
    )
    assert resp.status_code == 403


def test_zero_data_handling(db: Session):
    """Test that a brand new user with 0 records evaluates safely without errors."""
    trainee_role = db.query(Role).filter(Role.name == "TRAINEE").first()
    org = db.query(Organization).first()
    fresh_user = User(
        email=f"blank_{uuid.uuid4().hex[:6]}@imd.gov.in",
        username=f"blank_{uuid.uuid4().hex[:6]}",
        hashed_password=get_password_hash("BlankUser123!"),
        first_name="Blank",
        last_name="User",
        role_id=trainee_role.id,
        organization_id=org.id,
        is_active=True,
        is_verified=True,
        account_status="ACTIVE",
    )
    db.add(fresh_user)
    db.commit()

    token = create_access_token(str(fresh_user.id), "TRAINEE")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/competencies/me", headers=headers)
    assert resp.status_code == 200
    comps = resp.json()
    for c in comps:
        assert c["current_level"] == 0.0
        assert c["level_name"] == "Not Demonstrated"
        assert c["integer_level"] == 0

    # Readiness should be 0.0
    readiness_resp = client.get("/api/v1/competencies/me/readiness", headers=headers)
    assert readiness_resp.status_code == 200
    assert readiness_resp.json()["overall_readiness_percentage"] == 0.0


def test_deterministic_repeated_calculations(auth_headers):
    """Verify that multiple successive evaluations yield identical deterministic results."""
    resp1 = client.get("/api/v1/competencies/me", headers=auth_headers["trainee"]).json()
    resp2 = client.get("/api/v1/competencies/me", headers=auth_headers["trainee"]).json()

    for c1, c2 in zip(resp1, resp2):
        assert c1["competency_id"] == c2["competency_id"]
        assert c1["current_level"] == c2["current_level"]
        assert c1["confidence_score"] == c2["confidence_score"]
        for e1, e2 in zip(c1["evidence"], c2["evidence"]):
            assert e1["score"] == e2["score"]
            assert e1["contribution"] == e2["contribution"]
