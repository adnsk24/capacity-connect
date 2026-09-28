"""
Reseed Script for IMD Capacity Connect Course Catalogue.
Strictly replaces all existing demo/test courses and categories with the exact:
- 8 Categories
- 12 Courses with unique, domain-specific images and modules
- Exact assessments and passing marks
Preserves demo trainer and trainee users and relationships.
"""

import uuid
from datetime import datetime, date, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.session import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, Role, TraineeProfile, TrainerProfile
from app.models.organization import Organization, Department
from app.models.competency import Competency, CourseCompetency
from app.models.course import (
    CourseCategory,
    Course,
    CourseModule,
    Lesson,
    Resource,
    Enrollment,
    CourseProgress,
    LessonCompletion,
)
from app.models.assessment import (
    Assessment,
    Question,
    QuestionOption,
    AssessmentAttempt,
    AssessmentAnswer,
)
from app.models.notification import Notification


CATALOGUE_CATEGORIES = [
    {
        "code": "GEN-MET",
        "name": "General Meteorology",
        "description": "Foundational principles of atmospheric science, weather elements, air pressure, wind systems, clouds, and rainfall.",
    },
    {
        "code": "OWF",
        "name": "Weather Forecasting",
        "description": "Synoptic weather analysis, forecast models, severe weather forecasting, warning generation, and risk communication.",
    },
    {
        "code": "SAT-MET",
        "name": "Satellite Meteorology",
        "description": "INSAT meteorological satellites, multispectral imagery interpretation, cloud analysis, and cyclone detection.",
    },
    {
        "code": "RAD-MET",
        "name": "Radar Meteorology",
        "description": "Doppler weather radar operations, radar products, reflectivity, storm detection, and rainfall estimation.",
    },
    {
        "code": "CYC-WARN",
        "name": "Cyclone Warning Systems",
        "description": "Tropical cyclone genesis, tracking techniques, warning protocols, and disaster communication SOPs.",
    },
    {
        "code": "INST-OBS",
        "name": "Instruments & Observations",
        "description": "Surface meteorological instruments, barometers, rain gauges, anemometers, and automatic weather stations (AWS).",
    },
    {
        "code": "CLIM",
        "name": "Climate Services",
        "description": "Climate data monitoring, long-term climate trends, seasonal outlooks, and sectoral climate risk services.",
    },
    {
        "code": "MET-COMP",
        "name": "Computer & Data Processing",
        "description": "Meteorological data processing, automated data cleaning, data visualization, and Python programming.",
    },
]


CATALOGUE_COURSES = [
    # Category 1 — General Meteorology
    {
        "code": "MET-101",
        "title": "Introduction to Meteorology",
        "cat_code": "GEN-MET",
        "difficulty": "BEGINNER",
        "duration_hours": 30,
        "image": "/assets/courses/introduction-meteorology.jpg",
        "desc": "Learn the fundamental concepts of atmosphere, weather elements, air pressure, wind systems, clouds and rainfall.",
        "modules": [
            "Atmosphere Basics",
            "Weather Elements",
            "Air Pressure",
            "Wind Systems",
            "Clouds",
            "Rainfall",
        ],
        "competencies": ["COMP-SYNOPTIC"],
        "assessments": [
            {
                "title": "Introduction to Meteorology - 25 MCQs Assessment",
                "type": "MCQ",
                "passing_percentage": 60.0,
                "total_marks": 25.0,
                "duration_minutes": 30,
                "questions_count": 25,
            }
        ],
        "passing_marks": 60,
    },
    {
        "code": "MET-201",
        "title": "Indian Climatology",
        "cat_code": "GEN-MET",
        "difficulty": "INTERMEDIATE",
        "duration_hours": 35,
        "image": "/assets/courses/indian-climatology.jpg",
        "desc": "Study of India's climate, southwest & northeast monsoon systems, seasonal weather patterns, heat waves, and agro-climatic zones.",
        "modules": [
            "Climate of India",
            "Monsoon System",
            "Seasonal Weather",
            "Heat Waves",
            "Climate Zones",
        ],
        "competencies": ["COMP-SYNOPTIC"],
        "assessments": [
            {
                "title": "Indian Climatology 20 MCQs",
                "type": "MCQ",
                "passing_percentage": 60.0,
                "total_marks": 20.0,
                "duration_minutes": 25,
                "questions_count": 20,
            },
            {
                "title": "Indian Monsoon Case Study",
                "type": "ASSIGNMENT",
                "passing_percentage": 60.0,
                "total_marks": 50.0,
                "duration_minutes": 60,
                "questions_count": 1,
            },
        ],
        "passing_marks": 60,
    },

    # Category 2 — Weather Forecasting
    {
        "code": "MET-202",
        "title": "Weather Forecasting Fundamentals",
        "cat_code": "OWF",
        "difficulty": "BEGINNER",
        "duration_hours": 40,
        "image": "/assets/courses/weather-forecasting-fundamentals.jpg",
        "desc": "Master synoptic charts, numerical forecast models, weather analysis techniques, and operational warning generation procedures.",
        "modules": [
            "Synoptic Charts",
            "Forecast Models",
            "Weather Analysis",
            "Warning Generation",
        ],
        "competencies": ["COMP-SYNOPTIC", "COMP-NWP"],
        "assessments": [
            {
                "title": "Weather Forecasting Mid-Term Exam",
                "type": "MCQ",
                "passing_percentage": 60.0,
                "total_marks": 50.0,
                "duration_minutes": 45,
                "questions_count": 25,
            },
            {
                "title": "Weather Forecasting Final Exam",
                "type": "EXAM",
                "passing_percentage": 60.0,
                "total_marks": 50.0,
                "duration_minutes": 60,
                "questions_count": 25,
            },
        ],
        "passing_marks": 60,
    },
    {
        "code": "MET-301",
        "title": "Advanced Weather Forecasting",
        "cat_code": "OWF",
        "difficulty": "ADVANCED",
        "duration_hours": 50,
        "image": "/assets/courses/advanced-weather-forecasting.jpg",
        "desc": "Numerical weather prediction, forecast verification metrics, severe convective weather forecasting, and impact-based risk communication.",
        "modules": [
            "Numerical Weather Prediction",
            "Forecast Verification",
            "Severe Weather Forecasting",
            "Risk Communication",
        ],
        "competencies": ["COMP-NWP", "COMP-SYNOPTIC"],
        "assessments": [
            {
                "title": "Advanced Forecasting 50 MCQs Examination",
                "type": "MCQ",
                "passing_percentage": 60.0,
                "total_marks": 50.0,
                "duration_minutes": 60,
                "questions_count": 50,
            },
            {
                "title": "Severe Weather Practical Assignment",
                "type": "PRACTICAL",
                "passing_percentage": 60.0,
                "total_marks": 50.0,
                "duration_minutes": 90,
                "questions_count": 1,
            },
        ],
        "passing_marks": 60,
    },

    # Category 3 — Satellite Meteorology
    {
        "code": "MET-203",
        "title": "Satellite Data Interpretation",
        "cat_code": "SAT-MET",
        "difficulty": "INTERMEDIATE",
        "duration_hours": 35,
        "image": "/assets/courses/satellite-data-interpretation.jpg",
        "desc": "Exploitation of INSAT satellites, multi-spectral satellite images, cloud analysis, and tropical cyclone detection techniques.",
        "modules": [
            "INSAT Satellites",
            "Satellite Images",
            "Cloud Analysis",
            "Cyclone Detection",
        ],
        "competencies": ["COMP-SAT"],
        "assessments": [
            {
                "title": "Satellite Image Analysis Quiz",
                "type": "QUIZ",
                "passing_percentage": 60.0,
                "total_marks": 20.0,
                "duration_minutes": 25,
                "questions_count": 10,
            },
            {
                "title": "INSAT Multispectral Practical Exercise",
                "type": "PRACTICAL",
                "passing_percentage": 60.0,
                "total_marks": 30.0,
                "duration_minutes": 45,
                "questions_count": 1,
            },
        ],
        "passing_marks": 60,
    },

    # Category 4 — Radar Meteorology
    {
        "code": "MET-204",
        "title": "Doppler Weather Radar Operations",
        "cat_code": "RAD-MET",
        "difficulty": "INTERMEDIATE",
        "duration_hours": 45,
        "image": "/assets/courses/doppler-weather-radar.jpg",
        "desc": "Pulsed Doppler radar principles, operational radar products, storm signature detection, and quantitative precipitation estimation.",
        "modules": [
            "Radar Principles",
            "Radar Products",
            "Storm Detection",
            "Rainfall Estimation",
        ],
        "competencies": ["COMP-DOPPLER"],
        "assessments": [
            {
                "title": "Doppler Radar Practical Lab",
                "type": "PRACTICAL",
                "passing_percentage": 60.0,
                "total_marks": 50.0,
                "duration_minutes": 60,
                "questions_count": 1,
            },
            {
                "title": "Radar Meteorology MCQ Exam",
                "type": "MCQ",
                "passing_percentage": 60.0,
                "total_marks": 25.0,
                "duration_minutes": 30,
                "questions_count": 25,
            },
        ],
        "passing_marks": 60,
    },

    # Category 5 — Cyclone Warning Systems
    {
        "code": "MET-302",
        "title": "Cyclone Monitoring & Warning",
        "cat_code": "CYC-WARN",
        "difficulty": "ADVANCED",
        "duration_hours": 40,
        "image": "/assets/courses/cyclone-monitoring-warning.jpg",
        "desc": "Tropical cyclone formation dynamics, tracking techniques, warning formulation protocols, and disaster risk communication.",
        "modules": [
            "Cyclone Formation",
            "Tracking Techniques",
            "Warning Protocols",
            "Disaster Communication",
        ],
        "competencies": ["COMP-CYCLONE", "COMP-SYNOPTIC"],
        "assessments": [
            {
                "title": "Cyclone Scenario Based Assessment",
                "type": "SCENARIO",
                "passing_percentage": 60.0,
                "total_marks": 50.0,
                "duration_minutes": 60,
                "questions_count": 5,
            }
        ],
        "passing_marks": 60,
    },

    # Category 6 — Instruments & Observations
    {
        "code": "MET-102",
        "title": "Surface Meteorological Instruments",
        "cat_code": "INST-OBS",
        "difficulty": "BEGINNER",
        "duration_hours": 25,
        "image": "/assets/courses/surface-meteorological-instruments.jpg",
        "desc": "Operational handling, exposure, calibration, and observation using thermometers, barometers, rain gauges, and anemometers.",
        "modules": [
            "Thermometer",
            "Barometer",
            "Rain Gauge",
            "Anemometer",
        ],
        "competencies": ["COMP-AWS"],
        "assessments": [
            {
                "title": "Surface Instruments Practical Observation Test",
                "type": "PRACTICAL",
                "passing_percentage": 60.0,
                "total_marks": 40.0,
                "duration_minutes": 45,
                "questions_count": 1,
            }
        ],
        "passing_marks": 60,
    },
    {
        "code": "MET-103",
        "title": "Automatic Weather Stations (AWS)",
        "cat_code": "INST-OBS",
        "difficulty": "BEGINNER",
        "duration_hours": 30,
        "image": "/assets/courses/automatic-weather-stations.jpg",
        "desc": "Architecture of automatic weather stations, sensor components, telemetry data collection, maintenance schedules, and calibration.",
        "modules": [
            "AWS Components",
            "Data Collection",
            "Maintenance",
            "Calibration",
        ],
        "competencies": ["COMP-AWS"],
        "assessments": [
            {
                "title": "AWS Operational Practical Test",
                "type": "PRACTICAL",
                "passing_percentage": 60.0,
                "total_marks": 50.0,
                "duration_minutes": 60,
                "questions_count": 1,
            }
        ],
        "passing_marks": 60,
    },

    # Category 7 — Climate Services
    {
        "code": "MET-205",
        "title": "Climate Monitoring & Services",
        "cat_code": "CLIM",
        "difficulty": "INTERMEDIATE",
        "duration_hours": 35,
        "image": "/assets/courses/climate-monitoring-services.jpg",
        "desc": "Climate database analysis, long-term climate trends, seasonal forecast outlooks, and climate risk assessments for sectors.",
        "modules": [
            "Climate Data",
            "Climate Trends",
            "Seasonal Outlook",
            "Climate Risk",
        ],
        "competencies": ["COMP-SYNOPTIC"],
        "assessments": [
            {
                "title": "Climate Services MCQ + Report",
                "type": "MCQ",
                "passing_percentage": 60.0,
                "total_marks": 50.0,
                "duration_minutes": 60,
                "questions_count": 20,
            }
        ],
        "passing_marks": 60,
    },

    # Category 8 — Computer & Data Processing
    {
        "code": "MET-206",
        "title": "Meteorological Data Processing",
        "cat_code": "MET-COMP",
        "difficulty": "INTERMEDIATE",
        "duration_hours": 35,
        "image": "/assets/courses/meteorological-data-processing.jpg",
        "desc": "Automated meteorological data collection, quality control cleaning algorithms, spatial data visualization, and reporting.",
        "modules": [
            "Data Collection",
            "Data Cleaning",
            "Data Visualization",
            "Reporting",
        ],
        "competencies": ["COMP-PYMET"],
        "assessments": [
            {
                "title": "Meteorological Data Processing Assignment",
                "type": "ASSIGNMENT",
                "passing_percentage": 60.0,
                "total_marks": 40.0,
                "duration_minutes": 45,
                "questions_count": 1,
            }
        ],
        "passing_marks": 60,
    },
    {
        "code": "MET-104",
        "title": "Programming for Meteorologists",
        "cat_code": "MET-COMP",
        "difficulty": "BEGINNER",
        "duration_hours": 40,
        "image": "/assets/courses/programming-for-meteorologists.jpg",
        "desc": "Python fundamentals for meteorologists: data analysis with NumPy & Pandas, weather data APIs, and forecast automation scripts.",
        "modules": [
            "Python Basics",
            "Data Analysis",
            "Weather Data APIs",
            "Forecast Automation",
        ],
        "competencies": ["COMP-PYMET"],
        "assessments": [
            {
                "title": "Python Meteorology Coding Assignment",
                "type": "ASSIGNMENT",
                "passing_percentage": 60.0,
                "total_marks": 50.0,
                "duration_minutes": 60,
                "questions_count": 1,
            }
        ],
        "passing_marks": 60,
    },
]


def reseed_catalogue():
    db: Session = SessionLocal()
    try:
        print("[Reseed] Cleaning existing courses and demo data...")

        # 1. Ensure Trainer and Trainee exist
        trainer = db.query(User).filter(User.email == "trainer.demo@imd.gov.in").first()
        trainee = db.query(User).filter(User.email == "trainee.demo@imd.gov.in").first()

        # 2. Delete all existing courses (this cascades to modules, lessons, resources, assessments, enrollments)
        # First remove any foreign key references in notifications that link to courses/assessments if needed
        db.query(AssessmentAnswer).delete()
        db.query(AssessmentAttempt).delete()
        db.query(QuestionOption).delete()
        db.query(Question).delete()
        db.query(Assessment).delete()

        db.query(LessonCompletion).delete()
        db.query(CourseProgress).delete()
        db.query(Enrollment).delete()
        db.query(Resource).delete()
        db.query(Lesson).delete()
        db.query(CourseModule).delete()
        db.query(CourseCompetency).delete()
        db.query(Course).delete()

        # 3. Clean up non-standard course categories and synchronize to exact 8 categories
        existing_cats = db.query(CourseCategory).all()
        target_cat_codes = {c["code"] for c in CATALOGUE_CATEGORIES}
        for cat in existing_cats:
            if cat.code not in target_cat_codes:
                db.delete(cat)
        db.flush()

        cat_map = {}
        for cdata in CATALOGUE_CATEGORIES:
            cat = db.query(CourseCategory).filter(CourseCategory.code == cdata["code"]).first()
            if not cat:
                cat = CourseCategory(
                    code=cdata["code"],
                    name=cdata["name"],
                    description=cdata["description"],
                )
                db.add(cat)
                db.flush()
            else:
                cat.name = cdata["name"]
                cat.description = cdata["description"]
                db.flush()
            cat_map[cdata["code"]] = cat

        print(f"[Reseed] Synchronized {len(cat_map)} categories.")

        comps_map = {c.code: c for c in db.query(Competency).all()}

        # 4. Insert exact 12 courses
        courses_by_code = {}
        for cdata in CATALOGUE_COURSES:
            category = cat_map[cdata["cat_code"]]
            course = Course(
                code=cdata["code"],
                title=cdata["title"],
                category_id=category.id,
                trainer_id=trainer.id if trainer else None,
                description=cdata["desc"],
                difficulty_level=cdata["difficulty"],
                duration_hours=cdata["duration_hours"],
                thumbnail_url=cdata["image"],
                status="PUBLISHED",
                published_at=datetime.now(timezone.utc),
            )
            db.add(course)
            db.flush()
            courses_by_code[cdata["code"]] = course

            # Competency mappings
            for comp_code in cdata.get("competencies", []):
                comp_obj = comps_map.get(comp_code)
                if comp_obj:
                    cc = CourseCompetency(
                        course_id=course.id,
                        competency_id=comp_obj.id,
                        contribution_weight=0.8,
                        target_level=2 if cdata["difficulty"] == "BEGINNER" else (3 if cdata["difficulty"] == "INTERMEDIATE" else 4),
                    )
                    db.add(cc)

            # Modules and Lessons
            for m_idx, m_title in enumerate(cdata["modules"]):
                module = CourseModule(
                    course_id=course.id,
                    title=m_title,
                    description=f"{m_title} core learning unit and operational syllabus.",
                    order_index=m_idx + 1,
                )
                db.add(module)
                db.flush()

                # Add 2 lessons per module for rich learning structure
                l1 = Lesson(
                    module_id=module.id,
                    title=f"Fundamentals of {m_title}",
                    description=f"Theoretical foundation and standard operating principles for {m_title}.",
                    duration_minutes=45,
                    content_type="TEXT",
                    content_body=f"Standard IMD capacity curriculum section detailing {m_title} principles, physical processes, and observational methodologies.",
                    order_index=1,
                    is_mandatory=True,
                )
                l2 = Lesson(
                    module_id=module.id,
                    title=f"Operational Applications in {m_title}",
                    description=f"Field procedures, diagnostics, and operational case applications for {m_title}.",
                    duration_minutes=45,
                    content_type="TEXT",
                    content_body=f"Practical workflows and standardized analytical protocols utilized at IMD forecasting and observational centers for {m_title}.",
                    order_index=2,
                    is_mandatory=True,
                )
                db.add_all([l1, l2])

            # Assessments
            for ass_data in cdata.get("assessments", []):
                assessment = Assessment(
                    course_id=course.id,
                    title=ass_data["title"],
                    description=f"Institutional assessment evaluating proficiency in {cdata['title']}.",
                    assessment_type=ass_data["type"],
                    passing_percentage=ass_data["passing_percentage"],
                    total_marks=ass_data["total_marks"],
                    duration_minutes=ass_data["duration_minutes"],
                    max_attempts=3,
                    status="PUBLISHED",
                    due_at=datetime.now(timezone.utc) + timedelta(days=30),
                )
                db.add(assessment)
                db.flush()

                # Add sample question
                q = Question(
                    assessment_id=assessment.id,
                    question_text=f"Select the primary operational requirement associated with {cdata['modules'][0]}:",
                    question_type="MCQ_SINGLE",
                    marks=assessment.total_marks,
                    explanation=f"Demonstrates mastery of {cdata['title']} operational standards.",
                    order_index=1,
                )
                db.add(q)
                db.flush()

                opt1 = QuestionOption(
                    question_id=q.id,
                    option_text="Adherence to standard WMO/IMD operational protocols and quality checks",
                    is_correct=True,
                    order_index=1,
                )
                opt2 = QuestionOption(
                    question_id=q.id,
                    option_text="Non-calibrated ad-hoc estimations",
                    is_correct=False,
                    order_index=2,
                )
                db.add_all([opt1, opt2])

        db.commit()
        print(f"[Reseed] Successfully created {len(CATALOGUE_COURSES)} courses with modules, lessons, and assessments.")

        # 5. Restore Trainee Enrollments for demo continuity
        if trainee:
            # Course 1: MET-101
            intro_course = courses_by_code.get("MET-101")
            if intro_course:
                en1 = Enrollment(user_id=trainee.id, course_id=intro_course.id, status="IN_PROGRESS")
                db.add(en1)
                db.flush()
                # Get first 2 lessons
                intro_lessons = (
                    db.query(Lesson)
                    .join(CourseModule, Lesson.module_id == CourseModule.id)
                    .filter(CourseModule.course_id == intro_course.id)
                    .order_by(CourseModule.order_index, Lesson.order_index)
                    .all()
                )
                if len(intro_lessons) >= 2:
                    lc1 = LessonCompletion(enrollment_id=en1.id, lesson_id=intro_lessons[0].id)
                    lc2 = LessonCompletion(enrollment_id=en1.id, lesson_id=intro_lessons[1].id)
                    db.add_all([lc1, lc2])
                    db.flush()
                    pct = round((2 / len(intro_lessons)) * 100.0, 1)
                    prog1 = CourseProgress(
                        enrollment_id=en1.id,
                        completed_lessons_count=2,
                        total_lessons_count=len(intro_lessons),
                        completion_percentage=pct,
                        last_accessed_lesson_id=intro_lessons[1].id,
                        last_accessed_at=datetime.now(timezone.utc),
                        is_completed=False,
                    )
                    db.add(prog1)

            # Course 2: MET-204 (Doppler Radar)
            radar_course = courses_by_code.get("MET-204")
            if radar_course:
                en2 = Enrollment(user_id=trainee.id, course_id=radar_course.id, status="ENROLLED")
                db.add(en2)
                db.flush()
                radar_lessons = (
                    db.query(Lesson)
                    .join(CourseModule, Lesson.module_id == CourseModule.id)
                    .filter(CourseModule.course_id == radar_course.id)
                    .all()
                )
                prog2 = CourseProgress(
                    enrollment_id=en2.id,
                    completed_lessons_count=0,
                    total_lessons_count=len(radar_lessons),
                    completion_percentage=0.0,
                    is_completed=False,
                )
                db.add(prog2)

            db.commit()
            print("[Reseed] Restored Trainee demo enrollments.")

        # Verification counts
        cat_count = db.query(CourseCategory).count()
        course_count = db.query(Course).count()
        print(f"[Reseed Complete] Total Categories: {cat_count}, Total Courses: {course_count}")

    except Exception as e:
        db.rollback()
        print(f"[Reseed Error] {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reseed_catalogue()
