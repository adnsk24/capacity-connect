import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import require_roles
from app.models.user import User
from app.models.assessment import AssessmentAttempt
from app.schemas.trainer import (
    TrainerDashboardStats,
    TrainerCourseCreate,
    TrainerCourseUpdate,
    TrainerCourseListItem,
    TrainerCourseDetailResponse,
    ModuleCreate,
    LessonCreate,
    ResourceCreate,
    TraineePerformanceResponse,
)
from app.schemas.assessment import (
    AssessmentListItem,
    AssessmentDetail,
    AssessmentCreate,
    AssessmentUpdate,
    QuestionCreate,
    AssessmentAttemptHistoryItem,
)
from app.services.trainer_service import TrainerService
from app.services.assessment_service import AssessmentService

router = APIRouter(prefix="/trainer", tags=["Trainer Portal"])


@router.get(
    "/dashboard",
    response_model=TrainerDashboardStats,
    summary="Get trainer dashboard statistics",
)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    return TrainerService.get_dashboard_stats(db, current_user)


@router.get(
    "/courses",
    response_model=List[TrainerCourseListItem],
    summary="List courses managed by trainer",
)
def list_trainer_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    courses = TrainerService.list_courses(db, current_user)
    return [
        TrainerCourseListItem(
            id=c.id,
            title=c.title,
            code=c.code,
            description=c.description,
            category_id=c.category_id,
            category_name=c.category.name if c.category else "",
            difficulty_level=c.difficulty_level,
            duration_hours=c.duration_hours,
            status=c.status,
            thumbnail_url=c.thumbnail_url,
            enrolled_count=len(c.enrollments),
            modules_count=len(c.modules),
            published_at=c.published_at,
        )
        for c in courses
    ]


@router.post(
    "/courses",
    response_model=TrainerCourseListItem,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new course",
)
def create_course(
    data: TrainerCourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    c = TrainerService.create_course(db, data, current_user)
    return TrainerCourseListItem(
        id=c.id,
        title=c.title,
        code=c.code,
        description=c.description,
        category_id=c.category_id,
        category_name=c.category.name if c.category else "",
        difficulty_level=c.difficulty_level,
        duration_hours=c.duration_hours,
        status=c.status,
        thumbnail_url=c.thumbnail_url,
        enrolled_count=0,
        modules_count=0,
        published_at=c.published_at,
    )


@router.get(
    "/courses/{course_id}",
    response_model=TrainerCourseDetailResponse,
    summary="Get course detail for management",
)
def get_trainer_course_detail(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    c = TrainerService.get_course(db, course_id, current_user)
    # Map to TrainerCourseDetailResponse
    modules = [
        {
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "order_index": m.order_index,
            "lessons": [
                {
                    "id": l.id,
                    "title": l.title,
                    "description": l.description,
                    "content_type": l.content_type,
                    "content_body": l.content_body,
                    "duration_minutes": l.duration_minutes,
                    "order_index": l.order_index,
                    "is_mandatory": l.is_mandatory,
                }
                for l in sorted(m.lessons, key=lambda x: x.order_index)
            ],
        }
        for m in sorted(c.modules, key=lambda x: x.order_index)
    ]
    resources = [
        {
            "id": r.id,
            "title": r.title,
            "resource_type": r.resource_type,
            "file_url": r.file_url,
            "description": r.description,
        }
        for r in c.resources
    ]
    return TrainerCourseDetailResponse(
        id=c.id,
        title=c.title,
        code=c.code,
        description=c.description,
        category_id=c.category_id,
        category_name=c.category.name if c.category else "",
        difficulty_level=c.difficulty_level,
        duration_hours=c.duration_hours,
        status=c.status,
        thumbnail_url=c.thumbnail_url,
        published_at=c.published_at,
        objectives=c.objectives,
        prerequisites=c.prerequisites,
        trainer_name=f"{c.trainer.first_name} {c.trainer.last_name}" if c.trainer else None,
        modules=modules,
        resources=resources,
    )


@router.patch(
    "/courses/{course_id}",
    summary="Update course attributes",
)
def update_course(
    course_id: uuid.UUID,
    data: TrainerCourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    c = TrainerService.update_course(db, course_id, data, current_user)
    return {"message": "Course updated successfully.", "id": str(c.id), "status": c.status}


@router.post(
    "/courses/{course_id}/modules",
    status_code=status.HTTP_201_CREATED,
    summary="Add module to course",
)
def add_module(
    course_id: uuid.UUID,
    data: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    m = TrainerService.add_module(db, course_id, data, current_user)
    return {"message": "Module created successfully.", "id": str(m.id)}


@router.post(
    "/courses/{course_id}/modules/{module_id}/lessons",
    status_code=status.HTTP_201_CREATED,
    summary="Add lesson to module",
)
def add_lesson(
    course_id: uuid.UUID,
    module_id: uuid.UUID,
    data: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    l = TrainerService.add_lesson(db, course_id, module_id, data, current_user)
    return {"message": "Lesson created successfully.", "id": str(l.id)}


@router.post(
    "/courses/{course_id}/resources",
    status_code=status.HTTP_201_CREATED,
    summary="Add learning resource to course",
)
def add_resource(
    course_id: uuid.UUID,
    data: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    r = TrainerService.add_resource(db, course_id, data, current_user)
    return {"message": "Resource added successfully.", "id": str(r.id)}


# --- Trainer Assessment Authoring ---

@router.get(
    "/assessments",
    response_model=List[AssessmentListItem],
    summary="List assessments managed by trainer",
)
def list_trainer_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    return AssessmentService.list_trainer_assessments(db, current_user)


@router.post(
    "/assessments",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new assessment",
)
def create_assessment(
    data: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    a = AssessmentService.create_assessment(db, data, current_user)
    return {"message": "Assessment created successfully.", "id": str(a.id)}


@router.get(
    "/assessments/{assessment_id}",
    response_model=AssessmentDetail,
    summary="Get assessment authoring details (with answers)",
)
def get_trainer_assessment(
    assessment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    return AssessmentService.get_assessment_for_trainer(db, assessment_id, current_user)


@router.patch(
    "/assessments/{assessment_id}",
    summary="Update assessment metadata or published state",
)
def update_assessment(
    assessment_id: uuid.UUID,
    data: AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    a = AssessmentService.update_assessment(db, assessment_id, data, current_user)
    return {"message": "Assessment updated successfully.", "id": str(a.id)}


@router.delete(
    "/assessments/{assessment_id}",
    summary="Delete an assessment",
)
def delete_assessment(
    assessment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    return AssessmentService.delete_assessment(db, assessment_id, current_user)


@router.post(
    "/assessments/{assessment_id}/questions",
    status_code=status.HTTP_201_CREATED,
    summary="Add an MCQ question to assessment",
)
def add_question(
    assessment_id: uuid.UUID,
    data: QuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    q = AssessmentService.add_question(db, assessment_id, data, current_user)
    return {"message": "Question added successfully.", "id": str(q.id)}


@router.delete(
    "/questions/{question_id}",
    summary="Delete a question",
)
def delete_question(
    question_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    return AssessmentService.delete_question(db, question_id, current_user)


@router.get(
    "/assessments/{assessment_id}/results",
    response_model=List[AssessmentAttemptHistoryItem],
    summary="Get trainee attempt results for assessment",
)
def get_assessment_results(
    assessment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    attempts = (
        db.query(AssessmentAttempt)
        .filter(AssessmentAttempt.assessment_id == assessment_id)
        .order_by(AssessmentAttempt.submitted_at.desc())
        .all()
    )
    return [
        AssessmentAttemptHistoryItem(
            attempt_id=att.id,
            assessment_id=att.assessment_id,
            assessment_title=att.assessment.title if att.assessment else "",
            course_title=att.assessment.course.title if att.assessment and att.assessment.course else "",
            attempt_number=att.attempt_number,
            status=att.status,
            total_marks=att.assessment.total_marks if att.assessment else 100.0,
            score_obtained=att.score_obtained,
            percentage=att.percentage,
            is_passed=att.is_passed,
            started_at=att.started_at,
            submitted_at=att.submitted_at,
        )
        for att in attempts
    ]


@router.get(
    "/performance",
    response_model=TraineePerformanceResponse,
    summary="Trainee performance monitoring across managed courses",
)
def get_performance(
    course_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["TRAINER", "ADMIN"])),
):
    return TrainerService.get_trainee_performance(
        db, current_user, course_id=course_id, search=search, page=page, page_size=page_size
    )
