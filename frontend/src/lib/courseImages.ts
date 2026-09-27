/**
 * Course Thumbnail Mapping Utility
 * Maps courses to authentic, realistic IMD meteorological imagery based on curriculum domain.
 */

export function getCourseThumbnail(title?: string, category?: string): string {
  const t = (title || "").toLowerCase()
  const c = (category || "").toLowerCase()

  // 1. Radar Meteorology & Doppler Weather Radar Operations
  if (t.includes("radar") || t.includes("dwr") || t.includes("doppler") || c.includes("radar")) {
    return "/images/doppler-radar-tower.jpg"
  }

  // 2. Satellite Meteorology & Cyclone Warning
  if (
    t.includes("satellite") ||
    t.includes("cyclone") ||
    t.includes("insat") ||
    c.includes("satellite") ||
    c.includes("cyclone")
  ) {
    return "/images/cyclone-satellite.jpg"
  }

  // 3. Instruments, AWS, Surface Observation
  if (
    t.includes("instrument") ||
    t.includes("automatic weather") ||
    t.includes("aws") ||
    t.includes("surface") ||
    t.includes("observation") ||
    t.includes("introduction") ||
    c.includes("instrument") ||
    c.includes("observation")
  ) {
    return "/images/meteorological-instruments.jpg"
  }

  // 4. Climatology, Monsoon, Climate Services
  if (
    t.includes("climate") ||
    t.includes("climatology") ||
    t.includes("monsoon") ||
    t.includes("drought") ||
    c.includes("climat")
  ) {
    return "/images/indian-monsoon-clouds.jpg"
  }

  // 5. NWP, Data Processing, Numerical Modeling, Programming
  if (
    t.includes("nwp") ||
    t.includes("model") ||
    t.includes("processing") ||
    t.includes("programming") ||
    t.includes("python") ||
    t.includes("advanced") ||
    c.includes("comput") ||
    c.includes("data")
  ) {
    return "/images/nwp-modeling.jpg"
  }

  // 6. Forecasting, Synoptic, General Operations
  return "/images/imd-forecasting-center.jpg"
}

export function getCourseThumbnailAlt(title?: string): string {
  return `IMD Training: ${title || "Meteorological Curriculum"}`
}
