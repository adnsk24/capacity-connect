# CAPACITY CONNECT
> **Digital Capacity Building and Learning Management Portal**

Capacity Connect is an enterprise capacity-building and learning management platform engineered to transition workforce learning from passive course completion into measurable, verifiable organizational readiness.

---

## 1. Core Architecture Lifecycle

```
Training
   ↓
Assessment
   ↓
Certification
   ↓
Competency Evidence
   ↓
Competency Mapping
   ↓
Skill Gap Analysis
   ↓
Trainer Recommendation
   ↓
Organizational Capacity Building
```

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4 with custom enterprise tokens
- **Primitives**: shadcn/ui pattern (CVA, Lucide Icons, Radix UI Slot)
- **Client State**: Zustand
- **Server Cache**: TanStack Query v5
- **Routing**: React Router v7

### Backend
- **Language**: Python 3.12+ / 3.14
- **API Framework**: FastAPI (Async ASGI with OpenAPI / Swagger)
- **Validation**: Pydantic v2 & Pydantic-Settings
- **ORM**: SQLAlchemy 2.0
- **Database Driver**: `psycopg` (v3) & `psycopg2-binary`
- **Database Migrations**: Alembic
- **Testing**: Pytest & HTTPX

### Database & Storage
- **Relational Store**: PostgreSQL 16+ (Local Docker / Supabase compatible)
- **Cloud Storage**: Supabase Storage (Planned for Phase 4)

---

## 3. Monorepo Project Structure

```
capacity-connect/
├── backend/                  # FastAPI backend service
│   ├── alembic/              # Database migration definitions & env
│   ├── app/                  # Application source
│   │   ├── core/             # Configuration & security settings
│   │   ├── database/         # SQLAlchemy engine, session & declarative Base
│   │   ├── models/           # ORM models (Phase 1)
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── routers/          # API route definitions (/api/v1/...)
│   │   ├── services/         # Domain business logic
│   │   └── utils/            # Shared utilities
│   ├── tests/                # Pytest unit & integration suite
│   ├── alembic.ini           # Migration settings
│   ├── requirements.txt      # Python dependencies
│   └── README.md
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/       # Layout & UI components
│   │   ├── lib/              # Utility functions
│   │   ├── pages/            # View pages (Home, Login, Health)
│   │   ├── services/         # HTTP client & TanStack Query services
│   │   ├── store/            # Zustand global stores
│   │   ├── App.tsx           # Router & Query provider root
│   │   └── index.css         # Tailwind styles & theme variables
│   ├── index.html            # Application entrypoint
│   ├── vite.config.ts        # Vite configuration with @/* alias
│   └── package.json          # Dependencies & scripts
├── docs/                     # Specifications & architectural reports
│   ├── PROJECT_SPEC.md       # Full system blueprint & MVP scope
│   └── reports/
│       └── PHASE_00_REPORT.md# Phase 0 implementation report
├── database/                 # Database guides & migration notes
├── scripts/                  # Development & verification automation
├── docker-compose.yml        # PostgreSQL service containerization
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
└── README.md                 # Project README
```

---

## 4. Getting Started

### Prerequisites
- **Node.js**: v18+ (Node 24 recommended) & **npm**: v10+
- **Python**: v3.12+ (or 3.14)
- **Docker** (optional, for local PostgreSQL)

---

### Step 1: Environment Setup
Copy the template environment file:
```bash
# In project root:
cp .env.example .env
```

---

### Step 2: Running the Backend

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell):
   python -m venv .venv
   .venv\Scripts\Activate.ps1

   # Linux / macOS:
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
5. Endpoints available:
   - **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Alternative ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - **Healthcheck Endpoint**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

### Step 3: Running the Frontend

1. Navigate to the `frontend/` directory in a new terminal:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the application:
   - **Web Portal**: [http://localhost:5173](http://localhost:5173)
   - **Live Health Diagnostics Page**: [http://localhost:5173/health](http://localhost:5173/health)

---

### Step 4: Running with Docker (PostgreSQL)

To launch the local PostgreSQL container:
```bash
docker compose up -d db
```
This boots PostgreSQL on `localhost:5432` with credentials from `.env`.

---

## 5. Testing & Validation

### Backend Tests
From the project root:
```bash
# Windows:
backend\.venv\Scripts\python.exe -m pytest backend/tests

# Linux / macOS:
backend/.venv/bin/pytest backend/tests
```

### Frontend Build Validation
```bash
cd frontend
npm run build
```

---

## 6. Development Phasing Overview

| Phase | Title | Status |
|---|---|---|
| **Phase 0** | **Project Foundation & Architecture Setup** | **COMPLETE** |
| Phase 1 | Database Schema Modeling & Alembic Migrations | Upcoming |
| Phase 2 | Authentication & Role-Based Access Control (RBAC) | Upcoming |
| Phase 3 | Trainee, Trainer & Admin Profile Management | Upcoming |
| Phase 4 | Course Catalog & Learning Resource Engine | Upcoming |
| Phase 5 | MCQ Assessment System & Automated Grading | Upcoming |
| Phase 6 | Competency Mapping & Readiness Scoring Engine | Upcoming |
| Phase 7 | Skill Gap Diagnostics & Trainer Recommendation | Upcoming |
| Phase 8 | Executive & Role Analytics Dashboards | Upcoming |
| Phase 9 | Integration Testing, End-to-End Hardening & Deployment | Upcoming |
