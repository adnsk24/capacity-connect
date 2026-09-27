# Capacity Connect — Final System Architecture & Operational Overview

**IMD Digital Capacity Building & Learning Management Portal**  
**Version**: 1.0.0 (SIH Final Deliverable)  
**Classification**: Government of India / IMD Internal Platform  
**Operational Cost**: ₹0.00 (Zero paid AI APIs, 100% open-source, reproducible architecture)

---

## 1. Project Purpose

Capacity Connect is an enterprise-grade digital capacity building and learning management platform engineered specifically for the **India Meteorological Department (IMD)** under the Ministry of Earth Sciences (MoES). Its core mission is to transform conventional, siloed meteorological training into verifiable institutional competency evidence, automated skill deficiency detection, and transparent faculty nomination.

---

## 2. Problem Statement

Meteorological operations demand high-consequence precision across disparate disciplines: Doppler Weather Radar (DWR) operations, Numerical Weather Prediction (NWP) interpretation, tropical cyclone track forecasting, and automatic weather station telemetry.

Historically, organizations faced three critical bottlenecks:
1. **Unverifiable Training**: Course completion was disconnected from actual operational performance on the forecasting bench.
2. **Subjective Gap Auditing**: Capability deficiencies were identified reactively during severe weather crises rather than proactively diagnosed.
3. **Faculty Allocation Friction**: Trainer assignments relied on manual guesswork rather than quantitative matching between course competencies and faculty track records.

Capacity Connect resolves this through a **closed-loop capacity-building pipeline**:
$$\text{Learn} \longrightarrow \text{Assess} \longrightarrow \text{Map Competency} \longrightarrow \text{Audit Gaps} \longrightarrow \text{Targeted Recs} \longrightarrow \text{Faculty Match}$$

---

## 3. High-Level Architecture

The platform follows a decoupled, resilient client-gateway-database pattern:

```
                            ┌────────────────────────────────────────┐
                            │           Browser Client               │
                            │      React 19 + TypeScript + Vite      │
                            │      Tailwind CSS + Lucide Icons       │
                            │   Zustand + TanStack Query (v5)        │
                            │   Three.js + React Three Fiber (R3F)   │
                            └───────────────────┬────────────────────┘
                                                │ HTTPS / JSON REST
                                                ▼
                            ┌────────────────────────────────────────┐
                            │           FastAPI Gateway              │
                            │            /api/v1/...                 │
                            │     Pydantic v2 Contracts + JWT Auth   │
                            └───────┬────────────────────────┬───────┘
                                    │                        │
                    ┌───────────────┴────────┐      ┌────────┴───────────────┐
                    │  Operational Services  │      │  Intelligence Services │
                    │  - Auth & RBAC         │      │  - Multi-Source Engine │
                    │  - Courses & Content   │      │  - Readiness Index     │
                    │  - MCQ Assessment      │      │  - Skill Gap Analyzer  │
                    │  - Feedback & Ratings  │      │  - Course Recommender  │
                    │  - Notifications       │      │  - Trainer Matcher     │
                    └───────────────┬────────┘      └────────┬───────────────┘
                                    │                        │
                                    └───────────┬────────────┘
                                                │ SQLAlchemy 2.0 ORM
                                                ▼
                            ┌────────────────────────────────────────┐
                            │          PostgreSQL Database           │
                            │          (Supabase-Compatible)         │
                            │       29 Normalized Domain Tables      │
                            │      Alembic Schema Versioning         │
                            └────────────────────────────────────────┘
```

---

## 4. Technology Stack & ₹0 Cost Strategy

Every layer is built on open-source, permissively licensed technologies with zero recurring commercial subscriptions or paid AI API dependencies:

| Tier | Technology | Purpose | Cost |
| :--- | :--- | :--- | :---: |
| **Frontend Core** | React 19, TypeScript, Vite | High-performance reactive UI | ₹0 |
| **Styling** | Tailwind CSS, Framer Motion | Meteorological design system | ₹0 |
| **State & Cache** | Zustand, TanStack Query | Client state & query cache | ₹0 |
| **Data Viz** | Recharts, Three.js, R3F, Drei | 2D Radars & 3D Universe | ₹0 |
| **Backend API** | FastAPI (Python 3.12+) | Async REST micro-framework | ₹0 |
| **ORM & Migrations** | SQLAlchemy 2.0, Alembic | Type-safe DB operations | ₹0 |
| **Database** | PostgreSQL 16+ | Relational persistence | ₹0 |
| **Cryptography** | Argon2id, PyJWT, Web Crypto | RFC 9106 password hashing | ₹0 |
| **Intelligence** | Deterministic Python Services | Multi-source weighted scoring | ₹0 |
| **Total Cost** | | | **₹0.00** |

---

## 5. Module Architecture

The system delivers 16 interconnected MVP modules:
1. **Authentication & Session Manager**: Argon2id password hashing with rotating JWT access & refresh tokens.
2. **Role-Based Access Control (RBAC)**: Strict server-side FastAPI dependencies (`require_roles`, `require_admin`).
3. **Trainee Profile Management**: Comprehensive professional dossiers recording postings, degrees, and skills.
4. **Trainer Profile Management**: Faculty records with employee IDs, specializations, and ratings.
5. **Course Management**: Module and lesson authoring with multimedia content.
6. **Learning Resources Module**: Downloadable manuals, PDFs, and radar datasets.
7. **MCQ Assessment Engine**: Timed online testing with shuffle, deadline enforcement, and anti-tamper limits.
8. **Feedback System**: Trainee evaluation of course materials and instructor delivery.
9. **Admin Dashboard**: Institutional telemetry, user approvals, and course governance.
10. **Notifications Module**: In-app event alerts for enrollments, assessments, and publications.
11. **Competency Mapping Engine**: Deterministic multi-source evaluation on 0.0 to 5.0 scale.
12. **Trainer Recommendation Engine**: Algorithmic 6-dimension scoring for specialized subject faculty.
13. **Skill Gap Diagnostics**: Deficit audit with priority categorization (`HIGH`, `MEDIUM`, `LOW`).
14. **Personalized Learning Recommender**: Targeted course suggestions targeting open capability gaps.
15. **Training Readiness Score**: Transparent percentage metric measuring benchmark compliance.
16. **3D Competency Universe**: Interactive Three.js constellation network with 2D fallback.

---

## 6. Database Architecture

The relational schema is structured into 29 normalized tables across 7 domain modules:
- **Organization & Structure**: `organizations`, `departments`
- **Users & Identity**: `users`, `roles`, `user_roles`, `auth_sessions`, `user_profiles`, `qualifications`, `experiences`, `skills`, `user_skills`, `certifications`, `trainer_profiles`
- **Course & Syllabus**: `course_categories`, `courses`, `course_modules`, `lessons`, `resources`, `enrollments`, `course_progress`, `lesson_completions`
- **Assessment Engine**: `assessments`, `questions`, `assessment_attempts`, `assessment_answers`
- **Competency Taxonomy**: `competencies`, `user_competencies`, `course_competencies`, `subjects`, `subject_competency_requirements`
- **Feedback & Communication**: `feedbacks`, `notifications`

All entities use UUID primary keys and strict foreign key integrity with cascading rules.

---

## 7. Authentication & RBAC

- **Password Security**: Argon2id with recommended OWASP memory/time parameters.
- **Session Management**: Dual-token architecture:
  - Short-lived Access Token (JWT, 60 minutes).
  - Cryptographically tracked Refresh Token stored in `auth_sessions` table with revocation tracking.
- **Server-Side Authorization**: Every API route enforces `current_user = Depends(get_current_active_user)` and validates user roles server-side. Direct URL access or tampered frontend tokens return HTTP 401 or 403.

---

## 8. End-to-End Role Workflows

### 8.1 Trainee Workflow
1. Sign in via `/login` (or quick-fill demo button).
2. Trainee Dashboard displays personalized telemetry: enrolled courses, average progress, readiness index, and certificates.
3. Explore `/courses`, view syllabus, prerequisites, and ratings; enroll with a single click.
4. Study lessons in `/courses/:id/learn`; complete lessons to advance progress bars.
5. Launch timed assessment in `/assessments/:id/take`; complete 25 randomized MCQs with server-side countdown.
6. Submit exam; receive immediate automated grading, pass/fail badge, and answer review in `/assessments/attempts/:id/result`.
7. Inspect `/trainee/competencies`: review 0.0–5.0 competency ratings with detailed multi-source evidence dossiers.
8. Explore the **3D Competency Universe**: rotate, zoom, and click competency orbs to reveal child evidence nodes.
9. Diagnose deficiencies in `/trainee/skill-gap` with `HIGH PRIORITY` action items.
10. Receive personalized course recommendations targeting specific gaps.
11. Submit course & instructor feedback on course detail pages.

### 8.2 Trainer Workflow
1. Sign in via `/login`.
2. Trainer Dashboard displays authored courses, active enrollments, and average faculty ratings.
3. Manage courses in `/trainer/courses`; author modules and lessons.
4. Build assessments in `/trainer/assessments/builder`: define passing scores, time limits, and MCQ questions with explanation keys.
5. Review trainee examination submissions and passing rates in `/trainer/performance`.
6. Inspect student feedback and ratings in `/trainer/performance`.

### 8.3 Admin Workflow
1. Sign in via `/login`.
2. Admin Dashboard displays institutional telemetry: total users, active courses, completed assessments, and system health.
3. Govern users in `/admin/users`: approve pending accounts, update roles, or suspend access.
4. Oversee course catalog in `/admin/courses` and monitor assessments in `/admin/assessments`.
5. Access `/admin/trainer-recommendations`: select subject (e.g., Doppler Weather Radar Operations), review candidate instructors ranked algorithmically across 6 dimensions, and inspect explainable "Why Recommended" dossiers.

---

## 9. Competency Intelligence & Algorithmic Formulation

### 9.1 Multi-Source Evidence Aggregation
A user's demonstrated competency level ($L \in [0.0, 5.0]$) is computed deterministically from six platform evidence streams:

$$L = \min\left(5.0, 5.0 \times \sum_{i=1}^{6} (S_i \times W_i)\right)$$

Where $S_i \in [0.0, 1.0]$ is the normalized score and $W_i$ is the configurable dimension weight:
- **Assessment Performance**: $30\%$ ($\frac{\text{Average Passing Exam Score}}{100}$)
- **Course Syllabus Completion**: $20\%$ ($\frac{\text{Completed Lessons}}{\text{Total Lessons}}$)
- **Practical Operational Skills**: $20\%$ (Proficiency rating mapping: Beg=0.3, Int=0.6, Adv=0.8, Exp=1.0)
- **Field Posting Experience**: $15\%$ ($\min(1.0, \frac{\text{Years}}{5.0})$)
- **Accredited Certifications**: $10\%$ (0.8 per verified credential, capped at 1.0)
- **Academic Qualifications**: $5\%$ (Diploma=0.4, B.Sc.=0.6, M.Sc.=0.85, Ph.D.=1.0)

### 9.2 Training Readiness Score
$$\text{Readiness \%} = \frac{\sum_{c \in C} \left[\min\left(1.0, \frac{L_c}{R_c}\right) \times W_c\right]}{\sum_{c \in C} W_c} \times 100$$
Strictly designated as a **"Training Readiness Score"** reflecting recorded platform evidence.

### 9.3 6-Dimension Trainer Matching Algorithm
$$\text{Match \%} = 0.30 C_{\text{match}} + 0.20 E_{\text{score}} + 0.15 Q_{\text{score}} + 0.15 R_{\text{cert}} + 0.10 A_{\text{score}} + 0.10 F_{\text{rating}}$$
Final instructor assignment remains an administrative decision; the algorithm provides an unbiased, transparent recommendation.

---

## 10. 3D Competency Universe Visual Architecture

- **Visual Metaphor**: Trainee Core origin sphere surrounded by radial orbital rays connecting to color-coded Competency Spheres (Violet for Expert, Emerald for Intermediate, Cyan for Foundation, Rose for Gaps).
- **Satellite Nodes**: Orbiting sub-spheres representing individual evidence contributions (Exams, Syllabi, Skills).
- **Interactive Controls**: 360° mouse drag rotation, pinch/scroll zoom, and right-click panning with damping.
- **Code-Splitting**: Lazily imported via `React.lazy()` to maintain a fast initial load.
- **2D Fallback**: Accessible 2D Recharts Radar Chart toggle provided for mobile devices and non-WebGL environments.

---

## 11. Security Hardening Summary

- **Answer Privacy**: Examination keys are stripped server-side prior to submission; answer keys only appear after attempt submission.
- **Grading Integrity**: All scores, pass/fail status, and attempt limits are computed strictly on the backend.
- **Cross-User Isolation**: Trainees cannot inspect other trainees' attempts, profiles, or competency profiles.
- **Strict Role Boundaries**: Sensitive routes reject unauthorized roles with HTTP 403 Forbidden.

---

## 12. Deployment Architecture

- **Frontend**: Static production build generated via `npm run build` (`dist/`), deployable to Nginx, Vercel, Netlify, or AWS S3/CloudFront.
- **Backend**: Containerized ASGI application running `uvicorn app.main:app` with Gunicorn worker management.
- **Database**: PostgreSQL 16+ or Supabase-compatible managed PostgreSQL instance.
- **Environment**: Managed via `.env` configured from `.env.example`.

---

## 13. Known Limitations & Roadmap

1. **WebGL Requirement for 3D View**: Low-resource environments or headless browsers automatically default to the accessible 2D matrix view.
2. **Growth Progression Milestones**: Historical growth progression derives chronological milestones from recorded coursework and assessments rather than continuous telemetry logs.
3. **ReportLab PDF Generation**: Certificate verification route and digital credential records are fully functional; dynamic PDF export can be added in subsequent institutional enhancements.
