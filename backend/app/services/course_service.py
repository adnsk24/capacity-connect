import uuid
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models.course import Course, CourseCategory, CourseModule, Lesson, Resource, ResourceCompletion, Enrollment, CourseProgress, LessonCompletion
from app.models.assessment import Assessment
from app.models.user import User
from app.schemas.course import (
    CourseCatalogueResponse,
    CourseCardResponse,
    CourseCategoryResponse,
    CourseDetailResponse,
    CourseModuleResponse,
    LessonResponse,
    ResourceResponse,
    TrainerSummaryResponse,
    CompetencyTagResponse,
)


class CourseService:
    @staticmethod
    def get_categories(db: Session) -> List[CourseCategoryResponse]:
        categories = db.query(CourseCategory).order_by(CourseCategory.name.asc()).all()
        course_counts = dict(
            db.query(Course.category_id, func.count(Course.id))
            .filter(Course.status == "PUBLISHED")
            .group_by(Course.category_id)
            .all()
        )
        res: List[CourseCategoryResponse] = []
        for c in categories:
            cat_dto = CourseCategoryResponse.model_validate(c)
            cat_dto.course_count = course_counts.get(c.id, 0)
            res.append(cat_dto)
        return res

    @staticmethod
    def list_courses(
        db: Session,
        search: Optional[str] = None,
        category_id: Optional[uuid.UUID] = None,
        difficulty_level: Optional[str] = None,
        page: int = 1,
        page_size: int = 12,
        current_user: Optional[User] = None,
    ) -> CourseCatalogueResponse:
        query = db.query(Course).filter(Course.status == "PUBLISHED")

        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter(
                (Course.title.ilike(search_term))
                | (Course.description.ilike(search_term))
                | (Course.code.ilike(search_term))
            )

        if category_id:
            query = query.filter(Course.category_id == category_id)

        if difficulty_level:
            query = query.filter(Course.difficulty_level == difficulty_level.upper())

        total = query.count()
        total_pages = max(1, (total + page_size - 1) // page_size)
        offset = (page - 1) * page_size

        courses = (
            query.options(
                joinedload(Course.category),
                joinedload(Course.trainer),
                joinedload(Course.modules).joinedload(CourseModule.lessons),
                joinedload(Course.course_competencies),
                joinedload(Course.assessments).joinedload(Assessment.questions),
                joinedload(Course.enrollments),
            )
            .order_by(Course.created_at.asc())
            .offset(offset)
            .limit(page_size)
            .all()
        )

        user_enrollments_map = {}
        if current_user:
            course_ids = [c.id for c in courses]
            enrollments = (
                db.query(Enrollment)
                .options(joinedload(Enrollment.progress))
                .filter(Enrollment.user_id == current_user.id, Enrollment.course_id.in_(course_ids))
                .all()
            )
            for en in enrollments:
                user_enrollments_map[en.course_id] = en

        items: List[CourseCardResponse] = []
        for course in courses:
            total_modules = len(course.modules)
            total_lessons = sum(len(m.lessons) for m in course.modules)

            competency_names = []
            for cc in course.course_competencies:
                if cc.competency:
                    competency_names.append(cc.competency.name)

            trainer_summary = None
            if course.trainer:
                trainer_profile = course.trainer.trainer_profile
                trainer_summary = TrainerSummaryResponse(
                    id=course.trainer.id,
                    first_name=course.trainer.first_name,
                    last_name=course.trainer.last_name,
                    email=course.trainer.email,
                    avatar_url=course.trainer.avatar_url,
                    designation=trainer_profile.designation if trainer_profile else None,
                    specialization=trainer_profile.specialization if trainer_profile else None,
                )

            en = user_enrollments_map.get(course.id)
            is_enrolled = en is not None
            enrollment_status = en.status if en else None
            progress_pct = en.progress.completion_percentage if en and en.progress else None

            module_names = [m.title for m in course.modules]

            assessment_labels = []
            for a in course.assessments:
                q_count = len(a.questions) if a.questions else 0
                if "MCQ" in a.title.upper() or a.assessment_type == "MCQ":
                    assessment_labels.append(f"{q_count} MCQs" if q_count > 1 else "MCQ Exam")
                elif a.assessment_type == "PRACTICAL":
                    assessment_labels.append("Practical Lab")
                elif a.assessment_type == "ASSIGNMENT":
                    assessment_labels.append("Assignment")
                elif a.assessment_type == "SCENARIO":
                    assessment_labels.append("Scenario Test")
                elif a.assessment_type == "EXAM":
                    assessment_labels.append("Final Exam")
                elif a.assessment_type == "QUIZ":
                    assessment_labels.append("Quiz")
                else:
                    assessment_labels.append(a.title or a.assessment_type)

            if not assessment_labels:
                assessment_labels = ["Operational Assessment"]

            passing_str = "60% Pass Mark"
            if course.assessments and len(course.assessments) > 0:
                passing_str = f"{int(course.assessments[0].passing_percentage)}% Pass Mark"

            enrollment_count = len(course.enrollments) if course.enrollments else 0

            items.append(
                CourseCardResponse(
                    id=course.id,
                    code=course.code,
                    title=course.title,
                    description=course.description,
                    category_id=course.category_id,
                    category_name=course.category.name if course.category else "General",
                    category_code=course.category.code if course.category else "GEN",
                    difficulty_level=course.difficulty_level,
                    duration_hours=course.duration_hours,
                    thumbnail_url=course.thumbnail_url,
                    trainer=trainer_summary,
                    total_modules=total_modules,
                    total_lessons=total_lessons,
                    competencies=competency_names,
                    is_enrolled=is_enrolled,
                    enrollment_status=enrollment_status,
                    progress_percentage=progress_pct,
                    module_names=module_names,
                    assessment_types=assessment_labels,
                    passing_marks=passing_str,
                    enrollment_count=enrollment_count,
                )
            )

        categories = CourseService.get_categories(db)

        return CourseCatalogueResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            categories=categories,
        )

    @staticmethod
    def get_course_details(
        db: Session,
        course_id: uuid.UUID,
        current_user: Optional[User] = None,
    ) -> CourseDetailResponse:
        course = (
            db.query(Course)
            .options(
                joinedload(Course.category),
                joinedload(Course.trainer),
                joinedload(Course.modules).joinedload(CourseModule.lessons),
                joinedload(Course.resources),
                joinedload(Course.course_competencies),
            )
            .filter(Course.id == course_id)
            .first()
        )

        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )

        # Check enrollment and progress
        enrollment = None
        completed_lesson_ids = set()
        completed_resource_ids = set()
        if current_user:
            enrollment = (
                db.query(Enrollment)
                .options(joinedload(Enrollment.progress))
                .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == course_id)
                .first()
            )
            if enrollment:
                completions = (
                    db.query(LessonCompletion.lesson_id)
                    .filter(LessonCompletion.enrollment_id == enrollment.id)
                    .all()
                )
                completed_lesson_ids = {c[0] for c in completions}

                r_completions = (
                    db.query(ResourceCompletion.resource_id)
                    .filter(
                        ResourceCompletion.enrollment_id == enrollment.id,
                        ResourceCompletion.is_completed == True,
                    )
                    .all()
                )
                completed_resource_ids = {c[0] for c in r_completions}

        # Check if user is course manager or admin
        is_manager = current_user and (
            current_user.role.name == "ADMIN" or (
                current_user.role.name == "TRAINER" and course.trainer_id == current_user.id
            )
        )

        # Build trainer summary
        trainer_summary = None
        if course.trainer:
            tp = course.trainer.trainer_profile
            trainer_summary = TrainerSummaryResponse(
                id=course.trainer.id,
                first_name=course.trainer.first_name,
                last_name=course.trainer.last_name,
                email=course.trainer.email,
                avatar_url=course.trainer.avatar_url,
                designation=tp.designation if tp else None,
                specialization=tp.specialization if tp else None,
            )

        # Build modules & lessons
        modules_res: List[CourseModuleResponse] = []
        total_lessons = 0
        sorted_modules = sorted(course.modules, key=lambda m: m.order_index)

        # Index resources by lesson_id and module_id
        lesson_resources_map = {}
        module_resources_map = {}
        course_level_resources: List[ResourceResponse] = []
        for res in sorted(course.resources, key=lambda r: (r.display_order, r.created_at)):
            if not is_manager and not res.is_published:
                continue
            res_dto = ResourceResponse(
                id=res.id,
                course_id=res.course_id,
                module_id=res.module_id,
                lesson_id=res.lesson_id,
                title=res.title,
                description=res.description,
                resource_type=res.resource_type,
                storage_url=res.storage_url,
                media_url=res.storage_url,
                file_url=res.storage_url,
                thumbnail_url=res.thumbnail_url,
                file_name=res.file_name,
                file_size_bytes=res.file_size_bytes,
                mime_type=res.mime_type,
                duration_seconds=res.duration_seconds,
                display_order=res.display_order,
                is_published=res.is_published,
                is_downloadable=res.is_downloadable,
                is_completed=res.id in completed_resource_ids,
                created_at=res.created_at,
                updated_at=res.updated_at,
            )
            if res.lesson_id:
                lesson_resources_map.setdefault(res.lesson_id, []).append(res_dto)
            elif res.module_id:
                module_resources_map.setdefault(res.module_id, []).append(res_dto)
            else:
                course_level_resources.append(res_dto)

        for mod in sorted_modules:
            sorted_lessons = sorted(mod.lessons, key=lambda l: l.order_index)
            lessons_res: List[LessonResponse] = []
            for les in sorted_lessons:
                total_lessons += 1
                lessons_res.append(
                    LessonResponse(
                        id=les.id,
                        module_id=les.module_id,
                        title=les.title,
                        description=les.description,
                        content_type=les.content_type,
                        content_body=les.content_body,
                        order_index=les.order_index,
                        duration_minutes=les.duration_minutes,
                        is_mandatory=les.is_mandatory,
                        is_completed=les.id in completed_lesson_ids,
                        resources=lesson_resources_map.get(les.id, []),
                    )
                )

            modules_res.append(
                CourseModuleResponse(
                    id=mod.id,
                    course_id=mod.course_id,
                    title=mod.title,
                    description=mod.description,
                    order_index=mod.order_index,
                    lessons=lessons_res,
                    resources=module_resources_map.get(mod.id, []),
                )
            )

        # Competency tags
        competencies_res: List[CompetencyTagResponse] = []
        for cc in course.course_competencies:
            if cc.competency:
                competencies_res.append(
                    CompetencyTagResponse(
                        id=cc.competency.id,
                        name=cc.competency.name,
                        code=cc.competency.code,
                        category=cc.competency.category,
                        target_level=cc.target_level,
                        contribution_weight=cc.contribution_weight,
                    )
                )

        completed_count = len(completed_lesson_ids)
        progress_pct = (
            (completed_count / total_lessons * 100.0)
            if total_lessons > 0 and enrollment
            else (enrollment.progress.completion_percentage if enrollment and enrollment.progress else 0.0)
        )

        return CourseDetailResponse(
            id=course.id,
            code=course.code,
            title=course.title,
            description=course.description,
            objectives=course.objectives,
            prerequisites=course.prerequisites,
            status=course.status,
            difficulty_level=course.difficulty_level,
            duration_hours=course.duration_hours,
            thumbnail_url=course.thumbnail_url,
            published_at=course.published_at,
            category=CourseCategoryResponse.model_validate(course.category),
            trainer=trainer_summary,
            modules=modules_res,
            resources=course_level_resources,
            competencies=competencies_res,
            is_enrolled=enrollment is not None,
            enrollment_id=enrollment.id if enrollment else None,
            enrollment_status=enrollment.status if enrollment else None,
            progress_percentage=round(progress_pct, 1) if enrollment else None,
            completed_lessons_count=completed_count,
            total_lessons_count=total_lessons,
        )
