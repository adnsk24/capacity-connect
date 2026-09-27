# Trainer Portal API Specification

## Overview
The Trainer Portal API provides course authoring, syllabus management (modules, lessons, learning resources), assessment and question bank authoring, and real-time cohort performance tracking for instructors and subject-matter experts.

---

## Base Path
`/api/v1/trainer`

---

## Authentication & Authorization
All endpoints require a valid JWT Bearer token with role:
`TRAINER` or `ADMIN`

---

## Endpoints

### 1. Trainer Command Center Dashboard
- **Path**: `GET /api/v1/trainer/dashboard`
- **Response** `200 OK`:
  ```json
  {
    "courses_managed": 3,
    "enrolled_trainees": 48,
    "active_learners": 32,
    "assessments_count": 4,
    "average_assessment_score": 78.4,
    "completion_rate": 65.2,
    "recent_activity": [
      {
        "type": "ASSESSMENT_SUBMITTED",
        "title": "Amit Kumar scored 88.0% in Meteorological Fundamentals Assessment",
        "timestamp": "2026-09-27T17:58:12Z"
      }
    ],
    "upcoming_deadlines": []
  }
  ```

---

### 2. Course Management

#### List Managed Courses
- **Path**: `GET /api/v1/trainer/courses`
- **Query Parameters**: `status` (optional: `DRAFT`, `PUBLISHED`, `ARCHIVED`)
- **Response** `200 OK`:
  Array of course summaries with enrollment count and module count.

#### Create Course
- **Path**: `POST /api/v1/trainer/courses`
- **Request Body**:
  ```json
  {
    "title": "Numerical Weather Prediction Fundamentals",
    "code": "MET-401",
    "category_id": "9a008c2a-1614-4114-8f63-9f1d04fe079e",
    "description": "Mathematical formulations, grid discretization, and parameterization schemes.",
    "objectives": "Understand governing Navier-Stokes equations and ensemble methods.",
    "prerequisites": "Advanced Atmospheric Dynamics",
    "difficulty_level": "ADVANCED",
    "duration_hours": 40
  }
  ```
- **Response** `201 Created`

#### Get Course Detail with Full Syllabus Tree
- **Path**: `GET /api/v1/trainer/courses/{course_id}`
- **Response** `200 OK`: Course metadata, nested modules, lessons, and resources.

#### Add Module to Course
- **Path**: `POST /api/v1/trainer/courses/{course_id}/modules`
- **Request Body**:
  ```json
  {
    "title": "Module 1: Governing Atmospheric Equations",
    "description": "Continuity, hydrostatic, and thermodynamic energy equations.",
    "order_index": 1
  }
  ```

#### Add Lesson to Module
- **Path**: `POST /api/v1/trainer/courses/{course_id}/modules/{module_id}/lessons`
- **Request Body**:
  ```json
  {
    "title": "Lesson 1: Primitive Equations in Sigma Coordinates",
    "content": "Detailed mathematical formulation...",
    "duration_minutes": 45,
    "order_index": 1
  }
  ```

#### Add Resource to Lesson/Course
- **Path**: `POST /api/v1/trainer/courses/{course_id}/resources`
- **Request Body**:
  ```json
  {
    "lesson_id": "...",
    "title": "IMD NWP Operational Handbook (PDF)",
    "resource_type": "DOCUMENT",
    "url": "/resources/docs/nwp_handbook.pdf"
  }
  ```

---

### 3. Assessment & Question Bank Authoring

#### List Assessments
- **Path**: `GET /api/v1/trainer/assessments`
- **Query Parameters**: `course_id` (optional)

#### Create Assessment
- **Path**: `POST /api/v1/trainer/assessments`
- **Request Body**:
  ```json
  {
    "course_id": "c1a590ee-7235-4309-8472-fb1e20436829",
    "title": "Radar Operations Mid-Term Assessment",
    "description": "Standardized evaluation of radar reflectivities and velocity products.",
    "assessment_type": "MCQ",
    "passing_percentage": 65.0,
    "total_marks": 20.0,
    "duration_minutes": 30,
    "max_attempts": 2,
    "deadline": null
  }
  ```

#### Add Question with Options (MCQ Builder)
- **Path**: `POST /api/v1/trainer/assessments/{assessment_id}/questions`
- **Validation**:
  - Minimum 2 options required.
  - At least one option marked `is_correct: true`.
  - Marks must be > 0.
- **Request Body**:
  ```json
  {
    "question_text": "What does a hook echo signature typically signify on Doppler base reflectivity?",
    "question_type": "MCQ_SINGLE",
    "marks": 5.0,
    "explanation": "A hook echo indicates rotation in a supercell and potential cyclogenesis/tornado formation.",
    "order_index": 1,
    "options": [
      { "option_text": "Mesocyclonic rotation in a supercell thunderstorm", "order_index": 1, "is_correct": true },
      { "option_text": "Widespread stratiform rain shield", "order_index": 2, "is_correct": false },
      { "option_text": "Ground clutter contamination", "order_index": 3, "is_correct": false },
      { "option_text": "Clear-air boundary layer turbulence", "order_index": 4, "is_correct": false }
    ]
  }
  ```

#### Delete Question
- **Path**: `DELETE /api/v1/trainer/questions/{question_id}`

#### View Assessment Attempt Results
- **Path**: `GET /api/v1/trainer/assessments/{assessment_id}/results`

---

### 4. Cohort Trainee Performance Tracking
- **Path**: `GET /api/v1/trainer/performance`
- **Query Parameters**:
  - `course_id` (optional UUID)
  - `trainee_name` (optional string search)
  - `status` (optional: `ACTIVE`, `COMPLETED`, `DROPPED`)
  - `page` (int, default 1)
  - `page_size` (int, default 20)
- **Response** `200 OK`:
  ```json
  {
    "total_count": 1,
    "page": 1,
    "page_size": 20,
    "items": [
      {
        "trainee_id": "b1fa49c3-1d37-4d87-8df5-197e3a96cb47",
        "trainee_name": "Amit Kumar",
        "trainee_email": "amit.kumar@imd.gov.in",
        "course_id": "c1a590ee-7235-4309-8472-fb1e20436829",
        "course_title": "Introduction to Meteorology",
        "enrollment_status": "ACTIVE",
        "enrolled_at": "2026-09-20T10:00:00Z",
        "progress_percentage": 75.0,
        "completed_lessons": 3,
        "total_lessons": 4,
        "assessment_attempts_count": 1,
        "latest_score": 88.0,
        "is_passed": true
      }
    ]
  }
  ```
