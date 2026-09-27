# Assessment & MCQ Engine API Specification

## Overview
The Assessment & MCQ Engine provides automated, deterministic examination handling for the Capacity Connect portal. It enforces server-authoritative timer calculations, strictly prevents correct-answer exposure prior to submission, manages attempt limits, calculates pass/fail classifications, persists attempt history, and triggers in-app notification events.

---

## Base Path
`/api/v1/assessments`

---

## Authentication & Authorization
All endpoints require a valid JWT Bearer token:
`Authorization: Bearer <access_token>`

Role requirements:
- Trainee: Access published course assessments where enrolled, initiate attempts, submit answers, inspect personal attempt evaluations.
- Trainer: Author assessments and question banks for assigned courses, view cohort results.
- Admin: Full system-wide visibility and monitoring.

---

## Endpoints

### 1. List Available Assessments
- **Path**: `GET /api/v1/assessments`
- **Roles**: All authenticated users
- **Query Parameters**:
  - `course_id` (optional UUID): Filter assessments by course.
  - `status` (optional string): Filter by status (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
- **Response** `200 OK`:
  ```json
  [
    {
      "id": "e0b5711c-132d-45c9-94fc-0182741d45c1",
      "course_id": "c1a590ee-7235-4309-8472-fb1e20436829",
      "course_title": "Introduction to Meteorology",
      "title": "Meteorological Fundamentals Assessment",
      "description": "Comprehensive evaluation covering atmospheric thermodynamics, radiation, and synoptic chart interpretation.",
      "assessment_type": "MCQ",
      "passing_percentage": 60.0,
      "total_marks": 25.0,
      "duration_minutes": 45,
      "max_attempts": 3,
      "status": "PUBLISHED",
      "questions_count": 25,
      "user_attempts_count": 1,
      "user_attempts_remaining": 2,
      "best_score": 88.0,
      "is_passed": true,
      "deadline": null
    }
  ]
  ```

---

### 2. Get Assessment Details
- **Path**: `GET /api/v1/assessments/{assessment_id}`
- **Roles**: All authenticated users
- **Behavior**:
  - If requested by an authoring Trainer or Admin, returns questions with `is_correct` flags and explanations.
  - If requested by a Trainee, returns metadata without questions. (Questions are delivered upon starting an attempt).
- **Response** `200 OK`:
  ```json
  {
    "id": "e0b5711c-132d-45c9-94fc-0182741d45c1",
    "course_id": "c1a590ee-7235-4309-8472-fb1e20436829",
    "course_title": "Introduction to Meteorology",
    "title": "Meteorological Fundamentals Assessment",
    "description": "Comprehensive evaluation covering atmospheric thermodynamics, radiation, and synoptic chart interpretation.",
    "assessment_type": "MCQ",
    "passing_percentage": 60.0,
    "total_marks": 25.0,
    "duration_minutes": 45,
    "max_attempts": 3,
    "status": "PUBLISHED",
    "questions_count": 25,
    "user_attempts_count": 1,
    "user_attempts_remaining": 2,
    "best_score": 88.0,
    "is_passed": true,
    "deadline": null,
    "questions": []
  }
  ```

---

### 3. Start Assessment Attempt
- **Path**: `POST /api/v1/assessments/{assessment_id}/attempts`
- **Roles**: `TRAINEE` (must be actively enrolled in the parent course)
- **Validation**:
  - Assessment must be `PUBLISHED`.
  - Max attempt limit must not be exceeded.
  - Assessment deadline must not have passed.
- **Security Guarantee**:
  - Returns question bank and options.
  - **`is_correct` and `explanation` fields are strictly omitted/sanitized.**
- **Response** `201 Created`:
  ```json
  {
    "attempt_id": "843f5451-b016-43b9-b883-9b85cce72403",
    "assessment_id": "e0b5711c-132d-45c9-94fc-0182741d45c1",
    "assessment_title": "Meteorological Fundamentals Assessment",
    "course_title": "Introduction to Meteorology",
    "attempt_number": 2,
    "status": "IN_PROGRESS",
    "total_marks": 25.0,
    "score_obtained": null,
    "percentage": null,
    "is_passed": null,
    "started_at": "2026-09-27T17:30:00Z",
    "duration_minutes": 45,
    "expires_at": "2026-09-27T18:15:00Z",
    "submitted_at": null,
    "questions": [
      {
        "question_id": "f5f190e2-63db-4e76-b9cf-14c1eb2531a7",
        "question_text": "Which atmospheric layer contains the highest concentration of ozone (O3)?",
        "marks": 1.0,
        "marks_awarded": null,
        "selected_option_id": null,
        "is_correct": null,
        "explanation": null,
        "options": [
          { "id": "4ec5...", "question_id": "f5f1...", "option_text": "Troposphere", "order_index": 1 },
          { "id": "9bb2...", "question_id": "f5f1...", "option_text": "Stratosphere", "order_index": 2 },
          { "id": "7ac1...", "question_id": "f5f1...", "option_text": "Mesosphere", "order_index": 3 },
          { "id": "1fd3...", "question_id": "f5f1...", "option_text": "Thermosphere", "order_index": 4 }
        ]
      }
    ]
  }
  ```

---

### 4. Get Attempt State / Evaluated Review
- **Path**: `GET /api/v1/assessments/attempts/{attempt_id}`
- **Roles**: Attempt Owner, Authoring Trainer, or Admin
- **Behavior**:
  - If attempt is `IN_PROGRESS`, answers/explanations remain hidden.
  - If attempt is `EVALUATED`, returns complete question-by-question breakdown, trainee selected options, correct flags, and educational explanations.

---

### 5. Submit Assessment Attempt
- **Path**: `POST /api/v1/assessments/attempts/{attempt_id}/submit`
- **Roles**: Attempt Owner
- **Request Body**:
  ```json
  {
    "answers": [
      {
        "question_id": "f5f190e2-63db-4e76-b9cf-14c1eb2531a7",
        "selected_option_id": "9bb2e153-f756-4cf8-a9d7-ea8bbd7fcf60"
      }
    ]
  }
  ```
- **Grading Pipeline**:
  1. Validates ownership and confirms status is `IN_PROGRESS`.
  2. Compares each `selected_option_id` against the authoritative `QuestionOption.is_correct` database record.
  3. Awards marks for correct choices; awards 0 for incorrect choices.
  4. Calculates `score_obtained`, `percentage = (score_obtained / total_marks) * 100`, and `is_passed = percentage >= passing_percentage`.
  5. Updates attempt status to `EVALUATED` and records `submitted_at`.
  6. Dispatches in-app notification with result summary.
- **Response** `200 OK`:
  ```json
  {
    "attempt_id": "843f5451-b016-43b9-b883-9b85cce72403",
    "assessment_id": "e0b5711c-132d-45c9-94fc-0182741d45c1",
    "assessment_title": "Meteorological Fundamentals Assessment",
    "course_title": "Introduction to Meteorology",
    "attempt_number": 2,
    "status": "EVALUATED",
    "total_marks": 25.0,
    "score_obtained": 22.0,
    "percentage": 88.0,
    "is_passed": true,
    "started_at": "2026-09-27T17:30:00Z",
    "submitted_at": "2026-09-27T17:58:12Z",
    "questions": [
      {
        "question_id": "f5f190e2-63db-4e76-b9cf-14c1eb2531a7",
        "question_text": "Which atmospheric layer contains the highest concentration of ozone (O3)?",
        "marks": 1.0,
        "marks_awarded": 1.0,
        "selected_option_id": "9bb2e153-f756-4cf8-a9d7-ea8bbd7fcf60",
        "is_correct": true,
        "explanation": "The stratospheric ozone layer resides primarily between 15 km and 35 km altitude.",
        "options": [
          { "id": "4ec5...", "question_id": "f5f1...", "option_text": "Troposphere", "order_index": 1, "is_correct": false },
          { "id": "9bb2...", "question_id": "f5f1...", "option_text": "Stratosphere", "order_index": 2, "is_correct": true },
          { "id": "7ac1...", "question_id": "f5f1...", "option_text": "Mesosphere", "order_index": 3, "is_correct": false },
          { "id": "1fd3...", "question_id": "f5f1...", "option_text": "Thermosphere", "order_index": 4, "is_correct": false }
        ]
      }
    ]
  }
  ```

---

### 6. Trainee Assessment History
- **Path**: `GET /api/v1/assessments/trainee/history`
- **Roles**: `TRAINEE`
- **Response** `200 OK`:
  List of all evaluated attempts sorted by submission date descending.
