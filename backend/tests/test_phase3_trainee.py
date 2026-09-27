import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.session import SessionLocal
from app.models.user import User, Role
from app.models.course import Course, CourseCategory, CourseModule, Lesson, Enrollment, CourseProgress
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
def auth_headers(db_session):
    """Creates a fresh active Trainee and returns Bearer auth header and user."""
    unique_id = uuid.uuid4().hex[:6]
    trainee_role = db_session.query(Role).filter(Role.name == "TRAINEE").first()
    if not trainee_role:
        trainee_role = Role(name="TRAINEE", description="Trainee")
        db_session.add(trainee_role)
        db_session.commit()

    user = User(
        email=f"trainee_test_{unique_id}@example.com",
        username=f"trainee_test_{unique_id}",
        hashed_password=get_password_hash("Password123!"),
        first_name="Test",
        last_name="Trainee",
        role_id=trainee_role.id,
        is_active=True,
        is_verified=True,
        account_status="ACTIVE",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(str(user.id), "TRAINEE")
    headers = {"Authorization": f"Bearer {token}"}
    return headers, user


@pytest.fixture
def published_course(db_session):
    """Retrieves or creates a published course with modules and lessons."""
    category = db_session.query(CourseCategory).first()
    if not category:
        category = CourseCategory(name="Test Cat", code="TCAT")
        db_session.add(category)
        db_session.commit()

    unique_code = f"TEST-{uuid.uuid4().hex[:4].upper()}"
    course = Course(
        title="Test Radar Course",
        code=unique_code,
        category_id=category.id,
        status="PUBLISHED",
        difficulty_level="BEGINNER",
        duration_hours=20,
    )
    db_session.add(course)
    db_session.commit()

    module = CourseModule(course_id=course.id, title="Module 1", order_index=1)
    db_session.add(module)
    db_session.commit()

    lesson1 = Lesson(module_id=module.id, title="Lesson 1", order_index=1, duration_minutes=30)
    lesson2 = Lesson(module_id=module.id, title="Lesson 2", order_index=2, duration_minutes=45)
    db_session.add_all([lesson1, lesson2])
    db_session.commit()

    db_session.refresh(course)
    return course, [lesson1, lesson2]


# 1. Course List (Public & Authenticated)
def test_course_list_retrieval():
    response = client.get("/api/v1/courses")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1


# 2. Course Filtering and Search
def test_course_search_and_filter():
    response = client.get("/api/v1/courses?search=Radar")
    assert response.status_code == 200
    data = response.json()
    assert all("radar" in item["title"].lower() or "radar" in (item["description"] or "").lower() for item in data["items"])


def test_course_difficulty_filter():
    response = client.get("/api/v1/courses?difficulty=BEGINNER")
    assert response.status_code == 200
    data = response.json()
    assert all(item["difficulty_level"] == "BEGINNER" for item in data["items"])


# 3. Course Details
def test_course_details_endpoint(published_course):
    course, lessons = published_course
    response = client.get(f"/api/v1/courses/{course.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(course.id)
    assert data["title"] == course.title
    assert len(data["modules"]) >= 1
    assert len(data["modules"][0]["lessons"]) == 2


# 4. Trainee Profile Retrieval & Dynamic Completion
def test_trainee_profile_retrieval(auth_headers):
    headers, user = auth_headers
    response = client.get("/api/v1/trainee/profile", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(user.id)
    assert data["email"] == user.email
    assert "profile_completion_percentage" in data
    assert isinstance(data["profile_completion_percentage"], float)


# 5. Trainee Profile Update
def test_trainee_profile_update(auth_headers):
    headers, user = auth_headers
    update_payload = {
        "first_name": "UpdatedName",
        "last_name": "UpdatedLast",
        "phone_number": "+91 99999 88888",
        "designation": "Assistant Meteorologist",
        "bio": "Experienced weather observer",
        "qualifications": [
            {
                "degree": "B.Sc Physics",
                "institution": "Delhi University",
                "year_of_passing": 2020,
            }
        ],
        "experiences": [
            {
                "title": "Observational Assistant",
                "organization_name": "Regional Met Centre",
                "start_date": "2021-01-15",
                "is_current": True,
            }
        ],
        "skills": [
            {
                "name": "Radar Analysis",
                "proficiency_level": "INTERMEDIATE",
                "years_of_experience": 2.0,
            }
        ],
    }
    response = client.put("/api/v1/trainee/profile", json=update_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "UpdatedName"
    assert data["designation"] == "Assistant Meteorologist"
    assert len(data["qualifications"]) == 1
    assert len(data["experiences"]) == 1
    assert len(data["skills"]) == 1
    # Profile completion should be high after updating all sections
    assert data["profile_completion_percentage"] >= 80.0


# 6. Profile Ownership Protection (Unauthenticated rejection)
def test_profile_requires_authentication():
    response = client.get("/api/v1/trainee/profile")
    assert response.status_code == 401


# 7. Enrollment Success & Progress Initialization
def test_enrollment_success(auth_headers, published_course):
    headers, user = auth_headers
    course, lessons = published_course

    response = client.post(f"/api/v1/courses/{course.id}/enroll", headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["course_id"] == str(course.id)
    assert data["status"] == "ENROLLED"
    assert data["progress"]["completion_percentage"] == 0.0
    assert data["progress"]["completed_lessons_count"] == 0
    assert data["progress"]["total_lessons_count"] == 2


# 8. Duplicate Enrollment Prevention
def test_duplicate_enrollment_rejected(auth_headers, published_course):
    headers, user = auth_headers
    course, lessons = published_course

    # First enrollment
    res1 = client.post(f"/api/v1/courses/{course.id}/enroll", headers=headers)
    assert res1.status_code == 201

    # Second enrollment attempt must fail
    res2 = client.post(f"/api/v1/courses/{course.id}/enroll", headers=headers)
    assert res2.status_code == 400
    assert "Already enrolled" in res2.json()["detail"]


# 9. Unpublished Course Enrollment Rejection
def test_unpublished_course_enrollment_rejected(auth_headers, db_session):
    headers, user = auth_headers
    cat = db_session.query(CourseCategory).first()
    draft_course = Course(
        title="Draft Course",
        code=f"DRAFT-{uuid.uuid4().hex[:4]}",
        category_id=cat.id,
        status="DRAFT",
    )
    db_session.add(draft_course)
    db_session.commit()

    response = client.post(f"/api/v1/courses/{draft_course.id}/enroll", headers=headers)
    assert response.status_code == 400
    assert "unpublished" in response.json()["detail"].lower()


# 10. Lesson Completion & Progress Calculation
def test_lesson_completion_and_progress_flow(auth_headers, published_course):
    headers, user = auth_headers
    course, lessons = published_course

    # Enroll
    client.post(f"/api/v1/courses/{course.id}/enroll", headers=headers)

    # Complete Lesson 1 (out of 2 lessons -> 50% progress)
    res_l1 = client.post(f"/api/v1/courses/{course.id}/lessons/{lessons[0].id}/complete", headers=headers)
    assert res_l1.status_code == 200
    data_l1 = res_l1.json()
    assert data_l1["progress"]["completed_lessons_count"] == 1
    assert data_l1["progress"]["completion_percentage"] == 50.0
    assert data_l1["progress"]["is_completed"] is False

    # Complete Lesson 2 (out of 2 lessons -> 100% progress and course completion)
    res_l2 = client.post(f"/api/v1/courses/{course.id}/lessons/{lessons[1].id}/complete", headers=headers)
    assert res_l2.status_code == 200
    data_l2 = res_l2.json()
    assert data_l2["progress"]["completed_lessons_count"] == 2
    assert data_l2["progress"]["completion_percentage"] == 100.0
    assert data_l2["progress"]["is_completed"] is True


# 11. Unauthorized Lesson Completion (Not Enrolled)
def test_unauthorized_lesson_completion(auth_headers, published_course):
    headers, user = auth_headers
    course, lessons = published_course

    # Attempt to complete without enrolling
    response = client.post(f"/api/v1/courses/{course.id}/lessons/{lessons[0].id}/complete", headers=headers)
    assert response.status_code == 403


# 12. Invalid Lesson Completion (Lesson from another course)
def test_invalid_lesson_completion_rejected(auth_headers, published_course, db_session):
    headers, user = auth_headers
    course, lessons = published_course

    # Enroll in course
    client.post(f"/api/v1/courses/{course.id}/enroll", headers=headers)

    # Create another course with a different lesson
    cat = db_session.query(CourseCategory).first()
    other_course = Course(title="Other", code=f"OTH-{uuid.uuid4().hex[:4]}", category_id=cat.id, status="PUBLISHED")
    db_session.add(other_course)
    db_session.commit()
    mod = CourseModule(course_id=other_course.id, title="M", order_index=1)
    db_session.add(mod)
    db_session.commit()
    foreign_lesson = Lesson(module_id=mod.id, title="Foreign", order_index=1)
    db_session.add(foreign_lesson)
    db_session.commit()

    response = client.post(f"/api/v1/courses/{course.id}/lessons/{foreign_lesson.id}/complete", headers=headers)
    assert response.status_code == 400
    assert "belong to this course" in response.json()["detail"]


# 13. My Learning Retrieval
def test_my_learning_endpoint(auth_headers, published_course):
    headers, user = auth_headers
    course, lessons = published_course

    # Enroll
    client.post(f"/api/v1/courses/{course.id}/enroll", headers=headers)

    response = client.get("/api/v1/trainee/learning", headers=headers)
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    assert items[0]["course_id"] == str(course.id)
    assert items[0]["title"] == course.title


# 14. Trainee Dashboard Retrieval
def test_trainee_dashboard_data(auth_headers, published_course):
    headers, user = auth_headers
    course, lessons = published_course

    # Enroll in course
    client.post(f"/api/v1/courses/{course.id}/enroll", headers=headers)

    response = client.get("/api/v1/trainee/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "welcome_message" in data
    assert data["courses_enrolled_count"] >= 1
    assert len(data["recent_learning"]) >= 1
