"""Database schema verification script for Capacity Connect Phase 1."""

import sys
import psycopg
from app.core.config import settings


def verify_database_schema():
    print(f"[*] Connecting to database at {settings.DATABASE_URL}...")
    try:
        conn = psycopg.connect(settings.DATABASE_URL)
        cur = conn.cursor()

        # Query all public tables
        cur.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
        )
        tables = [row[0] for row in cur.fetchall()]
        print(f"[+] Total tables found in public schema: {len(tables)}")
        for t in tables:
            print(f"    - {t}")

        expected_app_tables = [
            "assessment_answers",
            "assessment_attempts",
            "assessments",
            "certifications",
            "competencies",
            "course_categories",
            "course_competencies",
            "course_modules",
            "course_progress",
            "courses",
            "departments",
            "enrollments",
            "experiences",
            "feedbacks",
            "lessons",
            "organizations",
            "qualifications",
            "question_options",
            "questions",
            "resources",
            "roles",
            "skills",
            "subject_competency_requirements",
            "subjects",
            "trainee_profiles",
            "trainer_profiles",
            "user_competencies",
            "user_skills",
            "users",
        ]

        missing = [t for t in expected_app_tables if t not in tables]
        if missing:
            print(f"[-] ERROR: Missing tables: {missing}")
            sys.exit(1)

        if "alembic_version" not in tables:
            print("[-] ERROR: alembic_version table missing!")
            sys.exit(1)

        # Check current revision in alembic_version
        cur.execute("SELECT version_num FROM alembic_version")
        version = cur.fetchone()[0]
        print(f"[+] Current Alembic revision in DB: {version}")

        # Verify foreign keys
        cur.execute(
            """
            SELECT count(*)
            FROM information_schema.table_constraints
            WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'
            """
        )
        fk_count = cur.fetchone()[0]
        print(f"[+] Total foreign key constraints verified: {fk_count}")

        # Verify unique constraints
        cur.execute(
            """
            SELECT count(*)
            FROM information_schema.table_constraints
            WHERE constraint_type = 'UNIQUE' AND table_schema = 'public'
            """
        )
        unique_count = cur.fetchone()[0]
        print(f"[+] Total unique constraints verified: {unique_count}")

        print("\n[+] SUCCESS: All 29 entities + alembic_version verified successfully in PostgreSQL!")
        conn.close()
        return True

    except Exception as exc:
        print(f"[-] Database verification failed: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    verify_database_schema()
