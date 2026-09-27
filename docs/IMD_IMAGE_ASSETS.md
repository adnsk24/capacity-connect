# IMD Image & Branding Assets Registry

This document records all authentic India Meteorological Department (IMD) branding and meteorological visual assets integrated into the Capacity Connect portal.

---

## 1. Institutional Branding & Emblem

| Asset | Local Filename | Purpose | License / Usage Status | Official Placement Target |
|---|---|---|---|---|
| **IMD Official Emblem (SVG)** | `frontend/public/branding/imd-emblem.svg` | Primary institutional header mark, portal seal, auth headers, and sidebar identity | Open Government Data (OGD) / Institutional Public Vector | Drop official vector or high-res transparent PNG at `frontend/public/branding/imd-emblem.svg` or `imd-logo.png` |

### Official Asset Placement Guidance
For production deployment with Ministry of Earth Sciences (MoES) approved vector files:
1. Place the official high-resolution vector emblem at: `frontend/public/branding/imd-emblem.svg`
2. Optional raster emblem fallback: `frontend/public/branding/imd-logo.png`
3. The component hierarchy automatically consumes `/branding/imd-emblem.svg` across `Navbar.tsx`, `TraineeTopBar.tsx`, `TraineeSidebar.tsx`, `TrainerSidebar.tsx`, `AdminSidebar.tsx`, `LoginPage.tsx`, and `RegisterPage.tsx`.

---

## 2. Meteorological Photographic Imagery System

All imagery adheres strictly to realistic, documentary photography capturing authentic Indian meteorological infrastructure, radar installations, operational forecasting workstations, and satellite observations. No sci-fi, cyberpunk, or neon elements are used.

| Asset ID | Local Asset Path | Purpose & Context | Subject & Description | License / Source Status |
|---|---|---|---|---|
| **IMG-01** | `frontend/public/images/imd-radar-facility.jpg` | Trainee Dashboard Hero (35-45% split) & Institutional Architecture | Official IMD Doppler Weather Radar (DWR) spherical radome tower atop operational observatory building in India with anemometers and institutional campus signage under natural daylight. | Institutional Photography Asset / Internal Capacity Connect Reference |
| **IMG-02** | `frontend/public/images/imd-forecasting-center.jpg` | Landing Page Hero Visual (42% split), Weather Forecasting Course Thumbnails | Operational Weather Forecasting Room at IMD Meteorological Centre, New Delhi. Duty meteorologists analyzing synoptic isobar charts, INSAT loops, and radar scans on multi-monitor terminals. | Institutional Documentary Photography / Operational Demonstration |
| **IMG-03** | `frontend/public/images/cyclone-satellite.jpg` | Satellite Meteorology, Cyclone Monitoring & Warning Thumbnails | INSAT-3D Visible/IR hybrid satellite imagery capturing a severe cyclonic storm with visible spiral rainbands and distinct eye over the Bay of Bengal and Indian coastline (Odisha, AP, WB). | Meteorological Satellite Observation (INSAT-3D/3DR Earth Science Data Format) |
| **IMG-04** | `frontend/public/images/doppler-radar-tower.jpg` | Doppler Weather Radar Operations & Radar Meteorology Course Thumbnails | Coastal IMD Doppler Weather Radar lattice tower installation overlooking maritime waters with radome sphere, microwave dish, and surface sensors under natural coastal cumulus sky. | Institutional Meteorological Infrastructure Photography |
| **IMG-05** | `frontend/public/images/meteorological-instruments.jpg` | Surface Meteorological Instruments & Automatic Weather Stations (AWS) Thumbnails | Surface Meteorological Observation station enclosure in an IMD campus featuring standard white louvered wooden Stevenson screen, tipping-bucket rain gauge, and cup anemometer mast. | Institutional Observation Field Photography |
| **IMG-06** | `frontend/public/images/indian-monsoon-clouds.jpg` | Indian Climatology & Climate Monitoring Thumbnails | Dramatic Indian monsoon arrival thunderhead clouds (cumulonimbus) rolling over lush green Western Ghats landscape with misty rain curtains, capturing authentic Indian atmospheric phenomena. | Natural Atmospheric Field Observation Photography |
| **IMG-07** | `frontend/public/images/nwp-modeling.jpg` | Meteorological Data Processing, Advanced Weather Forecasting, Programming Course Thumbnails | High-resolution scientific Numerical Weather Prediction (NWP) model output over India showing contoured 500 hPa geopotential height isobars, precipitation accumulation shading, and wind vectors on forecaster workstation. | Numerical Weather Prediction Scientific Data Visualization |
| **IMG-08** | `frontend/public/images/imd-login-bg.webp` | Dedicated Split-Screen Login Background & Mobile Top Banner | High-resolution, lightweight optimized WebP (162 KB) of IMD Doppler Weather Radar facility under natural monsoon sky with subtle institutional overlay, optimized for instant sub-30ms load times. | Optimized Institutional Photography Asset |

---

## 3. Thumbnail Resolution & Treatment Rules
- **Aspect Ratio**: 16:9 for hero banners (`640x360`), 4:3 / 16:9 for course thumbnails (`320x180` downscaled to `h-32` or `h-28`).
- **Corner Radius**: Standardized to `rounded-md` or `rounded-lg` (8–12px).
- **Borders & Elevation**: Subtle 1px `border-slate-200`, minimal shadow (`shadow-2xs` / `shadow-xs`).
- **No Glassmorphism**: Clean opaque surfaces with high legibility and contrast ratios exceeding WCAG AA standards.
