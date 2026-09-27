"""
Phase 5 Seed Script: Subjects, SubjectCompetencyRequirements,
Second Expert Trainer, and Trainee Evidence Data.
"""

from datetime import date, datetime, timezone
from app.database.session import SessionLocal
from app.models.user import User, Role, TrainerProfile, UserSkill, Skill, Qualification, Experience, Certification
from app.models.competency import Competency
from app.models.subject import Subject, SubjectCompetencyRequirement
from app.models.organization import Organization, Department
from app.core.security import get_password_hash


def seed_phase5():
    db = SessionLocal()
    try:
        print("[Phase 5 Seed] Initializing Competency Intelligence seed data...")

        # 1. Fetch reference maps
        comps = {c.code: c for c in db.query(Competency).all()}
        trainer_role = db.query(Role).filter(Role.name == "TRAINER").first()
        trainee_role = db.query(Role).filter(Role.name == "TRAINEE").first()
        org = db.query(Organization).first()
        nwfc_dept = db.query(Department).filter(Department.code == "NWFC").first()
        radar_dept = db.query(Department).filter(Department.code == "RADAR").first() or nwfc_dept

        # 2. Seed Subjects and Requirements
        subjects_data = [
            {
                "code": "SUBJ-DWR-OPS",
                "name": "Doppler Weather Radar Operations & Severe Convection",
                "domain": "Radar Meteorology",
                "desc": "Operational radar scanning protocols, dual-polarization interpretation, and severe convection warning.",
                "reqs": [
                    ("COMP-DOPPLER", 4, 1.0),
                    ("COMP-SYNOPTIC", 3, 0.8),
                ],
            },
            {
                "code": "SUBJ-SAT-CYCLONE",
                "name": "Satellite Remote Sensing & Tropical Cyclone Tracking",
                "domain": "Remote Sensing",
                "desc": "INSAT-3D multi-spectral tracking, Dvorak intensity analysis, and tropical cyclone warning bulletins.",
                "reqs": [
                    ("COMP-SAT", 4, 1.0),
                    ("COMP-CYCLONE", 4, 0.9),
                    ("COMP-SYNOPTIC", 3, 0.7),
                ],
            },
            {
                "code": "SUBJ-NWP-COMP",
                "name": "Numerical Weather Prediction & Atmospheric Modeling",
                "domain": "Computational Meteorology",
                "desc": "High-resolution WRF/GFS model interpretation, ensemble forecasting, and Python data pipelines.",
                "reqs": [
                    ("COMP-NWP", 4, 1.0),
                    ("COMP-PYMET", 3, 0.8),
                ],
            },
        ]

        for s_def in subjects_data:
            subject = db.query(Subject).filter(Subject.code == s_def["code"]).first()
            if not subject:
                subject = Subject(
                    code=s_def["code"],
                    name=s_def["name"],
                    domain=s_def["domain"],
                    description=s_def["desc"],
                    is_active=True,
                )
                db.add(subject)
                db.flush()

                for comp_code, req_lvl, wt in s_def["reqs"]:
                    comp_obj = comps.get(comp_code)
                    if comp_obj:
                        req = SubjectCompetencyRequirement(
                            subject_id=subject.id,
                            competency_id=comp_obj.id,
                            required_level=req_lvl,
                            weight=wt,
                        )
                        db.add(req)
                print(f"  + Seeded Subject: {subject.name} with {len(s_def['reqs'])} requirements")

        # 3. Seed Second Trainer for Comparison in Recommendations
        sat_trainer_email = "trainer.satellite@imd.gov.in"
        sat_trainer = db.query(User).filter(User.email == sat_trainer_email).first()
        if not sat_trainer:
            sat_trainer = User(
                email=sat_trainer_email,
                username="trainer_meenakshi",
                hashed_password=get_password_hash("DemoTrainer123!"),
                first_name="Dr. Meenakshi",
                last_name="Sundaram",
                role_id=trainer_role.id,
                organization_id=org.id,
                department_id=radar_dept.id,
                is_active=True,
                is_verified=True,
                account_status="ACTIVE",
            )
            db.add(sat_trainer)
            db.flush()

            sat_profile = TrainerProfile(
                user_id=sat_trainer.id,
                designation="Director of Satellite Meteorology",
                specialization="Satellite Remote Sensing & Cyclone Tracking",
                bio="14 years operational experience in INSAT multi-spectral interpretation and WMO cyclone guidance.",
                years_of_experience=14,
                average_rating=4.9,
                total_ratings_count=38,
            )
            db.add(sat_profile)

            # Qualifications
            db.add(
                Qualification(
                    user_id=sat_trainer.id,
                    degree="Ph.D. in Atmospheric Remote Sensing",
                    institution="Indian Institute of Space Science and Technology (IIST)",
                    year_of_passing=2012,
                    grade_or_percentage="Distinction",
                )
            )

            # Experiences
            db.add(
                Experience(
                    user_id=sat_trainer.id,
                    title="Senior Satellite Meteorologist",
                    organization_name="IMD Satellite Meteorology Division",
                    location="New Delhi",
                    start_date=date(2012, 8, 1),
                    end_date=None,
                    is_current=True,
                    description="Lead operational analyst for INSAT-3D/3DR cyclone center fixes and Dvorak classification.",
                )
            )

            # Certifications
            db.add(
                Certification(
                    user_id=sat_trainer.id,
                    title="WMO Certified Tropical Cyclone Forecaster",
                    issuing_organization="World Meteorological Organization (WMO)",
                    credential_id="WMO-TC-2018-912",
                    issue_date=date(2018, 5, 10),
                    verification_status="VERIFIED",
                )
            )
            print(f"  + Seeded Second Trainer: {sat_trainer.first_name} {sat_trainer.last_name}")

        # 4. Enrich Demo Trainee Evidence Profile
        trainee = db.query(User).filter(User.email == "trainee.demo@imd.gov.in").first()
        if trainee:
            # Seed catalog skills if needed
            skills_data = [
                ("Synoptic Chart Analysis", "Operational Forecasting"),
                ("Doppler Radar Interpretation", "Radar Meteorology"),
                ("Automatic Weather Station Calibration", "Instrumentation"),
                ("Satellite Cloud Classification", "Remote Sensing"),
            ]
            skills_map = {}
            for s_name, s_cat in skills_data:
                sk = db.query(Skill).filter(Skill.name == s_name).first()
                if not sk:
                    sk = Skill(name=s_name, category=s_cat, description=f"Operational skill in {s_name}")
                    db.add(sk)
                    db.flush()
                skills_map[s_name] = sk

            # Attach UserSkills to Demo Trainee
            existing_user_skills = {us.skill_id for us in db.query(UserSkill).filter(UserSkill.user_id == trainee.id).all()}
            
            if skills_map["Synoptic Chart Analysis"].id not in existing_user_skills:
                db.add(UserSkill(user_id=trainee.id, skill_id=skills_map["Synoptic Chart Analysis"].id, proficiency_level="ADVANCED", years_of_experience=2.5, is_verified=True))
            if skills_map["Doppler Radar Interpretation"].id not in existing_user_skills:
                db.add(UserSkill(user_id=trainee.id, skill_id=skills_map["Doppler Radar Interpretation"].id, proficiency_level="INTERMEDIATE", years_of_experience=1.5, is_verified=True))
            if skills_map["Automatic Weather Station Calibration"].id not in existing_user_skills:
                db.add(UserSkill(user_id=trainee.id, skill_id=skills_map["Automatic Weather Station Calibration"].id, proficiency_level="BEGINNER", years_of_experience=0.5, is_verified=True))

            # Experience
            if not db.query(Experience).filter(Experience.user_id == trainee.id).first():
                db.add(
                    Experience(
                        user_id=trainee.id,
                        title="Scientific Assistant",
                        organization_name="India Meteorological Department - NWFC",
                        location="Mausam Bhavan, New Delhi",
                        start_date=date(2023, 7, 1),
                        end_date=None,
                        is_current=True,
                        description="Assisting synoptic charting and real-time surface observations.",
                    )
                )

            # Qualifications
            if not db.query(Qualification).filter(Qualification.user_id == trainee.id).first():
                db.add(
                    Qualification(
                        user_id=trainee.id,
                        degree="M.Sc. Atmospheric Sciences",
                        institution="IIT Delhi",
                        year_of_passing=2023,
                        grade_or_percentage="First Class with Distinction",
                    )
                )

            # Certifications
            if not db.query(Certification).filter(Certification.user_id == trainee.id).first():
                db.add(
                    Certification(
                        user_id=trainee.id,
                        title="Certificate in Operational Meteorology Basics",
                        issuing_organization="IMD Central Training Institute (CTI Pune)",
                        credential_id="CTI-PUNE-2023-401",
                        issue_date=date(2023, 11, 15),
                        verification_status="VERIFIED",
                    )
                )

            print("  + Enriched Demo Trainee qualifications, experience, skills, and certifications.")

        db.commit()
        print("[Phase 5 Seed] Complete.")
    except Exception as e:
        db.rollback()
        print(f"[Phase 5 Seed Error]: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_phase5()
