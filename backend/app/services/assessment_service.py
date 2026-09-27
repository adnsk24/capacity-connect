import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models.user import User
from app.models.course import Course, Enrollment
from app.models.assessment import (
    Assessment,
    Question,
    QuestionOption,
    AssessmentAttempt,
    AssessmentAnswer,
)
from app.models.notification import Notification
from app.schemas.assessment import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentListItem,
    AssessmentDetail,
    QuestionCreate,
    QuestionUpdate,
    QuestionResponse,
    QuestionOptionResponse,
    QuestionReviewItem,
    AssessmentAttemptStartResponse,
    AssessmentSubmitRequest,
    AssessmentResultResponse,
    AssessmentAttemptHistoryItem,
)


class AssessmentService:
    @staticmethod
    def list_trainee_assessments(db: Session, user: User) -> List[AssessmentListItem]:
        """Fetch all published assessments for courses the trainee is enrolled in."""
        enrollments = (
            db.query(Enrollment)
            .filter(
                Enrollment.user_id == user.id,
                Enrollment.status.in_(["ACTIVE", "COMPLETED"]),
            )
            .all()
        )
        enrolled_course_ids = [e.course_id for e in enrollments]

        if not enrolled_course_ids:
            return []

        assessments = (
            db.query(Assessment)
            .options(
                joinedload(Assessment.course),
                joinedload(Assessment.questions),
            )
            .filter(
                Assessment.course_id.in_(enrolled_course_ids),
                Assessment.status == "PUBLISHED",
            )
            .order_by(Assessment.created_at.desc())
            .all()
        )

        results = []
        for a in assessments:
            attempts = (
                db.query(AssessmentAttempt)
                .filter(
                    AssessmentAttempt.assessment_id == a.id,
                    AssessmentAttempt.user_id == user.id,
                )
                .all()
            )
            attempts_count = len(attempts)
            evaluated_attempts = [att for att in attempts if att.status == "EVALUATED"]
            best_score = (
                max([att.score_obtained for att in evaluated_attempts if att.score_obtained is not None], default=None)
            )
            has_passed = any(att.is_passed is True for att in evaluated_attempts)

            results.append(
                AssessmentListItem(
                    id=a.id,
                    course_id=a.course_id,
                    course_title=a.course.title if a.course else "",
                    module_id=a.module_id,
                    title=a.title,
                    description=a.description,
                    assessment_type=a.assessment_type,
                    passing_percentage=a.passing_percentage,
                    total_marks=a.total_marks,
                    duration_minutes=a.duration_minutes,
                    max_attempts=a.max_attempts,
                    status=a.status,
                    due_at=a.due_at,
                    questions_count=len(a.questions),
                    user_attempts_count=attempts_count,
                    user_attempts_remaining=max(0, a.max_attempts - attempts_count),
                    best_score=best_score,
                    is_passed=has_passed,
                )
            )

        return results

    @staticmethod
    def get_assessment_for_trainee(db: Session, assessment_id: uuid.UUID, user: User) -> AssessmentDetail:
        """Get assessment instructions and details for an enrolled trainee. Answers remain hidden."""
        assessment = (
            db.query(Assessment)
            .options(
                joinedload(Assessment.course),
                joinedload(Assessment.questions).joinedload(Question.options),
            )
            .filter(Assessment.id == assessment_id)
            .first()
        )
        if not assessment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")

        if assessment.status != "PUBLISHED":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This assessment is not currently available.")

        # Check enrollment
        enrollment = (
            db.query(Enrollment)
            .filter(
                Enrollment.user_id == user.id,
                Enrollment.course_id == assessment.course_id,
                Enrollment.status.in_(["ACTIVE", "COMPLETED"]),
            )
            .first()
        )
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be enrolled in this course to view or take the assessment.",
            )

        # Sanitize questions: strip explanation and is_correct
        sanitized_questions = []
        for q in sorted(assessment.questions, key=lambda x: x.order_index):
            sanitized_options = [
                QuestionOptionResponse(
                    id=opt.id,
                    question_id=opt.question_id,
                    option_text=opt.option_text,
                    order_index=opt.order_index,
                    is_correct=None,  # Intentionally obscured
                )
                for opt in sorted(q.options, key=lambda x: x.order_index)
            ]
            sanitized_questions.append(
                QuestionResponse(
                    id=q.id,
                    assessment_id=q.assessment_id,
                    question_text=q.question_text,
                    question_type=q.question_type,
                    marks=q.marks,
                    explanation=None,  # Intentionally obscured
                    order_index=q.order_index,
                    options=sanitized_options,
                )
            )

        return AssessmentDetail(
            id=assessment.id,
            course_id=assessment.course_id,
            course_title=assessment.course.title if assessment.course else "",
            module_id=assessment.module_id,
            title=assessment.title,
            description=assessment.description,
            assessment_type=assessment.assessment_type,
            passing_percentage=assessment.passing_percentage,
            total_marks=assessment.total_marks,
            duration_minutes=assessment.duration_minutes,
            max_attempts=assessment.max_attempts,
            status=assessment.status,
            due_at=assessment.due_at,
            questions_count=len(assessment.questions),
            questions=sanitized_questions,
        )

    @staticmethod
    def start_attempt(db: Session, assessment_id: uuid.UUID, user: User) -> AssessmentAttemptStartResponse:
        """Start a new assessment examination attempt, enforcing limits and server deadlines."""
        assessment = (
            db.query(Assessment)
            .options(
                joinedload(Assessment.course),
                joinedload(Assessment.questions).joinedload(Question.options),
            )
            .filter(Assessment.id == assessment_id)
            .first()
        )
        if not assessment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")

        if assessment.status != "PUBLISHED":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Assessment is not published.")

        # Check enrollment
        enrollment = (
            db.query(Enrollment)
            .filter(
                Enrollment.user_id == user.id,
                Enrollment.course_id == assessment.course_id,
                Enrollment.status.in_(["ACTIVE", "COMPLETED"]),
            )
            .first()
        )
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be actively enrolled in the course to attempt this assessment.",
            )

        # Enforce server-side deadline
        now = datetime.now(timezone.utc)
        if assessment.due_at and now > assessment.due_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The deadline for this assessment has already passed.",
            )

        # Check for active in-progress attempt
        in_progress = (
            db.query(AssessmentAttempt)
            .filter(
                AssessmentAttempt.assessment_id == assessment_id,
                AssessmentAttempt.user_id == user.id,
                AssessmentAttempt.status == "IN_PROGRESS",
            )
            .first()
        )

        attempt = in_progress
        if not attempt:
            # Check maximum attempt limit
            prior_count = (
                db.query(AssessmentAttempt)
                .filter(
                    AssessmentAttempt.assessment_id == assessment_id,
                    AssessmentAttempt.user_id == user.id,
                )
                .count()
            )
            if prior_count >= assessment.max_attempts:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"You have reached the maximum allowed attempts ({assessment.max_attempts}) for this assessment.",
                )

            attempt = AssessmentAttempt(
                assessment_id=assessment_id,
                user_id=user.id,
                attempt_number=prior_count + 1,
                status="IN_PROGRESS",
                started_at=now,
            )
            db.add(attempt)
            db.commit()
            db.refresh(attempt)

        # Calculate server-authoritative remaining seconds
        remaining_seconds = None
        if assessment.duration_minutes:
            elapsed = (now - attempt.started_at).total_seconds()
            remaining_seconds = max(0, int(assessment.duration_minutes * 60 - elapsed))

        # Sanitize questions (never expose correct answer choices)
        sanitized_questions = []
        for q in sorted(assessment.questions, key=lambda x: x.order_index):
            sanitized_options = [
                QuestionOptionResponse(
                    id=opt.id,
                    question_id=opt.question_id,
                    option_text=opt.option_text,
                    order_index=opt.order_index,
                    is_correct=None,
                )
                for opt in sorted(q.options, key=lambda x: x.order_index)
            ]
            sanitized_questions.append(
                QuestionResponse(
                    id=q.id,
                    assessment_id=q.assessment_id,
                    question_text=q.question_text,
                    question_type=q.question_type,
                    marks=q.marks,
                    explanation=None,
                    order_index=q.order_index,
                    options=sanitized_options,
                )
            )

        return AssessmentAttemptStartResponse(
            attempt_id=attempt.id,
            assessment_id=assessment.id,
            assessment_title=assessment.title,
            attempt_number=attempt.attempt_number,
            status=attempt.status,
            started_at=attempt.started_at,
            duration_minutes=assessment.duration_minutes,
            remaining_seconds=remaining_seconds,
            total_questions=len(assessment.questions),
            total_marks=assessment.total_marks,
            passing_percentage=assessment.passing_percentage,
            questions=sanitized_questions,
        )

    @staticmethod
    def get_attempt_state(db: Session, attempt_id: uuid.UUID, user: User):
        """Fetch status or review of an attempt."""
        attempt = (
            db.query(AssessmentAttempt)
            .options(
                joinedload(AssessmentAttempt.assessment).joinedload(Assessment.course),
                joinedload(AssessmentAttempt.assessment)
                .joinedload(Assessment.questions)
                .joinedload(Question.options),
                joinedload(AssessmentAttempt.answers),
            )
            .filter(AssessmentAttempt.id == attempt_id)
            .first()
        )
        if not attempt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment attempt not found.")

        # Trainee can only view their own attempt; trainers/admins can view any
        if user.role.name == "TRAINEE" and attempt.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this attempt.")

        # If in progress, return sanitized questions
        if attempt.status == "IN_PROGRESS":
            now = datetime.now(timezone.utc)
            remaining_seconds = None
            if attempt.assessment.duration_minutes:
                elapsed = (now - attempt.started_at).total_seconds()
                remaining_seconds = max(0, int(attempt.assessment.duration_minutes * 60 - elapsed))

            sanitized_questions = []
            for q in sorted(attempt.assessment.questions, key=lambda x: x.order_index):
                sanitized_options = [
                    QuestionOptionResponse(
                        id=opt.id,
                        question_id=opt.question_id,
                        option_text=opt.option_text,
                        order_index=opt.order_index,
                        is_correct=None,
                    )
                    for opt in sorted(q.options, key=lambda x: x.order_index)
                ]
                sanitized_questions.append(
                    QuestionResponse(
                        id=q.id,
                        assessment_id=q.assessment_id,
                        question_text=q.question_text,
                        question_type=q.question_type,
                        marks=q.marks,
                        explanation=None,
                        order_index=q.order_index,
                        options=sanitized_options,
                    )
                )

            return AssessmentAttemptStartResponse(
                attempt_id=attempt.id,
                assessment_id=attempt.assessment.id,
                assessment_title=attempt.assessment.title,
                attempt_number=attempt.attempt_number,
                status=attempt.status,
                started_at=attempt.started_at,
                duration_minutes=attempt.assessment.duration_minutes,
                remaining_seconds=remaining_seconds,
                total_questions=len(attempt.assessment.questions),
                total_marks=attempt.assessment.total_marks,
                passing_percentage=attempt.assessment.passing_percentage,
                questions=sanitized_questions,
            )

        # Evaluated: Return full question-by-question review with answers and explanations
        review_questions = []
        for q in sorted(attempt.assessment.questions, key=lambda x: x.order_index):
            user_ans = next((a for a in attempt.answers if a.question_id == q.id), None)
            review_questions.append(
                QuestionReviewItem(
                    question_id=q.id,
                    question_text=q.question_text,
                    marks=q.marks,
                    marks_awarded=user_ans.marks_awarded if user_ans else 0.0,
                    selected_option_id=user_ans.selected_option_id if user_ans else None,
                    is_correct=user_ans.is_correct if user_ans else False,
                    explanation=q.explanation,
                    options=[
                        QuestionOptionResponse(
                            id=opt.id,
                            question_id=opt.question_id,
                            option_text=opt.option_text,
                            order_index=opt.order_index,
                            is_correct=opt.is_correct,
                        )
                        for opt in sorted(q.options, key=lambda x: x.order_index)
                    ],
                )
            )

        return AssessmentResultResponse(
            attempt_id=attempt.id,
            assessment_id=attempt.assessment_id,
            assessment_title=attempt.assessment.title,
            course_title=attempt.assessment.course.title if attempt.assessment.course else "",
            attempt_number=attempt.attempt_number,
            status=attempt.status,
            total_marks=attempt.assessment.total_marks,
            score_obtained=attempt.score_obtained or 0.0,
            percentage=attempt.percentage or 0.0,
            is_passed=attempt.is_passed or False,
            started_at=attempt.started_at,
            submitted_at=attempt.submitted_at,
            questions=review_questions,
        )

    @staticmethod
    def submit_attempt(
        db: Session,
        attempt_id: uuid.UUID,
        submission: AssessmentSubmitRequest,
        user: User,
    ) -> AssessmentResultResponse:
        """Deterministically grade the submitted examination answers and persist results."""
        attempt = (
            db.query(AssessmentAttempt)
            .options(
                joinedload(AssessmentAttempt.assessment).joinedload(Assessment.course),
                joinedload(AssessmentAttempt.assessment)
                .joinedload(Assessment.questions)
                .joinedload(Question.options),
            )
            .filter(AssessmentAttempt.id == attempt_id)
            .first()
        )
        if not attempt:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment attempt not found.")

        if attempt.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only submit your own attempt.")

        if attempt.status != "IN_PROGRESS":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This assessment attempt has already been submitted or completed.",
            )

        questions = sorted(attempt.assessment.questions, key=lambda x: x.order_index)
        answers_by_qid = {ans.question_id: ans for ans in submission.answers}

        total_possible_marks = sum(q.marks for q in questions) if questions else attempt.assessment.total_marks
        if total_possible_marks <= 0:
            total_possible_marks = 1.0

        obtained_score = 0.0
        review_questions = []

        for q in questions:
            user_ans = answers_by_qid.get(q.id)
            selected_option_id = user_ans.selected_option_id if user_ans else None
            is_correct = False
            marks_awarded = 0.0

            if selected_option_id:
                # Find matching option
                matched_opt = next((o for o in q.options if o.id == selected_option_id), None)
                if matched_opt and matched_opt.is_correct:
                    is_correct = True
                    marks_awarded = q.marks
                    obtained_score += marks_awarded

            # Persist answer record
            db_answer = AssessmentAnswer(
                attempt_id=attempt.id,
                question_id=q.id,
                selected_option_id=selected_option_id,
                text_response=user_ans.text_response if user_ans else None,
                is_correct=is_correct,
                marks_awarded=marks_awarded,
            )
            db.add(db_answer)

            # Build review item
            review_questions.append(
                QuestionReviewItem(
                    question_id=q.id,
                    question_text=q.question_text,
                    marks=q.marks,
                    marks_awarded=marks_awarded,
                    selected_option_id=selected_option_id,
                    is_correct=is_correct,
                    explanation=q.explanation,
                    options=[
                        QuestionOptionResponse(
                            id=opt.id,
                            question_id=opt.question_id,
                            option_text=opt.option_text,
                            order_index=opt.order_index,
                            is_correct=opt.is_correct,
                        )
                        for opt in sorted(q.options, key=lambda x: x.order_index)
                    ],
                )
            )

        percentage = round((obtained_score / total_possible_marks) * 100.0, 2)
        is_passed = percentage >= attempt.assessment.passing_percentage

        now = datetime.now(timezone.utc)
        attempt.status = "EVALUATED"
        attempt.submitted_at = now
        attempt.score_obtained = round(obtained_score, 2)
        attempt.percentage = percentage
        attempt.is_passed = is_passed

        # Create in-app notification
        notification = Notification(
            user_id=user.id,
            title=f"Assessment Completed: {attempt.assessment.title}",
            message=f"You scored {round(obtained_score, 1)}/{round(total_possible_marks, 1)} ({percentage}%). Result: {'PASSED' if is_passed else 'FAILED'}.",
            notification_type="ASSESSMENT_RESULT",
            link_url=f"/trainee/assessments/{attempt.assessment_id}/result/{attempt.id}",
            is_read=False,
        )
        db.add(notification)

        db.commit()
        db.refresh(attempt)

        return AssessmentResultResponse(
            attempt_id=attempt.id,
            assessment_id=attempt.assessment_id,
            assessment_title=attempt.assessment.title,
            course_title=attempt.assessment.course.title if attempt.assessment.course else "",
            attempt_number=attempt.attempt_number,
            status=attempt.status,
            total_marks=total_possible_marks,
            score_obtained=round(obtained_score, 2),
            percentage=percentage,
            is_passed=is_passed,
            started_at=attempt.started_at,
            submitted_at=attempt.submitted_at,
            questions=review_questions,
        )

    @staticmethod
    def list_trainee_history(db: Session, user: User) -> List[AssessmentAttemptHistoryItem]:
        """Fetch attempt history across all courses for the current trainee."""
        attempts = (
            db.query(AssessmentAttempt)
            .options(
                joinedload(AssessmentAttempt.assessment).joinedload(Assessment.course),
            )
            .filter(AssessmentAttempt.user_id == user.id)
            .order_by(AssessmentAttempt.started_at.desc())
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

    # --- Trainer & Admin Assessment Operations ---

    @staticmethod
    def list_trainer_assessments(db: Session, trainer: User) -> List[AssessmentListItem]:
        """Fetch all assessments for courses managed by this trainer (or all if ADMIN)."""
        query = db.query(Assessment).options(
            joinedload(Assessment.course),
            joinedload(Assessment.questions),
        )
        if trainer.role.name != "ADMIN":
            query = query.join(Course).filter(Course.trainer_id == trainer.id)

        assessments = query.order_by(Assessment.created_at.desc()).all()

        results = []
        for a in assessments:
            total_attempts = db.query(AssessmentAttempt).filter(AssessmentAttempt.assessment_id == a.id).count()
            results.append(
                AssessmentListItem(
                    id=a.id,
                    course_id=a.course_id,
                    course_title=a.course.title if a.course else "",
                    module_id=a.module_id,
                    title=a.title,
                    description=a.description,
                    assessment_type=a.assessment_type,
                    passing_percentage=a.passing_percentage,
                    total_marks=a.total_marks,
                    duration_minutes=a.duration_minutes,
                    max_attempts=a.max_attempts,
                    status=a.status,
                    due_at=a.due_at,
                    questions_count=len(a.questions),
                    user_attempts_count=total_attempts,
                    user_attempts_remaining=0,
                    best_score=None,
                    is_passed=None,
                )
            )
        return results

    @staticmethod
    def create_assessment(db: Session, data: AssessmentCreate, trainer: User) -> Assessment:
        """Create a new assessment for a course owned by the trainer."""
        course = db.query(Course).filter(Course.id == data.course_id).first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated course not found.")

        if trainer.role.name != "ADMIN" and course.trainer_id != trainer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this course.")

        assessment = Assessment(
            course_id=data.course_id,
            module_id=data.module_id,
            title=data.title,
            description=data.description,
            assessment_type=data.assessment_type,
            passing_percentage=data.passing_percentage,
            total_marks=data.total_marks,
            duration_minutes=data.duration_minutes,
            max_attempts=data.max_attempts,
            status=data.status,
            due_at=data.due_at,
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        return assessment

    @staticmethod
    def get_assessment_for_trainer(db: Session, assessment_id: uuid.UUID, trainer: User) -> AssessmentDetail:
        """Get full assessment detail including correct answer options and explanations."""
        assessment = (
            db.query(Assessment)
            .options(
                joinedload(Assessment.course),
                joinedload(Assessment.questions).joinedload(Question.options),
            )
            .filter(Assessment.id == assessment_id)
            .first()
        )
        if not assessment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")

        if trainer.role.name != "ADMIN" and assessment.course and assessment.course.trainer_id != trainer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this assessment.")

        questions = []
        for q in sorted(assessment.questions, key=lambda x: x.order_index):
            options = [
                QuestionOptionResponse(
                    id=opt.id,
                    question_id=opt.question_id,
                    option_text=opt.option_text,
                    order_index=opt.order_index,
                    is_correct=opt.is_correct,
                )
                for opt in sorted(q.options, key=lambda x: x.order_index)
            ]
            questions.append(
                QuestionResponse(
                    id=q.id,
                    assessment_id=q.assessment_id,
                    question_text=q.question_text,
                    question_type=q.question_type,
                    marks=q.marks,
                    explanation=q.explanation,
                    order_index=q.order_index,
                    options=options,
                )
            )

        return AssessmentDetail(
            id=assessment.id,
            course_id=assessment.course_id,
            course_title=assessment.course.title if assessment.course else "",
            module_id=assessment.module_id,
            title=assessment.title,
            description=assessment.description,
            assessment_type=assessment.assessment_type,
            passing_percentage=assessment.passing_percentage,
            total_marks=assessment.total_marks,
            duration_minutes=assessment.duration_minutes,
            max_attempts=assessment.max_attempts,
            status=assessment.status,
            due_at=assessment.due_at,
            questions_count=len(assessment.questions),
            questions=questions,
        )

    @staticmethod
    def update_assessment(
        db: Session,
        assessment_id: uuid.UUID,
        data: AssessmentUpdate,
        trainer: User,
    ) -> Assessment:
        """Update assessment metadata."""
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")

        if trainer.role.name != "ADMIN" and assessment.course and assessment.course.trainer_id != trainer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this assessment.")

        update_dict = data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            setattr(assessment, key, val)

        db.commit()
        db.refresh(assessment)
        return assessment

    @staticmethod
    def delete_assessment(db: Session, assessment_id: uuid.UUID, trainer: User):
        """Delete an assessment."""
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")

        if trainer.role.name != "ADMIN" and assessment.course and assessment.course.trainer_id != trainer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this assessment.")

        db.delete(assessment)
        db.commit()
        return {"message": "Assessment successfully deleted."}

    @staticmethod
    def add_question(
        db: Session,
        assessment_id: uuid.UUID,
        data: QuestionCreate,
        trainer: User,
    ) -> Question:
        """Add an MCQ question with validated answer options."""
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        if not assessment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")

        if trainer.role.name != "ADMIN" and assessment.course and assessment.course.trainer_id != trainer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this assessment.")

        # Validation: At least one option must be marked correct
        if not any(opt.is_correct for opt in data.options):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one option must be marked as the correct answer.",
            )

        if len(data.options) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="MCQ questions must contain at least 2 options.",
            )

        question = Question(
            assessment_id=assessment_id,
            question_text=data.question_text,
            question_type=data.question_type,
            marks=data.marks,
            explanation=data.explanation,
            order_index=data.order_index,
        )
        db.add(question)
        db.flush()

        for idx, opt in enumerate(data.options):
            db_opt = QuestionOption(
                question_id=question.id,
                option_text=opt.option_text,
                is_correct=opt.is_correct,
                order_index=opt.order_index if opt.order_index != 0 else idx,
            )
            db.add(db_opt)

        db.commit()
        db.refresh(question)
        return question

    @staticmethod
    def delete_question(db: Session, question_id: uuid.UUID, trainer: User):
        """Delete a question."""
        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found.")

        if trainer.role.name != "ADMIN" and question.assessment.course and question.assessment.course.trainer_id != trainer.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this question.")

        db.delete(question)
        db.commit()
        return {"message": "Question successfully deleted."}
