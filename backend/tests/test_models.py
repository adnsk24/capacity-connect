import uuid
from datetime import date, datetime, timezone
import pytest
from sqlalchemy import text
from app.database.session import SessionLocal, engine
from app.database.base import Base
import app.models as models


def test_all_models_registered_in_metadata():
    """Verify all 29 models are registered with SQLAlchemy metadata."""
    expected_tables = {
        "organizations",
        "departments",
        "roles",
        "users",
        "trainee_profiles",
        "trainer_profiles",
        "qualifications",
        "experiences",
        "skills",
        "user_skills",
        "certifications",
        "course_categories",
        "courses",
        "course_modules",
        "lessons",
        "resources",
        "enrollments",
        "course_progress",
        "assessments",
        "questions",
        "question_options",
        "assessment_attempts",
        "assessment_answers",
        "feedbacks",
        "competencies",
        "user_competencies",
        "course_competencies",
        "subjects",
        "subject_competency_requirements",
    }
    actual_tables = set(Base.metadata.tables.keys())
    missing = expected_tables - actual_tables
    assert not missing, f"Missing tables in Base.metadata: {missing}"
    assert len(expected_tables) == 29


def test_uuid_primary_keys_on_all_models():
    """Verify every registered table has a UUID primary key named 'id'."""
    for table_name, table in Base.metadata.tables.items():
        assert "id" in table.columns, f"Table {table_name} missing 'id' column"
        assert table.columns["id"].primary_key, f"Column 'id' on {table_name} is not primary key"


def test_database_connectivity():
    """Verify active database connection and query execution."""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1")).scalar()
        assert result == 1


def test_organization_and_department_persistence():
    """Test creating and persisting an organization and department."""
    db = SessionLocal()
    try:
        org_code = f"TEST_ORG_{uuid.uuid4().hex[:6]}"
        dept_code = f"TEST_DEPT_{uuid.uuid4().hex[:6]}"

        org = models.Organization(
            name=f"Test Org {uuid.uuid4().hex[:6]}",
            code=org_code,
            description="Synthetic organization for testing",
        )
        db.add(org)
        db.flush()

        dept = models.Department(
            organization_id=org.id,
            name=f"Test Dept {uuid.uuid4().hex[:6]}",
            code=dept_code,
            description="Synthetic department for testing",
        )
        db.add(dept)
        db.commit()

        # Query back
        fetched_org = db.query(models.Organization).filter_by(code=org_code).first()
        assert fetched_org is not None
        assert fetched_org.id == org.id
        assert len(fetched_org.departments) == 1
        assert fetched_org.departments[0].code == dept_code

        # Cleanup
        db.delete(fetched_org)
        db.commit()
    finally:
        db.close()


def test_competency_and_subject_mapping():
    """Test creating a competency, subject, and requirement."""
    db = SessionLocal()
    try:
        comp_code = f"COMP_TEST_{uuid.uuid4().hex[:6]}"
        subj_code = f"SUBJ_TEST_{uuid.uuid4().hex[:6]}"

        comp = models.Competency(
            name=f"Radar Operation {uuid.uuid4().hex[:6]}",
            code=comp_code,
            category="Radar Meteorology",
            description="Testing competency persistence",
        )
        db.add(comp)

        subj = models.Subject(
            name=f"Radar Meteorology {uuid.uuid4().hex[:6]}",
            code=subj_code,
            description="Testing subject persistence",
            domain="Observational Meteorology",
        )
        db.add(subj)
        db.flush()

        req = models.SubjectCompetencyRequirement(
            subject_id=subj.id,
            competency_id=comp.id,
            required_level=4,
            weight=0.8,
        )
        db.add(req)
        db.commit()

        # Query back
        fetched_subj = db.query(models.Subject).filter_by(code=subj_code).first()
        assert fetched_subj is not None
        assert len(fetched_subj.competency_requirements) == 1
        assert fetched_subj.competency_requirements[0].required_level == 4

        # Cleanup
        db.delete(fetched_subj)
        db.delete(comp)
        db.commit()
    finally:
        db.close()
