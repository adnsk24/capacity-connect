# Trainee Course Catalogue Navigation & Portal Separation Report

**System:** Capacity Connect — India Meteorological Department (IMD) Digital Capacity Building Portal  
**Document:** `docs/reports/TRAINEE_COURSE_CATALOGUE_REPORT.md`  
**Date:** September 29, 2026  
**Status:** Completed & Validated  

---

## 1. Problem Identified

When a user logged into Capacity Connect as an authenticated **TRAINEE** and clicked **"Course Catalogue"** from the Trainee Sidebar or dashboard call-to-actions, the application routed to `/courses`.

Because `/courses` was nested strictly under `<Route path="/" element={<AppShell />}>`, the browser replaced the entire trainee portal interface with the public landing layout:
- The Trainee Sidebar, Trainee Header, session navigation, and authenticated portal shell disappeared.
- The trainee was visually and contextually kicked out to the public website experience.
- Breadcrumbs and back navigation led further into public landing pages rather than returning to the Trainee Dashboard.
- The experience was disjointed and inconsistent with the rest of the authenticated portal (`/trainee/dashboard`, `/trainee/learning`, `/trainee/assessments`, etc.).

---

## 2. Existing Routing Analyzed

An audit of `frontend/src/App.tsx` and related components revealed:

1. **Public Layout (`AppShell`):**
   - Mounted at path `"/"`.
   - Included routes `courses` (`/courses` -> `CourseCataloguePage`) and `courses/:courseId` (`/courses/:courseId` -> `CourseDetailPage`).
   - Hardcoded for unauthenticated landing page visitors.

2. **Authenticated Trainee Layout (`TraineeLayout`):**
   - Mounted at path `"/trainee"`.
   - Protected by `<ProtectedRoute allowedRoles={["TRAINEE"]}>`.
   - Included subroutes `dashboard`, `profile`, `learning`, `assessments`, `competencies`, `skill-gap`, `certificates`, `notifications`.
   - Missing dedicated routes for `courses` and `courses/:courseId`.

3. **Navigation Links:**
   - `TraineeSidebar.tsx` (line 24) hardcoded `{ to: "/courses", label: "Course Catalogue", icon: BookOpen }`.
   - `TraineeDashboardPage.tsx`, `MyLearningPage.tsx`, `TraineeAssessmentsPage.tsx`, `CertificatesPage.tsx`, and `AssessmentResultPage.tsx` had buttons/empty-states pointing directly to `/courses`.
   - `CourseCard.tsx` had fixed links to `/courses/${course.id}`, meaning clicking "View Course" from inside any portal would break out into the public layout.
   - `CourseDetailPage.tsx` had breadcrumbs hardcoded to `/courses`.

---

## 3. New Routes Created

Under the existing protected `/trainee` route group in [frontend/src/App.tsx](file:///d:/SIH/PS2/Capacity%20Connect/frontend/src/App.tsx), two new routes were added:

```tsx
<Route
  path="/trainee"
  element={
    <ProtectedRoute allowedRoles={["TRAINEE"]}>
      <TraineeLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<Navigate to="/trainee/dashboard" replace />} />
  <Route path="dashboard" element={<TraineeDashboardPage />} />
  <Route path="profile" element={<TraineeProfilePage />} />
  <Route path="courses" element={<TraineeCoursesPage />} />
  <Route path="courses/:courseId" element={<CourseDetailPage />} />
  <Route path="learning" element={<MyLearningPage />} />
  ...
</Route>
```

- **`/trainee/courses`**: Dedicated authenticated Trainee Course Catalogue page rendered inside `TraineeLayout`.
- **`/trainee/courses/:courseId`**: Course Detail page rendered inside `TraineeLayout` for trainees.
- **`/courses` & `/courses/:courseId`**: Preserved untouched under `AppShell` for public and unauthenticated visitors.

---

## 4. Components Created & Reused

### New Components:
- **`TraineeCoursesPage`** (`frontend/src/pages/TraineeCoursesPage.tsx`):
  - Dedicated authenticated course catalogue tailored for the Trainee Portal shell.
  - Page header with IMD Official Curriculum badge (`BIP-M / WMO Standards`), `BookOpen` icon, and title.
  - Interactive category selector tabs with live course count badges.
  - URL query string synchronization via `useSearchParams` (`category_id`) for category filtering and breadcrumb deep links.
  - Live search input and difficulty level filter buttons (All Levels, Beginner, Intermediate, Advanced).
  - Responsive course grid (1-column on mobile, 2 on tablet, 3 on desktop, 4 on wide desktop).
  - Loading skeleton (`CourseCatalogSkeleton`), empty states (`EmptyState`), and retryable error states (`ErrorState`).
  - Pagination controls (Previous, Page X of Y, Next).
  - Supplies `basePath="/trainee/courses"` to `CourseCard`.

### Modified & Reused Components:
- **`CourseCard`** (`frontend/src/components/ui/course-card.tsx`):
  - Added optional `basePath?: string` prop (defaults to `"/courses"`).
  - When rendered in `TraineeCoursesPage`, receives `basePath="/trainee/courses"`.
  - "View Course" button and course title link resolve to `${basePath}/${course.id}` (`/trainee/courses/:courseId`).
  - "Continue Learning" link directs to `/courses/:courseId/learn` (which already runs inside `TraineeLayout`).
  - "Enroll Now" calls `coursesService.enrollInCourse` and navigates to the learning viewer inside `TraineeLayout`.
- **`CourseDetailPage`** (`frontend/src/pages/CourseDetailPage.tsx`):
  - Detects if `location.pathname.startsWith("/trainee")`.
  - In trainee context, breadcrumbs point to `/trainee/courses` ("Course Catalogue") and `/trainee/courses?category_id=...`.
  - Ensures trainees clicking breadcrumbs or Back stay strictly within the Trainee Portal.
- **`LearningContentPage`** (`frontend/src/pages/LearningContentPage.tsx`):
  - Updated breadcrumbs to link back to `/trainee/courses/${course.id}` for authenticated trainees instead of public `/courses/${course.id}`.

---

## 5. APIs Reused (Zero Backend/Database Duplication)

No backend changes or duplicate database tables/models were created. The new page directly reuses the existing API endpoints and services:

1. **`coursesService.getCatalogue(params)`**:
   - `GET /api/v1/courses/catalogue?search=...&category_id=...&difficulty=...&page=...&page_size=...`
   - Reuses category listing, course counts, difficulty levels, trainer information, and enrollment status.
2. **`coursesService.getCourseDetails(courseId)`**:
   - `GET /api/v1/courses/:courseId`
   - Supplies curriculum modules, lessons, competencies, resources, and trainer profile.
3. **`coursesService.enrollInCourse(courseId)`**:
   - `POST /api/v1/courses/:courseId/enroll`
   - Reuses existing enrollment mutation with automatic cache invalidation (`courses-catalogue`, `course-detail`, `trainee-dashboard`, `trainee-learning`).

---

## 6. Navigation Changes

All trainee internal portal links previously referencing the public `/courses` route were redirected to `/trainee/courses`:

| Source Component | Previous Target | Updated Target | Context |
| :--- | :--- | :--- | :--- |
| `TraineeSidebar.tsx:24` | `/courses` | `/trainee/courses` | Sidebar "Course Catalogue" menu item |
| `TraineeDashboardPage.tsx:84` | `/courses` | `/trainee/courses` | Header "Browse Courses" CTA |
| `TraineeDashboardPage.tsx:176` | `/courses` | `/trainee/courses` | Empty state "Explore Courses" action |
| `MyLearningPage.tsx:67` | `/courses` | `/trainee/courses` | Header "Browse More Courses" CTA |
| `MyLearningPage.tsx:82` | `/courses` | `/trainee/courses` | Empty state "Explore Course Catalogue" action |
| `TraineeAssessmentsPage.tsx:140`| `/courses` | `/trainee/courses` | Empty state "Explore Course Catalogue" CTA |
| `CertificatesPage.tsx:105` | `/courses` | `/trainee/courses` | Empty state "Browse Course Catalogue" action |
| `AssessmentResultPage.tsx:141` | `/courses` | `/trainee/courses` | Results summary "Catalogue" button |
| `TraineeCompetenciesPage.tsx:516` | `/courses/:id` | `/trainee/courses/:id` | Gap closure course recommendation CTA |
| `CourseCard.tsx:124,193` | `/courses/:id` | `/trainee/courses/:id` | Card title and "View Course" link (when in trainee portal) |
| `CourseDetailPage.tsx:117` | `/courses` | `/trainee/courses` | Trainee detail view breadcrumb |

**Public Routes Unchanged:**
- Public Landing Page (`HomePage.tsx`), public Navbar (`Navbar.tsx`), public Footer (`Footer.tsx`), and Certificate Verification (`CertificateVerifyPage.tsx`) continue to link to public `/courses`.

---

## 7. RBAC Protection & Security

- Route `/trainee/courses` and `/trainee/courses/:courseId` are nested under `<Route path="/trainee" element={<ProtectedRoute allowedRoles={["TRAINEE"]}><TraineeLayout /></ProtectedRoute>}>`.
- **Unauthenticated Access:** Anyone attempting to open `/trainee/courses` directly without logging in is intercepted by `ProtectedRoute` and redirected to `/login?redirect=/trainee/courses`.
- **Non-Trainee Role Access:** If a user with role `TRAINER` or `ADMIN` navigates to `/trainee/courses`, `ProtectedRoute` intercepts them and redirects to their role-specific dashboard (`/trainer/dashboard` or `/admin/dashboard`).
- **Session Refresh:** Refreshing `/trainee/courses` or `/trainee/courses/:courseId` preserves the authenticated session and remains inside `TraineeLayout`.

---

## 8. Tests Performed

A dedicated Vitest test suite was created in `frontend/src/tests/trainee_course_catalogue.test.tsx` containing 7 test cases covering the entire scope:

1. **Public Catalogue Independence:**
   - Unauthenticated visitors navigating to `/courses` receive `CourseCataloguePage` inside `AppShell` with public links pointing to `/courses/:id`.
2. **Sidebar Navigation Link:**
   - TraineeSidebar renders "Course Catalogue" NavLink with `href="/trainee/courses"`.
3. **Dashboard Navigation Link:**
   - Trainee Dashboard "Browse Courses" CTA links to `/trainee/courses`.
4. **Trainee Shell Preservation & Card Routing:**
   - Navigating to `/trainee/courses` renders `TraineeCoursesPage` inside `TraineeLayout` (sidebar, header, navigation).
   - Course cards link to `/trainee/courses/:id`.
   - Enrolled courses link to `/courses/:id/learn`.
5. **Contextual Breadcrumbs:**
   - Navigating to `/trainee/courses/:id` renders `CourseDetailPage` inside `TraineeLayout` with breadcrumb linking back to `/trainee/courses`.
6. **Authentication Protection:**
   - Unauthenticated direct access to `/trainee/courses` is redirected to `/login`.
7. **RBAC Role Guarding:**
   - Non-trainee direct access (e.g. `TRAINER`) to `/trainee/courses` is blocked and redirected to `/trainer/dashboard`.

### Test Execution Results:
```bash
> frontend@0.0.0 test
> vitest run --run

 Test Files  9 passed (9)
      Tests  69 passed (69)
   Duration  4.92s
```
All 9 test suites (69 tests total) passed with 0 failures and 0 warnings.

---

## 9. Build Result

Production build was validated using TypeScript compilation and Vite:

```bash
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.1 building client environment for production...
transforming...
✓ 3141 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                   0.91 kB │ gzip:   0.50 kB
dist/assets/index-Cv09SaSd.css                   89.97 kB │ gzip:  15.14 kB
dist/assets/CompetencyUniverse3D-BP6xsQAV.js    938.79 kB │ gzip: 249.64 kB
dist/assets/index-pqXWu05y.js                 1,146.09 kB │ gzip: 295.32 kB
✓ built in 959ms
```
Exit code: `0`. TypeScript type checks and minification passed cleanly.

---

## 10. Limitations & Considerations

1. **Trainer/Admin Portals:** Trainer and Admin users already have their own dedicated course management interfaces (`/trainer/courses`, `/trainer/courses/:courseId`, `/admin/courses`). Trainee-specific catalogue routes are strictly restricted to role `TRAINEE`.
2. **Learning Content Viewer:** The interactive learning viewer route `/courses/:courseId/learn` continues to be protected by `<ProtectedRoute allowedRoles={["TRAINEE", "TRAINER", "ADMIN"]}><TraineeLayout /></ProtectedRoute>`, allowing enrolled trainees to learn while preserving the portal shell. Breadcrumbs within the learning viewer now return trainees to `/trainee/courses/:courseId`.
