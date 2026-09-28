# COURSE MEDIA RESOURCES — IMPLEMENTATION REPORT
**Capacity Connect — IMD Digital Capacity Building Portal**
_Report Date: 2026-09-28_

---

## 1. EXECUTIVE SUMMARY

This report documents the complete implementation of **Course Video & Audio Learning Resources** for the Capacity Connect (IMD) portal. The feature was designed as a clean, in-place extension to the existing course management system — preserving all assessments, competency tracking, enrollment records, and progress data — while adding structured media learning support.

### Objectives Achieved
- ✅ Trainers can attach Video, Audio, Document, Presentation, and External Video resources to courses and modules
- ✅ Trainees in enrolled courses see resources in LearningContentPage alongside lessons with filter tabs
- ✅ Server-side RBAC enforced: trainers only modify their own courses; trainees only see published resources when enrolled
- ✅ Local storage at ₹0 cost (no paid cloud services)
- ✅ Full test coverage: **12 backend security tests** + **11 frontend component tests** = **46 total frontend tests, 105 total backend tests** — all passing

---

## 2. ARCHITECTURE OVERVIEW

### Storage Strategy
```
uploads/
  course-media/
    videos/        ← MP4, WebM files (max 100 MB)
    audio/         ← MP3, WAV, M4A, AAC files (max 30 MB)
    documents/     ← PDF, DOCX, TXT files (max 25 MB)
    thumbnails/    ← JPEG, PNG thumbnail images
```

Served at `/uploads` via FastAPI `StaticFiles`. External video links (YouTube, official IMD broadcasts) stored as URL-only records — no local copy.

### Database Schema Changes (Alembic Migration `7278f0014421`)

**Extended `resources` table:**
| Column | Type | Purpose |
|--------|------|---------|
| `module_id` | UUID FK → modules | Associate resource with a module |
| `lesson_id` | UUID FK → lessons | Associate resource with a specific lesson |
| `media_url` | VARCHAR | Canonical playback/download URL |
| `thumbnail_url` | VARCHAR | Thumbnail image URL |
| `duration_seconds` | INTEGER | Runtime for completion tracking |
| `display_order` | INTEGER | Trainer-controlled ordering |
| `is_published` | BOOLEAN | Draft/Published toggle |
| `created_by` | UUID FK → users | Authorship/RBAC enforcement |

**New `resource_completions` table:**
| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Primary key |
| `resource_id` | UUID FK → resources | Which resource |
| `enrollment_id` | UUID FK → enrollments | Whose enrollment |
| `is_completed` | BOOLEAN | Completion state |
| `progress_seconds` | INTEGER | Playback position (for resume) |
| `completed_at` | TIMESTAMPTZ | When marked complete |

---

## 3. BACKEND IMPLEMENTATION

### Files Modified / Created

| File | Change |
|------|--------|
| `backend/app/models/course.py` | Extended `Resource` model + new `ResourceCompletion` model |
| `backend/app/services/storage_service.py` | MIME validation, size limits, SSRF/XSS URL sanitisation |
| `backend/app/services/resource_service.py` | Full CRUD, publish toggle, completion recording, RBAC |
| `backend/app/routers/courses.py` | `GET/POST /courses/{id}/resources`, `POST /courses/{id}/resources/upload` |
| `backend/app/routers/resources.py` | `PUT`, `DELETE`, `POST /publish`, `POST /complete` per resource |
| `backend/app/main.py` | Mounted `/uploads` static file directory |
| `backend/alembic/versions/7278f0014421_*.py` | Schema migration |
| `backend/app/database/seed_course_media.py` | 18 seeded official IMD resources |
| `backend/tests/test_course_media.py` | 12 security + lifecycle tests |

### Security Controls
- **MIME checking**: `python-multipart` + `mimetypes` validation (not extension-only)
- **Size enforcement**: `413 Content Too Large` on violations
- **External URL validation**: `StorageService.validate_external_url` enforces `http/https` only; blocks `javascript:`, `file:`, `data:`, and private IP ranges (SSRF protection)
- **Ownership RBAC**: `resource_service.py` verifies `resource.created_by == current_user.id` on all mutations
- **Enrollment gate**: Trainees can only access resources if `enrollment.status == "IN_PROGRESS"` or `"COMPLETED"` in their own enrollment

### Seeded Official Resources (18 items)
- MET-101: 3 IMD official documents
- MET-103: 3 official NWP/GFS reference materials
- MET-202: 3 satellite imagery resources (INSAT-3D)
- MET-203: 2 Doppler Radar lecture files + 1 external broadcast
- MET-204: 3 advanced radar + cyclone tracking resources
- MET-302: 3 expert-level synoptic analysis resources

---

## 4. FRONTEND IMPLEMENTATION

### Files Modified / Created

| File | Change |
|------|--------|
| `frontend/src/services/courses.ts` | Extended `ResourceItem` type; added `getCourseResources`, `completeResource` |
| `frontend/src/services/trainer.ts` | Added `createResource`, `uploadResource`, `updateResource`, `deleteResource`, `publishResource` |
| `frontend/src/components/ui/ResourceCard.tsx` | New reusable card with thumbnail, type badges, duration, Play/Open, Complete, Edit, Delete, Publish, Move Up/Down |
| `frontend/src/components/ui/VideoPlayerModal.tsx` | HTML5 `<video>` + YouTube safe embed; 90% threshold auto-complete |
| `frontend/src/components/ui/AudioPlayerModal.tsx` | Native `<audio>` player with 90% threshold + manual complete |
| `frontend/src/pages/TrainerCourseDetailPage.tsx` | Full LEARNING RESOURCES section with 5 typed add buttons, unified modal, edit/delete/publish/reorder |
| `frontend/src/pages/LearningContentPage.tsx` | Integrated ResourceCard stack per lesson; filter pills; VideoPlayerModal + AudioPlayerModal |
| `frontend/src/tests/course_media.test.tsx` | 11 frontend component + integration tests |

### Trainer Portal — LEARNING RESOURCES Section

The `TrainerCourseDetailPage` now contains:

```
LEARNING RESOURCES (N)
  Attach video lectures, audio briefings, presentations...

  [ + Add Video ]  [ + Add Audio ]  [ + Add Document ]  [ + Add Presentation ]  [ + Add External Video ]
  
  ┌─────────────────────────────────────────────────────┐
  │ [VIDEO] 12:45  PUBLISHED  Introduction to...        │
  │                           [↑] [↓] [Unpublish] [✎] [🗑] │
  ├─────────────────────────────────────────────────────┤
  │ [AUDIO] 10:32  PUBLISHED  Radar Acoustics...        │
  │                           [↑] [↓] [Unpublish] [✎] [🗑] │
  └─────────────────────────────────────────────────────┘
```

**Unified Add/Edit Modal supports:**
- Title and Description
- Module selector → Lesson selector (cascading)
- File upload (type-restricted accept attribute) OR external URL
- Optional thumbnail URL or thumbnail file upload
- Duration in minutes, display order, Draft/Published radio

### Trainee Portal — LearningContentPage

Resources are rendered inside lesson content with filter pills:

```
Learning Resources  [7]
  [ All (7) ] [ Videos (2) ] [ Audio (1) ] [ Documents (3) ] [ Presentations (1) ]
  
  ┌─────────────────────────────────────────────────────┐
  │ [VIDEO] 12:45  Introduction to Doppler Radar...     │
  │         [Play]                        [Mark Complete]│
  └─────────────────────────────────────────────────────┘
```

VideoPlayerModal and AudioPlayerModal auto-trigger `completeResource` at 90% playback.

---

## 5. TEST RESULTS

### Backend Tests (pytest)

```
pytest tests/test_course_media.py -v

PASSED  test_trainer_can_create_resource
PASSED  test_trainer_cannot_modify_another_trainers_course
PASSED  test_trainer_can_publish_and_unpublish_own_resource
PASSED  test_trainee_cannot_create_resource
PASSED  test_trainee_must_be_enrolled_to_access_resources
PASSED  test_trainee_cannot_access_draft_resource
PASSED  test_trainee_can_access_published_resource
PASSED  test_admin_can_manage_resources
PASSED  test_invalid_mime_rejected
PASSED  test_oversized_upload_rejected
PASSED  test_invalid_external_url_rejected
PASSED  test_trainee_can_complete_resource

12 passed, 3 warnings — alembic head: 7278f0014421
Full suite: 105 passed (all)
```

### Frontend Tests (vitest)

```
vitest run
 ✓ src/tests/course_media.test.tsx (11 tests)
   ✓ renders trainer LEARNING RESOURCES section with 5 add buttons
   ✓ opens add video modal when + Add Video is clicked
   ✓ opens add audio modal showing audio file size info
   ✓ accepts external video URL and calls createResource on save
   ✓ opens edit modal with pre-filled title for existing resource
   ✓ toggles publish status by calling publishResource
   ✓ displays only published resources for trainee in learning content
   ✓ renders VideoPlayerModal with title and Mark as Completed button
   ✓ renders AudioPlayerModal with title and Mark as Completed button
   ✓ filters resource list between Videos and Audio tabs
   ✓ ResourceCard root element has mobile-first flex-col and sm:flex-row classes

Test Files  6 passed (6)
     Tests  46 passed (46)
```

### Production Build

```
npm run build — Exit code 0

vite v8.3.1 building for production...
✓ 3136 modules transformed
dist/index.html  0.94 kB │ gzip: 0.50 kB
✓ built in 989ms
```

---

## 6. CONSTRAINTS ADHERED TO

| Constraint | Status |
|-----------|--------|
| ₹0 storage — no AWS S3, Mux, Cloudinary | ✅ Local disk only |
| No live streaming, transcoding, AI subtitles | ✅ Not implemented |
| Preserve assessments and competency formula | ✅ Untouched |
| Preserve enrollment logic and progress tracking | ✅ Untouched |
| IMD light theme — no dark dashboards, no neon | ✅ Consistent |
| External URLs validated (no SSRF/XSS) | ✅ `validate_external_url` |

---

## 7. DEPLOYMENT CHECKLIST

- [x] `alembic upgrade head` applied → head `7278f0014421`
- [x] `uploads/course-media/` directory created in backend root
- [x] `app.mount("/uploads", ...)` active in `main.py`
- [x] `python-multipart` installed in `.venv`
- [x] Seed script run: `python -m app.database.seed_course_media`
- [x] `npm run build` — production bundle verified
- [x] All 105 backend tests passing
- [x] All 46 frontend tests passing

---

_Report generated for SIH PS2 — Capacity Connect (IMD Digital Capacity Building Portal)_
