# CAPACITY CONNECT — PREDEFINED CERTIFICATE TEMPLATE IMPLEMENTATION REPORT

**Executive Summary**
This report documents the end-to-end implementation of the accredited certificate generation and cryptographic verification system for Capacity Connect (India Meteorological Department, Ministry of Earth Sciences, Government of India). The implementation strictly preserves the visual fidelity, typography, branding, and layout of the master certificate template (`certificate_template.png`) as a 1:1 background canvas in ReportLab while dynamically overlaying authenticated trainee, course, duration, delivery mode, unique credential number, and QR verification data.

---

## 1. Implementation Summary

| Component | Technology | Description |
| :--- | :--- | :--- |
| **PDF Engine** | ReportLab 5.0.1 + Pillow | Renders exact 1024×724 pt canvas using `certificate_template.png` background |
| **Typography** | GreatVibes TTF + Times-Bold / Times-Roman | Elegant script font for trainee names; professional serif for course details |
| **QR Code Engine** | `qrcode[pil]` 8.2 | Generates high-density QR code targeting `/certificates/verify/{id}` |
| **Database** | PostgreSQL + SQLAlchemy ORM | `certificates` table with foreign keys, unique constraint on `(user_id, course_id)` |
| **Database Migration** | Alembic | Revision `c01928a4128f` (`head`) |
| **File Storage** | Supabase Storage / Local Uploads | Stored at `/uploads/certificates/<user_id>/<certificate_number>.pdf` |
| **Backend Framework** | FastAPI (Python 3.14) | Versioned REST API endpoints under `/api/v1/certificates` and root verification |
| **Frontend Framework** | React 19 + TypeScript + Vite | Trainee "My Certificates" page, Preview Modal, and Public Verification Registry |
| **Test Coverage** | Pytest (10 tests) + Vitest (6 tests) | 100% passing across all backend and frontend test suites |

---

## 2. Template Integration

- **Master Template File**: `backend/app/static/certificate_template.png` (1024 × 724 px, landscape orientation).
- **Zero Redesign Principle**: The master template was **not** altered, redesigned, or substituted. Its visual assets—including the National Emblem of India (Ashoka Lion Capital), IMD bilingual insignia, Ministry of Earth Sciences branding, satellite & radar telemetry art, circular meteorology icons, signatory lines for Course Coordinator, Head (Training), and Director General of Meteorology, and the foundational motto banner (`OBSERVE | ANALYSE | FORECAST | SERVE THE NATION`)—remain 100% authentic and untouched.
- **Coordinate Mapping**: ReportLab's Cartesian coordinate system (`(0,0)` at bottom-left) is mapped 1:1 with image pixel coordinates:
  $$\text{pdf\_x} = \text{img\_x}, \quad \text{pdf\_y} = 724 - \text{img\_y}$$

---

## 3. Dynamic Fields & Coordinates

| Dynamic Field | Coordinate / Region | Font / Style | Blanking Strategy |
| :--- | :--- | :--- | :--- |
| **Trainee Name** (`{{TRAINEE_NAME}}`) | Centered at $X=514$, $Y=\text{py}(340)$ | `GreatVibes` Script, 46pt (auto-scales down for long names) | `#FCFCFC` seamless rect: $X=348..688$, $Y=\text{py}(361..302)$ |
| **Course Title** (`{{COURSE_TITLE}}`) | Centered at $X=514$, $Y=\text{py}(422)$ | `Times-Bold`, 16pt (e.g. `“Satellite Data Interpretation”`) | `#FCFCFC` seamless rect: $X=370..660$, $Y=\text{py}(428..404)$ |
| **Course Duration** (`{{COURSE_START_DATE}}` to `{{COURSE_END_DATE}}`) | Pill 1 ($X=325$, $Y=\text{py}(536, 548)$) | `Times-Roman`, 9pt (`01 Sep 2026 \n to 28 Sep 2026`) | `#E5EEF7` rect: $X=323..427$, $Y=\text{py}(554..524)$ |
| **Training Mode** (`{{MODE}}`) | Pill 2 ($X=514$, $Y=\text{py}(538)$) | `Times-Roman`, 9.5pt (`Online`, `Offline`, or `Hybrid`) | `#E7F1FA` rect: $X=512..608$, $Y=\text{py}(547..524)$ |
| **Date of Issue** (`{{DATE_OF_ISSUE}}`) | Pill 3 ($X=704$, $Y=\text{py}(538)$) | `Times-Roman`, 9.5pt (e.g. `28 Sep 2026`) | `#EFF6FC` rect: $X=702..787$, $Y=\text{py}(547..530)$ |
| **Verification QR Code** (`{{VERIFICATION_QR}}`) | Bottom-left ($X=28..92$, $Y=\text{py}(646..582)$) | 64×64 pt dynamically rendered QR code | Direct overlay covering placeholder QR code |
| **Certificate Number** (`{{CERTIFICATE_NUMBER}}`) | Centered below QR label at $X=60$, $Y=\text{py}(686)$ | `Helvetica-Bold`, 6.5pt (`CC-2026-SDI-000124`) | Unobtrusive subtle text beneath "Scan the QR code" |

---

## 4. PDF Generation Architecture

ReportLab executes the following pipeline in `CertificateService.render_pdf`:
1. Ensures `GreatVibes-Regular.ttf` is registered with `pdfmetrics`.
2. Creates canvas with `pagesize=(1024, 724)`.
3. Draws `certificate_template.png` at `(0, 0, width=1024, height=724)`.
4. Applies precise background-matched blanking rectangles over placeholder areas.
5. Computes dynamic text dimensions; auto-scales font if trainee name exceeds 340pt or course title exceeds 360pt.
6. Encodes public verification URL (`/certificates/verify/{certificate_id}`) into standard QR code image and renders over the placeholder QR box.
7. Saves the compiled PDF to `/uploads/certificates/<user_id>/<certificate_number>.pdf`.
8. Updates database record with relative `pdf_url`.

---

## 5. QR Code & Public Verification

- **QR Target URL**: `https://<domain>/certificates/verify/{certificate_id}`
- **Authentication**: Zero authentication required for public verification. Anyone scanning the QR code with a smartphone camera or visiting the URL can instantly inspect the validity.
- **Verification Responses**:
  - `ISSUED / VALID`: Displays green authenticated badge, certificate number, trainee name, course name, issue date, and completion date.
  - `REVOKED`: Displays prominent amber/red alert indicating the credential has been formally revoked by administrative authorities.
  - `NOT_FOUND`: Displays error banner if the credential identifier does not exist in the IMD database.
- **Privacy Safeguard**: The verification endpoint does **not** expose private trainee data (such as email, password hash, internal IDs, or demographic profiles).

---

## 6. Database Schema & Migration

### Table: `certificates`
```sql
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL,
    course_start_date DATE,
    course_end_date DATE,
    mode VARCHAR(50) NOT NULL DEFAULT 'Online',
    score FLOAT,
    grade VARCHAR(20),
    verification_token VARCHAR(100) UNIQUE NOT NULL,
    pdf_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'ISSUED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT uq_user_course_certificate UNIQUE (user_id, course_id)
);

CREATE INDEX ix_certificates_certificate_number ON certificates(certificate_number);
CREATE INDEX ix_certificates_course_id ON certificates(course_id);
CREATE INDEX ix_certificates_user_id ON certificates(user_id);
CREATE INDEX ix_certificates_verification_token ON certificates(verification_token);
```

### Alembic Migration
- **Revision ID**: `c01928a4128f`
- **Down Revision**: `7278f0014421`
- **Status**: Applied to PostgreSQL (`alembic current` confirms `c01928a4128f (head)`).

---

## 7. Storage Architecture

- **Path Schema**: `certificates/<user_id>/<certificate_number>.pdf`
- **URL Pattern**: `/uploads/certificates/<user_id>/<certificate_number>.pdf`
- **File Serving**: Served securely via FastAPI `FileResponse` with content disposition:
  `filename="Capacity_Connect_Certificate_<CertificateNumber>.pdf"`
- **On-Demand Regeneration**: If a certificate PDF file is missing from disk, `CertificateService` automatically re-renders the PDF on the fly before serving, ensuring downloads never fail.

---

## 8. API Endpoints

| Method | Endpoint | Auth Required | Allowed Roles | Description |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/api/v1/certificates/me` | Yes | `TRAINEE` | Lists all certificates issued to authenticated trainee |
| `GET` | `/api/v1/certificates/{id}` | Yes | Owner / `ADMIN` | Fetches details for a specific certificate |
| `GET` | `/api/v1/certificates/{id}/download` | Yes | Owner / `ADMIN` | Downloads PDF with official IMD naming convention |
| `GET` | `/api/v1/certificates/eligibility/{course_id}` | Yes | `TRAINEE` | Checks course completion and assessment requirements |
| `POST` | `/api/v1/certificates/{course_id}/generate` | Yes | `TRAINEE` | Issues certificate if completion criteria are met |
| `POST` | `/api/v1/certificates/generate` | Yes | `TRAINEE` | Issues certificate from JSON body `{"course_id": ...}` |
| `GET` | `/api/v1/certificates/verify/{id}` | **No** | Public | Public cryptographic verification endpoint |
| `GET` | `/certificates/verify/{id}` | **No** | Public | Root public verification endpoint for QR scanners |
| `GET` | `/api/v1/certificates/admin/all` | Yes | `ADMIN` | Lists/searches all certificates with pagination |
| `POST` | `/api/v1/certificates/admin/{id}/revoke` | Yes | `ADMIN` | Formally revokes an issued certificate |

---

## 9. Security & Role-Based Access Control (RBAC)

1. **Eligibility Enforcement**: Certificates cannot be generated by user request alone. `CertificateService.check_eligibility` validates:
   - Trainee has an active enrollment record.
   - 100% of course lessons have been completed.
   - All published assessments for the course have been completed with a passing grade (`is_passed == True`).
   - If any requirement is missing, a descriptive HTTP 400 is returned.
2. **Ownership Protection**: Trainees can **only** view and download certificates issued to their own `user_id`. Attempting to access another trainee's certificate returns HTTP 403 Forbidden.
3. **Trainer Safeguard**: Trainers cannot arbitrarily create or issue certificates outside course completion workflows.
4. **Admin Governance**: Only users with the `ADMIN` role can inspect the portal-wide certificate registry or execute certificate revocations.
5. **Duplicate Prevention**: A database-level unique constraint on `(user_id, course_id)` prevents accidental or malicious re-issuance. Repeated calls return the original certificate and permanent credential number.

---

## 10. Frontend Implementation

### 1. Trainee Portal: "My Certificates" Page (`/trainee/certificates`)
- Rendered in `CertificatesPage.tsx` under `TraineeLayout`.
- Displays clean cards showing:
  - Course Name
  - Official IMD Credential badge
  - Certificate Number (monospace pill)
  - Issue Date
  - Assessment Score with star icon
  - Training Mode (Online/Offline/Hybrid)
  - Status badge (`ISSUED` / `REVOKED`)
- Interactive Actions:
  - **`[View Certificate]`**: Opens the full-fidelity modal preview.
  - **`[Download PDF]`**: Directly triggers download of `Capacity_Connect_Certificate_<CertificateNumber>.pdf`.
  - **`[Verify]`**: Opens the public verification registry in a new tab.
- Empty State: Integrated when trainee has not yet earned certificates, featuring an action button directing to the Course Catalogue.

### 2. Certificate Preview Modal (`CertificatePreviewModal.tsx`)
- Rendered using responsive dialog backdrop.
- Embeds the generated PDF inside a secure `<iframe>` with `#toolbar=0&navpanes=0`.
- Includes metadata header and quick actions for downloading and external verification.

### 3. Public Verification Page (`CertificateVerifyPage.tsx`)
- Accessible at `/certificates/verify/:certificateId` without login.
- Displays official India Meteorological Department crest and Ministry of Earth Sciences banner.
- Real-time verification status with verified checkmark, trainee name, course title, issue date, and completion date.

### 4. Course Completion Integration
- In `MyLearningPage.tsx`, completed courses (100% progress) display a direct "View Certificate" action button linking to `/trainee/certificates`.

---

## 11. Test Results

### Backend Test Suite (`pytest`)
All 10 required backend test cases pass:
```
tests/test_certificates.py::test_eligible_trainee_can_receive_certificate PASSED
tests/test_certificates.py::test_incomplete_course_cannot_generate_certificate PASSED
tests/test_certificates.py::test_failed_assessment_cannot_generate_certificate PASSED
tests/test_certificates.py::test_certificate_belongs_to_correct_trainee PASSED
tests/test_certificates.py::test_trainee_cannot_download_another_trainees_certificate PASSED
tests/test_certificates.py::test_certificate_number_is_unique PASSED
tests/test_certificates.py::test_duplicate_certificate_is_prevented PASSED
tests/test_certificates.py::test_qr_verification_works PASSED
tests/test_certificates.py::test_invalid_certificate_returns_not_found PASSED
tests/test_certificates.py::test_revoked_certificate_is_reported_correctly PASSED
```
**Full backend suite**: **115 tests passed** across all modules with 0 errors.

### Frontend Test Suite (`vitest`)
All 6 frontend unit tests pass:
```
✓ My Certificates page renders list of certificates (Course Name, Cert Number)
✓ certificate card displays Course Name, Certificate Number, Issue Date, Score, and Status
✓ View Certificate action opens preview modal
✓ Download PDF action initiates download with correct certificate details
✓ empty certificate state renders when no certificates exist
✓ public verification page displays verified credentials
```
**Full frontend suite**: **52 tests passed** across 7 test suites.

---

## 12. Production Build Result

Running `npm run build` in `frontend/`:
```bash
> tsc -b && vite build
vite v8.3.1 building client environment for production...
transforming...
✓ 3139 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                   0.94 kB │ gzip:   0.50 kB
dist/assets/index-B_cVdUyb.css                   87.49 kB │ gzip:  14.84 kB
dist/assets/CompetencyUniverse3D-6h0WYu0o.js    938.79 kB │ gzip: 249.64 kB
dist/assets/index-CV8WdLog.js                 1,132.91 kB │ gzip: 292.84 kB
✓ built in 968ms
```
**Exit Code**: `0` (Success, no TypeScript errors).

---

## 13. Sample Certificate Verification Result

A visual verification test certificate was generated and inspected:
- **Trainee Name**: Aditya Sharma
- **Course Title**: Satellite Data Interpretation
- **Duration**: 01 Sep 2026 to 28 Sep 2026
- **Mode**: Online
- **Date of Issue**: 28 Sep 2026
- **Certificate Number**: `CC-2026-SDI-000124`
- **Inspection Findings**:
  - Zero text overlap or clipping.
  - Script font (`GreatVibes`) matches master template aesthetics.
  - Trainee name and course title are centered over the horizontal rule.
  - Monitor and calendar icons in pill containers remain 100% intact.
  - Dynamic QR code covers placeholder area and scans to the verification URL.
  - Certificate number is unobtrusively placed below the QR label.
  - All original IMD branding, Ashoka emblem, and signatories are preserved without alteration.

---

## 14. Known Limitations & Extensibility

1. **Custom Signatures**: Signatory blocks currently reflect the master template design. For future phases, digital signature image overlays can be added if multi-tier officer sign-offs are required.
2. **Offline Fallback**: In environments without internet access to Google Fonts, ReportLab seamlessly falls back to built-in `Times-BoldItalic` without breaking PDF generation.
3. **Paper Sizing**: The PDF canvas uses 1024×724 pt preserving the master template aspect ratio. For standard ISO A4 paper printing, modern PDF viewers auto-fit to A4 landscape margins without distortion.
