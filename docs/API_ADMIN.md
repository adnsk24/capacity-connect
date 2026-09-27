# Admin Portal API Specification

## Overview
The Admin Portal API provides centralized institutional governance across users, courses, assessments, and notifications. It strictly enforces server-side Role-Based Access Control (`ADMIN` role required), self-protection invariants (preventing self-demotion or self-suspension), and provides aggregate telemetry.

---

## Base Path
`/api/v1/admin`

---

## Authentication & Authorization
All endpoints require a valid JWT Bearer token with role:
`ADMIN`

Any non-admin caller receives:
`403 Forbidden: "Administrative privileges required"`

---

## Endpoints

### 1. System Telemetry & Metrics
- **Path**: `GET /api/v1/admin/dashboard`
- **Response** `200 OK`:
  ```json
  {
    "total_users": 15,
    "pending_users": 2,
    "active_trainees": 10,
    "active_trainers": 3,
    "total_courses": 5,
    "published_courses": 5,
    "total_enrollments": 18,
    "assessment_attempts": 12,
    "certifications_count": 0,
    "overall_completion_rate": 62.5,
    "users_by_role": {
      "TRAINEE": 10,
      "TRAINER": 3,
      "ADMIN": 2
    },
    "category_distribution": [
      { "category": "General Meteorology", "count": 2 },
      { "category": "Radar Meteorology", "count": 2 },
      { "category": "Satellite Meteorology", "count": 1 }
    ],
    "recent_activity": []
  }
  ```

---

### 2. User Lifecycle & Governance

#### List Users
- **Path**: `GET /api/v1/admin/users`
- **Query Parameters**:
  - `role` (optional: `TRAINEE`, `TRAINER`, `ADMIN`)
  - `account_status` (optional: `PENDING`, `ACTIVE`, `SUSPENDED`, `REJECTED`)
  - `search` (optional string search against name and email)
- **Response** `200 OK`:
  List of user summaries with metadata and timestamps.

#### Update Account Status (Approve / Suspend / Activate / Reject)
- **Path**: `PATCH /api/v1/admin/users/{user_id}/status`
- **Safety Invariant**: An administrator cannot suspend or reject their own account (`400 Bad Request: "Administrators cannot alter their own account status"`).
- **Request Body**:
  ```json
  {
    "status": "ACTIVE"
  }
  ```
- **Response** `200 OK`

#### Update User Role (Role Escalation / Demotion)
- **Path**: `PATCH /api/v1/admin/users/{user_id}/role`
- **Safety Invariant**: An administrator cannot demote their own account (`400 Bad Request: "Administrators cannot change their own role"`).
- **Request Body**:
  ```json
  {
    "role": "TRAINER"
  }
  ```
- **Response** `200 OK`

---

### 3. Course Governance
- **Path**: `GET /api/v1/admin/courses`
- **Path**: `PATCH /api/v1/admin/courses/{course_id}/status`
  - Valid statuses: `PUBLISHED`, `DRAFT`, `ARCHIVED`.

---

### 4. Assessment Monitoring
- **Path**: `GET /api/v1/admin/assessments`
- **Response** `200 OK`:
  Comprehensive list of all examinations across all courses and trainers with aggregate attempt metrics and pass rates.
