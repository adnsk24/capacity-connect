# Capacity Connect — Competency Intelligence Engine & 3D Universe Architecture

## 1. Engine Mission & Principles

The Capacity Connect **Competency Intelligence Engine** is the core analytical differentiator of the IMD Digital Capacity Building Portal. It deterministically bridges administrative profiles, training syllabi, examination outcomes, and field credentials to provide **explainable**, **auditable**, and **zero-cost** operational intelligence without relying on external generative AI or paid APIs.

### Core Principles:
1. **Explainable by Design**: Every score, level recommendation, or deficiency priority reveals its raw components and contribution weights.
2. **Deterministic & Reproducible**: Identical platform evidence guarantees identical computed levels and rankings across repeated runs.
3. **₹0 Operating Cost**: 100% open-source algorithms executing on Python/FastAPI with PostgreSQL and Three.js/React Three Fiber.
4. **Institutional Security & RBAC**: Trainees access only their own dossiers; trainers inspect verified candidate pools; admins oversee nationwide capability benchmarks.

---

## 2. Standardized Competency Level Framework

Competency capabilities are mapped on a continuous **0.0 to 5.0 scale** categorized into 6 standardized operational tiers:

| Tier | Name | Numerical Range | Operational Meaning |
| :---: | :--- | :---: | :--- |
| **0** | **Not Demonstrated** | `[0.0, 0.5)` | No verified evidence recorded on the portal. |
| **1** | **Awareness** | `[0.5, 1.5)` | Familiar with fundamental meteorological definitions and theoretical principles. |
| **2** | **Foundation** | `[1.5, 2.5)` | Capable of executing standard observation protocols under senior supervision. |
| **3** | **Intermediate** | `[2.5, 3.5)` | Independent operational competency in routine analysis and daily forecasting. |
| **4** | **Advanced** | `[3.5, 4.5)` | Deep operational expertise handling complex or severe meteorological events autonomously. |
| **5** | **Expert** | `[4.5, 5.0]` | Institutional authority capable of leading cyclone/radar desks and mentoring faculty. |

---

## 3. Multi-Source Evidence Aggregation Algorithm

The engine evaluates a user's demonstrated competency level ($L$) by calculating weighted contributions from six distinct evidence vectors:

$$L = \min\left(5.0, 5.0 \times \sum_{i=1}^{6} (S_i \times W_i)\right)$$

Where $S_i \in [0.0, 1.0]$ is the normalized source score, and $W_i$ is the configurable dimension weight:

| Dimension ($i$) | Weight ($W_i$) | Normalization Formula ($S_i$) | Platform Source Entity |
| :--- | :---: | :--- | :--- |
| **Assessments** | **30%** | $\frac{\text{Average Exam Score}}{100}$ | `assessment_attempts` (Passing & Completed) |
| **Course Syllabus** | **20%** | $\frac{\text{Completed Lessons}}{\text{Total Lessons}}$ | `enrollments` & `course_progress` |
| **Practical Skills** | **20%** | Map: Beginner=0.3, Int=0.6, Adv=0.8, Exp=1.0 | `user_skills` & `skills` |
| **Field Experience** | **15%** | $\min\left(1.0, \frac{\text{Years of Exp}}{5.0}\right)$ | `experiences` (Operational Duration) |
| **Certifications** | **10%** | 0.8 per verified credential (cap 1.0) | `certifications` (WMO, IMD, Tech) |
| **Qualifications** | **5%** | Dip=0.4, B.Sc=0.6, M.Sc=0.85, Ph.D=1.0 | `qualifications` (Degree Level) |

Weights are strictly normalized such that $\sum W_i = 1.0$.

---

## 4. Training Readiness Score Formulation

The **Training Readiness Score** measures how adequately a trainee's demonstrated competencies satisfy the operational prerequisites of a syllabus or operational role:

$$\text{Readiness \%} = \frac{\sum_{c \in C} \left[\min\left(1.0, \frac{L_c}{R_c}\right) \times W_c\right]}{\sum_{c \in C} W_c} \times 100$$

Where:
- $C$ is the set of required competencies for the subject.
- $L_c$ is the trainee's demonstrated level in competency $c$.
- $R_c$ is the operational target level benchmark for competency $c$.
- $W_c$ is the requirement priority weight ($0.1$ to $1.0$).

> **Institutional Note**: This metric is strictly designated as a **"Training Readiness Score"** reflecting recorded platform evidence, NOT a psychological evaluation or innate human aptitude score.

---

## 5. Skill Gap Analysis & Priority Calculation

For each competency requirement, the gap is computed as:

$$\text{Gap}_c = \max(0.0, R_c - L_c)$$

Deficiency priority is deterministically categorized based on gap magnitude and mission criticality:
- **`HIGH` Priority**: $\text{Gap}_c \ge 1.0$ **and** Requirement Weight $W_c \ge 0.8$ (Direct operational risk).
- **`MEDIUM` Priority**: $\text{Gap}_c > 0.3$ (Noticeable capability deficiency).
- **`LOW` Priority**: $\text{Gap}_c \le 0.3$ (Proficiency benchmark met or nearly satisfied).

---

## 6. Personalized Learning Path Recommendations

Recommendations are formed deterministically without generative guessing:
1. Identify all competencies where $\text{Gap}_c > 0.3$.
2. Query course catalog for courses mapped to these deficiency competencies via `course_competencies`.
3. Score each candidate course:
   $$\text{Score}_{\text{course}} = \sum_{c \in \text{Course Gaps}} (\text{Gap}_c \times W_c)$$
4. Exclude courses already 100% completed by the trainee.
5. Generate human-readable explanation specifying exact gaps closed and syllabus alignment.

---

## 7. 6-Dimension Trainer Matching Algorithm

When an Admin nominates faculty for a specialized subject, candidate trainers are evaluated across six operational criteria:

$$\text{Score}_{\text{trainer}} = 0.30 C_{\text{match}} + 0.20 E_{\text{score}} + 0.15 Q_{\text{score}} + 0.15 R_{\text{cert}} + 0.10 A_{\text{score}} + 0.10 F_{\text{rating}}$$

1. **Competency Match ($C_{\text{match}}$)**: Average demonstrated level across subject-required competencies divided by target requirements (0–100%).
2. **Experience Score ($E_{\text{score}}$)**: Operational years scaled to 10-year benchmark ($\min(100, \frac{\text{Years}}{10} \times 100)$).
3. **Qualification Score ($Q_{\text{score}}$)**: Highest degree held (Ph.D.=95%, M.Sc.=85%, B.Sc.=70%).
4. **Certification Score ($R_{\text{cert}}$)**: Active credentials verified (80–100%).
5. **Assessment Score ($A_{\text{score}}$)**: Historical exam performance across domain topics.
6. **Feedback Score ($F_{\text{rating}}$)**: Student and institutional rating scaled to 100 ($\frac{\text{Rating}}{5.0} \times 100$).

---

## 8. Interactive 3D Competency Universe Architecture

The visual centerpiece of Phase 5 is the **3D Competency Universe**, constructed using **Three.js**, **React Three Fiber (R3F)**, and **Drei**:

```
                              [Starfield Universe Canvas]
                                          │
                                 ┌────────┴────────┐
                                 ▼                 ▼
                         [Orbit Controls]   [Lighting Array]
                                 │
                         ┌───────┴────────────────────────┐
                         │      Central Trainee Core      │
                         │     (Luminescent Sky-Blue)     │
                         └───────┬──────────────┬─────────┘
                                 │              │
                       Dynamic Ray │      Dynamic │ Ray
                                 ▼              ▼
                 [Competency Orb A]            [Competency Orb B]
                 (Orbital Radius: 4.8)         (Orbital Radius: 4.8)
                 Color: Violet (L4.2)          Color: Emerald (L2.8)
                         │                              │
                 ┌───────┴───────┐              ┌───────┴───────┐
                 ▼               ▼              ▼               ▼
           [Exam Node]     [Skill Node]   [Course Node]   [Exp Node]
```

### Visual Semantics:
- **Trainee Node**: Central origin sphere with subtle atmospheric pulse.
- **Orbital Distance**: Fixed at 4.8 units for harmonic visual balance.
- **Node Geometry & Color**:
  - `Level >= 3.5`: Deep Violet / Indigo (Advanced/Expert)
  - `Level >= 2.5`: Emerald (Intermediate)
  - `Level >= 1.5`: Cyan (Foundation)
  - `Level < 1.5`: Slate / Rose (Deficiency / Awareness)
- **Satellite Nodes**: Orbiting child spheres representing real evidence streams (Exams, Syllabi, Field Skills).
- **Orbit Controls**: Full 360° mouse drag rotation, pinch/scroll zoom, and right-click panning with auto-damping.
- **Performance & Code-Splitting**:
  - Lazily imported via `React.lazy()` to prevent Three.js from impacting initial portal bundle.
  - Zero heavy 3D mesh files or high-res texture downloads; uses lightweight standard geometries and procedural materials.
  - Full accessible 2D analytical matrix toggle provided for screen readers, mobile devices, and environments without WebGL.
