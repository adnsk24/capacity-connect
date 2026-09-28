import uuid
from datetime import datetime, date, timezone
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.core.security import get_password_hash
from app.models.user import (
    User,
    Role,
    TraineeProfile,
    TrainerProfile,
    Qualification,
    Experience,
    Skill,
    UserSkill,
    Certification,
)
from app.models.organization import Organization, Department
from app.models.competency import Competency, UserCompetency, CourseCompetency
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
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.certificate import Certificate
from app.services.certificate_service import CertificateService


def seed_phase3_data():
    """Seeds synthetic, clearly marked demo data for Capacity Connect Phase 3.
    This seed is repeatable and idempotent.
    """
    db: Session = SessionLocal()
    try:
        print("[Seed] Starting Phase 3 Demo Data Seeding...")

        # 1. Roles
        roles_map = {}
        for r_name in ["TRAINEE", "TRAINER", "ADMIN"]:
            role = db.query(Role).filter(Role.name == r_name).first()
            if not role:
                role = Role(name=r_name, description=f"{r_name} role")
                db.add(role)
                db.flush()
            roles_map[r_name] = role

        # 2. Organizations & Departments
        org = db.query(Organization).filter(Organization.code == "IMD").first()
        if not org:
            org = Organization(
                name="India Meteorological Department (IMD)",
                code="IMD",
                description="National Meteorological Service of India, under the Ministry of Earth Sciences (MoES).",
                website="https://mausam.imd.gov.in",
            )
            db.add(org)
            db.flush()

        depts_data = [
            ("NWFC", "National Weather Forecasting Centre", "Operational severe weather tracking and national forecasting"),
            ("SAT-MET", "Satellite Meteorology Division", "INSAT-3D/3DR geostationary and polar meteorological payload operations"),
            ("RAD-MET", "Radar Meteorology Division", "S-band and C-band Doppler Weather Radar network monitoring"),
            ("CLIM-DIV", "Climate Application and Research Division", "Climatological databases, seasonal forecasting, and climate services"),
            ("INST-DIV", "Instruments and Observational Network Division", "Surface and upper-air observational networks, AWS, and radiosonde"),
        ]

        depts_map = {}
        for code, name, desc in depts_data:
            dept = db.query(Department).filter(Department.organization_id == org.id, Department.code == code).first()
            if not dept:
                dept = Department(organization_id=org.id, code=code, name=name, description=desc)
                db.add(dept)
                db.flush()
            depts_map[code] = dept

        # 3. Categories
        categories_data = [
            ("GEN-MET", "General Meteorology", "Foundational principles of atmospheric science, thermodynamics, and dynamics."),
            ("CLIM", "Climatology & Climate Change", "Indian monsoon patterns, teleconnections, and long-range seasonal climate diagnostics."),
            ("OWF", "Operational Weather Forecasting", "Synoptic charting, numerical guidance interpretation, and warning issuance protocols."),
            ("SAT-MET", "Remote Sensing & Satellite", "Satellite payload interpretation, infrared/visible/water-vapor channel analysis."),
            ("RAD-MET", "Radar Meteorology", "Doppler weather radar reflectivity, velocity, spectrum width, and severe storm nowcasting."),
            ("INST-OBS", "Instruments & Observational Network", "Surface sensors, barometers, AWS maintenance, calibration, and quality control."),
            ("MET-COMP", "Meteorological Computing", "Python, NWP model post-processing, NetCDF/GRIB data handling, and automated graphics."),
        ]

        categories_map = {}
        for code, name, desc in categories_data:
            cat = db.query(CourseCategory).filter(CourseCategory.code == code).first()
            if not cat:
                cat = CourseCategory(code=code, name=name, description=desc)
                db.add(cat)
                db.flush()
            categories_map[code] = cat

        # 4. Competencies
        competencies_data = [
            ("COMP-SYNOPTIC", "Synoptic Weather Analysis & Charting", "Operational Forecasting", "Ability to analyze surface and upper-air synoptic charts, identify fronts, troughs, and cyclonic circulations."),
            ("COMP-DOPPLER", "Doppler Weather Radar Interpretation", "Radar Meteorology", "Skill in interpreting PPI, RHI, velocity azimuth display, and detecting mesocyclones and microbursts."),
            ("COMP-SAT", "Satellite Imagery Interpretation & Tracking", "Remote Sensing", "Proficiency in multi-spectral satellite imagery analysis, cloud classification, and tropical cyclone center fixes."),
            ("COMP-CYCLONE", "Tropical Cyclone Monitoring & Warning Formulation", "Disaster Warning", "Capability to track tropical depressions/cyclones using Dvorak technique, cone of uncertainty, and bulletins."),
            ("COMP-AWS", "Automatic Weather Station Calibration & Maintenance", "Instrumentation", "Procedures for sensor diagnostics, calibration against standard barometers, and telemetry verification."),
            ("COMP-NWP", "Numerical Weather Prediction Model Guidance Interpretation", "Computational Meteorology", "Interpreting WRF, GFS, and NCUM ensemble prediction systems for precipitation and wind fields."),
            ("COMP-PYMET", "Python for Meteorological Data Processing", "Scientific Computing", "Handling NetCDF4, GRIB2, MetPy, and CartoPy for observational analysis and visual generation."),
        ]

        competencies_map = {}
        for code, name, category, desc in competencies_data:
            comp = db.query(Competency).filter(Competency.code == code).first()
            if not comp:
                comp = Competency(code=code, name=name, category=category, description=desc)
                db.add(comp)
                db.flush()
            competencies_map[code] = comp

        # 5. Demo Trainer User
        demo_trainer_email = "trainer.demo@imd.gov.in"
        demo_trainer = db.query(User).filter(User.email == demo_trainer_email).first()
        if not demo_trainer:
            demo_trainer = User(
                email=demo_trainer_email,
                username="trainer_demo",
                hashed_password=get_password_hash("DemoTrainer123!"),
                first_name="Dr. Rajesh",
                last_name="Kumar",
                role_id=roles_map["TRAINER"].id,
                organization_id=org.id,
                department_id=depts_map["NWFC"].id,
                is_active=True,
                is_verified=True,
                account_status="ACTIVE",
            )
            db.add(demo_trainer)
            db.flush()

            trainer_profile = TrainerProfile(
                user_id=demo_trainer.id,
                employee_id="IMD-TR-1042",
                designation="Senior Meteorologist & Head of Training Division",
                specialization="Synoptic Meteorology & Tropical Cyclone Warning",
                bio="Senior atmospheric scientist with over 18 years of operational forecasting and curriculum development experience.",
                years_of_experience=18,
                average_rating=4.9,
                total_ratings_count=124,
            )
            db.add(trainer_profile)
            db.flush()

        # 6. Demo Trainee User
        demo_trainee_email = "trainee.demo@imd.gov.in"
        demo_trainee = db.query(User).filter(User.email == demo_trainee_email).first()
        if not demo_trainee:
            demo_trainee = User(
                email=demo_trainee_email,
                username="trainee_demo",
                hashed_password=get_password_hash("DemoTrainee123!"),
                first_name="Ananya",
                last_name="Sharma",
                phone_number="+91 98765 43210",
                role_id=roles_map["TRAINEE"].id,
                organization_id=org.id,
                department_id=depts_map["NWFC"].id,
                is_active=True,
                is_verified=True,
                account_status="ACTIVE",
            )
            db.add(demo_trainee)
            db.flush()

            trainee_profile = TraineeProfile(
                user_id=demo_trainee.id,
                employee_id="IMD-TRN-8821",
                designation="Scientific Assistant",
                cadre="Operational Meteorology Cadre",
                posting_location="New Delhi HQ, Meteorological Centre",
                bio="Passionate observational meteorologist eager to master Doppler radar analysis and synoptic weather forecasting techniques.",
                interests="Severe thunderstorms, radar meteorology, monsoon teleconnections, Python for atmospheric data visualization",
                target_competency_level="LEVEL_3_PROFICIENT",
                readiness_score=86.5,
            )
            db.add(trainee_profile)

            # Qualifications
            q1 = Qualification(
                user_id=demo_trainee.id,
                degree="Master of Science (M.Sc.)",
                field_of_study="Atmospheric Sciences & Meteorology",
                institution="Indian Institute of Technology (IIT) Delhi",
                year_of_passing=2023,
                grade_or_percentage="8.8 / 10 CGPA",
            )
            q2 = Qualification(
                user_id=demo_trainee.id,
                degree="Bachelor of Science (B.Sc. Hons)",
                field_of_study="Physics and Mathematics",
                institution="University of Delhi",
                year_of_passing=2021,
                grade_or_percentage="First Class with Distinction",
            )
            db.add_all([q1, q2])

            # Experiences
            exp1 = Experience(
                user_id=demo_trainee.id,
                title="Scientific Assistant Trainee",
                organization_name="India Meteorological Department (IMD)",
                location="New Delhi HQ",
                start_date=date(2023, 8, 1),
                is_current=True,
                description="Assisting in operational surface data ingestion, telemetry monitoring of AWS stations, and preliminary synoptic chart plotting.",
            )
            db.add(exp1)

            # Skills
            skills_data = [
                ("Synoptic Chart Plotting", "Operational", "INTERMEDIATE", 2.0),
                ("Surface Weather Observations (METAR/SPECI)", "Observational", "ADVANCED", 2.5),
                ("Python (NumPy, Matplotlib)", "Computing", "INTERMEDIATE", 1.5),
                ("Doppler Radar Reflectivity Analysis", "Remote Sensing", "BEGINNER", 0.5),
            ]
            for s_name, s_cat, s_prof, s_yrs in skills_data:
                skill = db.query(Skill).filter(Skill.name == s_name).first()
                if not skill:
                    skill = Skill(name=s_name, category=s_cat)
                    db.add(skill)
                    db.flush()
                us = UserSkill(
                    user_id=demo_trainee.id,
                    skill_id=skill.id,
                    proficiency_level=s_prof,
                    years_of_experience=s_yrs,
                    is_verified=True,
                )
                db.add(us)

            # User Competencies
            uc1 = UserCompetency(
                user_id=demo_trainee.id,
                competency_id=competencies_map["COMP-SYNOPTIC"].id,
                current_level=2,
                assessed_level=2,
                evidence_source="SUPERVISOR_EVALUATION",
                confidence_score=0.85,
                last_assessed_at=datetime.now(timezone.utc),
            )
            uc2 = UserCompetency(
                user_id=demo_trainee.id,
                competency_id=competencies_map["COMP-AWS"].id,
                current_level=3,
                assessed_level=3,
                evidence_source="ASSESSMENT",
                confidence_score=0.92,
                last_assessed_at=datetime.now(timezone.utc),
            )
            db.add_all([uc1, uc2])
            db.flush()

        # 7. Courses Catalogue (12 Courses as required by testing catalogue)
        courses_def = [
            {
                "code": "MET-101",
                "title": "Introduction to Meteorology",
                "cat": "GEN-MET",
                "diff": "BEGINNER",
                "hours": 30,
                "desc": "Foundational curriculum covering atmospheric composition, radiation balance, thermodynamics, and pressure gradient fundamentals.",
                "objectives": "Understand the vertical structure of the atmosphere; Calculate hydrostatic equilibrium; Describe global circulation cells.",
                "prerequisites": "Basic undergraduate physics and calculus.",
                "comp": ["COMP-SYNOPTIC"],
                "modules": [
                    {
                        "title": "Atmospheric Thermodynamics & Vertical Structure",
                        "desc": "Tropospheric composition, lapse rates, and hydrostatic balance.",
                        "lessons": [
                            ("Atmospheric Composition and Vertical Layers", "Study troposphere, stratosphere, mesosphere, and greenhouse gas distribution.", 45, "TEXT",
                             "The Earth's atmosphere is structured into distinct layers governed by vertical temperature gradients. In the troposphere (surface to 8–18 km), temperature decreases with height at the environmental lapse rate (~6.5°C/km). This layer contains over 80% of total atmospheric mass and virtually all weather phenomena."),
                            ("Hydrostatic Balance and the Hypsometric Equation", "Formulation of hydrostatic equilibrium in operational weather analysis.", 50, "TEXT",
                             "Hydrostatic equilibrium occurs when the upward pressure gradient force exactly balances downward gravitational force: dp/dz = -rho*g. Integrating this leads to the hypsometric equation, used extensively by meteorologists to calculate geopotential thickness between mandatory pressure levels."),
                            ("Thermodynamic Diagrams (Tephigram & Skew-T)", "Operational plotting of temperature and dewpoint soundings.", 60, "TEXT",
                             "Thermodynamic charts allow forecasters to diagnose convective available potential energy (CAPE), convective inhibition (CIN), lifted condensation level (LCL), and level of free convection (LFC)."),
                        ],
                    },
                    {
                        "title": "Atmospheric Dynamics & Wind Systems",
                        "desc": "Forces governing air motion, geostrophic wind, and gradient balance.",
                        "lessons": [
                            ("Forces in the Atmosphere: Pressure, Coriolis, and Friction", "Fundamental equation of horizontal motion on a rotating Earth.", 55, "TEXT",
                             "Atmospheric motion is driven by pressure gradient force, modulated by the Coriolis acceleration (f = 2*omega*sin(phi)), centrifugal forces along curved trajectories, and turbulent frictional drag in the planetary boundary layer."),
                            ("Geostrophic and Gradient Wind Approximations", "Diagnostic wind balances in synoptic weather charts.", 50, "TEXT",
                             "Above the boundary layer, geostrophic balance represents the steady-state equilibrium between the horizontal pressure gradient force and Coriolis force. It serves as the cornerstone of mid-latitude synoptic analysis."),
                        ],
                    },
                ],
                "resources": [
                    ("WMO Guide to Meteorological Instruments and Methods of Observation", "PDF", "https://library.wmo.int/doc_num.php?explnum_id=10616", "WMO-No-8-Summary.pdf", 4200000),
                    ("IMD Standard Meteorological Glossary & Constants", "PDF", "https://internal.imd.gov.in/docs/glossary.pdf", "IMD_Met_Glossary.pdf", 1850000),
                ]
            },
            {
                "code": "MET-201",
                "title": "Indian Climatology",
                "cat": "CLIM",
                "diff": "INTERMEDIATE",
                "hours": 45,
                "desc": "Comprehensive analysis of the Southwest and Northeast monsoon systems, Western Disturbances, and tropical teleconnections (ENSO, IOD, MJO).",
                "objectives": "Analyze monsoon onset dynamics; Understand tropical Indo-Pacific oscillations; Evaluate seasonal precipitation distribution.",
                "prerequisites": "Introduction to Meteorology (MET-101).",
                "comp": ["COMP-SYNOPTIC", "COMP-NWP"],
                "modules": [
                    {
                        "title": "Southwest Monsoon Dynamics",
                        "desc": "Onset, semi-permanent systems, and monsoon depressions over the Bay of Bengal.",
                        "lessons": [
                            ("Monsoon Trough and Tibetan High", "Upper-tropospheric anticyclone and thermal forcing over the Tibetan plateau.", 60, "TEXT",
                             "The summer monsoon over India is maintained by differential heating between the Asian landmass and the Indian Ocean. The Tibetan High at 200 hPa and the Tropical Easterly Jet (TEJ) at 150 hPa are fundamental upper-level features."),
                            ("Monsoon Depressions and Low Pressure Systems", "Genesis, propagation, and synoptic structure of Bay of Bengal systems.", 60, "TEXT",
                             "Monsoon depressions form in the head Bay of Bengal and move west-northwestward along the monsoon trough, distributing heavy precipitation across central and northern India."),
                        ],
                    },
                    {
                        "title": "Teleconnections and Climate Drivers",
                        "desc": "El Nino Southern Oscillation, Indian Ocean Dipole, and Madden-Julian Oscillation.",
                        "lessons": [
                            ("ENSO and IOD Impact on Indian Monsoon", "Quantifying the Pacific and Indian ocean sea surface temperature anomalies.", 50, "TEXT",
                             "The canonical El Nino pattern tends to suppress monsoon rainfall, whereas positive Indian Ocean Dipole (pIOD) events frequently offset El Nino impacts by enhancing moisture convergence over the Arabian Sea."),
                            ("Madden-Julian Oscillation (MJO) Phase Propagation", "Intra-seasonal oscillation tracking for extended-range prediction.", 45, "TEXT",
                             "MJO phases 2 to 4 enhance convective activity over the equatorial Indian Ocean and South Asia, providing critical predictability for active monsoon spells."),
                        ],
                    },
                ],
                "resources": [
                    ("IMD Monograph: Synoptic Meteorology of the Indian Summer Monsoon", "PDF", "https://internal.imd.gov.in/docs/monsoon_synoptic.pdf", "IMD_Monsoon_Synoptic.pdf", 6500000),
                ]
            },
            {
                "code": "MET-202",
                "title": "Weather Forecasting Fundamentals",
                "cat": "OWF",
                "diff": "BEGINNER",
                "hours": 40,
                "desc": "Practical synoptic analysis, surface and upper-air plotting, isobaric chart analysis, and standard operational forecast protocols.",
                "objectives": "Decode METAR, SPECI, and SYNOP reports; Plot surface weather charts; Formulate district-level weather forecasts.",
                "prerequisites": "None.",
                "comp": ["COMP-SYNOPTIC"],
                "modules": [
                    {
                        "title": "Observational Codes & Synoptic Plotting",
                        "desc": "Decoding WMO alphanumeric codes and manual/automated plotting symbols.",
                        "lessons": [
                            ("WMO SYNOP and METAR Code Breakdown", "Decoding pressure, wind barbs, present weather, and cloud groups.", 45, "TEXT",
                             "SYNOP (FM-12) reports encapsulate surface observations every 3 hours. Forecasters must rapidly decode station pressure, temperature, dewpoint, 3-hour pressure tendency, and WMO present weather codes (ww)."),
                            ("Isopleth Analysis: Isobars and Isallobars", "Constructing mean sea level pressure charts and diagnosing pressure changes.", 55, "TEXT",
                             "Isobars drawn at 2 hPa intervals reveal cyclonic circulations, anticyclones, ridges, and cols. Isallobars (lines of equal pressure tendency) delineate moving troughs."),
                        ],
                    },
                ],
                "resources": [
                    ("Standard Operational Weather Charting Guide", "PDF", "https://internal.imd.gov.in/docs/charting_guide.pdf", "IMD_Charting_Manual.pdf", 3100000),
                ]
            },
            {
                "code": "MET-301",
                "title": "Advanced Weather Forecasting",
                "cat": "OWF",
                "diff": "ADVANCED",
                "hours": 60,
                "desc": "Mesoscale convective system nowcasting, jet stream dynamics, Q-vector diagnostics, and ensemble prediction system integration.",
                "objectives": "Execute quasi-geostrophic diagnostic equations; Interpret multi-model ensemble plume forecasts; Issue impact-based weather warnings.",
                "prerequisites": "Weather Forecasting Fundamentals (MET-202).",
                "comp": ["COMP-SYNOPTIC", "COMP-NWP"],
                "modules": [
                    {
                        "title": "Quasi-Geostrophic Diagnostics",
                        "desc": "Omega equation, differential vorticity advection, and thermal advection.",
                        "lessons": [
                            ("Q-Vector Formulation and Vertical Motion", "Diagnosing synoptic vertical motion without cancellation errors.", 60, "TEXT",
                             "The classical omega equation suffers from cancellation between differential vorticity advection and Laplacian of thermal advection. Q-vectors resolve this by computing forcing directly on isobaric surfaces."),
                        ],
                    },
                ],
                "resources": [
                    ("Advanced Synoptic Dynamics Manual", "PDF", "https://internal.imd.gov.in/docs/qg_dynamics.pdf", "Adv_Synoptic_Dynamics.pdf", 5200000),
                ]
            },
            {
                "code": "MET-203",
                "title": "Satellite Data Interpretation",
                "cat": "SAT-MET",
                "diff": "INTERMEDIATE",
                "hours": 35,
                "desc": "Operational exploitation of INSAT-3D, 3DR, and 3DS meteorological imager and sounder data for weather analysis and severe storm detection.",
                "objectives": "Distinguish cloud types on RGB composite imagery; Track atmospheric motion vectors; Apply Dvorak technique to tropical cyclones.",
                "prerequisites": "Introduction to Meteorology.",
                "comp": ["COMP-SAT", "COMP-CYCLONE"],
                "modules": [
                    {
                        "title": "INSAT Payloads & Spectral Channels",
                        "desc": "Visible, Thermal Infrared, Mid-Infrared, and Water Vapor channel physics.",
                        "lessons": [
                            ("Multi-Spectral Channel Physics & RGB Composites", "Natural color, Day Microphysics, and Night Microphysics RGB interpretation.", 50, "TEXT",
                             "INSAT-3D/3DR payloads provide multi-channel scans every 15 minutes. Combining TIR1 (10.8 um), MIR (3.9 um), and VIS channels into RGB composites illuminates fog vs low stratus and deep convection tops."),
                            ("Water Vapor Imagery and Upper-Tropospheric Features", "Diagnosing dry slots, upper-level jet streaks, and vorticity centers.", 50, "TEXT",
                             "The 6.7 um and 7.1 um water vapor channels detect moisture patterns in the middle-to-upper troposphere, highlighting deformation zones and dry intrusions associated with rapid cyclogenesis."),
                        ],
                    },
                ],
                "resources": [
                    ("INSAT-3D/3DR Product User Manual", "PDF", "https://internal.imd.gov.in/docs/insat_pum.pdf", "INSAT_PUM_v2.pdf", 8900000),
                ]
            },
            {
                "code": "MET-204",
                "title": "Doppler Weather Radar Operations",
                "cat": "RAD-MET",
                "diff": "INTERMEDIATE",
                "hours": 50,
                "desc": "Principles of pulsed Doppler radar, scan strategies (VCP), radar reflectivity factor (Z), radial velocity, and severe storm signatures.",
                "objectives": "Operate DWR graphical workstations; Identify hook echoes, bounded weak echo regions (BWER), and velocity couplets; Calculate rainfall using Z-R relations.",
                "prerequisites": "Basic Electromagnetic Physics.",
                "comp": ["COMP-DOPPLER"],
                "modules": [
                    {
                        "title": "Radar Hardware & Signal Processing",
                        "desc": "Transmitter types, pulse repetition frequency (PRF), Doppler dilemma, and attenuation.",
                        "lessons": [
                            ("Radar Equation and Doppler Dilemma", "Relationship between unambiguous range (Rmax) and unambiguous velocity (Vmax).", 55, "TEXT",
                             "Pulsed Doppler radars face the Doppler dilemma: Rmax * Vmax = c * lambda / 8. High PRF expands velocity coverage but contracts range coverage, requiring dual-PRF and staggered PRT scanning strategies."),
                            ("Radar Products: PPI, RHI, CAPPI, and MAX(Z)", "Operational generation of planar and volume scan products.", 45, "TEXT",
                             "Plan Position Indicator (PPI) displays data at a fixed elevation angle. Constant Altitude Plan Position Indicator (CAPPI) resamples polar coordinate volumes into Cartesian horizontal slices."),
                        ],
                    },
                    {
                        "title": "Severe Weather Signatures",
                        "desc": "Mesocyclones, tornadic vortex signatures (TVS), microbursts, and gust fronts.",
                        "lessons": [
                            ("Velocity Azimuth Display (VAD) and Wind Profiling", "Extracting vertical profiles of horizontal winds from single Doppler radar.", 50, "TEXT",
                             "VAD analysis fits a Fourier series to radial velocities along an elevation circle, producing vertical wind profiles and divergence estimates in operational environments."),
                        ],
                    },
                ],
                "resources": [
                    ("IMD Doppler Weather Radar Network Operations Handbook", "PDF", "https://internal.imd.gov.in/docs/dwr_handbook.pdf", "IMD_DWR_Operations.pdf", 7400000),
                ]
            },
            {
                "code": "MET-302",
                "title": "Cyclone Monitoring & Warning",
                "cat": "OWF",
                "diff": "ADVANCED",
                "hours": 45,
                "desc": "Tropical cyclone genesis, intensification dynamics over the North Indian Ocean, Dvorak classification, storm surge modeling, and standard warning bulletin SOP.",
                "objectives": "Perform Dvorak intensity analysis; Interpret SLOSH storm surge guidance; Draft 4-stage cyclone warning bulletins (Pre-Cyclone Watch, Alert, Warning, Post-Landfall).",
                "prerequisites": "Satellite Data Interpretation (MET-203) & Operational Weather Forecasting.",
                "comp": ["COMP-CYCLONE", "COMP-SYNOPTIC", "COMP-SAT"],
                "modules": [
                    {
                        "title": "Cyclone Thermodynamics and Dynamics",
                        "desc": "Warm-core structure, CISK, WISHE mechanism, and environmental vertical wind shear.",
                        "lessons": [
                            ("North Indian Ocean Cyclone Climatology & Genesis", "Pre-monsoon (April-May) and post-monsoon (October-December) peaks.", 55, "TEXT",
                             "Tropical cyclones in the Bay of Bengal and Arabian Sea show a bimodal seasonal distribution governed by warm sea surface temperatures (>28°C), high low-level cyclonic vorticity, and low vertical wind shear."),
                            ("Dvorak Technique: Curved Band & Eye Patterns", "Estimating Current Intensity (C.I.) and central pressure drop.", 60, "TEXT",
                             "The empirical Dvorak technique relates satellite cloud patterns (curved band, shear, central dense overcast, and eye) to T-numbers from T1.0 to T8.0, providing operational intensity estimates."),
                        ],
                    },
                ],
                "resources": [
                    ("Standard Operating Procedure for Tropical Cyclone Warning Services in India", "PDF", "https://internal.imd.gov.in/docs/tc_sop.pdf", "IMD_Cyclone_SOP_2024.pdf", 6200000),
                ]
            },
            {
                "code": "MET-102",
                "title": "Surface Meteorological Instruments",
                "cat": "INST-OBS",
                "diff": "BEGINNER",
                "hours": 25,
                "desc": "Operational maintenance, inspection, and reading of mercury barometers, aneroids, thermograph, Stevensons screen, anemometers, and rain gauges.",
                "objectives": "Calibrate mercury barometers; Maintain psychrometers; Compute rainfall and reduction to mean sea level.",
                "prerequisites": "None.",
                "comp": ["COMP-AWS"],
                "modules": [
                    {
                        "title": "Surface Instrument Operation & Reading",
                        "desc": "Stevenson screen installation, dry and wet bulb thermometers, hair hygrometer.",
                        "lessons": [
                            ("Atmospheric Pressure Measurement and Barometer Corrections", "Index error, temperature correction, and gravity reduction to MSL.", 45, "TEXT",
                             "Barometer readings must be corrected for instrument scale error, temperature expansion of mercury and brass scale, and local latitude gravity before reducing to mean sea level."),
                            ("Rainfall Measurement: Standard Symons & Self-Recording Gauges", "Proper exposure, site selection, and reading timing.", 40, "TEXT",
                             "Symons rain gauge with 127 mm funnel diameter collects precipitation measured daily at 08:30 IST. Siphon-type self-recording rain gauges (SRRG) provide continuous rainfall intensity records."),
                        ],
                    },
                ],
                "resources": [
                    ("Instructions to Observers at Surface Observatories (Part I)", "PDF", "https://internal.imd.gov.in/docs/observers_part1.pdf", "IMD_Observers_Handbook.pdf", 4100000),
                ]
            },
            {
                "code": "MET-103",
                "title": "Automatic Weather Stations",
                "cat": "INST-OBS",
                "diff": "BEGINNER",
                "hours": 30,
                "desc": "Architecture, data loggers, satellite telemetry (EDUSAT/INSAT DCP), power systems, and maintenance protocols for IMD's nation-wide AWS network.",
                "objectives": "Diagnose sensor communication faults; Configure DCP burst transmitters; Perform routine sensor calibration checks.",
                "prerequisites": "Basic electronics or instrumentation knowledge.",
                "comp": ["COMP-AWS"],
                "modules": [
                    {
                        "title": "AWS Hardware Architecture & Data Collection",
                        "desc": "Solar power management, battery banks, micro-loggers, and sensor interface.",
                        "lessons": [
                            ("Sensor Interfacing: SDI-12, RS-485, and Analog Signals", "Communication protocols between sensors and central micro-logger.", 50, "TEXT",
                             "Modern AWS installations employ SDI-12 smart bus architecture for soil moisture and temperature sensors, and RS-485 serial communication for sonic anemometers, ensuring high noise immunity."),
                            ("INSAT Data Collection Platform (DCP) Transmissions", "Uplink frequency, time-slot scheduling, and receiver demodulation.", 45, "TEXT",
                             "AWS stations transmit pseudo-random burst packets to INSAT-3DR DCP transponders on UHF frequencies (402.75 MHz), which are received at Earth Station Pune and distributed in real-time."),
                        ],
                    },
                ],
                "resources": [
                    ("Automatic Weather Station (AWS) Network Maintenance Manual", "PDF", "https://internal.imd.gov.in/docs/aws_maintenance.pdf", "IMD_AWS_Manual.pdf", 3800000),
                ]
            },
            {
                "code": "MET-205",
                "title": "Climate Monitoring & Services",
                "cat": "CLIM",
                "diff": "INTERMEDIATE",
                "hours": 40,
                "desc": "Standard climatological normals, drought indices (SPI, SPEI), heatwave monitoring protocols, and tailored climate products for agriculture and water sectors.",
                "objectives": "Calculate Standardized Precipitation Index (SPI); Monitor heatwave/coldwave criteria; Generate district agro-meteorological advisories.",
                "prerequisites": "Indian Climatology (MET-201).",
                "comp": ["COMP-SYNOPTIC"],
                "modules": [
                    {
                        "title": "Climate Diagnostics & Extreme Indices",
                        "desc": "WMO ETCCDI climate indices, heatwave definitions, and drought monitoring.",
                        "lessons": [
                            ("Heat Wave and Cold Wave Criteria over Indian Subcontinent", "Threshold departure from normal and maximum temperature criteria.", 50, "TEXT",
                             "In core heatwave zones, a heatwave is declared when maximum temperature reaches at least 40°C with departure from normal between +4.5°C to +6.4°C, triggering color-coded administrative warnings."),
                        ],
                    },
                ],
                "resources": [
                    ("Climate Services & Heat Wave Protocol Guidelines", "PDF", "https://internal.imd.gov.in/docs/heatwave_guidelines.pdf", "IMD_Heatwave_Protocol.pdf", 2900000),
                ]
            },
            {
                "code": "MET-206",
                "title": "Meteorological Data Processing",
                "cat": "MET-COMP",
                "diff": "INTERMEDIATE",
                "hours": 35,
                "desc": "Quality control algorithms, spatial interpolation (Barnes, Cressman, Kriging), automated SYNOP/BUFR parsing, and real-time database archiving.",
                "objectives": "Implement spatial and temporal QC checks on observational data; Parse BUFR format messages; Interpolate station point data to regular grids.",
                "prerequisites": "Introductory programming experience.",
                "comp": ["COMP-PYMET"],
                "modules": [
                    {
                        "title": "Data Quality Control and Gridding",
                        "desc": "Gross error checks, internal consistency checks, and spatial coherence checks.",
                        "lessons": [
                            ("WMO Real-Time Quality Control Standards", "Range limits, rate of change, and spatial neighbor consistency testing.", 50, "TEXT",
                             "Observational data ingested into the National Data Centre undergoes automated QC: Tier 1 checks gross climatological limits, Tier 2 checks temporal rate of change, and Tier 3 checks spatial neighbor correlation."),
                        ],
                    },
                ],
                "resources": [
                    ("Quality Control of Meteorological Data in Automated Systems", "PDF", "https://internal.imd.gov.in/docs/qc_manual.pdf", "WMO_Data_QC_Manual.pdf", 4800000),
                ]
            },
            {
                "code": "MET-104",
                "title": "Programming for Meteorologists",
                "cat": "MET-COMP",
                "diff": "BEGINNER",
                "hours": 40,
                "desc": "Practical Python for meteorological analysis using Xarray, MetPy, CartoPy, NetCDF4, and Matplotlib to visualize weather data and model outputs.",
                "objectives": "Load and slice multi-dimensional NetCDF and GRIB2 datasets; Compute meteorological quantities (wind speed, potential temperature); Create publication-quality synoptic maps.",
                "prerequisites": "Basic computer literacy.",
                "comp": ["COMP-PYMET"],
                "modules": [
                    {
                        "title": "Scientific Python for Atmospheric Science",
                        "desc": "NumPy arrays, Pandas time-series, Xarray for multidimensional geospatial grids.",
                        "lessons": [
                            ("Working with NetCDF4 and GRIB2 Data with Xarray", "Opening, indexing, and slicing multi-dimensional gridded weather fields.", 50, "TEXT",
                             "Xarray introduces labeled dimensions, coordinates, and attributes onto NumPy arrays, allowing intuitive indexing such as ds.sel(latitude=slice(8, 38), longitude=slice(68, 98), time='2024-07-15')."),
                            ("Plotting Synoptic Weather Charts with CartoPy and MetPy", "Projections, coastlines, geopotential height contours, and wind barbs.", 60, "TEXT",
                             "CartoPy handles geospatial map projections (PlateCarree, LambertConformal), while MetPy calculates potential vorticity, advection terms, and formats wind barb overlays effortlessly."),
                        ],
                    },
                ],
                "resources": [
                    ("Python for Atmospheric Scientists Cheatsheet & Tutorial", "PDF", "https://internal.imd.gov.in/docs/pymet_tutorial.pdf", "Python_Meteorology_Guide.pdf", 5100000),
                ]
            },
        ]

        # Insert courses, modules, lessons, resources, and competency mappings
        for c_def in courses_def:
            course = db.query(Course).filter(Course.code == c_def["code"]).first()
            cat = categories_map[c_def["cat"]]
            if not course:
                course = Course(
                    code=c_def["code"],
                    title=c_def["title"],
                    category_id=cat.id,
                    trainer_id=demo_trainer.id,
                    description=c_def["desc"],
                    objectives=c_def["objectives"],
                    prerequisites=c_def["prerequisites"],
                    status="PUBLISHED",
                    difficulty_level=c_def["diff"],
                    duration_hours=c_def["hours"],
                    published_at=datetime.now(timezone.utc),
                )
                db.add(course)
                db.flush()

                # Competency mappings
                for comp_code in c_def.get("comp", []):
                    comp_obj = competencies_map.get(comp_code)
                    if comp_obj:
                        cc = CourseCompetency(
                            course_id=course.id,
                            competency_id=comp_obj.id,
                            contribution_weight=0.8,
                            target_level=2 if c_def["diff"] == "BEGINNER" else (3 if c_def["diff"] == "INTERMEDIATE" else 4),
                        )
                        db.add(cc)

                # Modules and Lessons
                for m_idx, m_def in enumerate(c_def.get("modules", [])):
                    module = CourseModule(
                        course_id=course.id,
                        title=m_def["title"],
                        description=m_def["desc"],
                        order_index=m_idx + 1,
                    )
                    db.add(module)
                    db.flush()

                    for l_idx, (l_title, l_desc, l_dur, l_type, l_body) in enumerate(m_def.get("lessons", [])):
                        lesson = Lesson(
                            module_id=module.id,
                            title=l_title,
                            description=l_desc,
                            duration_minutes=l_dur,
                            content_type=l_type,
                            content_body=l_body,
                            order_index=l_idx + 1,
                            is_mandatory=True,
                        )
                        db.add(lesson)

                # Resources
                for r_title, r_type, r_url, r_fname, r_size in c_def.get("resources", []):
                    res = Resource(
                        course_id=course.id,
                        title=r_title,
                        resource_type=r_type,
                        storage_url=r_url,
                        file_name=r_fname,
                        file_size_bytes=r_size,
                        mime_type="application/pdf" if r_type == "PDF" else "text/html",
                        is_downloadable=True,
                    )
                    db.add(res)

        db.commit()

        # 8. Enroll demo trainee into 2 courses with realistic progress
        # Course 1: MET-101 (completed first 2 lessons -> progress ~40%)
        c_intro = db.query(Course).filter(Course.code == "MET-101").first()
        if c_intro:
            en_intro = db.query(Enrollment).filter(Enrollment.user_id == demo_trainee.id, Enrollment.course_id == c_intro.id).first()
            if not en_intro:
                en_intro = Enrollment(user_id=demo_trainee.id, course_id=c_intro.id, status="IN_PROGRESS")
                db.add(en_intro)
                db.flush()

                # Get lessons of MET-101
                lessons = (
                    db.query(Lesson)
                    .join(CourseModule, Lesson.module_id == CourseModule.id)
                    .filter(CourseModule.course_id == c_intro.id)
                    .order_by(CourseModule.order_index, Lesson.order_index)
                    .all()
                )

                # Complete first 2 lessons
                if len(lessons) >= 2:
                    lc1 = LessonCompletion(enrollment_id=en_intro.id, lesson_id=lessons[0].id)
                    lc2 = LessonCompletion(enrollment_id=en_intro.id, lesson_id=lessons[1].id)
                    db.add_all([lc1, lc2])
                    db.flush()

                    pct = round((2 / len(lessons)) * 100.0, 1)
                    prog = CourseProgress(
                        enrollment_id=en_intro.id,
                        completed_lessons_count=2,
                        total_lessons_count=len(lessons),
                        completion_percentage=pct,
                        last_accessed_lesson_id=lessons[1].id,
                        last_accessed_at=datetime.now(timezone.utc),
                        is_completed=False,
                    )
                    db.add(prog)

        # Course 2: MET-204 (Doppler Radar - Enrolled recently, 0% progress)
        c_radar = db.query(Course).filter(Course.code == "MET-204").first()
        if c_radar:
            en_radar = db.query(Enrollment).filter(Enrollment.user_id == demo_trainee.id, Enrollment.course_id == c_radar.id).first()
            if not en_radar:
                en_radar = Enrollment(user_id=demo_trainee.id, course_id=c_radar.id, status="ENROLLED")
                db.add(en_radar)
                db.flush()

                radar_lessons = (
                    db.query(Lesson)
                    .join(CourseModule, Lesson.module_id == CourseModule.id)
                    .filter(CourseModule.course_id == c_radar.id)
                    .all()
                )
                prog_radar = CourseProgress(
                    enrollment_id=en_radar.id,
                    completed_lessons_count=0,
                    total_lessons_count=len(radar_lessons),
                    completion_percentage=0.0,
                    is_completed=False,
                )
                db.add(prog_radar)

        # 9. Certification for Trainee (from prior foundational course)
        cert_existing = db.query(Certification).filter(Certification.user_id == demo_trainee.id).first()
        if not cert_existing:
            cert = Certification(
                user_id=demo_trainee.id,
                title="IMD Surface Meteorological Observation Certified Specialist",
                issuing_organization="India Meteorological Department (IMD)",
                credential_id="IMD-CERT-2023-7492",
                issue_date=date(2023, 11, 15),
                verification_status="VERIFIED",
            )
            db.add(cert)

        # 10. Accredited Certificate for Trainee (Satellite Data Interpretation)
        c_satellite = db.query(Course).filter(Course.code == "MET-203").first()
        if c_satellite:
            cert_existing = (
                db.query(Certificate)
                .filter(Certificate.user_id == demo_trainee.id, Certificate.course_id == c_satellite.id)
                .first()
            )
            if not cert_existing:
                # Ensure Enrollment exists and is COMPLETED
                en_sat = (
                    db.query(Enrollment)
                    .filter(Enrollment.user_id == demo_trainee.id, Enrollment.course_id == c_satellite.id)
                    .first()
                )
                if not en_sat:
                    en_sat = Enrollment(
                        user_id=demo_trainee.id,
                        course_id=c_satellite.id,
                        status="COMPLETED",
                        started_at=datetime(2026, 9, 1, 9, 0, 0, tzinfo=timezone.utc),
                        completed_at=datetime(2026, 9, 28, 17, 0, 0, tzinfo=timezone.utc),
                    )
                    db.add(en_sat)
                    db.flush()
                else:
                    en_sat.status = "COMPLETED"

                # Mark all lessons completed
                sat_lessons = (
                    db.query(Lesson)
                    .join(CourseModule, Lesson.module_id == CourseModule.id)
                    .filter(CourseModule.course_id == c_satellite.id)
                    .all()
                )
                for les in sat_lessons:
                    lc = (
                        db.query(LessonCompletion)
                        .filter(LessonCompletion.enrollment_id == en_sat.id, LessonCompletion.lesson_id == les.id)
                        .first()
                    )
                    if not lc:
                        db.add(
                            LessonCompletion(
                                enrollment_id=en_sat.id,
                                lesson_id=les.id,
                                completed_at=datetime(2026, 9, 25, 12, 0, 0, tzinfo=timezone.utc),
                            )
                        )

                # Ensure 100% course progress
                sat_prog = db.query(CourseProgress).filter(CourseProgress.enrollment_id == en_sat.id).first()
                if not sat_prog:
                    db.add(
                        CourseProgress(
                            enrollment_id=en_sat.id,
                            completed_lessons_count=len(sat_lessons),
                            total_lessons_count=len(sat_lessons),
                            completion_percentage=100.0,
                            is_completed=True,
                            completed_at=datetime(2026, 9, 28, 17, 0, 0, tzinfo=timezone.utc),
                        )
                    )

                # Pass published assessments
                sat_assessments = (
                    db.query(Assessment)
                    .filter(Assessment.course_id == c_satellite.id, Assessment.status == "PUBLISHED")
                    .all()
                )
                for a in sat_assessments:
                    att = (
                        db.query(AssessmentAttempt)
                        .filter(AssessmentAttempt.assessment_id == a.id, AssessmentAttempt.user_id == demo_trainee.id)
                        .first()
                    )
                    if not att:
                        db.add(
                            AssessmentAttempt(
                                assessment_id=a.id,
                                user_id=demo_trainee.id,
                                status="EVALUATED",
                                score_obtained=94.0,
                                percentage=94.0,
                                is_passed=True,
                                started_at=datetime(2026, 9, 27, 10, 0, 0, tzinfo=timezone.utc),
                                submitted_at=datetime(2026, 9, 27, 11, 30, 0, tzinfo=timezone.utc),
                            )
                        )

                db.flush()
                CertificateService.issue_certificate(db, demo_trainee.id, c_satellite.id)

        db.commit()
        print("[Seed] Successfully seeded Phase 3 Demo Data (12 IMD Courses, Syllabus, Lessons, Resources, Competencies, and Demo Accounts)!")

    except Exception as e:
        db.rollback()
        print(f"[Seed] Error seeding Phase 3 data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_phase3_data()
