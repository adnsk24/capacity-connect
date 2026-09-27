/**
 * Course Thumbnail Mapping Utility
 * Maps courses to authentic, realistic IMD meteorological imagery based on curriculum domain.
 * Every course receives a deterministic, visually distinct meteorological image.
 */

const COURSE_TITLE_MAP: Record<string, string> = {
  // 1. Introduction to Meteorology
  "introduction to meteorology": "/images/atmospheric-clouds.jpg",
  // 2. Indian Climatology
  "indian climatology": "/images/indian-monsoon-clouds.jpg",
  // 3. Weather Forecasting Fundamentals
  "weather forecasting fundamentals": "/images/synoptic-weather-chart.jpg",
  // 4. Advanced Weather Forecasting
  "advanced weather forecasting": "/images/nwp-modeling.jpg",
  // 5. Satellite Data Interpretation
  "satellite data interpretation": "/images/cyclone-satellite.jpg",
  // 6. Doppler Weather Radar Operations
  "doppler weather radar operations": "/images/doppler-radar-tower.jpg",
  // 7. Cyclone Monitoring & Warning
  "cyclone monitoring & warning": "/images/imd-radar-facility.jpg",
  "cyclone monitoring and warning": "/images/imd-radar-facility.jpg",
  // 8. Surface Meteorological Instruments
  "surface meteorological instruments": "/images/meteorological-instruments.jpg",
  // 9. Automatic Weather Stations
  "automatic weather stations": "/images/automatic-weather-station.jpg",
  // 10. Climate Monitoring & Services
  "climate monitoring & services": "/images/climate-services.jpg",
  "climate monitoring and services": "/images/climate-services.jpg",
  // 11. Meteorological Data Processing
  "meteorological data processing": "/images/imd-forecasting-center.jpg",
  // 12. Programming for Meteorologists
  "programming for meteorologists": "/images/python-meteorology.jpg",
}

export function getCourseThumbnail(title?: string, category?: string): string {
  const t = (title || "").toLowerCase().trim()
  const c = (category || "").toLowerCase().trim()

  // 1. Exact or direct title match
  for (const [key, path] of Object.entries(COURSE_TITLE_MAP)) {
    if (t.includes(key)) {
      return path
    }
  }

  // 2. Domain & keyword heuristics for custom or newly authored courses
  if (t.includes("automatic weather") || t.includes("aws")) {
    return "/images/automatic-weather-station.jpg"
  }
  if (t.includes("synoptic") || t.includes("chart")) {
    return "/images/synoptic-weather-chart.jpg"
  }
  if (t.includes("instrument") || t.includes("surface") || t.includes("barometer") || t.includes("gauge")) {
    return "/images/meteorological-instruments.jpg"
  }
  if (t.includes("radar") || t.includes("dwr") || t.includes("doppler") || c.includes("radar")) {
    return "/images/doppler-radar-tower.jpg"
  }
  if (t.includes("cyclone") || t.includes("storm") || t.includes("tropical")) {
    return "/images/imd-radar-facility.jpg"
  }
  if (t.includes("satellite") || t.includes("insat") || c.includes("satellite")) {
    return "/images/cyclone-satellite.jpg"
  }
  if (t.includes("python") || t.includes("programming") || t.includes("code") || t.includes("software")) {
    return "/images/python-meteorology.jpg"
  }
  if (t.includes("climate monitoring") || t.includes("climate services")) {
    return "/images/climate-services.jpg"
  }
  if (t.includes("climate") || t.includes("climatology") || t.includes("monsoon") || c.includes("climat")) {
    return "/images/indian-monsoon-clouds.jpg"
  }
  if (t.includes("data") || t.includes("processing") || t.includes("quality control") || c.includes("comp")) {
    return "/images/imd-forecasting-center.jpg"
  }
  if (t.includes("nwp") || t.includes("numerical") || t.includes("model") || t.includes("advanced")) {
    return "/images/nwp-modeling.jpg"
  }
  if (t.includes("intro") || t.includes("atmosphere") || t.includes("cloud") || c.includes("gen-met")) {
    return "/images/atmospheric-clouds.jpg"
  }

  // 3. Deterministic hash fallback to distribute any unknown course across the 12 images
  const ALL_IMAGES = [
    "/images/atmospheric-clouds.jpg",
    "/images/indian-monsoon-clouds.jpg",
    "/images/synoptic-weather-chart.jpg",
    "/images/nwp-modeling.jpg",
    "/images/cyclone-satellite.jpg",
    "/images/doppler-radar-tower.jpg",
    "/images/imd-radar-facility.jpg",
    "/images/meteorological-instruments.jpg",
    "/images/automatic-weather-station.jpg",
    "/images/climate-services.jpg",
    "/images/imd-forecasting-center.jpg",
    "/images/python-meteorology.jpg",
  ]

  let hash = 0
  for (let i = 0; i < t.length; i++) {
    hash = (hash << 5) - hash + t.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % ALL_IMAGES.length
  return ALL_IMAGES[index]
}

export function getCourseThumbnailAlt(title?: string): string {
  return `IMD Training: ${title || "Meteorological Curriculum"}`
}

