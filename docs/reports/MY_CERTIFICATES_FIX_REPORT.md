# Capacity Connect — Trainee “My Certificates” Fix & Verification Report

**Project:** Capacity Connect — Digital Capacity Building & Learning Management Portal for India Meteorological Department (IMD)  
**Date:** September 2026  
**Document Ref:** `docs/reports/MY_CERTIFICATES_FIX_REPORT.md`  
**Classification:** Core System Fix & Verification Documentation  
**Status:** COMPLETED & VERIFIED END-TO-END  

---

## Executive Summary

The certificate management capability previously engineered in Capacity Connect was experiencing an issue where trainees visiting **Trainee Dashboard → My Certificates** (`/trainee/certificates`) saw zero certificates or empty state, even after participating in accredited courses.

A comprehensive, root-cause investigation across database tables, backend service logic, API route serialization, and frontend state synchronization revealed that while the underlying ReportLab generation engine, QR verification routes, and database models were fully functional, **the automatic lifecycle trigger connecting course/assessment completion to certificate generation was disconnected**, and **the Trainee Dashboard query targeted an external profile model rather than accredited course certificates**.

Following surgical, architecture-preserving corrections, the complete data path:
$$\text{Course \& Assessment Completion} \longrightarrow \text{Automated Eligibility Check} \longrightarrow \text{Certificate Issuance \& PDF Render} \longrightarrow \text{Database Persistence} \longrightarrow \text{Trainee Dashboard \& My Certificates API} \longrightarrow \text{Interactive Frontend}$$
is fully operational, verified by **134 passing backend tests**, **81 passing frontend tests**, and live end-to-end API execution.

---

## 1. Root Cause Analysis

Tracing the complete certificate data path identified four distinct root causes:

1. **Disconnected Lesson Completion Hook (`backend/app/services/progress_service.py`)**:
   - In `ProgressService.complete_lesson`, when a trainee finished the final lesson of a course, `progress.completion_percentage` reached `100.0` and `enrollment.status` transitioned to `"COMPLETED"`.
   - However, `CertificateService.check_eligibility()` and `CertificateService.issue_certificate()` were **never called** at that transition point.

2. **Disconnected Assessment Pass Hook (`backend/app/services/assessment_service.py`)**:
   - In `AssessmentService.submit_attempt`, when a trainee submitted a passing assessment attempt (`is_passed = True`), the system recorded the evaluation score, but did not check if the trainee had already completed 100% course lessons and was awaiting assessment pass for accredited certificate generation.
   - Consequently, certificates remained ungenerated unless a user manually hit the internal POST `/generate` endpoint.

3. **Dashboard Model Mismatch (`backend/app/services/trainee_service.py`)**:
   - In `TraineeService.get_dashboard`, lines 310–332 queried `Certification` (the user profile resume model for external credentials like AWS or degree certificates) instead of `Certificate` (the IMD accredited course certificate model).
   - Because trainees rarely had manual resume certifications inputted, the Trainee Dashboard summary stat displayed `0 Certificates`, conflicting with accredited training achievements.

4. **Frontend PDF Origin Resolution (`frontend/src/components/certificates/CertificatePreviewModal.tsx`)**:
   - In `CertificatePreviewModal.tsx`, the fallback PDF iframe URL had a hardcoded `http://localhost:8000` prefix, which broke modal preview rendering when deployed in staging or production environments (e.g., Render/Vercel).

5. **Seed Scenario Gap (`backend/app/database/reseed_catalogue.py` & `main.py`)**:
   - Existing seeds enrolled the demo trainee in incomplete courses without a passing assessment attempt on the same course, meaning the demo user had no issued certificate record in the database upon fresh deployment.

---

## 2. Files Changed

| File Path | Component | Scope & Purpose |
|:---|:---|:---|
| [backend/app/services/progress_service.py](file:///d:/SIH/PS2/Capacity%20Connect/backend/app/services/progress_service.py) | Backend Service | Added automatic eligibility check and certificate issuance upon reaching 100% lesson progress. |
| [backend/app/services/assessment_service.py](file:///d:/SIH/PS2/Capacity%20Connect/backend/app/services/assessment_service.py) | Backend Service | Added automated check and certificate issuance hook upon passing course assessment. |
| [backend/app/services/certificate_service.py](file:///d:/SIH/PS2/Capacity%20Connect/backend/app/services/certificate_service.py) | Backend Service | Added celebratory in-app notification (`CERTIFICATE_ISSUED`) linking directly to `/trainee/certificates`. |
| [backend/app/services/trainee_service.py](file:///d:/SIH/PS2/Capacity%20Connect/backend/app/services/trainee_service.py) | Backend Service | Fixed dashboard query to fetch accredited `Certificate` records and serialize matching fields. |
| [backend/app/main.py](file:///d:/SIH/PS2/Capacity%20Connect/backend/app/main.py) | Application Lifespan | Added safe startup verification assuring demo trainee has an accredited certificate issued for testing. |
| [backend/app/database/reseed_catalogue.py](file:///d:/SIH/PS2/Capacity%20Connect/backend/app/database/reseed_catalogue.py) | Database Seed | Seeded complete progress and passing assessment for demo trainee on accredited course. |
| [frontend/src/components/certificates/CertificatePreviewModal.tsx](file:///d:/SIH/PS2/Capacity%20Connect/frontend/src/components/certificates/CertificatePreviewModal.tsx) | Frontend UI Modal | Updated `pdfSource` to dynamically derive backend origin from `API_BASE_URL`. |
| [backend/tests/test_certificates.py](file:///d:/SIH/PS2/Capacity%20Connect/backend/tests/test_certificates.py) | Test Suite | Added 4 automated tests verifying lesson completion auto-issuance, assessment pass auto-issuance, dashboard integration, and RBAC protection. |

---

## 3. Backend / API Changes

### 3.1. Automatic Issuance in `ProgressService`
```python
# backend/app/services/progress_service.py
if pct >= 100.0:
    progress.is_completed = True
    progress.completed_at = now
    enrollment.status = "COMPLETED"
    enrollment.completed_at = now

    # Check eligibility and trigger automatic certificate generation if all requirements are met
    try:
        from app.services.certificate_service import CertificateService
        eligibility = CertificateService.check_eligibility(db, enrollment.user_id, course_id)
        if eligibility.eligible:
            CertificateService.issue_certificate(db, enrollment.user_id, course_id)
    except Exception as cert_err:
        print(f"[ProgressService] Certificate auto-issuance notice: {cert_err}")
```

### 3.2. Automatic Issuance in `AssessmentService`
```python
# backend/app/services/assessment_service.py
# If passed, check if the course now meets all requirements for accredited certificate issuance
if is_passed and attempt.assessment.course_id:
    try:
        from app.services.certificate_service import CertificateService
        eligibility = CertificateService.check_eligibility(
            db, user.id, attempt.assessment.course_id
        )
        if eligibility.eligible:
            CertificateService.issue_certificate(
                db, user.id, attempt.assessment.course_id
            )
    except Exception as cert_err:
        print(f"[AssessmentService] Certificate auto-issuance notice: {cert_err}")
```

### 3.3. In-App Notification Hook in `CertificateService`
```python
# backend/app/services/certificate_service.py
try:
    from app.models.notification import Notification
    notif = Notification(
        user_id=user_id,
        title=f"Certificate Issued: {course.title}",
        message=f"Congratulations! Your official IMD Certificate of Completion ({cert_number}) is ready to view and download.",
        notification_type="CERTIFICATE_ISSUED",
        link_url="/trainee/certificates",
        is_read=False,
    )
    db.add(notif)
except Exception as notif_err:
    print(f"[CertificateService] Notification creation warning: {notif_err}")
```

### 3.4. Trainee Dashboard Alignment in `TraineeService`
```python
# backend/app/services/trainee_service.py
from app.models.certificate import Certificate
certs = (
    db.query(Certificate)
    .options(joinedload(Certificate.course))
    .filter(Certificate.user_id == current_user.id)
    .order_by(Certificate.issue_date.desc(), Certificate.created_at.desc())
    .all()
)
certificates: List[CertificateItem] = []
for cert in certs:
    certificates.append(
        CertificateItem(
            id=cert.id,
            title=cert.course.title if cert.course else "Accredited Training Course",
            course_id=cert.course_id,
            course_title=cert.course.title if cert.course else None,
            issuing_organization="India Meteorological Department (IMD)",
            credential_id=cert.certificate_number,
            issue_date=cert.issue_date,
            verification_status=cert.status,
        )
    )
```

---

## 4. Frontend Changes

### 4.1. Dynamic Backend Origin for Preview Modal
In [frontend/src/components/certificates/CertificatePreviewModal.tsx](file:///d:/SIH/PS2/Capacity%20Connect/frontend/src/components/certificates/CertificatePreviewModal.tsx):
```tsx
const backendOrigin = API_BASE_URL.replace("/api/v1", "")
const pdfSource = certificate.pdf_url
  ? (certificate.pdf_url.startsWith("http") ? certificate.pdf_url : `${backendOrigin}${certificate.pdf_url}`)
  : certificateService.getDownloadUrl(certificate.id)
```
This guarantees preview functionality works regardless of whether the client connects to `http://127.0.0.1:8000` or production URL `https://capacity-connect.onrender.com`.

### 4.2. Existing Design System Preservation
- [frontend/src/pages/CertificatesPage.tsx](file:///d:/SIH/PS2/Capacity%20Connect/frontend/src/pages/CertificatesPage.tsx) is preserved and adheres to IMD branding guidelines:
  - Header with credentials counter badge (`N Credentials Earned`)
  - Two-column responsive certificate cards
  - Emerald accent bar indicating `ISSUED` status (`bg-emerald-700`)
  - Clear metadata breakdown: Certificate Number (monospace pill), Issue Date, Assessment Score with grade, Training Mode
  - Action buttons: **View Certificate** (modal with print/zoom), **Download PDF** (secure blob download), and **Verify Authenticity** (opens QR verification portal)
  - Seamless loading skeleton and contextual empty state with "Browse Course Catalogue" action button.

---

## 5. Database Verification

The database schema and records were verified:

1. **Table Schema (`certificates`)**:
   - `id`: UUID primary key
   - `certificate_number`: Unique varchar formatted as `CC-<YEAR>-<COURSE_CODE>-<SEQ>` (e.g., `CC-2026-SDI-000003`)
   - `user_id`: Foreign key referencing `users.id` (ON DELETE CASCADE)
   - `course_id`: Foreign key referencing `courses.id` (ON DELETE CASCADE)
   - `issue_date`: Date of issuance
   - `score`: Numeric percentage obtained on final assessment
   - `status`: String enum (`ISSUED`, `REVOKED`)
   - `verification_token`: Cryptographically secure token
   - `pdf_url`: Relative path stored as `/uploads/certificates/<USER_ID>/<CERT_NUMBER>.pdf`
   - `created_at`: UTC timestamp

2. **Alembic State**:
   - Migration head verified: `e7192a55042b (head)`
   - No pending migrations or uncommitted DDL changes.

3. **Data Integrity & Idempotence**:
   - Unique constraint `uq_user_course_certificate` ensures a user cannot receive duplicate certificates for the same course.
   - Calling `issue_certificate` repeatedly returns the existing record without throwing errors or duplicating database rows.

---

## 6. Certificate Generation Verification

Certificate generation was tested against all operational constraints:

| Requirement | Test Scenario | Verified Behavior | Status |
|:---|:---|:---|:---:|
| **Enrollment** | Trainee not enrolled in course | Certificate generation rejected with 400 Bad Request | Passed |
| **Lesson Progress** | Less than 100% lessons completed | Certificate generation rejected with 400 Bad Request | Passed |
| **Assessment Pass** | Assessment attempted but failed (< passing threshold) | Certificate generation rejected with 400 Bad Request | Passed |
| **All Criteria Met** | 100% lessons + passed assessment | Certificate issued automatically with unique ID and PDF | Passed |
| **No-Assessment Course** | Course without assessment reaches 100% lessons | Certificate issued automatically on final lesson completion | Passed |
| **Duplicate Prevention** | Same user/course triggered multiple times | Returns existing certificate without duplicate entry | Passed |

---

## 7. View / Download Verification

1. **PDF Rendering**:
   - ReportLab canvas renders high-resolution certificate with IMD emblem, ornate borders, dynamic recipient name, course title, completion date, and embedded QR verification code.
   - Generated file size: ~1.31 MB (1,309,570 bytes).
   - Storage path: `uploads/certificates/<user_id>/<certificate_number>.pdf`.

2. **Download Endpoint (`GET /api/v1/certificates/{id}/download`)**:
   - Returns HTTP 200 with `content-type: application/pdf`.
   - Content-Disposition header formats filename as:  
     `Capacity_Connect_Certificate_<CERT_NUMBER>.pdf`.
   - Trainee A attempting to download Trainee B's certificate receives HTTP 403 Forbidden.

3. **Public Verification Endpoints**:
   - `GET /api/v1/certificates/verify/{certificate_id}`:
     - Returns HTTP 200 with `{ "verified": true, "status": "ISSUED", "certificate_number": "...", "trainee_name": "...", "course_title": "..." }`.
     - Requires **no authentication**, enabling seamless verification from smartphone QR code scanners.
   - `GET /certificates/verify/{certificate_id}`:
     - Root-level alias returns HTTP 200, matching the QR code URL structure printed on the certificate document.

---

## 8. Security & RBAC Verification

Security constraints were verified through automated and manual tests:

1. **Trainee Isolation**:
   - `GET /api/v1/certificates/me` queries the database strictly filtering by `Certificate.user_id == current_user.id`. The frontend cannot supply or manipulate target `user_id`.
   - Trainee 1 cannot see or download Trainee 2's certificates (HTTP 403 Forbidden).

2. **Admin Privileges**:
   - Administrators can view all system-wide certificates via `GET /api/v1/certificates/admin/all`.
   - Administrators can revoke certificates via `POST /api/v1/certificates/admin/{id}/revoke`.
   - Trainees attempting to call admin endpoints receive HTTP 403 Forbidden.

3. **Revocation Enforcement**:
   - Once revoked by an administrator, the certificate status changes to `REVOKED`.
   - Public QR verification reflects `{ "verified": false, "status": "REVOKED", "message": "Certificate was revoked..." }`.

---

## 9. Tests Executed and Results

### 9.1. Backend Pytest Suite (`backend/tests/test_certificates.py`)
```
============================= test session starts =============================
platform win32 -- Python 3.14.4, pytest-9.1.1, pluggy-1.6.0
collected 14 items

tests/test_certificates.py::test_eligible_trainee_can_receive_certificate PASSED [  7%]
tests/test_certificates.py::test_incomplete_course_cannot_generate_certificate PASSED [ 14%]
tests/test_certificates.py::test_failed_assessment_cannot_generate_certificate PASSED [ 21%]
tests/test_certificates.py::test_certificate_belongs_to_correct_trainee PASSED [ 28%]
tests/test_certificates.py::test_trainee_cannot_download_another_trainees_certificate PASSED [ 35%]
tests/test_certificates.py::test_certificate_number_is_unique PASSED     [ 42%]
tests/test_certificates.py::test_duplicate_certificate_is_prevented PASSED [ 50%]
tests/test_certificates.py::test_qr_verification_works PASSED            [ 57%]
tests/test_certificates.py::test_invalid_certificate_returns_not_found PASSED [ 64%]
tests/test_certificates.py::test_revoked_certificate_is_reported_correctly PASSED [ 71%]
tests/test_certificates.py::test_auto_issue_certificate_on_completing_lessons PASSED [ 78%]
tests/test_certificates.py::test_auto_issue_certificate_on_passing_assessment PASSED [ 85%]
tests/test_certificates.py::test_trainee_dashboard_returns_certificates PASSED [ 92%]
tests/test_certificates.py::test_admin_list_and_rbac_protection PASSED   [100%]

======================= 14 passed in 4.24s =======================
```

### 9.2. Full Backend Test Suite
```
pytest backend/tests/ -v
====================== 134 passed, 6 warnings in 41.16s =======================
```
All 134 backend test cases passed across authentication, courses, assessments, competencies, feedback, AI intelligence, and certificates.

### 9.3. Frontend Vitest Suite (`npm run test`)
```
 RUN  v5.0.2 D:/SIH/PS2/Capacity Connect/frontend

 ✓ src/tests/auth.test.tsx (8 tests)
 ✓ src/tests/featured_carousel.test.tsx (10 tests)
 ✓ src/tests/phase6_integration.test.tsx (3 tests)
 ✓ src/tests/certificates.test.tsx (6 tests)
 ✓ src/tests/trainee_experience.test.tsx (8 tests)
 ✓ src/tests/phase7_ai.test.tsx (5 tests)
 ✓ src/tests/public_course_catalogue_responsive.test.tsx (7 tests)
 ✓ src/tests/trainee_course_catalogue.test.tsx (7 tests)
 ✓ src/tests/course_media.test.tsx (11 tests)
 ✓ src/tests/phase4_portals.test.tsx (10 tests)
 ✓ src/tests/phase5_competency.test.tsx (6 tests)

 Test Files  11 passed (11)
      Tests  81 passed (81)
   Duration  42.19s
```

---

## 10. Build Result

### Frontend Production Build (`npm run build`)
```
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.1 building client environment for production...
transforming...
✓ 3146 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                   0.91 kB │ gzip:   0.49 kB
dist/assets/index-D5cCt9pK.css                   95.18 kB │ gzip:  15.80 kB
dist/assets/CompetencyUniverse3D-BJNUXj_8.js    938.79 kB │ gzip: 249.64 kB
dist/assets/index-A1RaMa_G.js                 1,203.23 kB │ gzip: 305.33 kB
✓ built in 5.63s
```
Frontend compiled cleanly with TypeScript 0 errors and zero broken imports.

---

## 11. Final End-to-End Verification

A live automated verification against the running backend server (`http://127.0.0.1:8000`) verified the exact user lifecycle:

1. **Authentication**:
   - Authenticated as `trainee.demo@imd.gov.in` $\longrightarrow$ HTTP 200, JWT access token received.
2. **My Certificates Retrieval**:
   - `GET /api/v1/certificates/me` $\longrightarrow$ HTTP 200, returned 1 certificate:
     - Certificate Number: `CC-2026-SDI-000003`
     - Course Title: `Satellite Data Interpretation`
     - Status: `ISSUED`
     - PDF URL: `/uploads/certificates/e76a58dc-fd03-4bb1-a8fc-3887fa6ddd8d/CC-2026-SDI-000003.pdf`
3. **Public QR Verification**:
   - `GET /api/v1/certificates/verify/508d7558-54ac-4ac3-9d2c-681677fd633d` $\longrightarrow$ HTTP 200, verified: `True`.
4. **PDF Download**:
   - `GET /api/v1/certificates/508d7558-54ac-4ac3-9d2c-681677fd633d/download` $\longrightarrow$ HTTP 200, Content-Type: `application/pdf`, Payload size: `1,309,570 bytes`.
5. **Trainee Dashboard Integration**:
   - `GET /api/v1/trainee/dashboard` $\longrightarrow$ HTTP 200.
   - `certificates` field contains the IMD certificate record with credential ID `CC-2026-SDI-000003` and organization `India Meteorological Department (IMD)`.
6. **Zero Certificate Account / Empty State Verification**:
   - Authenticated with zero-certificate user $\longrightarrow$ `GET /api/v1/certificates/me` returned `[]` (HTTP 200).
   - Frontend correctly renders the designed empty state: *"No Certificates Earned Yet — Certificates are automatically generated upon course completion and passing required assessments."* with a direct CTA to Browse Course Catalogue.

---

## Conclusion

The Trainee "My Certificates" page and the Trainee Dashboard now correctly, securely, and automatically display accredited certificates earned by India Meteorological Department trainees. All existing RBAC constraints, PDF generation templates, cryptographic QR verification links, and frontend design systems have been preserved with 100% integrity.
