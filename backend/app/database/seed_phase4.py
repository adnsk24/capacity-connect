import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, Role
from app.models.organization import Organization, Department
from app.models.course import Course, Enrollment
from app.models.assessment import (
    Assessment,
    Question,
    QuestionOption,
    AssessmentAttempt,
    AssessmentAnswer,
)
from app.models.notification import Notification
from app.database.seed_phase3 import seed_phase3_data


METEOROLOGY_25_MCQS = [
    {
        "q": "What is the primary gas composing the Earth's atmosphere by volume?",
        "options": [
            ("Nitrogen (~78%)", True),
            ("Oxygen (~21%)", False),
            ("Argon (~0.93%)", False),
            ("Carbon Dioxide (~0.04%)", False),
        ],
        "marks": 1.0,
        "exp": "Nitrogen constitutes approximately 78.08% of dry atmospheric air by volume.",
    },
    {
        "q": "In which atmospheric layer does virtually all weather phenomena occur?",
        "options": [
            ("Troposphere", True),
            ("Stratosphere", False),
            ("Mesosphere", False),
            ("Thermosphere", False),
        ],
        "marks": 1.0,
        "exp": "The troposphere contains ~80% of the atmosphere's mass and almost all water vapor.",
    },
    {
        "q": "What is the standard dry adiabatic lapse rate (DALR) in the atmosphere?",
        "options": [
            ("9.8 °C per 1,000 meters (approx 10 °C/km)", True),
            ("6.5 °C per 1,000 meters", False),
            ("3.0 °C per 1,000 meters", False),
            ("1.5 °C per 1,000 meters", False),
        ],
        "marks": 1.0,
        "exp": "Dry adiabatic cooling occurs at g/Cp = 9.8 °C per km.",
    },
    {
        "q": "Which force balances the horizontal pressure gradient force in geostrophic wind?",
        "options": [
            ("Coriolis force", True),
            ("Frictional force", False),
            ("Centrifugal force", False),
            ("Gravitational force", False),
        ],
        "marks": 1.0,
        "exp": "Geostrophic balance is the exact balance between horizontal pressure gradient force and Coriolis force.",
    },
    {
        "q": "In the Northern Hemisphere, which direction does air rotate around a surface low-pressure system (cyclone)?",
        "options": [
            ("Counter-clockwise (cyclonic)", True),
            ("Clockwise (anticyclonic)", False),
            ("Straight inward radially", False),
            ("Straight outward radially", False),
        ],
        "marks": 1.0,
        "exp": "Due to Coriolis deflection to the right, flow around low pressure in the Northern Hemisphere is counter-clockwise.",
    },
    {
        "q": "What instrument is routinely carried aloft by weather balloons to measure temperature, humidity, and pressure?",
        "options": [
            ("Radiosonde", True),
            ("Anemometer", False),
            ("Pyrheliometer", False),
            ("Ceilometer", False),
        ],
        "marks": 1.0,
        "exp": "Radiosondes transmit vertical atmospheric profiles to ground receiving telemetry.",
    },
    {
        "q": "What cloud genus is characteristic of severe thunderstorms producing lightning and heavy convective rain?",
        "options": [
            ("Cumulonimbus (Cb)", True),
            ("Altocumulus (Ac)", False),
            ("Cirrostratus (Cs)", False),
            ("Stratocumulus (Sc)", False),
        ],
        "marks": 1.0,
        "exp": "Cumulonimbus clouds exhibit deep vertical extent with an anvil top capable of severe convective weather.",
    },
    {
        "q": "What is the dew point temperature?",
        "options": [
            ("The temperature to which air must be cooled at constant pressure to become saturated", True),
            ("The boiling temperature of water at standard sea level pressure", False),
            ("The temperature at the tropopause boundary", False),
            ("The temperature measured inside an aspirated psychrometer bulb", False),
        ],
        "marks": 1.0,
        "exp": "Dew point is the temperature at which relative humidity reaches 100% at constant pressure.",
    },
    {
        "q": "Lines connecting points of equal atmospheric pressure on a weather chart are called:",
        "options": [
            ("Isobars", True),
            ("Isotherms", False),
            ("Isohyets", False),
            ("Isotachs", False),
        ],
        "marks": 1.0,
        "exp": "Isobars represent lines of equal barometric pressure reduced to mean sea level.",
    },
    {
        "q": "The thermal wind represents:",
        "options": [
            ("The vector difference between geostrophic winds at two vertical pressure levels", True),
            ("A local sea-breeze blowing during maximum daytime heating", False),
            ("Surface wind created purely by friction over warm land", False),
            ("Wind generated by katabatic drainage down mountain slopes", False),
        ],
        "marks": 1.0,
        "exp": "Thermal wind is proportional to the horizontal temperature gradient across a layer.",
    },
    {
        "q": "What optical atmospheric phenomenon is caused by hexagonal ice crystals in cirrostratus clouds?",
        "options": [
            ("22-degree solar or lunar halo", True),
            ("Primary rainbow", False),
            ("Mirage", False),
            ("Glory", False),
        ],
        "marks": 1.0,
        "exp": "A 22-degree halo is produced by refraction through columnar hexagonal ice crystals.",
    },
    {
        "q": "At what latitude does the Coriolis parameter f equal exactly zero?",
        "options": [
            ("Equator (0°)", True),
            ("Tropic of Cancer (23.5° N)", False),
            ("Arctic Circle (66.5° N)", False),
            ("North Pole (90° N)", False),
        ],
        "marks": 1.0,
        "exp": "The Coriolis parameter f = 2 * Omega * sin(phi), which vanishes when phi = 0.",
    },
    {
        "q": "Which equation relates changes in atmospheric pressure with height under hydrostatic equilibrium?",
        "options": [
            ("dp/dz = -rho * g (Hydrostatic Equation)", True),
            ("F = m * a", False),
            ("P * V = n * R * T", False),
            ("E = m * c^2", False),
        ],
        "marks": 1.0,
        "exp": "Hydrostatic balance equates vertical pressure gradient force to gravity per unit volume.",
    },
    {
        "q": "What is the standard unit of barometric pressure used in modern meteorological reports (METAR/SYNOP)?",
        "options": [
            ("Hectopascal (hPa)", True),
            ("Pounds per square inch (psi)", False),
            ("Torr", False),
            ("Atmospheres (atm)", False),
        ],
        "marks": 1.0,
        "exp": "1 hPa is identically equal to 1 millibar (mbar).",
    },
    {
        "q": "What type of front is formed when a rapidly moving cold front overtakes a warm front?",
        "options": [
            ("Occluded front", True),
            ("Stationary front", False),
            ("Dryline", False),
            ("Sea-breeze front", False),
        ],
        "marks": 1.0,
        "exp": "An occlusion lifts the warm sector completely off the ground surface.",
    },
    {
        "q": "The albedo of the Earth-atmosphere system is approximately:",
        "options": [
            ("0.30 (30%)", True),
            ("0.10 (10%)", False),
            ("0.60 (60%)", False),
            ("0.85 (85%)", False),
        ],
        "marks": 1.0,
        "exp": "Earth's planetary albedo is ~0.30, reflecting thirty percent of incoming solar insolation back into space.",
    },
    {
        "q": "In thermodynamic soundings, what does CAPE stand for?",
        "options": [
            ("Convective Available Potential Energy", True),
            ("Cumulative Atmospheric Precipitation Energy", False),
            ("Coriolis Accelerated Planetary Equilibrium", False),
            ("Condensation Altitude Point Estimate", False),
        ],
        "marks": 1.0,
        "exp": "CAPE represents the integrated positive buoyant energy available to a rising parcel.",
    },
    {
        "q": "A Stevenson Screen is designed to shade and ventilate instruments that measure:",
        "options": [
            ("Air temperature and humidity", True),
            ("Wind speed and direction", False),
            ("Solar irradiance only", False),
            ("Precipitation accumulation", False),
        ],
        "marks": 1.0,
        "exp": "Louvered Stevenson screens protect thermometers from direct solar radiation while allowing ambient air flow.",
    },
    {
        "q": "The Intertropical Convergence Zone (ITCZ) is characterized by:",
        "options": [
            ("Converging trade winds and vigorous convective precipitation", True),
            ("Persistent subsidence and desert anticyclones", False),
            ("Strong subpolar westerlies", False),
            ("Polar easterly blizzards", False),
        ],
        "marks": 1.0,
        "exp": "The ITCZ is the equatorial trough where Northeast and Southeast trade winds converge.",
    },
    {
        "q": "What is the typical altitude of the polar jet stream core in mid-latitudes?",
        "options": [
            ("9 to 12 km (approx 300 - 200 hPa)", True),
            ("1 to 2 km (approx 850 hPa)", False),
            ("25 to 30 km (stratosphere)", False),
            ("50 to 60 km (mesosphere)", False),
        ],
        "marks": 1.0,
        "exp": "Jet stream cores reside near the tropopause break around 250-300 hPa.",
    },
    {
        "q": "Which wavelength band of meteorological satellites is used to detect water vapor in the middle-to-upper troposphere?",
        "options": [
            ("6.7 - 7.3 micrometers (Water Vapor Channel)", True),
            ("0.6 micrometers (Visible)", False),
            ("10.8 micrometers (Thermal Infrared Window)", False),
            ("1.6 micrometers (Snow/Ice Channel)", False),
        ],
        "marks": 1.0,
        "exp": "The ~6.7 µm absorption band of water vapor provides moisture and dynamic tracking in cloud-free upper air.",
    },
    {
        "q": "What is the lifting condensation level (LCL)?",
        "options": [
            ("The height at which an unsaturated air parcel becomes saturated when lifted dry-adiabatically", True),
            ("The level where a parcel becomes warmer than the environmental temperature", False),
            ("The level where ice crystals sublimate completely", False),
            ("The ground surface elevation", False),
        ],
        "marks": 1.0,
        "exp": "LCL marks the cloud base height of convective clouds formed by mechanical or thermal ascent.",
    },
    {
        "q": "Fog formed by radiational cooling of the ground during clear, calm nocturnal conditions is called:",
        "options": [
            ("Radiation fog", True),
            ("Advection fog", False),
            ("Upslope fog", False),
            ("Steam fog", False),
        ],
        "marks": 1.0,
        "exp": "Radiation fog occurs on calm, clear nights when terrestrial longwave cooling lowers surface air to its dew point.",
    },
    {
        "q": "What is the primary heat transfer mechanism by which energy moves from Earth's tropical oceans to the atmosphere?",
        "options": [
            ("Latent heat flux via evaporation", True),
            ("Sensible conduction through bedrock", False),
            ("Direct gamma radiation", False),
            ("Tidal friction dissipation", False),
        ],
        "marks": 1.0,
        "exp": "Latent heat absorbed during seawater evaporation and released aloft upon condensation drives global circulation.",
    },
    {
        "q": "In synoptic terminology, a 'trough' refers to:",
        "options": [
            ("An elongated area of relatively low atmospheric pressure", True),
            ("An elongated ridge of high barometric pressure", False),
            ("A region of completely calm surface winds", False),
            ("A vertical column of sinking air in a desert", False),
        ],
        "marks": 1.0,
        "exp": "A trough is characterized by cyclonic curvature of isobars/contours and relative minimum geopotential height.",
    },
]


def seed_phase4_data():
    """Seeds Phase 4 demo data: Admin user, comprehensive 25-MCQ assessments, attempts, and notifications."""
    seed_phase3_data()
    db: Session = SessionLocal()

    try:
        print("[Seed] Seeding Phase 4 Admin, Assessments, and Notifications...")

        # 1. Admin Role & Demo User
        admin_role = db.query(Role).filter(Role.name == "ADMIN").first()
        org = db.query(Organization).filter(Organization.code == "IMD").first()
        dept = db.query(Department).first()

        admin_email = "admin.demo@imd.gov.in"
        demo_admin = db.query(User).filter(User.email == admin_email).first()
        if not demo_admin:
            demo_admin = User(
                email=admin_email,
                username="admin_demo",
                hashed_password=get_password_hash("DemoAdmin123!"),
                first_name="Dr. Shailendra",
                last_name="Verma",
                role_id=admin_role.id,
                organization_id=org.id if org else None,
                department_id=dept.id if dept else None,
                is_active=True,
                is_verified=True,
                account_status="ACTIVE",
            )
            db.add(demo_admin)
            db.commit()
            db.refresh(demo_admin)
            print(f"[Seed] Created demo admin: {admin_email}")

        # 2. Get demo trainer and trainee
        trainer = db.query(User).filter(User.email == "trainer.demo@imd.gov.in").first()
        trainee = db.query(User).filter(User.email == "trainee.demo@imd.gov.in").first()

        # 3. Associate trainer with existing courses
        courses = db.query(Course).all()
        for c in courses:
            if not c.trainer_id and trainer:
                c.trainer_id = trainer.id
        db.commit()

        # 4. Create primary assessment for Introduction to Meteorology
        intro_course = db.query(Course).filter(Course.code.in_(["GEN-MET-101", "MET-101"])).first()
        if not intro_course and courses:
            intro_course = courses[0]

        if intro_course:
            # Check if 25 MCQ assessment already exists
            existing_ass = (
                db.query(Assessment)
                .filter(
                    Assessment.course_id == intro_course.id,
                    Assessment.title == "Meteorology Fundamentals Comprehensive Assessment",
                )
                .first()
            )

            if not existing_ass:
                ass = Assessment(
                    course_id=intro_course.id,
                    title="Meteorology Fundamentals Comprehensive Assessment",
                    description="Institutional 25-MCQ examination testing foundational atmospheric thermodynamics, synoptic dynamics, observation instrumentation, and cloud physics.",
                    assessment_type="MCQ",
                    passing_percentage=60.0,
                    total_marks=25.0,
                    duration_minutes=30,
                    max_attempts=3,
                    status="PUBLISHED",
                    due_at=datetime.now(timezone.utc) + timedelta(days=14),
                )
                db.add(ass)
                db.flush()

                for idx, item in enumerate(METEOROLOGY_25_MCQS):
                    q = Question(
                        assessment_id=ass.id,
                        question_text=item["q"],
                        question_type="MCQ_SINGLE",
                        marks=item["marks"],
                        explanation=item["exp"],
                        order_index=idx + 1,
                    )
                    db.add(q)
                    db.flush()

                    for o_idx, (opt_text, is_corr) in enumerate(item["options"]):
                        opt = QuestionOption(
                            question_id=q.id,
                            option_text=opt_text,
                            is_correct=is_corr,
                            order_index=o_idx + 1,
                        )
                        db.add(opt)

                db.commit()
                print(f"[Seed] Created 25-MCQ assessment for {intro_course.title}")

                # 5. Create demo attempt for trainee
                if trainee:
                    # Trainee attempt with 20/25 correct (80% score -> PASS)
                    attempt = AssessmentAttempt(
                        assessment_id=ass.id,
                        user_id=trainee.id,
                        attempt_number=1,
                        status="EVALUATED",
                        score_obtained=20.0,
                        percentage=80.0,
                        is_passed=True,
                        started_at=datetime.now(timezone.utc) - timedelta(days=1, hours=2),
                        submitted_at=datetime.now(timezone.utc) - timedelta(days=1, hours=1, minutes=35),
                    )
                    db.add(attempt)
                    db.flush()

                    # Add answers
                    questions = db.query(Question).filter(Question.assessment_id == ass.id).order_by(Question.order_index).all()
                    for q_idx, q in enumerate(questions):
                        opts = db.query(QuestionOption).filter(QuestionOption.question_id == q.id).all()
                        correct_opt = next((o for o in opts if o.is_correct), opts[0])
                        wrong_opt = next((o for o in opts if not o.is_correct), opts[0])
                        # First 20 correct, last 5 wrong
                        selected = correct_opt if q_idx < 20 else wrong_opt
                        ans = AssessmentAnswer(
                            attempt_id=attempt.id,
                            question_id=q.id,
                            selected_option_id=selected.id,
                            is_correct=selected.is_correct,
                            marks_awarded=q.marks if selected.is_correct else 0.0,
                        )
                        db.add(ans)

                    # Add assessment result notification
                    n1 = Notification(
                        user_id=trainee.id,
                        title=f"Assessment Passed: {ass.title}",
                        message=f"Congratulations! You scored 20.0/25.0 (80.0%) on the Meteorology Fundamentals assessment.",
                        notification_type="ASSESSMENT_RESULT",
                        link_url=f"/trainee/assessments/{ass.id}",
                        is_read=False,
                    )
                    db.add(n1)

                    db.commit()
                    print(f"[Seed] Created demo attempt and notification for {trainee.email}")

        # 6. Seed Doppler and Indian Climatology assessments
        for course in courses:
            if "Radar" in course.title or "RAD" in course.code:
                if not db.query(Assessment).filter(Assessment.course_id == course.id).first():
                    rad_ass = Assessment(
                        course_id=course.id,
                        title="Doppler Weather Radar Operations Assessment",
                        description="Operational assessment covering PPI/RHI scans, base reflectivity interpretation, and velocity aliasing.",
                        assessment_type="MCQ",
                        passing_percentage=65.0,
                        total_marks=10.0,
                        duration_minutes=20,
                        max_attempts=2,
                        status="PUBLISHED",
                        due_at=datetime.now(timezone.utc) + timedelta(days=21),
                    )
                    db.add(rad_ass)
                    db.flush()
                    q = Question(
                        assessment_id=rad_ass.id,
                        question_text="What Doppler radar product is best suited to detect hook echoes and cyclonic rotation?",
                        marks=5.0,
                        explanation="Reflectivity identifies precipitation intensity and hook echo shapes, while Storm-Relative Velocity identifies velocity couplets.",
                        order_index=1,
                    )
                    db.add(q)
                    db.flush()
                    db.add_all([
                        QuestionOption(question_id=q.id, option_text="Base Reflectivity (Z)", is_correct=True, order_index=1),
                        QuestionOption(question_id=q.id, option_text="Spectrum Width", is_correct=False, order_index=2),
                        QuestionOption(question_id=q.id, option_text="Vertically Integrated Liquid (VIL)", is_correct=False, order_index=3),
                    ])
                    db.commit()

        # 7. Seed trainer and admin notifications
        if trainer:
            n_tr = Notification(
                user_id=trainer.id,
                title="Assessment Submissions Received",
                message="Trainees have submitted new attempts in Meteorology Fundamentals Comprehensive Assessment.",
                notification_type="ASSESSMENT_AVAILABLE",
                link_url="/trainer/performance",
                is_read=False,
            )
            db.add(n_tr)

        if demo_admin:
            n_ad = Notification(
                user_id=demo_admin.id,
                title="System Operational Status: Healthy",
                message="Capacity Connect Phase 4 services are synchronized with PostgreSQL and active.",
                notification_type="SYSTEM",
                link_url="/admin/dashboard",
                is_read=False,
            )
            db.add(n_ad)

        db.commit()
        print("[Seed] Phase 4 Seeding completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"[Seed] Error seeding Phase 4: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_phase4_data()
