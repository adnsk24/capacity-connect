"""
Seeder script for official IMD learning resources:
Videos, Audio lectures, Presentations, Technical manuals, and External Video references
mapped to the 12 official IMD courses.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from app.database.session import SessionLocal
from app.models.course import Course, CourseModule, Lesson, Resource


SAMPLE_MEDIA_BY_COURSE = {
    "MET-203": [  # Satellite Data Interpretation
        {
            "title": "Satellite Image Interpretation",
            "resource_type": "VIDEO",
            "url": "https://mausam.imd.gov.in/satellite/animation/anim-3d.html",
            "description": "Demonstration of multispectral INSAT-3D/3DR imagery analysis for convection identification.",
            "duration_seconds": 765, # 12:45
            "thumbnail_url": "/assets/courses/satellite-data-interpretation.jpg",
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 1,
        },
        {
            "title": "Cloud Classification from Satellite Imagery",
            "resource_type": "VIDEO",
            "url": "https://mausam.imd.gov.in/imd_latest/contents/index_all_video.php",
            "description": "Visual classification of stratiform, cirrus, and cumulonimbus cloud clusters.",
            "duration_seconds": 1100, # 18:20
            "thumbnail_url": "/assets/courses/satellite-data-interpretation.jpg",
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 2,
        },
        {
            "title": "Satellite Meteorology Lecture",
            "resource_type": "AUDIO",
            "url": "https://imdpune.gov.in/training/audio/sat_met_lecture.mp3",
            "description": "Audio commentary by Central Training Institute faculty on geostationary sounder principles.",
            "duration_seconds": 632, # 10:32
            "thumbnail_url": "/assets/courses/satellite-data-interpretation.jpg",
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 3,
        },
        {
            "title": "Satellite Meteorology Notes",
            "resource_type": "DOCUMENT",
            "url": "https://imdpune.gov.in/monographs.html",
            "description": "Comprehensive reference guide on thermal infrared channel calibration.",
            "duration_seconds": None,
            "thumbnail_url": None,
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 4,
        },
        {
            "title": "INSAT Applications & Numerical Integration",
            "resource_type": "PRESENTATION",
            "url": "https://imdpune.gov.in/training/insat_applications.pptx",
            "description": "Operational deck illustrating atmospheric motion vectors and rapid-scan protocols.",
            "duration_seconds": None,
            "thumbnail_url": None,
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 5,
        },
    ],
    "MET-204": [  # Doppler Weather Radar Operations
        {
            "title": "Introduction to Doppler Weather Radar",
            "resource_type": "VIDEO",
            "url": "https://mausam.imd.gov.in/radar/animation/dwr-anim.html",
            "description": "Technical overview of S-band and C-band pulsed Doppler radar transmitters and antennas.",
            "duration_seconds": 840, # 14:00
            "thumbnail_url": "/assets/courses/doppler-weather-radar.jpg",
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 1,
        },
        {
            "title": "Radar Products and Velocity Interpretation",
            "resource_type": "VIDEO",
            "url": "https://mausam.imd.gov.in/imd_latest/contents/index_all_video.php",
            "description": "Analysis of Plan Position Indicator (PPI), Max-Z, and Velocity Azimuth Display (VAD).",
            "duration_seconds": 960, # 16:00
            "thumbnail_url": "/assets/courses/doppler-weather-radar.jpg",
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 2,
        },
        {
            "title": "Radar Meteorology Technical Lecture",
            "resource_type": "AUDIO",
            "url": "https://imdpune.gov.in/training/audio/dwr_operations.mp3",
            "description": "Audio instruction detailing radar constant calibration and ground clutter filtering.",
            "duration_seconds": 710, # 11:50
            "thumbnail_url": "/assets/courses/doppler-weather-radar.jpg",
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 3,
        },
        {
            "title": "Radar Operations Manual & Guidelines",
            "resource_type": "DOCUMENT",
            "url": "https://imdpune.gov.in/monographs.html",
            "description": "Standard Operating Procedure for National DWR network data dissemination.",
            "duration_seconds": None,
            "thumbnail_url": None,
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 4,
        },
    ],
    "MET-302": [  # Cyclone Monitoring & Warning
        {
            "title": "Cyclone Monitoring Protocols",
            "resource_type": "VIDEO",
            "url": "https://rsmcnewdelhi.imd.gov.in/",
            "description": "Official IMD RSMC New Delhi cyclone tracking and 4-stage warning bulletin workflow.",
            "duration_seconds": 920, # 15:20
            "thumbnail_url": "/assets/courses/cyclone-monitoring-warning.jpg",
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 1,
        },
        {
            "title": "Satellite and Radar Observation of Cyclones",
            "resource_type": "VIDEO",
            "url": "https://mausam.imd.gov.in/satellite/animation/anim-3d.html",
            "description": "Dvorak technique eye temperature analysis and eyewall radar surveillance.",
            "duration_seconds": 1050, # 17:30
            "thumbnail_url": "/assets/courses/cyclone-monitoring-warning.jpg",
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 2,
        },
        {
            "title": "Cyclone Warning Procedures & Dissemination",
            "resource_type": "AUDIO",
            "url": "https://imdpune.gov.in/training/audio/cyclone_briefing.mp3",
            "description": "Standard terminology for storm surges, gale force winds, and coastal evacuation sirens.",
            "duration_seconds": 540, # 09:00
            "thumbnail_url": "/assets/courses/cyclone-monitoring-warning.jpg",
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 3,
        },
        {
            "title": "Cyclone Warning Protocol & RSMC Guidelines",
            "resource_type": "DOCUMENT",
            "url": "https://rsmcnewdelhi.imd.gov.in/images/cyclone_manual.pdf",
            "description": "WMO/ESCAP Panel on Tropical Cyclones Standard Operational Procedures.",
            "duration_seconds": None,
            "thumbnail_url": None,
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 4,
        },
    ],
    "MET-202": [  # Weather Forecasting Fundamentals
        {
            "title": "Synoptic Weather Analysis & Briefing",
            "resource_type": "VIDEO",
            "url": "https://mausam.imd.gov.in/imd_latest/contents/index_all_video.php",
            "description": "National Weather Forecasting Centre operational daily morning synoptic review.",
            "duration_seconds": 880,
            "thumbnail_url": "/assets/courses/weather-forecasting-fundamentals.jpg",
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 1,
        },
        {
            "title": "Forecasting Concepts & Frontal Dynamics",
            "resource_type": "AUDIO",
            "url": "https://imdpune.gov.in/training/audio/synoptic_concepts.mp3",
            "description": "Baroclinic instability and thermal wind relationship audio lecture.",
            "duration_seconds": 620,
            "thumbnail_url": "/assets/courses/weather-forecasting-fundamentals.jpg",
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 2,
        },
        {
            "title": "Surface Weather Chart Interpretation",
            "resource_type": "DOCUMENT",
            "url": "https://imdpune.gov.in/training/docs/synoptic_charts_notes.pdf",
            "description": "IMD observational plotting symbols and isobar analysis rules.",
            "duration_seconds": None,
            "thumbnail_url": None,
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 3,
        },
    ],
    "MET-101": [
        {
            "title": "Atmospheric Composition and Structure",
            "resource_type": "VIDEO",
            "url": "https://mausam.imd.gov.in/imd_latest/contents/index_all_video.php",
            "description": "Thermal structure from troposphere to exosphere and hydrostatic equilibrium.",
            "duration_seconds": 780,
            "thumbnail_url": "/assets/courses/introduction-meteorology.jpg",
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 1,
        },
        {
            "title": "Lapse Rates and Atmospheric Stability",
            "resource_type": "AUDIO",
            "url": "https://imdpune.gov.in/training/audio/stability_lecture.mp3",
            "description": "Dry and moist adiabatic lapse rates and parcel theory fundamentals.",
            "duration_seconds": 580,
            "thumbnail_url": "/assets/courses/introduction-meteorology.jpg",
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 2,
        },
        {
            "title": "General Meteorology Foundations Manual",
            "resource_type": "DOCUMENT",
            "url": "https://imdpune.gov.in/monographs.html",
            "description": "WMO BIP-M aligned reference text for meteorologist recruits.",
            "duration_seconds": None,
            "thumbnail_url": None,
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 3,
        },
    ],
    "MET-103": [  # Automatic Weather Stations (AWS)
        {
            "title": "Automatic Weather Station (AWS) Calibration",
            "resource_type": "VIDEO",
            "url": "https://imdpune.gov.in/training/index.html",
            "description": "Field sensor verification and solar telemetry module testing procedures.",
            "duration_seconds": 890,
            "thumbnail_url": "/assets/courses/automatic-weather-stations.jpg",
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 1,
        },
        {
            "title": "AWS Sensor Troubleshooting Guidelines",
            "resource_type": "DOCUMENT",
            "url": "https://imdpune.gov.in/training/docs/aws_troubleshooting.pdf",
            "description": "Routine diagnostic commands and data logger recovery checklists.",
            "duration_seconds": None,
            "thumbnail_url": None,
            "module_index": 0,
            "lesson_index": 0,
            "display_order": 2,
        },
    ],
}


def seed_media():
    db = SessionLocal()
    try:
        print("[Seed] Seeding realistic IMD learning media resources...")
        total_seeded = 0

        for course_code, media_list in SAMPLE_MEDIA_BY_COURSE.items():
            course = db.query(Course).filter(Course.code == course_code).first()
            if not course:
                print(f"[Seed] Course {course_code} not found, skipping.")
                continue

            sorted_modules = sorted(course.modules, key=lambda m: m.order_index)
            
            for item in media_list:
                # Check if resource with same title already exists
                existing = db.query(Resource).filter(
                    Resource.course_id == course.id,
                    Resource.title == item["title"],
                ).first()

                mod_id = None
                les_id = None
                if sorted_modules and item["module_index"] < len(sorted_modules):
                    mod = sorted_modules[item["module_index"]]
                    mod_id = mod.id
                    sorted_lessons = sorted(mod.lessons, key=lambda l: l.order_index)
                    if sorted_lessons and item["lesson_index"] < len(sorted_lessons):
                        les_id = sorted_lessons[item["lesson_index"]].id

                if existing:
                    existing.resource_type = item["resource_type"]
                    existing.storage_url = item["url"]
                    existing.description = item["description"]
                    existing.duration_seconds = item["duration_seconds"]
                    existing.thumbnail_url = item["thumbnail_url"]
                    existing.display_order = item["display_order"]
                    existing.is_published = True
                    existing.module_id = mod_id
                    existing.lesson_id = les_id
                    existing.is_downloadable = True
                else:
                    new_res = Resource(
                        course_id=course.id,
                        module_id=mod_id,
                        lesson_id=les_id,
                        title=item["title"],
                        description=item["description"],
                        resource_type=item["resource_type"],
                        storage_url=item["url"],
                        thumbnail_url=item["thumbnail_url"],
                        duration_seconds=item["duration_seconds"],
                        display_order=item["display_order"],
                        is_published=True,
                        is_downloadable=True,
                    )
                    db.add(new_res)
                    total_seeded += 1

        db.commit()
        print(f"[Seed] Successfully seeded/updated {total_seeded} course media resources.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_media()
