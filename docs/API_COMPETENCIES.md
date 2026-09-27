# Capacity Connect — Competencies & Intelligence API Specification

**Base URL**: `/api/v1/competencies`  
**Authentication**: Bearer Token (`Authorization: Bearer <access_token>`)  
**Cost**: ₹0.00 (Zero paid AI APIs, 100% deterministic calculations)

---

## 1. Endpoints Overview

| Method | Endpoint | Access Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Authenticated | List all active competencies from catalogue |
| `GET` | `/levels` | Authenticated | Retrieve standardized 0–5 proficiency level framework |
| `GET` | `/subjects` | Authenticated | List active curriculum subjects with competency requirements |
| `GET` | `/me` | `TRAINEE`, `TRAINER`, `ADMIN` | Evaluated competencies for currently authenticated user with multi-source evidence |
| `GET` | `/me/readiness` | `TRAINEE` | Transparent Training Readiness Score against baseline or specific subject |
| `GET` | `/me/gaps` | `TRAINEE` | Prioritized capability gap analysis against baseline or specific subject |
| `GET` | `/me/recommendations`| `TRAINEE` | Personalized course curriculum recommendations targeting open gaps |
| `GET` | `/me/growth/{competency_id}` | `TRAINEE` | Historical competency progression timeline derived from audits and events |
| `GET` | `/trainer-recommendations` | `ADMIN`, `TRAINER` | Algorithmic ranking of faculty candidates across 6 operational dimensions |
| `GET` | `/user/{user_id}` | `ADMIN` | Institutional inspection of any user's multi-source competency profile |

---

## 2. Detailed Endpoint Contracts

### 2.1 Standardized Levels Framework
- **Endpoint**: `GET /api/v1/competencies/levels`
- **Response**: `200 OK`
```json
[
  {
    "level": 0,
    "name": "Not Demonstrated",
    "description": "No verified operational evidence recorded on platform.",
    "color": "slate"
  },
  {
    "level": 1,
    "name": "Awareness",
    "description": "Familiarity with basic meteorological terminology and theoretical principles.",
    "color": "sky"
  },
  {
    "level": 2,
    "name": "Foundation",
    "description": "Basic operational knowledge capable of executing routine tasks under direct supervision.",
    "color": "cyan"
  },
  {
    "level": 3,
    "name": "Intermediate",
    "description": "Independent operational capability in standard meteorological analysis and forecasting routines.",
    "color": "emerald"
  },
  {
    "level": 4,
    "name": "Advanced",
    "description": "Deep operational proficiency handling complex, high-impact weather phenomena autonomously.",
    "color": "indigo"
  },
  {
    "level": 5,
    "name": "Expert",
    "description": "Institutional authority capable of leading severe weather operations and training faculty.",
    "color": "amber"
  }
]
```

---

### 2.2 User Demonstrated Competencies with Evidence
- **Endpoint**: `GET /api/v1/competencies/me`
- **Response**: `200 OK`
```json
[
  {
    "competency_id": "c1a2b3c4-...",
    "code": "COMP-DOPPLER",
    "name": "Doppler Weather Radar Interpretation",
    "category": "Radar Meteorology",
    "current_level": 2.8,
    "integer_level": 3,
    "level_name": "Intermediate",
    "badge_color": "emerald",
    "target_level": 4.0,
    "confidence_score": 0.85,
    "evidence": [
      {
        "type": "COURSE",
        "title": "Curriculum & Syllabus Completion",
        "score": 100.0,
        "contribution": 1.0,
        "detail": "Completed 'Doppler Weather Radar Operations' with 100% syllabus progress."
      },
      {
        "type": "ASSESSMENT",
        "title": "Examination Performance",
        "score": 78.5,
        "contribution": 1.18,
        "detail": "Achieved 78.5% in Doppler Radar Operations Certification Exam."
      },
      {
        "type": "SKILL",
        "title": "Operational & Technical Skills",
        "score": 60.0,
        "contribution": 0.6,
        "detail": "Verified INTERMEDIATE level in Radar Echo Analysis."
      }
    ],
    "summary_explanation": "Radar Operations competency is assessed at Level 2.8 (Intermediate) because of completed coursework, 78.5% exam score, and verified practical echo interpretation skills."
  }
]
```

---

### 2.3 Training Readiness Score
- **Endpoint**: `GET /api/v1/competencies/me/readiness?subject_id={optional_subject_uuid}`
- **Formula**:
  $$\text{Readiness} = \frac{\sum \min\left(1.0, \frac{\text{Demonstrated Level}}{\text{Required Level}}\right) \times \text{Weight}}{\sum \text{Weights}} \times 100$$
- **Response**: `200 OK`
```json
{
  "overall_readiness_percentage": 73.8,
  "target_role_or_subject": "Doppler Weather Radar Operations & Analysis",
  "required_competencies_count": 3,
  "met_competencies_count": 1,
  "gaps_count": 2,
  "competency_breakdown": [
    {
      "competency_id": "...",
      "code": "COMP-DOPPLER",
      "name": "Doppler Weather Radar Interpretation",
      "current_level": 2.8,
      "required_level": 4.0,
      "gap": 1.2,
      "is_met": false,
      "weight": 1.0
    }
  ],
  "formula_explanation": "Readiness Score = Sum(min(1.0, Demonstrated / Required) * Weight) / Sum(Weights) * 100"
}
```

---

### 2.4 Skill Gap Analysis
- **Endpoint**: `GET /api/v1/competencies/me/gaps?subject_id={optional_subject_uuid}`
- **Priority Logic**:
  - `HIGH`: $\text{Gap} \ge 1.0 \text{ and } \text{Weight} \ge 0.8$
  - `MEDIUM`: $\text{Gap} > 0.3$
  - `LOW`: $\text{Gap} \le 0.3$
- **Response**: `200 OK`
```json
[
  {
    "competency_id": "...",
    "code": "COMP-DOPPLER",
    "name": "Doppler Weather Radar Interpretation",
    "category": "Radar Meteorology",
    "current_level": 2.8,
    "required_level": 4.0,
    "gap": 1.2,
    "priority": "HIGH",
    "weight": 1.0,
    "evidence_summary": "Demonstrated Level 2.8 falls 1.2 levels short of mandatory benchmark Level 4.0."
  }
]
```

---

### 2.5 Personalized Course Recommendations
- **Endpoint**: `GET /api/v1/competencies/me/recommendations`
- **Response**: `200 OK`
```json
[
  {
    "course_id": "...",
    "course_code": "CRSE-MET-004",
    "title": "Advanced Doppler Weather Radar Operations",
    "difficulty_level": "ADVANCED",
    "estimated_hours": 30,
    "matched_competency_codes": ["COMP-DOPPLER"],
    "target_gaps_addressed": ["COMP-DOPPLER (-1.2 gap)"],
    "priority_score": 1.2,
    "why_recommended": "Addresses 1 high-priority capability deficiency in Doppler Weather Radar Interpretation. Course syllabus directly bridges the 1.2 level gap required for operational deployment."
  }
]
```

---

### 2.6 Trainer Recommendations & Candidate Matching
- **Endpoint**: `GET /api/v1/competencies/trainer-recommendations?subject_id={subject_uuid}`
- **Permissions**: `ADMIN`, `TRAINER`
- **Candidate Evaluation Weights**:
  - Competency Match: **30%**
  - Operational Experience: **20%**
  - Academic Qualifications: **15%**
  - Professional Certifications: **15%**
  - Assessment Performance: **10%**
  - Peer/Student Feedback: **10%**
- **Response**: `200 OK`
```json
{
  "subject_id": "...",
  "subject_name": "Doppler Weather Radar Operations & Analysis",
  "subject_code": "SUBJ-DWR-OPS",
  "domain": "Radar Meteorology",
  "candidate_count": 2,
  "candidates": [
    {
      "trainer_id": "...",
      "name": "Dr. Rajesh Kumar",
      "email": "trainer.radar@imd.gov.in",
      "organization": "India Meteorological Department",
      "designation": "Senior Meteorologist & Radar In-charge",
      "overall_match_score": 89.5,
      "competency_match": 92.0,
      "experience_score": 90.0,
      "qualification_score": 85.0,
      "certification_score": 80.0,
      "assessment_score": 88.0,
      "feedback_score": 95.0,
      "matched_competencies": ["COMP-DOPPLER"],
      "missing_competencies": [],
      "explanation": "Candidate exhibits 92.0% subject competency alignment. Demonstrates 10.0+ years of operational meteorology experience. Holds recognized qualifications (M.Sc / Ph.D.). Possesses verified professional credentials. Strong learner evaluation rating (4.8/5.0)."
    }
  ]
}
```
