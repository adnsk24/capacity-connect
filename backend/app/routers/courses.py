import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user, get_current_active_user, get_optional_current_user
from app.models.user import User
from app.schemas.course import (
    CourseCatalogueResponse,
    CourseCategoryResponse,
    CourseDetailResponse,
    ResourceResponse,
    ResourceCreateRequest,
)
from app.schemas.enrollment import (
    EnrollmentResponse,
    LessonCompletionResponse,
)
from app.services.course_service import CourseService
from app.services.enrollment_service import EnrollmentService
from app.services.progress_service import ProgressService
from app.services.resource_service import ResourceService

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get(
    "",
    response_model=CourseCatalogueResponse,
    summary="List and filter courses in the catalogue",
)
def list_courses(
    search: Optional[str] = Query(None, description="Search by title, description, or code"),
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by course category UUID"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: BEGINNER, INTERMEDIATE, ADVANCED"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(12, ge=1, le=50, description="Items per page"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
) -> CourseCatalogueResponse:
    """Returns paginated courses catalogue with search and category filtering."""
    return CourseService.list_courses(
        db=db,
        search=search,
        category_id=category_id,
        difficulty_level=difficulty,
        page=page,
        page_size=page_size,
        current_user=current_user,
    )


@router.get(
    "/categories",
    response_model=List[CourseCategoryResponse],
    summary="List all course categories",
)
def get_categories(
    db: Session = Depends(get_db),
) -> List[CourseCategoryResponse]:
    """Returns all available course categories."""
    return CourseService.get_categories(db)


@router.get(
    "/{course_id}",
    response_model=CourseDetailResponse,
    summary="Get course details with modules, syllabus, and enrollment status",
)
def get_course_details(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
) -> CourseDetailResponse:
    """Returns complete course details, syllabus hierarchy, and enrollment context."""
    return CourseService.get_course_details(
        db=db,
        course_id=course_id,
        current_user=current_user,
    )


@router.post(
    "/{course_id}/enroll",
    response_model=EnrollmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Enroll authenticated trainee in a published course",
)
def enroll_course(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> EnrollmentResponse:
    """Enrolls the authenticated user into the specified course."""
    return EnrollmentService.enroll_in_course(
        db=db,
        current_user=current_user,
        course_id=course_id,
    )


@router.get(
    "/{course_id}/learn",
    response_model=CourseDetailResponse,
    summary="Get learning content for an enrolled trainee",
)
def get_learning_content(
    course_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> CourseDetailResponse:
    """Returns complete course curriculum and lesson completion flags for enrolled trainee."""
    return ProgressService.get_learning_content(
        db=db,
        current_user=current_user,
        course_id=course_id,
    )


@router.post(
    "/{course_id}/lessons/{lesson_id}/complete",
    response_model=LessonCompletionResponse,
    summary="Mark lesson complete and update course progress metrics",
)
def complete_lesson(
    course_id: uuid.UUID,
    lesson_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> LessonCompletionResponse:
    """Records completion of an individual instructional lesson and recalculates course progress."""
    return ProgressService.complete_lesson(
        db=db,
        current_user=current_user,
        course_id=course_id,
        lesson_id=lesson_id,
    )


# --- Media & Learning Resource Endpoints ---

@router.get(
    "/{course_id}/resources",
    response_model=List[ResourceResponse],
    summary="List course learning resources",
)
def list_course_resources(
    course_id: uuid.UUID,
    module_id: Optional[uuid.UUID] = Query(None, description="Optional module filter"),
    lesson_id: Optional[uuid.UUID] = Query(None, description="Optional lesson filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[ResourceResponse]:
    """Returns learning resources. Enforces enrollment & published status for trainees."""
    return ResourceService.list_course_resources(
        db=db,
        course_id=course_id,
        current_user=current_user,
        module_id=module_id,
        lesson_id=lesson_id,
    )


@router.get(
    "/{course_id}/modules/{module_id}/resources",
    response_model=List[ResourceResponse],
    summary="List resources for a specific course module",
)
def list_module_resources(
    course_id: uuid.UUID,
    module_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[ResourceResponse]:
    """Returns published resources attached to a course module."""
    return ResourceService.list_course_resources(
        db=db,
        course_id=course_id,
        current_user=current_user,
        module_id=module_id,
    )


@router.get(
    "/{course_id}/lessons/{lesson_id}/resources",
    response_model=List[ResourceResponse],
    summary="List resources for a specific lesson",
)
def list_lesson_resources(
    course_id: uuid.UUID,
    lesson_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[ResourceResponse]:
    """Returns published resources attached to a course lesson."""
    return ResourceService.list_course_resources(
        db=db,
        course_id=course_id,
        current_user=current_user,
        lesson_id=lesson_id,
    )


@router.post(
    "/{course_id}/resources",
    response_model=ResourceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add learning resource to course via JSON (external video, doc link, etc.)",
)
def create_course_resource(
    course_id: uuid.UUID,
    data: ResourceCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ResourceResponse:
    """Creates a learning resource. Verifies trainer ownership or admin role."""
    return ResourceService.create_resource(
        db=db,
        course_id=course_id,
        data=data,
        current_user=current_user,
    )


@router.post(
    "/{course_id}/resources/upload",
    response_model=ResourceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload media file (video, audio, document) to course",
)
async def upload_course_resource(
    course_id: uuid.UUID,
    file: UploadFile = File(..., description="Media or document file"),
    title: str = Form(..., description="Resource title"),
    resource_type: str = Form(..., description="VIDEO, AUDIO, DOCUMENT, PRESENTATION, etc."),
    description: Optional[str] = Form(None),
    module_id: Optional[uuid.UUID] = Form(None),
    lesson_id: Optional[uuid.UUID] = Form(None),
    thumbnail_file: Optional[UploadFile] = File(None),
    duration_seconds: Optional[int] = Form(None),
    display_order: int = Form(0),
    is_published: bool = Form(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ResourceResponse:
    """Uploads and saves course media with server-side MIME type and file size validation."""
    return await ResourceService.upload_resource_file(
        db=db,
        course_id=course_id,
        current_user=current_user,
        file=file,
        title=title,
        resource_type=resource_type,
        description=description,
        module_id=module_id,
        lesson_id=lesson_id,
        thumbnail_file=thumbnail_file,
        duration_seconds=duration_seconds,
        display_order=display_order,
        is_published=is_published,
    )
