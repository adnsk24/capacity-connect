# IMD GOVERNMENT PORTAL HOMEPAGE REDESIGN REPORT

**Capacity Connect — Digital Capacity Building & Learning Management Portal**  
*India Meteorological Department (IMD) • Ministry of Earth Sciences, Government of India*  
**Date:** September 28, 2026  
**Status:** Complete, Verified & Tested  

---

## 1. Executive Summary

Based on the provided Government of India / Digital India and OpenForge reference screenshots, the public homepage (`HomePage.tsx`), main navigation header (`Navbar.tsx`), institutional footer (`Footer.tsx`), and layout shell (`AppShell.tsx`) have undergone a complete visual and information architecture redesign.

The result is an authentic, institutional, professional Indian government portal experience specifically tailored to the **India Meteorological Department (IMD)** without copying third-party brand marks or text.

---

## 2. Implemented

### 1. Top Government of India Bar (`Navbar.tsx`)
- **Visuals**: Deep navy institutional bar (`#082B73`, height 40px).
- **Left**: Indian Flag (`🇮🇳`), `भारत सरकार | Government of India`.
- **Right**:
  - `Skip to content` accessibility shortcut.
  - Interactive font scaling controls (`A+`, `A`, `A-`).
  - Language selector (`🌐 English ▼`).

### 2. Main Navigation Header (`Navbar.tsx`)
- **Height**: 90–100px on crisp white background (`#FFFFFF`, subtle border `#E2E8F0`).
- **Left**: Official tall `IMD_logo.png` (`72px` height, preserved aspect ratio, un-distorted), `CAPACITY CONNECT` in bold navy (`#082B73`), `India Meteorological Department` in IMD blue (`#0B3D91`), and `Digital Capacity Building & Learning Management Portal`.
- **Center**: Government navigation links: *Home*, *About Us*, *Learning*, *Courses*, *Competency*, *Resources*.
- **Right**:
  - Rounded pill search box (`Search courses... 🔍`, light border, 220px width).
  - Clean `[ Sign In ]` and solid IMD blue `[ Register ]` buttons (or active user role pill when authenticated).

### 3. Large Hero / Banner Section (`HomePage.tsx`)
- **Layout**: 450–550px height with pale cyan / meteorological gradient background (`#EAF4FF` to `#FFFFFF`) and subtle weather map contour curves.
- **Left**:
  - Official badge: `Capacity Connect • IMD Digital Capacity Building Portal`.
  - Prominent title: **CAPACITY CONNECT** (48px bold `#082B73`).
  - Subtitle: *Digital Capacity Building & Learning Management Portal*.
  - Department: *India Meteorological Department • Government of India*.
  - Institutional quote: *"Building meteorological expertise through structured learning, assessment and competency development."*
  - Action buttons: Amber/orange `[ Explore Courses ]` (`#C05600`, matching reference "Visit Us" style) and outlined `[ Sign In ]`.
- **Right**:
  - Large photographic operational frame of the IMD National Weather Forecasting Operations Center (`imd-forecasting-center.jpg`) with operational 24×7 synoptic surveillance caption.

### 4. About Capacity Connect Section (`HomePage.tsx`)
- **Layout**: Two-column institutional section inspired by the OpenForge reference screenshot.
- **Left**:
  - Heading: *About Capacity Connect*.
  - Comprehensive explanation of structured professional development, competency assessment, and knowledge sharing across meteorological cadres.
  - 7-point capability checklist with checkmarks (*Structured learning, assessments, profiles, competency mapping, skill gap identification, trainer matching, enterprise analytics*).
  - Amber/orange `[ Explore Platform -> ]` CTA button (`#C05600`).
- **Right**:
  - Framed Doppler Weather Radar observational infrastructure display (`imd-radar-facility.jpg`).

### 5. Explore Capacity Connect Initiative Carousel (`HomePage.tsx`)
- **Interactive Carousel**: Horizontal scrollable container with left (`<`) and right (`>`) circular navigation buttons.
- **Cards**: 8 distinct, deterministic domain cards with authentic meteorological images:
  1. `GEN-MET`: General Meteorology (`atmospheric-clouds.jpg`)
  2. `OWF`: Weather Forecasting (`synoptic-weather-chart.jpg`)
  3. `SAT-MET`: Satellite Meteorology (`cyclone-satellite.jpg`)
  4. `RAD-MET`: Radar Meteorology (`doppler-radar-tower.jpg`)
  5. `CYC-WARN`: Cyclone Warning Systems (`nwp-modeling.jpg`)
  6. `INST-OBS`: Instruments & Observations (`automatic-weather-station.jpg`)
  7. `CLIM`: Climate Services (`climate-services.jpg`)
  8. `MET-COMP`: Meteorological Computing (`python-meteorology.jpg`)

### 6. Learning & Training Section ("Learn. Assess. Grow.")
- 4 core educational pillars:
  - **Courses**: Structured operational syllabi.
  - **Learning Resources**: Manuals & operational guides.
  - **Assessments**: Timed evaluations & deterministic scoring.
  - **Certificates**: Verified cadre credentials.

### 7. Competency Intelligence & Lifecycle Section
- **Process Diagram**: Closed-loop 8-step pipeline:  
  *01 Profile ➔ 02 Learning ➔ 03 Assessment ➔ 04 Evidence ➔ 05 Competency ➔ 06 Skill Gap ➔ 07 Recommendation ➔ 08 Readiness*.
- **Callout**: Highlights the *Explainable Competency Engine* and *3D Competency Universe*.
- **6-Level Framework**: Detailed criteria from Level 1 (*Foundational Observer*) to Level 6 (*National Cadre Expert*).

### 8. Trainer Matching Section ("Find the Right Expertise")
- 4-step government infographic workflow:  
  *STEP 1: Subject Requirement ➔ STEP 2: Competency Evidence ➔ STEP 3: Trainer Profiles ➔ STEP 4: Suitable Trainers*.

### 9. Three User Roles Section ("One Platform. Three Roles.")
- Dedicated cadre cards for **TRAINEE**, **TRAINER**, and **ADMIN** with key capability points and direct workspace entry buttons.

### 10. Meteorological Image Band
- Real photographic banner (`indian-monsoon-clouds.jpg`) with dark blue overlay and headline *"Building a stronger, weather-ready workforce."*

### 11. Call to Action Section
- Clean card with *"Start Your Learning Journey"* and direct action buttons.

### 12. Large Blue Institutional Footer (`Footer.tsx`)
- **Styling**: Royal institutional blue (`#214FA8`, top border `#082B73`) with subtle SVG concentric contour rings watermark.
- **Column 1**: Official `IMD_logo.png`, portal description, `Connect on Portal & Social Media` pill, `Last Updated: September 28, 2026`, and black-box **Visitor Counter** (`Visitor: 4 7 6 5 5 3 3`).
- **Column 2 (Capacity Connect)**: Links to About, Courses, Learning, Competency, Lifecycle, Resources.
- **Column 3 (Useful Links)**: Help & Diagnostics, FAQ, Accessibility Statement, Email Verification, Privacy Policy, Terms.
- **Column 4 (Connect with Us)**: Headquarters address (Mausam Bhavan, Lodhi Road, New Delhi), helpline numbers, support email, and national portal badge (`india.gov.in`).
- **Bottom Legal Bar**: Dark navy strip (`#163B82`) with copyright, Terms & Conditions, Feedback, and Accessibility links.

### 13. Floating Accessibility Widget (`AccessibilityWidget.tsx`)
- Floating purple circular control in bottom-right corner with `Ctrl+F2` label matching reference screenshot.
- Interactive popover panel supporting font scaling (`A-`, `A`, `A+`), high-contrast mode toggle, and reset defaults.

---

## 3. Images and Assets Used

| Asset | Location | Deterministic Section Mapping |
|:---|:---|:---|
| **Official IMD Emblem** | `/branding/IMD_logo.png` | Top Bar, Main Header, Footer, Hero Badge |
| **Forecasting Center** | `/images/imd-forecasting-center.jpg` | Hero Banner graphic composition |
| **Doppler Radar Facility** | `/images/imd-radar-facility.jpg` | About Capacity Connect observational display |
| **Atmospheric Clouds** | `/images/atmospheric-clouds.jpg` | `GEN-MET` General Meteorology |
| **Synoptic Weather Chart** | `/images/synoptic-weather-chart.jpg` | `OWF` Weather Forecasting |
| **Cyclone Satellite Imagery** | `/images/cyclone-satellite.jpg` | `SAT-MET` Satellite Meteorology |
| **Doppler Radar Tower** | `/images/doppler-radar-tower.jpg` | `RAD-MET` Radar Meteorology |
| **NWP Modeling & Synoptic Plots** | `/images/nwp-modeling.jpg` | `CYC-WARN` Cyclone Warning Systems |
| **Automatic Weather Station** | `/images/automatic-weather-station.jpg` | `INST-OBS` Instruments & Observations |
| **High Altitude Climate Station**| `/images/climate-services.jpg` | `CLIM` Climate Services |
| **Python NWP Code Screen** | `/images/python-meteorology.jpg` | `MET-COMP` Meteorological Computing |
| **Indian Monsoon Skies** | `/images/indian-monsoon-clouds.jpg` | Meteorological Image Band |

---

## 4. Tested & Verification Results

### Build Verification
- **Command:** `npm run build`
- **Result:**  
  `tsc -b && vite build` completed with **0 errors**. Production bundle compiled cleanly in under 1 second.

### Frontend Test Suite
- **Command:** `npx vitest run`
- **Result:**  
  - `src/tests/auth.test.tsx` (8 passed)
  - `src/tests/phase6_integration.test.tsx` (3 passed)
  - `src/tests/trainee_experience.test.tsx` (8 passed)
  - `src/tests/phase4_portals.test.tsx` (10 passed)
  - `src/tests/phase5_competency.test.tsx` (6 passed)
  - **Total: 5 test files, 35 of 35 passed (100% passing)**

### Backend Test Suite
- **Command:** `pytest -q`
- **Result:**  
  **93 of 93 passed** (100% passing) with zero regressions across auth, models, courses, assessments, and competency services.

### Browser Visual QA (Automated Browser Agent)
- **Desktop (1920×1080 & 1366×768)**:
  - Header search, top bar accessibility font buttons, and navigation links confirmed.
  - Interactive carousel smoothly scrolled forward upon clicking the right `>` button.
  - Floating purple accessibility button clicked and verified opening the Accessibility Options popover.
- **Mobile (390×844)**:
  - Header collapsed into a responsive mobile drawer.
  - Carousel smoothly swipeable.
  - All sections stacked cleanly with zero horizontal overflow.

---

## 5. Known Limitations

- **Search Autocomplete**: The header search form redirects to `/courses?search=<query>`. Full live search dropdown suggestions can be enhanced in future phases if dynamic course autocompletion is desired.
- **Social Media Links**: The footer "Connect on Portal & Social Media" button anchors to internal portal communication channels since external social media accounts are not provisioned in this local environment.
