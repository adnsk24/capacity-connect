import React, { useRef } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BookOpen,
  LogIn,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/Container"
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel"

export const HomePage: React.FC = () => {
  // Deterministic initiative category cards (220px x 110px matching OpenForge reference screenshots)
  const carouselItems = [
    {
      code: "GEN-MET",
      title: "General Meteorology",
      image: "/assets/courses/introduction-meteorology.jpg",
    },
    {
      code: "OWF",
      title: "Weather Forecasting",
      image: "/assets/courses/weather-forecasting-fundamentals.jpg",
    },
    {
      code: "SAT-MET",
      title: "Satellite Meteorology",
      image: "/assets/courses/satellite-data-interpretation.jpg",
    },
    {
      code: "RAD-MET",
      title: "Radar Meteorology",
      image: "/assets/courses/doppler-weather-radar.jpg",
    },
    {
      code: "CYC-WARN",
      title: "Cyclone Warning",
      image: "/assets/courses/cyclone-monitoring-warning.jpg",
    },
    {
      code: "INST-OBS",
      title: "Instruments & Observations",
      image: "/assets/courses/surface-meteorological-instruments.jpg",
    },
    {
      code: "CLIM",
      title: "Climate Services",
      image: "/assets/courses/climate-monitoring-services.jpg",
    },
    {
      code: "MET-COMP",
      title: "Computer & Data Processing",
      image: "/assets/courses/meteorological-data-processing.jpg",
    },
  ]

  // Carousel scroll handler
  const carouselRef = useRef<HTMLDivElement>(null)
  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollDistance = 500
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollDistance : scrollDistance,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="w-full bg-white text-[#172033] overflow-x-hidden font-sans">
      {/* ======================================================== */}
      {/* 4, 5, 6. HERO — SIMPLE GOVERNMENT WEBSITE STYLE          */}
      {/* Height: ~340–380px, Background: #E8FAFA                  */}
      {/* Exact visual layout matching OpenForge hero screenshot    */}
      {/* ======================================================== */}
      <section className="w-full bg-[#E8FAFA] border-b border-slate-200 py-8 sm:py-10 md:py-12 relative overflow-hidden">
        {/* Subtle decorative concentric contour lines matching OpenForge screenshot */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-25 overflow-hidden hidden lg:block"
          aria-hidden="true"
        >
          <svg
            className="absolute -top-24 right-12 w-[600px] h-[600px] text-[#0A6E55]"
            viewBox="0 0 600 600"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="300" cy="300" r="100" />
            <circle cx="300" cy="300" r="180" />
            <circle cx="300" cy="300" r="260" />
            <circle cx="300" cy="300" r="340" />
            <circle cx="300" cy="300" r="420" />
          </svg>
        </div>

        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center min-h-[300px] sm:min-h-[330px]">
            {/* LEFT SIDE: Capacity Connect Outline Badge + Copy + Buttons */}
            <div className="lg:col-span-6 space-y-4">
              {/* Graphic Outline Badge similar to OpenForge handshake pill */}
              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full border-2 border-[#1E8270] bg-white/80 backdrop-blur-2xs shadow-xs max-w-full">
                <img
                  src="/branding/IMD_logo.png"
                  alt="IMD Emblem"
                  className="h-9 sm:h-10 w-auto object-contain shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-[17px] sm:text-[20px] font-extrabold text-[#062B73] tracking-tight leading-none">
                    CAPACITY CONNECT
                  </div>
                  <div className="text-[10.5px] sm:text-[11.5px] font-bold text-[#0B3D91] leading-tight truncate">
                    India Meteorological Department
                  </div>
                </div>
              </div>

              {/* Sub-title */}
              <div>
                <div className="text-sm sm:text-base font-bold text-[#062B73] tracking-tight">
                  Digital Capacity Building &amp; Learning Management Portal
                </div>
                <p className="text-[13px] sm:text-[14px] text-slate-700 mt-1 font-normal leading-relaxed">
                  Professional learning and competency development for meteorological personnel.
                </p>
              </div>

              {/* Buttons: [ Explore Courses ] [ Sign In ] */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/courses">
                  <Button
                    size="lg"
                    className="bg-[#1557A6] hover:bg-[#0B3D91] text-white font-bold px-6 sm:px-7 h-11 rounded-[22px] shadow-sm transition-all flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <BookOpen className="h-4 w-4" />
                    Explore Courses
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-300 bg-white hover:bg-slate-50 text-[#062B73] hover:text-[#0B3D91] font-bold px-6 sm:px-7 h-11 rounded-[22px] shadow-2xs transition-all flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            {/* RIGHT SIDE: Realistic IMD Meteorological Image framed with circular backdrop */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[500px]">
                {/* Circular dark-green / teal backdrop graphic matching OpenForge reference */}
                <div className="absolute -top-4 -right-4 w-48 h-48 sm:w-56 sm:h-56 bg-[#0E6655] rounded-full opacity-90 hidden sm:block pointer-events-none" />
                <div className="absolute top-1/2 -left-6 w-32 h-32 bg-[#1E8270] rounded-full opacity-60 hidden sm:block pointer-events-none" />
                {/* Responsive Featured Operations Carousel */}
                <FeaturedCarousel autoPlayIntervalMs={1500} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* 7, 8. ABOUT SECTION — SIMPLE TEXT + IMAGE STRUCTURE      */}
      {/* Follows exact OpenForge screenshot structure              */}
      {/* LEFT: Heading, 3 factual paragraphs, orange/amber button */}
      {/* RIGHT: Real IMD Meteorological image                      */}
      {/* ======================================================== */}
      <section id="about" className="w-full bg-white border-b border-slate-200 py-14 sm:py-16 md:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* LEFT COLUMN: Clean Institutional Text */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold text-[#172033] tracking-tight">
                Capacity Connect
              </h2>

              <p className="text-[15px] sm:text-[16px] text-slate-700 leading-relaxed font-normal">
                Capacity Connect is a digital capacity-building and learning management platform for structured professional development across the India Meteorological Department.
              </p>

              <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed font-normal">
                The platform brings together courses, learning resources, assessments, competency mapping and skill-gap analysis in one place, establishing transparent benchmarks for operational excellence and cadre progression.
              </p>

              <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed font-normal">
                It supports trainees, trainers and administrators throughout the training lifecycle, equipping meteorological personnel with the specialized capabilities required for accurate weather forecasting, radar surveillance, and disaster risk reduction.
              </p>

              {/* Bottom-left Button: Amber / Orange Government Style matching OpenForge 'Visit Us' */}
              <div className="pt-3">
                <Link to="/courses">
                  <Button
                    size="lg"
                    className="bg-[#B85D19] hover:bg-[#9E4D12] text-white font-bold px-7 h-11 rounded-[22px] shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer text-sm"
                  >
                    Explore Courses
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: Real IMD Meteorological Photo */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[480px] h-[280px] sm:h-[320px] rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-md relative group">
                <img
                  src="/images/imd-radar-facility.jpg"
                  alt="Doppler Weather Radar Facility"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="text-sm sm:text-base font-bold">Doppler Weather Radar Facility</div>
                  <div className="text-[11px] text-slate-300">National Observational Infrastructure Network</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* 9, 10. HORIZONTAL CAROUSEL — INITIATIVE CAROUSEL STYLE   */}
      {/* Matches OpenForge initiative carousel screenshot          */}
      {/* Title: Meteorological Learning                           */}
      {/* Width ~220px, Height ~110px cards with < and > arrows    */}
      {/* ======================================================== */}
      <section id="learning" className="w-full bg-[#F7F9FC] border-b border-slate-200 py-12 sm:py-14">
        <Container>
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#062B73] tracking-tight">
              Meteorological Learning
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Standardized disciplines aligned with WMO BIP-M instructional packages.
            </p>
          </div>

          {/* Carousel Layout: Left Arrow + Scrollable Row + Right Arrow */}
          <div className="flex items-center gap-3">
            {/* Left Arrow Button (Round amber/brown button matching OpenForge screenshot) */}
            <button
              type="button"
              onClick={() => scroll("left")}
              className="w-9 h-9 rounded-full bg-[#B85D19] hover:bg-[#9E4D12] text-white flex items-center justify-center shadow-xs cursor-pointer shrink-0 transition-colors"
              aria-label="Previous learning categories"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Horizontal Scrollable Row of 220px x 110px Cards */}
            <div
              ref={carouselRef}
              className="flex-1 flex gap-4 overflow-x-auto py-2 scroll-smooth snap-x snap-mandatory scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {carouselItems.map((item) => (
                <Link
                  key={item.code}
                  to="/courses"
                  className="w-[220px] h-[110px] shrink-0 snap-start bg-white border border-slate-200 hover:border-[#1557A6] hover:shadow-md rounded-xl p-3 flex items-center gap-3.5 transition-all group"
                >
                  {/* Category Thumbnail Image */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Title & Code */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono font-bold text-[#1557A6] uppercase tracking-wider">
                      {item.code}
                    </div>
                    <div className="text-[13px] font-bold text-slate-900 group-hover:text-[#1557A6] transition-colors leading-snug line-clamp-2 mt-0.5">
                      {item.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right Arrow Button (Round amber/brown button matching OpenForge screenshot) */}
            <button
              type="button"
              onClick={() => scroll("right")}
              className="w-9 h-9 rounded-full bg-[#B85D19] hover:bg-[#9E4D12] text-white flex items-center justify-center shadow-xs cursor-pointer shrink-0 transition-colors"
              aria-label="Next learning categories"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* 12. OPTIONAL SMALL INFORMATION SECTION                   */}
      {/* "Capacity Building Through One Platform"                 */}
      {/* LEFT: Learning Resources, Assessments, Competency        */}
      {/* RIGHT: One realistic meteorological image                */}
      {/* ======================================================== */}
      <section id="competency" className="w-full bg-white border-b border-slate-200 py-14 sm:py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* LEFT: 3 Simple Content Pillars */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <span className="text-xs font-bold text-[#1557A6] uppercase tracking-wider">
                  Capacity Connect • IMD Digital Capacity Building Portal
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#062B73] tracking-tight mt-1">
                  Capacity Building Through One Platform
                </h2>
                <p className="text-[14px] text-slate-600 mt-1">
                  Integrating instructional curricula with verifiable competency evaluation.
                </p>
              </div>

              <div className="space-y-4">
                {/* 1. Learning Resources */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1557A6] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900">Learning Resources</h3>
                    <p className="text-[13px] text-slate-600 mt-0.5 leading-relaxed">
                      Standardized instructional modules, operational synoptic charts, and technical manuals mapped to IMD observational guidelines.
                    </p>
                  </div>
                </div>

                {/* 2. Assessments */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1557A6] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900">Assessments</h3>
                    <p className="text-[13px] text-slate-600 mt-0.5 leading-relaxed">
                      Deterministic examinations, radar interpretation exercises, and practical case evaluations with automated grading.
                    </p>
                  </div>
                </div>

                {/* 3. Competency Development */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1557A6] flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-slate-900">Competency Development</h3>
                    <p className="text-[13px] text-slate-600 mt-0.5 leading-relaxed">
                      Standardized competency assessment and progression frameworks for operational cadres:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-block text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                        The Capacity Building Lifecycle
                      </span>
                      <span className="inline-block text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                        Explainable Competency Engine
                      </span>
                      <span className="inline-block text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                        3D Competency Universe
                      </span>
                      <span className="inline-block text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                        Competency Intelligence
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: One Meteorological Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[480px] h-[280px] sm:h-[320px] rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-md relative">
                <img
                  src="/images/synoptic-weather-chart.jpg"
                  alt="Meteorological Analysis and Operational Guidance"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-transparent p-4 text-white">
                  <div className="text-sm font-bold">Synoptic Analysis &amp; Forecast Verification</div>
                  <div className="text-[11px] text-slate-300">Operational Weather Forecasting Cadre Syllabus</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* 13. SIMPLE CTA — VERY SIMPLE, NO GIANT MARKETING BANNER   */}
      {/* ======================================================== */}
      <section id="resources" className="w-full bg-[#F7F9FC] border-b border-slate-200 py-12 sm:py-14">
        <Container>
          <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#062B73]">
                Start Learning
              </h3>
              <p className="text-[14px] text-slate-600 mt-1 max-w-xl">
                Explore courses and build your professional competency across national meteorological disciplines.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link to="/courses">
                <Button
                  size="lg"
                  className="bg-[#1557A6] hover:bg-[#0B3D91] text-white font-bold px-6 h-11 rounded-[22px] shadow-sm transition-all cursor-pointer text-sm"
                >
                  Explore Courses
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-300 bg-white hover:bg-slate-50 text-[#062B73] hover:text-[#0B3D91] font-bold px-6 h-11 rounded-[22px] cursor-pointer text-sm"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
