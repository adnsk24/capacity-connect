# Capacity Connect — Phase 3 Courses & Trainee API Specification

## Overview
This document specifies the RESTful endpoints implemented in Phase 3 for the Course Catalogue, Trainee Profile, Course Enrollment, Learning Content, and Course Progress tracking.

**Base URL**: `http://localhost:8000/api/v1`

---

## 1. Course Catalogue & Details

### `GET /courses`
- **Summary**: Paginated course catalogue with full-text search, category filter, and difficulty filter.
- **Access**: Public / Optional Bearer token (if authenticated, returns user-specific enrollment and progress fields).
- **Query Parameters**:
  - `search` (optional, string): Search query against title, description, and course code.
  - `category_id` (optional, UUID): Filter by course category.
  - `difficulty` (optional, string): `BEGINNER`, `INTERMEDIATE`, `ADVANCED`.
  - `page` (optional, integer, default: 1): Page number.
  - `page_size` (optional, integer, default: 12): Items per page.
- **Response**: `200 OK`
```json
{
  "items": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "code": "MET-101",
      "title": "Introduction to Meteorology",
      "description": "Foundational curriculum covering atmospheric composition...",
      "category_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "category_name": "General Meteorology",
      "category_code": "GEN-MET",
      "difficulty_level": "BEGINNER",
      "duration_hours": 30,
      "thumbnail_url": null,
      "trainer": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "first_name": "Dr. Rajesh",
        "last_name": "Kumar",
        "email": "trainer.demo@imd.gov.in",
        "designation": "Senior Meteorologist"
      },
      "total_modules": 2,
      "total_lessons": 5,
      "competencies": ["Synoptic Weather Analysis & Charting"],
      "is_enrolled": true,
      "enrollment_status": "IN_PROGRESS",
      "progress_percentage": 40.0
    }
  ],
  "total": 12,
  "page": 1,
  "page_size": 12,
  "total_pages": 1,
  "categories": [...]
}
```

### `GET /courses/categories`
- **Summary**: Returns all course taxonomies and categories.
- **Access**: Public
- **Response**: `200 OK` - List of `CourseCategoryResponse`

### `GET /courses/{course_id}`
- **Summary**: Detailed course curriculum, syllabus hierarchy (modules -> lessons), downloadable resource metadata, and competency mappings.
- **Access**: Public / Optional Bearer token (returns lesson completion checkmarks if enrolled).
- **Response**: `200 OK` - `CourseDetailResponse`

---

## 2. Course Enrollment

### `POST /courses/{course_id}/enroll`
- **Summary**: Enrolls authenticated trainee into a published course and initializes zeroed progress telemetry.
- **Access**: Authenticated (`TRAINEE` role or active user)
- **Error Codes**:
  - `400 Bad Request`: "Already enrolled in this course." or "Cannot enroll in an unpublished course."
  - `401 Unauthorized`: Missing or invalid Bearer token.
  - `404 Not Found`: Course ID does not exist.
- **Response**: `201 Created`
```json
{
  "id": "enrollment-uuid",
  "user_id": "trainee-uuid",
  "course_id": "course-uuid",
  "status": "ENROLLED",
  "enrolled_at": "2026-09-27T17:00:00Z",
  "progress": {
    "id": "progress-uuid",
    "completion_percentage": 0.0,
    "completed_lessons_count": 0,
    "total_lessons_count": 5,
    "is_completed": false
  }
}
```

---

## 3. Learning Content & Progress Telemetry

### `GET /courses/{course_id}/learn`
- **Summary**: Retrieves full course learning environment for enrolled trainee, including lesson completion statuses.
- **Access**: Authenticated enrolled user.
- **Error Codes**:
  - `403 Forbidden`: User is not enrolled in this course.
- **Response**: `200 OK` - `CourseDetailResponse` with `is_completed: boolean` on each lesson.

### `POST /courses/{course_id}/lessons/{lesson_id}/complete`
- **Summary**: Marks individual lesson complete, creates `LessonCompletion` record, and recalculates aggregate `CourseProgress`.
- **Access**: Authenticated enrolled user.
- **Formula**: `completion_percentage = (completed_lessons_count / total_lessons_count) * 100`
  - If `completion_percentage >= 100.0`, sets `progress.is_completed = True`, `enrollment.status = "COMPLETED"`, and timestamps completion.
- **Error Codes**:
  - `400 Bad Request`: Lesson does not belong to specified course.
  - `403 Forbidden`: User is not enrolled.
- **Response**: `200 OK`
```json
{
  "id": "completion-uuid",
  "enrollment_id": "enrollment-uuid",
  "lesson_id": "lesson-uuid",
  "completed_at": "2026-09-27T17:01:00Z",
  "progress": {
    "id": "progress-uuid",
    "completion_percentage": 40.0,
    "completed_lessons_count": 2,
    "total_lessons_count": 5,
    "last_accessed_lesson_id": "lesson-uuid",
    "last_accessed_at": "2026-09-27T17:01:00Z",
    "is_completed": false
  }
}
```

---

## 4. Trainee Dashboard & Profile

### `GET /trainee/dashboard`
- **Summary**: Aggregated personal telemetry, dynamic completion percentage, active course progression, evaluated competencies, and verified certificates.
- **Access**: Authenticated user (`TRAINEE`).
- **Response**: `200 OK` - `TraineeDashboardResponse`

### `GET /trainee/profile`
- **Summary**: Returns profile credentials, academic qualifications, operational experiences, skills, and calculated profile completion score.
- **Access**: Authenticated user (`TRAINEE`).
- **Response**: `200 OK` - `TraineeProfileResponse`

### `PUT /trainee/profile`
- **Summary**: Updates profile information, qualifications list, experiences list, and technical skills list. Dynamically recalculates profile completion.
- **Access**: Authenticated user (self only).
- **Body**: `TraineeProfileUpdateRequest`
- **Response**: `200 OK` - Updated `TraineeProfileResponse`

### `GET /trainee/learning`
- **Summary**: Returns all enrolled courses with progress percentages, completed lessons count, last accessed timestamps, and next recommended lesson.
- **Access**: Authenticated user.
- **Response**: `200 OK` - Array of `EnrolledCourseItem`
