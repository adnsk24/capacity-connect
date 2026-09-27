"""
Centralized Configuration for the Competency Intelligence Engine.
Defines competency level frameworks, deterministic evidence weights,
and trainer recommendation weighting configurations.
"""

from typing import Dict, Any

# Competency Levels (0 to 5)
COMPETENCY_LEVELS: Dict[int, Dict[str, str]] = {
    0: {
        "name": "Not Demonstrated",
        "descriptor": "No recorded evidence or unassessed capability.",
        "badge_color": "slate",
    },
    1: {
        "name": "Awareness",
        "descriptor": "Basic conceptual familiarity and rudimentary understanding of meteorological principles.",
        "badge_color": "blue",
    },
    2: {
        "name": "Foundation",
        "descriptor": "Foundational understanding with ability to perform routine tasks under supervision.",
        "badge_color": "cyan",
    },
    3: {
        "name": "Intermediate",
        "descriptor": "Working operational proficiency; executes operational analyses independently.",
        "badge_color": "emerald",
    },
    4: {
        "name": "Advanced",
        "descriptor": "Advanced operational mastery, diagnosing complex atmospheric events and edge cases.",
        "badge_color": "violet",
    },
    5: {
        "name": "Expert",
        "descriptor": "Authoritative subject-matter mastery; capability to formulate protocols and mentor personnel.",
        "badge_color": "amber",
    },
}

# Deterministic User Competency Evidence Weights (Sum = 1.0)
DEFAULT_EVIDENCE_WEIGHTS: Dict[str, float] = {
    "assessment": 0.30,      # 30% Assessment score on related exams
    "course": 0.20,          # 20% Course syllabus completion percentage
    "skill": 0.20,           # 20% Verified technical/observational skills
    "experience": 0.15,      # 15% Years in operational meteorological roles
    "certification": 0.10,   # 10% Verified training certifications
    "qualification": 0.05,   # 5% Academic degrees (B.Sc, M.Sc, Ph.D.)
}

# Trainer Matching Scoring Weights (Sum = 1.0)
DEFAULT_TRAINER_WEIGHTS: Dict[str, float] = {
    "competency_match": 0.30, # 30% Demonstrated competency vs required subject level
    "experience": 0.20,       # 20% Operational meteorological experience duration
    "qualification": 0.15,    # 15% Academic pedigree & degrees
    "certification": 0.15,    # 15% Accredited training certifications
    "assessment": 0.10,       # 10% Examination and assessment track record
    "feedback": 0.10,         # 10% Historical trainee feedback rating
}

# Skill proficiency level numerical mappings (0.0 - 5.0)
SKILL_PROFICIENCY_MAP: Dict[str, float] = {
    "BEGINNER": 1.5,
    "INTERMEDIATE": 3.0,
    "ADVANCED": 4.0,
    "EXPERT": 5.0,
}

# Maximum level scale
MAX_COMPETENCY_LEVEL: float = 5.0


def get_level_info(level: float) -> Dict[str, Any]:
    """Resolves a continuous level (e.g. 3.4) into its categorical level info."""
    rounded_level = int(round(level))
    clamped_level = max(0, min(5, rounded_level))
    info = COMPETENCY_LEVELS.get(clamped_level, COMPETENCY_LEVELS[0]).copy()
    info["numeric_level"] = round(level, 2)
    info["integer_level"] = clamped_level
    return info
