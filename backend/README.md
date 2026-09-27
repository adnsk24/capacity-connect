# Capacity Connect - Backend Service

FastAPI-powered backend service for the Capacity Connect Digital Capacity Building and Learning Management Portal.

## Architecture

```
backend/
├── alembic/              # Database migration scripts & environment
│   ├── versions/         # Versioned migration revisions
│   └── env.py            # Alembic runner with dynamic DB URL & model metadata
├── app/
│   ├── core/             # Application configuration & security primitives
│   │   └── config.py     # Pydantic Settings (loads .env)
│   ├── database/         # SQLAlchemy engine, session maker & declarative base
│   │   ├── base.py       # DeclarativeBase and TimestampMixin
│   │   └── session.py    # Engine pool & get_db session dependency
│   ├── models/           # SQLAlchemy ORM models (Phase 1)
│   ├── schemas/          # Pydantic request/response schemas
│   │   └── health.py     # System health response models
│   ├── routers/          # FastAPI routers (versioned under /api/v1)
│   │   ├── api_v1.py     # Router aggregator for v1 APIs
│   │   └── health.py     # Healthcheck endpoint
│   ├── services/         # Domain business logic (Phase 2+)
│   └── utils/            # Helper utilities
├── tests/                # Automated pytest suite
│   └── test_health.py
├── alembic.ini           # Alembic migration configuration
├── requirements.txt      # Python dependencies
└── .env.example          # Environment variables template
```

## Setup & Running

### 1. Prerequisites
- Python 3.12+ (or 3.14)
- PostgreSQL (or local Docker container)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Create & Activate Virtual Environment
```bash
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Run Database Migrations (Phase 1+)
```bash
alembic upgrade head
```

### 6. Start Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- Interactive API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
- Alternative Docs (ReDoc): [http://localhost:8000/redoc](http://localhost:8000/redoc)
- Health Endpoint: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 7. Run Unit Tests
```bash
pytest
```
