/**
 * Course Thumbnail Mapping Utility
 * Maps courses to authentic, realistic IMD meteorological imagery based on curriculum domain.
 * Every course receives a deterministic, visually distinct meteorological image.
 */

const COURSE_TITLE_MAP: Record<string, string> = {
  // 1. Introduction to Meteorology
  "introduction to meteorology": "/assets/courses/introduction-meteorology.jpg",
  // 2. Indian Climatology
  "indian climatology": "/assets/courses/indian-climatology.jpg",
  // 3. Weather Forecasting Fundamentals
  "weather forecasting fundamentals": "/assets/courses/weather-forecasting-fundamentals.jpg",
  // 4. Advanced Weather Forecasting
  "advanced weather forecasting": "/assets/courses/advanced-weather-forecasting.jpg",
  // 5. Satellite Data Interpretation
  "satellite data interpretation": "/assets/courses/satellite-data-interpretation.jpg",
  // 6. Doppler Weather Radar Operations
  "doppler weather radar operations": "/assets/courses/doppler-weather-radar.jpg",
  // 7. Cyclone Monitoring & Warning
  "cyclone monitoring & warning": "/assets/courses/cyclone-monitoring-warning.jpg",
  "cyclone monitoring and warning": "/assets/courses/cyclone-monitoring-warning.jpg",
  // 8. Surface Meteorological Instruments
  "surface meteorological instruments": "/assets/courses/surface-meteorological-instruments.jpg",
  // 9. Automatic Weather Stations (AWS)
  "automatic weather stations": "/assets/courses/automatic-weather-stations.jpg",
  "automatic weather stations (aws)": "/assets/courses/automatic-weather-stations.jpg",
  // 10. Climate Monitoring & Services
  "climate monitoring & services": "/assets/courses/climate-monitoring-services.jpg",
  "climate monitoring and services": "/assets/courses/climate-monitoring-services.jpg",
  // 11. Meteorological Data Processing
  "meteorological data processing": "/assets/courses/meteorological-data-processing.jpg",
  // 12. Programming for Meteorologists
  "programming for meteorologists": "/assets/courses/programming-for-meteorologists.jpg",
}

export function getCourseThumbnail(title?: string, category?: string, thumbnail_url?: string): string {
  if (thumbnail_url && thumbnail_url.trim()) {
    return thumbnail_url
  }

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
    return "/assets/courses/automatic-weather-stations.jpg"
  }
  if (t.includes("synoptic") || t.includes("chart")) {
    return "/assets/courses/weather-forecasting-fundamentals.jpg"
  }
  if (t.includes("instrument") || t.includes("surface") || t.includes("barometer") || t.includes("gauge")) {
    return "/assets/courses/surface-meteorological-instruments.jpg"
  }
  if (t.includes("radar") || t.includes("dwr") || t.includes("doppler") || c.includes("radar")) {
    return "/assets/courses/doppler-weather-radar.jpg"
  }
  if (t.includes("cyclone") || t.includes("storm") || t.includes("warning")) {
    return "/assets/courses/cyclone-monitoring-warning.jpg"
  }
  if (t.includes("satellite") || t.includes("insat") || c.includes("satellite")) {
    return "/assets/courses/satellite-data-interpretation.jpg"
  }
  if (t.includes("python") || t.includes("programming") || t.includes("code") || t.includes("software")) {
    return "/assets/courses/programming-for-meteorologists.jpg"
  }
  if (t.includes("climate monitoring") || t.includes("climate services") || c.includes("climate")) {
    return "/assets/courses/climate-monitoring-services.jpg"
  }
  if (t.includes("climatology") || t.includes("monsoon")) {
    return "/assets/courses/indian-climatology.jpg"
  }
  if (t.includes("data") || t.includes("processing") || t.includes("quality control") || c.includes("comp")) {
    return "/assets/courses/meteorological-data-processing.jpg"
  }
  if (t.includes("nwp") || t.includes("numerical") || t.includes("advanced") || t.includes("model")) {
    return "/assets/courses/advanced-weather-forecasting.jpg"
  }
  if (t.includes("intro") || t.includes("atmosphere") || t.includes("cloud") || c.includes("gen")) {
    return "/assets/courses/introduction-meteorology.jpg"
  }

  // 3. Deterministic hash fallback to distribute any unknown course across the 12 images
  const ALL_IMAGES = [
    "/assets/courses/introduction-meteorology.jpg",
    "/assets/courses/indian-climatology.jpg",
    "/assets/courses/weather-forecasting-fundamentals.jpg",
    "/assets/courses/advanced-weather-forecasting.jpg",
    "/assets/courses/satellite-data-interpretation.jpg",
    "/assets/courses/doppler-weather-radar.jpg",
    "/assets/courses/cyclone-monitoring-warning.jpg",
    "/assets/courses/surface-meteorological-instruments.jpg",
    "/assets/courses/automatic-weather-stations.jpg",
    "/assets/courses/climate-monitoring-services.jpg",
    "/assets/courses/meteorological-data-processing.jpg",
    "/assets/courses/programming-for-meteorologists.jpg",
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

