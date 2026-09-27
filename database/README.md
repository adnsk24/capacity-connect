# Capacity Connect - Database Architecture

## Overview

Capacity Connect uses **PostgreSQL 16+** as its primary relational store. The database layer is designed to run seamlessly in local Docker containers or hosted through **Supabase**.

## Design Guidelines

1. **Relational Core**: Structured relationships between Users, Roles, Cohorts, Courses, Assessments, Submissions, and Competencies.
2. **JSONB Extensibility**: Utilized for dynamic question definitions, assessment rubrics, and modular evidence payloads without schema thrashing.
3. **Migration Integrity**: All schema changes must be versioned and executed through Alembic (`backend/alembic/`). Never alter production schemas manually.
4. **Supabase Compatibility**:
   - Uses standard PostgreSQL connection strings compatible with Supabase pooler (Transaction and Session modes via port 6543 / 5432).
   - Compatible with future Supabase Auth hooks and Storage buckets.

## Local PostgreSQL Setup (Docker)

To launch the local PostgreSQL database service:

```bash
docker compose up -d db
```

Default connection string:
```
postgresql://postgres:postgres@localhost:5432/capacity_connect
```

## Schema Phasing Roadmap

- **Phase 0 (Current)**: Engine, SessionLocal, Base declarative metadata, and Alembic environment initialized. No application tables created.
- **Phase 1**: Core entities (Users, Roles, Profiles, Courses, Modules, Assessments, Submissions, Competencies).
- **Phase 6**: Competency framework mappings, evidence tables, and readiness matrices.
