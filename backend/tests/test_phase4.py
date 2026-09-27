import uuid
from datetime import datetime, timezone, timedelta
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.session import SessionLocal
from app.models.user import User, Role
from app.models.course import Course, CourseCategory, CourseModule, Lesson, Enrollment
from app.models.assessment import (
    Assessment,
    Question,
    QuestionOption,
    AssessmentAttempt,
    AssessmentAnswer,
)
from app.models.notification import Notification
from app.core.security import create_access_token, get_password_hash

client = TestClient(app)


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def get_or_create_roles(db_session):
    roles = {}
    for r_name in ["TRAINEE", "TRAINER", "ADMIN"]:
        role = db_session.query(Role).filter(Role.name == r_name).first()
        if not role:
            role = Role(name=r_name, description=r_name)
            db_session.add(role)
            db_session.commit()
            db_session.refresh(role)
        roles[r_name] = role
    return roles


@pytest.fixture
def trainee_user(db_session, get_or_create_roles):
    uid = uuid.uuid4().hex[:6]
    user = User(
        email=f"trainee_p4_{uid}@imd.gov.in",
        username=f"trainee_p4_{uid}",
        hashed_password=get_password_hash("Password123!"),
        first_name="Trainee",
        last_name="P4",
        role_id=get_or_create_roles["TRAINEE"].id,
        is_active=True,
        is_verified=True,
        account_status="ACTIVE",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    token = create_access_token(str(user.id), "TRAINEE")
    return {"user": user, "headers": {"Authorization": f"Bearer {token}"}}


@pytest.fixture
def trainer_user(db_session, get_or_create_roles):
    uid = uuid.uuid4().hex[:6]
    user = User(
        email=f"trainer_p4_{uid}@imd.gov.in",
        username=f"trainer_p4_{uid}",
        hashed_password=get_password_hash("Password123!"),
        first_name="Trainer",
        last_name="P4",
        role_id=get_or_create_roles["TRAINER"].id,
        is_active=True,
        is_verified=True,
        account_status="ACTIVE",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    token = create_access_token(str(user.id), "TRAINER")
    return {"user": user, "headers": {"Authorization": f"Bearer {token}"}}


@pytest.fixture
def other_trainer_user(db_session, get_or_create_roles):
    uid = uuid.uuid4().hex[:6]
    user = User(
        email=f"othertrainer_{uid}@imd.gov.in",
        username=f"othertrainer_{uid}",
        hashed_password=get_password_hash("Password123!"),
        first_name="Other",
        last_name="Trainer",
        role_id=get_or_create_roles["TRAINER"].id,
        is_active=True,
        is_verified=True,
        account_status="ACTIVE",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    token = create_access_token(str(user.id), "TRAINER")
    return {"user": user, "headers": {"Authorization": f"Bearer {token}"}}


@pytest.fixture
def admin_user(db_session, get_or_create_roles):
    uid = uuid.uuid4().hex[:6]
    user = User(
        email=f"admin_p4_{uid}@imd.gov.in",
        username=f"admin_p4_{uid}",
        hashed_password=get_password_hash("Password123!"),
        first_name="Admin",
        last_name="P4",
        role_id=get_or_create_roles["ADMIN"].id,
        is_active=True,
        is_verified=True,
        account_status="ACTIVE",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    token = create_access_token(str(user.id), "ADMIN")
    return {"user": user, "headers": {"Authorization": f"Bearer {token}"}}


@pytest.fixture
def sample_course_with_assessment(db_session, trainer_user, trainee_user):
    category = db_session.query(CourseCategory).first()
    if not category:
        category = CourseCategory(name="Meteorology Category", code=f"MC_{uuid.uuid4().hex[:4]}")
        db_session.add(category)
        db_session.commit()

    course = Course(
        category_id=category.id,
        trainer_id=trainer_user["user"].id,
        title="Synoptic Analysis Test Course",
        code=f"SATC_{uuid.uuid4().hex[:4]}",
        description="Comprehensive training in synoptic charting",
        difficulty_level="INTERMEDIATE",
        duration_hours=20,
        status="PUBLISHED",
    )
    db_session.add(course)
    db_session.commit()

    # Enroll trainee
    enrollment = Enrollment(
        user_id=trainee_user["user"].id,
        course_id=course.id,
        status="ACTIVE",
    )
    db_session.add(enrollment)

    # Published Assessment with 2 questions
    assessment = Assessment(
        course_id=course.id,
        title="Synoptic Charting Evaluation",
        description="Standard evaluation covering weather symbols and fronts",
        assessment_type="MCQ",
        passing_percentage=60.0,
        total_marks=10.0,
        duration_minutes=30,
        max_attempts=2,
        status="PUBLISHED",
        due_at=datetime.now(timezone.utc) + timedelta(days=7),
    )
    db_session.add(assessment)
    db_session.flush()

    # Question 1: 5 marks
    q1 = Question(
        assessment_id=assessment.id,
        question_text="What does a red line with semicircles represent on a synoptic chart?",
        question_type="MCQ_SINGLE",
        marks=5.0,
        explanation="Red semicircles indicate a warm front moving in the direction of the semicircles.",
        order_index=1,
    )
    db_session.add(q1)
    db_session.flush()

    q1_opt1 = QuestionOption(question_id=q1.id, option_text="Warm front", is_correct=True, order_index=1)
    q1_opt2 = QuestionOption(question_id=q1.id, option_text="Cold front", is_correct=False, order_index=2)
    q1_opt3 = QuestionOption(question_id=q1.id, option_text="Occluded front", is_correct=False, order_index=3)
    db_session.add_all([q1_opt1, q1_opt2, q1_opt3])

    # Question 2: 5 marks
    q2 = Question(
        assessment_id=assessment.id,
        question_text="Which instrument measures atmospheric pressure?",
        question_type="MCQ_SINGLE",
        marks=5.0,
        explanation="Barometers measure atmospheric pressure in hPa or mmHg.",
        order_index=2,
    )
    db_session.add(q2)
    db_session.flush()

    q2_opt1 = QuestionOption(question_id=q2.id, option_text="Anemometer", is_correct=False, order_index=1)
    q2_opt2 = QuestionOption(question_id=q2.id, option_text="Barometer", is_correct=True, order_index=2)
    q2_opt3 = QuestionOption(question_id=q2.id, option_text="Hygrometer", is_correct=False, order_index=3)
    db_session.add_all([q2_opt1, q2_opt2, q2_opt3])

    # Unpublished assessment
    unpub_assessment = Assessment(
        course_id=course.id,
        title="Unpublished Draft Quiz",
        assessment_type="MCQ",
        passing_percentage=50.0,
        total_marks=5.0,
        duration_minutes=15,
        max_attempts=1,
        status="DRAFT",
    )
    db_session.add(unpub_assessment)

    db_session.commit()
    db_session.refresh(assessment)
    db_session.refresh(unpub_assessment)

    return {
        "course": course,
        "assessment": assessment,
        "unpub_assessment": unpub_assessment,
        "q1": q1,
        "q1_opts": {"correct": q1_opt1, "wrong": q1_opt2},
        "q2": q2,
        "q2_opts": {"correct": q2_opt2, "wrong": q2_opt1},
    }


# 1. Assessment listing
def test_trainee_assessment_listing(trainee_user, sample_course_with_assessment):
    res = client.get("/api/v1/assessments", headers=trainee_user["headers"])
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    item = next((a for a in data if a["id"] == str(sample_course_with_assessment["assessment"].id)), None)
    assert item is not None
    assert item["title"] == "Synoptic Charting Evaluation"
    assert item["questions_count"] == 2
    assert item["user_attempts_remaining"] == 2


# 2. Assessment details
def test_assessment_details(trainee_user, sample_course_with_assessment):
    ass_id = sample_course_with_assessment["assessment"].id
    res = client.get(f"/api/v1/assessments/{ass_id}", headers=trainee_user["headers"])
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == str(ass_id)
    assert len(data["questions"]) == 2


# 3. Trainee cannot access unpublished assessment
def test_trainee_cannot_access_unpublished_assessment(trainee_user, sample_course_with_assessment):
    unpub_id = sample_course_with_assessment["unpub_assessment"].id
    res = client.get(f"/api/v1/assessments/{unpub_id}", headers=trainee_user["headers"])
    assert res.status_code == 403


# 4. Assessment attempt creation
def test_assessment_attempt_creation(trainee_user, sample_course_with_assessment):
    ass_id = sample_course_with_assessment["assessment"].id
    res = client.post(f"/api/v1/assessments/{ass_id}/attempts", headers=trainee_user["headers"])
    assert res.status_code == 201
    data = res.json()
    assert "attempt_id" in data
    assert data["attempt_number"] == 1
    assert data["status"] == "IN_PROGRESS"
    assert data["remaining_seconds"] is not None
    assert data["remaining_seconds"] > 0


# 5. Attempt limit enforcement
def test_attempt_limit_enforcement(db_session, trainee_user, sample_course_with_assessment):
    ass_id = sample_course_with_assessment["assessment"].id
    # Submit first attempt
    r1 = client.post(f"/api/v1/assessments/{ass_id}/attempts", headers=trainee_user["headers"])
    att1_id = r1.json()["attempt_id"]
    client.post(f"/api/v1/assessments/attempts/{att1_id}/submit", json={"answers": []}, headers=trainee_user["headers"])

    # Submit second attempt
    r2 = client.post(f"/api/v1/assessments/{ass_id}/attempts", headers=trainee_user["headers"])
    att2_id = r2.json()["attempt_id"]
    client.post(f"/api/v1/assessments/attempts/{att2_id}/submit", json={"answers": []}, headers=trainee_user["headers"])

    # Third attempt should be rejected (max_attempts = 2)
    r3 = client.post(f"/api/v1/assessments/{ass_id}/attempts", headers=trainee_user["headers"])
    assert r3.status_code == 400
    assert "maximum" in r3.json()["detail"].lower()


# 6. Deadline enforcement
def test_deadline_enforcement(db_session, trainee_user, sample_course_with_assessment):
    ass = sample_course_with_assessment["assessment"]
    ass.due_at = datetime.now(timezone.utc) - timedelta(hours=1)
    db_session.commit()

    res = client.post(f"/api/v1/assessments/{ass.id}/attempts", headers=trainee_user["headers"])
    assert res.status_code == 400
    assert "deadline" in res.json()["detail"].lower()

    # Reset deadline for subsequent tests
    ass.due_at = datetime.now(timezone.utc) + timedelta(days=7)
    db_session.commit()


# 7. Correct answers hidden before submission
def test_correct_answers_hidden_before_submission(trainee_user, sample_course_with_assessment):
    ass_id = sample_course_with_assessment["assessment"].id
    res = client.post(f"/api/v1/assessments/{ass_id}/attempts", headers=trainee_user["headers"])
    data = res.json()
    for q in data["questions"]:
        assert q["explanation"] is None
        for opt in q["options"]:
            assert opt["is_correct"] is None


# 8 & 9 & 10. Valid MCQ submission, automatic grading, and PASS result
def test_valid_mcq_submission_and_pass_result(trainee_user, sample_course_with_assessment):
    ass_id = sample_course_with_assessment["assessment"].id
    r_start = client.post(f"/api/v1/assessments/{ass_id}/attempts", headers=trainee_user["headers"])
    attempt_id = r_start.json()["attempt_id"]

    q1 = sample_course_with_assessment["q1"]
    q2 = sample_course_with_assessment["q2"]
    q1_correct = sample_course_with_assessment["q1_opts"]["correct"]
    q2_correct = sample_course_with_assessment["q2_opts"]["correct"]

    # Submit all correct answers
    payload = {
        "answers": [
            {"question_id": str(q1.id), "selected_option_id": str(q1_correct.id)},
            {"question_id": str(q2.id), "selected_option_id": str(q2_correct.id)},
        ]
    }
    r_sub = client.post(f"/api/v1/assessments/attempts/{attempt_id}/submit", json=payload, headers=trainee_user["headers"])
    assert r_sub.status_code == 200
    result = r_sub.json()
    assert result["status"] == "EVALUATED"
    assert result["score_obtained"] == 10.0
    assert result["percentage"] == 100.0
    assert result["is_passed"] is True
    assert len(result["questions"]) == 2
    # Verify answers revealed on submission
    assert result["questions"][0]["is_correct"] is True
    assert result["questions"][0]["explanation"] is not None


# 11. Fail result grading
def test_fail_result_grading(db_session, trainee_user, sample_course_with_assessment):
    # Create another assessment with high passing percentage
    course = sample_course_with_assessment["course"]
    ass = Assessment(
        course_id=course.id,
        title="Radar Exam High Standard",
        passing_percentage=80.0,
        total_marks=10.0,
        status="PUBLISHED",
        max_attempts=3,
    )
    db_session.add(ass)
    db_session.flush()

    q = Question(assessment_id=ass.id, question_text="Sample Q", marks=10.0, order_index=1)
    db_session.add(q)
    db_session.flush()

    opt_correct = QuestionOption(question_id=q.id, option_text="Correct", is_correct=True, order_index=1)
    opt_wrong = QuestionOption(question_id=q.id, option_text="Wrong", is_correct=False, order_index=2)
    db_session.add_all([opt_correct, opt_wrong])
    db_session.commit()

    r_start = client.post(f"/api/v1/assessments/{ass.id}/attempts", headers=trainee_user["headers"])
    attempt_id = r_start.json()["attempt_id"]

    # Submit wrong answer
    payload = {"answers": [{"question_id": str(q.id), "selected_option_id": str(opt_wrong.id)}]}
    r_sub = client.post(f"/api/v1/assessments/attempts/{attempt_id}/submit", json=payload, headers=trainee_user["headers"])
    assert r_sub.status_code == 200
    result = r_sub.json()
    assert result["score_obtained"] == 0.0
    assert result["percentage"] == 0.0
    assert result["is_passed"] is False


# 12. Attempt history
def test_attempt_history(trainee_user, sample_course_with_assessment):
    ass_id = sample_course_with_assessment["assessment"].id
    r_start = client.post(f"/api/v1/assessments/{ass_id}/attempts", headers=trainee_user["headers"])
    att_id = r_start.json()["attempt_id"]
    client.post(f"/api/v1/assessments/attempts/{att_id}/submit", json={"answers": []}, headers=trainee_user["headers"])

    res = client.get("/api/v1/trainee/assessments/history", headers=trainee_user["headers"])
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1


# 13. Unauthorized attempt access
def test_unauthorized_attempt_access(db_session, trainee_user, sample_course_with_assessment, other_trainer_user):
    uid = uuid.uuid4().hex[:6]
    other_trainee = User(
        email=f"othertrainee_{uid}@imd.gov.in",
        username=f"othertrainee_{uid}",
        hashed_password=get_password_hash("Password123!"),
        first_name="Other",
        last_name="Trainee",
        role_id=trainee_user["user"].role_id,
        is_active=True,
        account_status="ACTIVE",
    )
    db_session.add(other_trainee)
    db_session.commit()
    other_token = create_access_token(str(other_trainee.id), "TRAINEE")
    other_headers = {"Authorization": f"Bearer {other_token}"}

    ass_id = sample_course_with_assessment["assessment"].id
    # Enrolled trainee creates attempt
    r_start = client.post(f"/api/v1/assessments/{ass_id}/attempts", headers=trainee_user["headers"])
    attempt_id = r_start.json()["attempt_id"]

    # Other trainee tries to access this attempt
    r_hack = client.get(f"/api/v1/assessments/attempts/{attempt_id}", headers=other_headers)
    assert r_hack.status_code == 403


# 14. Trainer assessment creation
def test_trainer_assessment_creation(trainer_user, sample_course_with_assessment):
    course = sample_course_with_assessment["course"]
    payload = {
        "course_id": str(course.id),
        "title": "Numerical Weather Prediction Quiz",
        "description": "NWP grid equations and boundary conditions",
        "assessment_type": "MCQ",
        "passing_percentage": 70.0,
        "total_marks": 50.0,
        "duration_minutes": 45,
        "max_attempts": 2,
        "status": "DRAFT",
    }
    res = client.post("/api/v1/trainer/assessments", json=payload, headers=trainer_user["headers"])
    assert res.status_code == 201
    assert "id" in res.json()


# 15. Trainer question creation with validation
def test_trainer_question_creation(trainer_user, sample_course_with_assessment):
    ass = sample_course_with_assessment["assessment"]
    payload = {
        "question_text": "Which parameter is conserved in adiabatic motion?",
        "question_type": "MCQ_SINGLE",
        "marks": 2.0,
        "explanation": "Potential temperature theta is conserved under dry adiabatic processes.",
        "order_index": 3,
        "options": [
            {"option_text": "Potential temperature", "is_correct": True, "order_index": 1},
            {"option_text": "Relative humidity", "is_correct": False, "order_index": 2},
        ],
    }
    res = client.post(f"/api/v1/trainer/assessments/{ass.id}/questions", json=payload, headers=trainer_user["headers"])
    assert res.status_code == 201
    assert "id" in res.json()


# 16. Trainer ownership protection
def test_trainer_ownership_protection(other_trainer_user, sample_course_with_assessment):
    ass = sample_course_with_assessment["assessment"]
    # other_trainer_user did not create this course/assessment
    payload = {
        "question_text": "Unauthorized question?",
        "marks": 1.0,
        "options": [
            {"option_text": "A", "is_correct": True},
            {"option_text": "B", "is_correct": False},
        ],
    }
    res = client.post(f"/api/v1/trainer/assessments/{ass.id}/questions", json=payload, headers=other_trainer_user["headers"])
    assert res.status_code == 403


# 17. Trainer performance endpoint
def test_trainer_performance_endpoint(trainer_user, sample_course_with_assessment):
    res = client.get("/api/v1/trainer/performance", headers=trainer_user["headers"])
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total_count" in data
    assert data["total_count"] >= 1


# 18. Admin user access
def test_admin_user_access(admin_user):
    res = client.get("/api/v1/admin/users", headers=admin_user["headers"])
    assert res.status_code == 200
    users = res.json()
    assert isinstance(users, list)
    assert len(users) >= 1


# 19. Admin-only endpoint protection
def test_admin_only_endpoint_protection(trainee_user, trainer_user):
    r1 = client.get("/api/v1/admin/dashboard", headers=trainee_user["headers"])
    assert r1.status_code == 403

    r2 = client.get("/api/v1/admin/dashboard", headers=trainer_user["headers"])
    assert r2.status_code == 403


# 20. Notification retrieval
def test_notification_retrieval(trainee_user, sample_course_with_assessment):
    ass_id = sample_course_with_assessment["assessment"].id
    r_start = client.post(f"/api/v1/assessments/{ass_id}/attempts", headers=trainee_user["headers"])
    att_id = r_start.json()["attempt_id"]
    # Submission creates ASSESSMENT_RESULT in-app notification
    client.post(f"/api/v1/assessments/attempts/{att_id}/submit", json={"answers": []}, headers=trainee_user["headers"])

    res = client.get("/api/v1/notifications", headers=trainee_user["headers"])
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "unread_count" in data
    assert len(data["items"]) >= 1
    assert data["unread_count"] >= 1


# 21. Notification read state
def test_notification_read_state(db_session, trainee_user):
    notification = Notification(
        user_id=trainee_user["user"].id,
        title="Test Alert",
        message="A test notification message",
        notification_type="SYSTEM",
        is_read=False,
    )
    db_session.add(notification)
    db_session.commit()
    db_session.refresh(notification)

    res = client.patch(f"/api/v1/notifications/{notification.id}/read", headers=trainee_user["headers"])
    assert res.status_code == 200
    assert res.json()["is_read"] is True
