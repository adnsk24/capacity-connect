# Public Course Catalogue Responsive & Layout Alignment Fix Report

**System:** Capacity Connect — India Meteorological Department (IMD) Digital Capacity Building Portal  
**Document:** `docs/reports/PUBLIC_COURSE_CATALOGUE_RESPONSIVE_FIX_REPORT.md`  
**Date:** September 29, 2026  
**Status:** Completed & Validated  
**Note:** Changes committed locally. Manual push reserved for user.

---

## 1. Root Causes Identified

A thorough architectural and responsive audit of the public Courses page (`/courses`) revealed the following root causes of layout misalignment, horizontal overflow, and responsive breakage:

1. **Container Width and Alignment Mismatch:**
   - The top navigation (`Navbar.tsx`), landing page (`HomePage.tsx`), and bottom navigation (`Footer.tsx`) all used the standard `<Container>` layout (`w-full max-w-[1360px] mx-auto px-4 sm:px-6 md:px-10 xl:px-[60px]`).
   - In contrast, `CourseCataloguePage.tsx` used `<div className="space-y-6 max-w-7xl mx-auto pb-12">`.
   - **Consequence:**
     - On desktop screens (> 1280px), the content was constrained to 1280px (`max-w-7xl`) instead of 1360px, causing the page content to be visibly indented and misaligned with the header logo, navigation tabs, and footer columns.
     - On mobile and tablet screens (< 1280px), because the wrapper had **zero horizontal padding** (`px-0`), page elements touched the absolute left and right boundaries of the screen (0px padding).

2. **Sub-Bar Wrapping & Ragged Stacking on Tablet:**
   - In the search and difficulty filter bar, `flex flex-col sm:flex-row items-stretch sm:items-center justify-between` was used with `sm:max-w-md` (448px) for search.
   - On tablet screens (e.g., 768px – 850px), `sm:max-w-md` took up over 60% of the available width, forcing the 4 difficulty buttons to wrap awkwardly into two ragged rows next to the search input, creating unbalanced gaps.

3. **Course Card Inconsistent Heights & Alignment:**
   - Card titles varied between 1 and 2 lines without a `min-h` guard.
   - Course descriptions varied between 1 and 2 lines without a `min-h` guard.
   - On rows containing cards with mixed title/description lengths, the syllabus details box and footer buttons were pushed to uneven vertical offsets.
   - Buttons inside `CourseCard.tsx` did not have `min-w-0` on their flex parents, and the trainer name string lacked proper truncation safeguards (`shrink min-w-0 truncate`), causing potential overflow on narrow viewports (360px – 430px).

4. **URL Query Synchronization Gaps:**
   - The global Navbar search bar submitted queries to `/courses?search=...`, and course detail breadcrumbs linked to `/courses?category_id=...`.
   - However, `CourseCataloguePage.tsx` did not read `useSearchParams()`. As a result, searching from the navbar or navigating from category links failed to filter courses automatically.

5. **Loading Skeleton Misalignment:**
   - `CourseCatalogSkeleton` possessed its own `max-w-7xl mx-auto py-6` wrapper with fixed gaps, creating an initial layout jump when transitioning from loading to populated states.

---

## 2. Components Modified

| Component | File Path | Scope of Modification |
| :--- | :--- | :--- |
| **`CourseCataloguePage`** | `frontend/src/pages/CourseCataloguePage.tsx` | Redesigned with site-wide `<Container>`, updated page structure (Header -> Search+Filters -> Category Controls -> Course Grid), synchronized URL search params, and added responsive grid/spacing classes. |
| **`CourseCard`** | `frontend/src/components/ui/course-card.tsx` | Added `min-h` constraints on title and description, `min-w-0` on flex button parents, `truncate` safety on instructor metadata, and responsive typography/padding. |
| **`CourseCatalogSkeleton`** | `frontend/src/components/ui/loading-skeleton.tsx` | Removed nested max-width constraint to inherit container layout, aligned responsive grid gap tokens (`gap-4 sm:gap-5 lg:gap-6`). |

---

## 3. Responsive Changes & Structural Redesign

### Page Structure Implemented:
```
Page (w-full bg-[#F7F9FC] py-6 sm:py-8 lg:py-10)
 └── Container (max-w-[1360px] mx-auto px-4 sm:px-6 md:px-10 xl:px-[60px])
      ├── 1. Header / Hero
      │    ├── Official Curriculum badge + BIP-M subtitle
      │    ├── Main Heading (with BookOpen emblem)
      │    ├── Curriculum description
      │    └── Reset Filters button (conditional)
      ├── 2. Search + Filters Card
      │    ├── Full-width responsive search bar with clear button
      │    └── Grouped level filter pills (All, Beginner, Intermediate, Advanced)
      ├── 3. Category / Discipline Controls Card
      │    ├── Discipline label & count
      │    └── Smooth touch-scrollable discipline tabs
      └── 4. Course Grid Section
           ├── Results summary ("Showing X of Y courses")
           ├── Responsive Course Cards Grid
           │    └── CourseCard (equal height, aspect-[16/10] image, aligned CTA buttons)
           └── Pagination Controls
```

### Responsive Grid Breakpoints:
- **Mobile (< 640px):** Single column (`grid-cols-1`). Cards span full container width with comfortable `px-4` padding.
- **Small Tablet (640px – 1023px):** Two columns (`sm:grid-cols-2`). Cards have uniform heights and gaps (`gap-4 sm:gap-5`).
- **Tablet Landscape / Laptop (1024px – 1279px):** Three columns (`lg:grid-cols-3`). Gaps scale to `lg:gap-6`.
- **Large Desktop (1280px+):** Four columns (`xl:grid-cols-4`). Aligns with the 1360px container edges.

### Card Alignment Safeguards:
- Card Title: `min-h-[2.5rem]` guarantees 1-line and 2-line titles consume identical vertical space.
- Card Description: `min-h-[2.25rem]` ensures metadata box always aligns horizontally across cards.
- CTA Footer: `mt-auto` anchors "View Course" and "Enroll Now" buttons to the bottom edge.
- Responsive Image: `aspect-[16/10]` preserves crisp image ratios across all screen widths.

---

## 4. Breakpoints Tested

| Viewport | Dimensions | Grid Columns | Observations & Verification |
| :--- | :--- | :--- | :--- |
| **Large Desktop** | 1920 × 1080 | 4 Columns | Content perfectly centered at 1360px; aligns with Navbar emblem and Footer; no excessive whitespace. |
| **Standard Desktop** | 1440 × 900 | 4 Columns | Perfect 4-column layout; card buttons and badges aligned across all rows. |
| **Small Laptop** | 1280 × 720 | 4 Columns | Clean padding (`px-[60px]`); no horizontal overflow; cards maintain proportional aspect ratios. |
| **Tablet Landscape** | 1024 × 768 | 3 Columns | Grid automatically switches to 3 columns; Search & Level filters wrap cleanly; zero clipping. |
| **Tablet Portrait** | 768 × 1024 | 2 Columns | Grid displays 2 columns; discipline tabs scroll smoothly with touch pan; buttons inside cards remain readable. |
| **Large Mobile** | 430 × 932 | 1 Column | Full-width single-column cards; search input and level filters stack cleanly; no horizontal scrolling. |
| **Standard Mobile** | 390 × 844 | 1 Column | Cards have appropriate side padding (`px-4`); images scale cleanly; CTAs fit side-by-side without wrapping. |
| **Small Mobile** | 360 × 800 | 1 Column | Content remains 100% within viewport; zero horizontal scrollbar; text wraps naturally without truncation bugs. |

### Browser Zoom Scaling:
- **100% Zoom:** Baseline verified.
- **125% Zoom:** Layout scales gracefully; grid transitions between breakpoints cleanly.
- **150% Zoom:** Content remains legible; no overlapping buttons; cards maintain minimum touch targets.

---

## 5. Functional & Automated Tests

A dedicated responsive test suite was added in `frontend/src/tests/public_course_catalogue_responsive.test.tsx` verifying:
1. Container max-width (`max-w-[1360px]`) and responsive padding tokens (`px-4 sm:px-6 md:px-10 xl:px-[60px]`).
2. CSS Grid responsive class assignments (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
3. Responsive card images (`aspect-[16/10]`) and public detail link targets (`/courses/:id`).
4. Search input change events, query filtering, and search clear button behavior.
5. Difficulty level filter buttons, active highlight states, and "Reset Filters" action.
6. Discipline/category tab filtering with dynamic course counts.
7. Confirmation that authenticated Trainee portal routes and layout remain separate and unaffected.

### Vitest Test Results:
```bash
> frontend@0.0.0 test
> vitest run --run

 Test Files  10 passed (10)
      Tests  76 passed (76)
   Duration  5.67s
```
All 10 test suites (76 tests total) passed with 0 failures.

---

## 6. Production Build Result

The production bundle was compiled using Vite and TypeScript:
```bash
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.1 building client environment for production...
transforming...
✓ 3141 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                   0.91 kB │ gzip:   0.50 kB
dist/assets/index-Dhb2P8SK.css                   91.32 kB │ gzip:  15.40 kB
dist/assets/CompetencyUniverse3D-DekGua7u.js    938.79 kB │ gzip: 249.64 kB
dist/assets/index-DKGyi0EY.js                 1,147.99 kB │ gzip: 295.91 kB
✓ built in 1.05s
```
Exit code: `0`. TypeScript type checking and asset minification completed with zero errors.

---

## 7. Confirmation: Trainee Catalogue & Home Page Unaffected

1. **Trainee Course Catalogue (`/trainee/courses`):**
   - Implemented in `frontend/src/pages/TraineeCoursesPage.tsx` under `<Route path="/trainee" element={<ProtectedRoute allowedRoles={["TRAINEE"]}><TraineeLayout /></ProtectedRoute>}>`.
   - Completely independent from `CourseCataloguePage.tsx`.
   - Verified that the Trainee Sidebar, Trainee Header, and trainee role protection remain fully functional.
2. **Home Page (`/`):**
   - Verified that all CTA links on `HomePage.tsx` (`Explore Courses`, `View Complete Course Catalogue`, category cards) continue to navigate smoothly to `/courses`.
   - Hero banner, featured carousel, and stats cards remain 100% operational.

---

## 8. Remaining Limitations & Notes

- **Manual Push Reserved:** In accordance with user instructions (*"dont push i will push manually"*), changes have been committed locally on the `master` branch. The remote repository on GitHub will be updated when the user executes `git push`.
