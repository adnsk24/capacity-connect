import React, { useRef } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Radar,
  Satellite,
  Thermometer,
  CloudSun,
  Activity,
  Cpu,
  FileCheck,
  Award,
  Check,
  Compass,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/Container"

export const HomePage: React.FC = () => {
  // Deterministic initiative category cards (220px x 110px style matching reference screenshot)
  const carouselItems = [
    {
      code: "GEN-MET",
      title: "General Meteorology",
      image: "/images/atmospheric-clouds.jpg",
      icon: CloudSun,
    },
    {
      code: "OWF",
      title: "Weather Forecasting",
      image: "/images/synoptic-weather-chart.jpg",
      icon: Compass,
    },
    {
      code: "SAT-MET",
      title: "Satellite Meteorology",
      image: "/images/cyclone-satellite.jpg",
      icon: Satellite,
    },
    {
      code: "RAD-MET",
      title: "Radar Meteorology",
      image: "/images/doppler-radar-tower.jpg",
      icon: Radar,
    },
    {
      code: "CYC-WARN",
      title: "Cyclone Warning",
      image: "/images/nwp-modeling.jpg",
      icon: Activity,
    },
    {
      code: "INST-OBS",
      title: "Instruments",
      image: "/images/automatic-weather-station.jpg",
      icon: Thermometer,
    },
    {
      code: "CLIM",
      title: "Climate Services",
      image: "/images/climate-services.jpg",
      icon: CloudSun,
    },
    {
      code: "MET-COMP",
      title: "Data Processing",
      image: "/images/python-meteorology.jpg",
      icon: Cpu,
    },
  ]

  // Carousel scroll handler
  const carouselRef = useRef<HTMLDivElement>(null)
  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollDistance = 240
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollDistance : scrollDistance,
        behavior: "smooth",
      })
    }
  }

  // 6 Competency Levels for IMD
  const competencyLevels = [
    { level: "Level 1", title: "Foundational Observer", desc: "Surface meteorological sensors, barometer calibration, and standard observational logs." },
    { level: "Level 2", title: "Operational Assistant", desc: "Routine synoptic chart interpretation, automated weather station (AWS) QA telemetry." },
    { level: "Level 3", title: "Forecasting Practitioner", desc: "Doppler radar console operations, severe squall nowcasting, and aerodrome warnings." },
    { level: "Level 4", title: "Senior Meteorological Officer", desc: "NWP model diagnostic analysis, cyclone tracking, and state-level bulletins." },
    { level: "Level 5", title: "Domain Specialist", desc: "Advanced radar telemetry calibration, high-resolution NWP tuning, and syllabus authoring." },
    { level: "Level 6", title: "National Cadre Expert", desc: "National monsoon outlook reviews, strategic capacity policy, and master mentorship." },
  ]

  return (
    <div className="w-full bg-white text-[#172033] overflow-x-hidden">
      {/* ======================================================== */}
      {/* 9, 10, 11. HERO BANNER (Height: ~340–400px, Pale #E9FAFA) */}
      {/* ======================================================== */}
      <section className="w-full bg-[#E9FAFA] border-b border-slate-200 py-10 lg:py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] gap-8 lg:gap-10 items-center">
            {/* Left Column: Capacity Connect Identity */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-200 bg-white/90 text-[#062B73] text-[12px] font-bold shadow-2xs">
                <img
                  src="/branding/IMD_logo.png"
                  alt="IMD Emblem"
                  className="h-4.5 w-auto object-contain"
                />
                <span>Capacity Connect • IMD Digital Capacity Building Portal</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#062B73] tracking-tight leading-tight">
                  CAPACITY CONNECT
                </h1>
                <div className="text-base sm:text-lg font-bold text-[#0B3D91] mt-1">
                  Digital Capacity Building &amp; Learning Management Portal
                </div>
                <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 mt-1">
                  India Meteorological Department
                </div>
              </div>

              <blockquote className="border-l-3 border-[#0B3D91] pl-3.5 py-1 text-xs sm:text-sm text-slate-700 italic font-medium bg-white/80 rounded-r shadow-2xs">
                "Building meteorological expertise through structured learning, assessment and competency development."
              </blockquote>

              {/* Action Buttons (Height 45-50px, border-radius 20-24px, #1557A6) */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/courses">
                  <Button
                    size="lg"
                    className="bg-[#1557A6] hover:bg-[#0B3D91] text-white font-bold px-6 h-11 rounded-[22px] shadow-sm transition-all flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <BookOpen className="h-4 w-4" />
                    Explore Courses
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-300 bg-white hover:bg-slate-50 text-[#062B73] hover:text-[#0B3D91] font-bold px-6 h-11 rounded-[22px] shadow-2xs transition-all flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Large Meteorological Image extending toward right */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-2xl h-[280px] sm:h-[320px] rounded-xl overflow-hidden border border-slate-300 bg-white shadow-sm relative">
                <img
                  src="/images/imd-forecasting-center.jpg"
                  alt="IMD Weather Forecasting & Operations Center"
                  className="w-full h-full object-cover object-center"
                  loading="eager"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#062B73]/95 via-[#062B73]/60 to-transparent p-4 text-white">
                  <div className="text-sm font-bold tracking-wide">
                    National Weather Forecasting &amp; Surveillance Operations
                  </div>
                  <div className="text-[11px] text-blue-200 mt-0.5">
                    India Meteorological Department &bull; Operational 24×7 Network
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* 12, 13. ABOUT SECTION (Two Columns: 1.1fr 0.9fr, Gap 70px)*/}
      {/* ======================================================== */}
      <section id="about" className="w-full bg-white border-b border-slate-200 py-[70px]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-[70px] items-center">
            {/* Left: About Text & Highlights */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#062B73] tracking-tight">
                About Capacity Connect
              </h2>

              <p className="text-base text-slate-700 leading-relaxed font-normal">
                Capacity Connect is a digital capacity-building and learning management platform designed to support structured professional development, competency assessment and knowledge sharing.
              </p>

              <p className="text-[14px] text-slate-600 leading-relaxed">
                Engineered specifically for the India Meteorological Department, the platform centralizes operational syllabi, administers deterministic assessments, maintains verified professional profiles, maps demonstrated competency levels, diagnoses institutional skill gaps, and matches qualified trainers to emerging national operational requirements.
              </p>

              {/* Core Feature Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[
                  "Structured learning & syllabi",
                  "Assessments & examinations",
                  "Professional cadre profiles",
                  "Competency mapping",
                  "Skill-gap identification",
                  "Trainer matching",
                  "Institutional analytics",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Check className="h-4 w-4 text-[#1557A6] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Button: [ Explore Platform ] (border-radius: 20–24px, #1557A6) */}
              <div className="pt-4">
                <Link to="/courses">
                  <Button
                    size="lg"
                    className="bg-[#1557A6] hover:bg-[#0B3D91] text-white font-bold px-7 h-11 rounded-[22px] shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer text-sm"
                  >
                    Explore Platform
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Large IMD Image vertically centered with text */}
            <div className="flex justify-center">
              <div className="w-full max-w-lg h-[320px] sm:h-[360px] rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-md relative">
                <img
                  src="/images/imd-radar-facility.jpg"
                  alt="IMD Doppler Weather Radar Station"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="inline-block px-2.5 py-0.5 bg-[#1557A6] rounded text-[10px] font-bold uppercase tracking-wider mb-1 w-max">
                    Observational Cadre Infrastructure
                  </div>
                  <div className="text-base font-bold">Doppler Weather Radar Facility</div>
                  <div className="text-[12px] text-slate-300">National Atmospheric Surveillance Network</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* 14, 15. CAROUSEL — SAME STYLE AS REFERENCE SCREENSHOTS     */}
      {/* (Width ~220px, Height ~110px Cards with Arrows)           */}
      {/* ======================================================== */}
      <section className="w-full bg-[#F7F9FC] border-b border-slate-200 py-12">
        <Container>
          <div className="mb-6">
            <div className="text-xs font-bold text-[#0B3D91] uppercase tracking-wider mb-1">
              Explore Capacity Connect
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#062B73] tracking-tight">
              Meteorological Training Categories
            </h2>
          </div>

          {/* Carousel Layout: Arrow + Carousel Scroll + Arrow */}
          <div className="flex items-center gap-3">
            {/* Left Arrow Button */}
            <button
              type="button"
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full bg-white border border-slate-300 hover:border-[#1557A6] hover:text-[#1557A6] text-slate-700 flex items-center justify-center shadow-xs cursor-pointer shrink-0 transition-colors"
              aria-label="Previous categories"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Horizontal Scrollable Row of 220px x 110px Cards */}
            <div
              ref={carouselRef}
              className="flex-1 flex gap-4 overflow-x-auto py-2 scroll-smooth snap-x snap-mandatory scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {carouselItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.code}
                    to="/courses"
                    className="w-[220px] h-[110px] shrink-0 snap-start bg-white border border-slate-200 hover:border-[#1557A6] hover:shadow-md rounded-lg p-3 flex items-center gap-3 transition-all group"
                  >
                    {/* Small Thumbnail Image */}
                    <div className="w-14 h-14 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    </div>
                    {/* Title & Code */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-[#1557A6] uppercase">
                        <Icon className="h-3 w-3" />
                        <span>{item.code}</span>
                      </div>
                      <div className="text-[13px] font-bold text-slate-900 group-hover:text-[#1557A6] transition-colors leading-tight line-clamp-2 mt-0.5">
                        {item.title}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Right Arrow Button */}
            <button
              type="button"
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-white border border-slate-300 hover:border-[#1557A6] hover:text-[#1557A6] text-slate-700 flex items-center justify-center shadow-xs cursor-pointer shrink-0 transition-colors"
              aria-label="Next categories"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* 17. INFORMATION SECTION 1: Learning & Training (TEXT | IMG) */}
      {/* ======================================================== */}
      <section id="learning" className="w-full bg-white border-b border-slate-200 py-[70px]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-[70px] items-center">
            {/* Left: Text */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-[#0B3D91] uppercase tracking-wider">
                Integrated Training Framework
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#062B73] tracking-tight">
                Learn. Assess. Grow.
              </h2>
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                Capacity Connect structures meteorological training across four unified institutional mechanisms: Courses, Learning Resources, Assessments, and Certificates.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1557A6] flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Structured Courses</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Curated operational syllabi mapped to IMD observational standards, radar surveillance, and NWP charts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1557A6] flex items-center justify-center shrink-0 mt-0.5">
                    <FileCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Deterministic Assessments</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Timed MCQ examinations, radar case evaluations, and synoptic chart interpretation scoring.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#1557A6] flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Verified Certificates</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Official cadre completion credentials recognizing demonstrated mastery across competency benchmarks.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/courses">
                  <Button
                    size="lg"
                    className="bg-[#1557A6] hover:bg-[#0B3D91] text-white font-bold px-6 h-11 rounded-[22px] text-sm"
                  >
                    View All Courses
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Image */}
            <div className="flex justify-center">
              <div className="w-full max-w-lg h-[300px] sm:h-[340px] rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-sm relative">
                <img
                  src="/images/synoptic-weather-chart.jpg"
                  alt="Operational Synoptic Weather Chart Analysis"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-transparent p-4 text-white">
                  <div className="text-sm font-bold">Synoptic Weather Charting &amp; NWP Analysis</div>
                  <div className="text-[11px] text-slate-300">Operational Weather Forecasting Cadre Syllabus</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* 17. INFORMATION SECTION 2: Competency (IMG | TEXT)         */}
      {/* ======================================================== */}
      <section id="competency" className="w-full bg-[#F7F9FC] border-b border-slate-200 py-[70px]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-[70px] items-center">
            {/* Left: Image */}
            <div className="flex justify-center order-2 lg:order-1">
              <div className="w-full max-w-lg h-[340px] sm:h-[380px] rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-sm relative">
                <img
                  src="/images/doppler-radar-tower.jpg"
                  alt="Doppler Weather Radar Tower & Console"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-4 text-white">
                  <div className="text-sm font-bold">Doppler Weather Radar Facility</div>
                  <div className="text-[11px] text-slate-300">Level 3–5 Advanced Radar Operations Benchmark</div>
                </div>
              </div>
            </div>

            {/* Right: Text & Competency Lifecycle */}
            <div className="space-y-4 order-1 lg:order-2">
              <div className="text-xs font-bold text-[#0B3D91] uppercase tracking-wider">
                The Capacity Building Lifecycle
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#062B73] tracking-tight">
                From Learning to Competency
              </h2>

              <p className="text-base text-slate-700 leading-relaxed font-normal">
                Capacity Connect implements Competency Intelligence to evaluate demonstrated capability through a multi-stream evidence engine rather than subjective attendance logs.
              </p>

              {/* Exact text element anchors for test suite */}
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1 text-xs text-slate-700">
                <div className="font-bold text-[#062B73]">
                  Explainable Competency Engine
                </div>
                <p className="text-[12px] text-slate-600">
                  Every capability score is mathematically derived from exam attempts, course modules, tenure, and peer feedback without opaque machine learning algorithms.
                </p>
                <div className="pt-1 text-[11px] font-semibold text-[#1557A6]">
                  Integrated with the interactive <span>3D Competency Universe</span>
                </div>
              </div>

              {/* 6-Level Hierarchy Overview */}
              <div className="space-y-2 pt-1">
                {competencyLevels.slice(0, 4).map((lvl) => (
                  <div key={lvl.level} className="flex items-start gap-2.5 text-xs">
                    <span className="font-bold text-[#1557A6] shrink-0">{lvl.level}:</span>
                    <span className="text-slate-700 font-medium"><strong>{lvl.title}</strong> — {lvl.desc}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link to="/courses">
                  <Button
                    size="lg"
                    className="bg-[#1557A6] hover:bg-[#0B3D91] text-white font-bold px-6 h-11 rounded-[22px] text-sm"
                  >
                    Explore Competency Matrix
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* 17. INFORMATION SECTION 3: Trainer Matching (TEXT | IMG)  */}
      {/* ======================================================== */}
      <section className="w-full bg-white border-b border-slate-200 py-[70px]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-[70px] items-center">
            {/* Left: Text & Process */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-[#0B3D91] uppercase tracking-wider">
                Expertise Allocation
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#062B73] tracking-tight">
                Find the Right Expertise
              </h2>

              <p className="text-base text-slate-700 leading-relaxed font-normal">
                Capacity Connect helps administrators identify suitable trainers using competency, experience, qualifications, certifications, assessment performance and feedback.
              </p>

              {/* 4-Step Process Infographic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-slate-200 bg-[#F7F9FC]">
                  <div className="text-[11px] font-bold text-[#1557A6]">STAGE 1</div>
                  <div className="text-sm font-bold text-slate-900">Subject Requirement</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Syllabus demands such as Radar or Satellite.</div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-[#F7F9FC]">
                  <div className="text-[11px] font-bold text-[#1557A6]">STAGE 2</div>
                  <div className="text-sm font-bold text-slate-900">Competency Evidence</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Certifications and exam benchmark criteria.</div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-[#F7F9FC]">
                  <div className="text-[11px] font-bold text-[#1557A6]">STAGE 3</div>
                  <div className="text-sm font-bold text-slate-900">Trainer Profiles</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Cadre tenure and past course review scoring.</div>
                </div>

                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/70">
                  <div className="text-[11px] font-bold text-[#0B3D91]">STAGE 4</div>
                  <div className="text-sm font-bold text-[#062B73]">Suitable Trainers</div>
                  <div className="text-[11px] text-slate-700 mt-0.5">Transparent algorithmic matching.</div>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/login">
                  <Button
                    size="lg"
                    className="bg-[#1557A6] hover:bg-[#0B3D91] text-white font-bold px-6 h-11 rounded-[22px] text-sm"
                  >
                    Trainer Nomination Portal
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Image */}
            <div className="flex justify-center">
              <div className="w-full max-w-lg h-[300px] sm:h-[340px] rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-sm relative">
                <img
                  src="/images/automatic-weather-station.jpg"
                  alt="Meteorological Observational Instrumentation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-transparent p-4 text-white">
                  <div className="text-sm font-bold">Meteorological Field Instrumentation &amp; AWS</div>
                  <div className="text-[11px] text-slate-300">Surface Observational Network Faculty Cadre</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* 16. THREE USER ROLES ("One Platform. Three Roles.")       */}
      {/* ======================================================== */}
      <section className="w-full bg-[#F7F9FC] border-b border-slate-200 py-[70px]">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-bold text-[#0B3D91] uppercase tracking-wider mb-1">
              Cadre Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#062B73] tracking-tight">
              One Platform. Three Roles.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Purpose-built experiences engineered for every role in the institutional learning workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TRAINEE */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-2xs hover:border-[#1557A6] transition-all">
              <div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-100 text-[#062B73]">
                  TRAINEE
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-3 mb-1">Operational Trainee</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Weather observers, assistants, and field cadre personnel.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#1557A6] shrink-0" />
                    <span>Learn through structured syllabi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#1557A6] shrink-0" />
                    <span>Assess through timed examinations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#1557A6] shrink-0" />
                    <span>Track demonstrated competency</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#1557A6] shrink-0" />
                    <span>Bridge identified skill gaps</span>
                  </li>
                </ul>
              </div>

              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold border-slate-300 text-[#062B73] hover:bg-blue-50 rounded-[20px]"
                >
                  Enter Trainee Portal
                </Button>
              </Link>
            </div>

            {/* TRAINER */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-2xs hover:border-[#1557A6] transition-all">
              <div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                  TRAINER
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-3 mb-1">Instructional Faculty</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Senior meteorologists, radar instructors, and subject specialists.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Create courses and module syllabi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Build assessment question banks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Monitor learner progress &amp; submissions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Share observational and NWP resources</span>
                  </li>
                </ul>
              </div>

              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold border-slate-300 text-emerald-800 hover:bg-emerald-50 rounded-[20px]"
                >
                  Enter Trainer Portal
                </Button>
              </Link>
            </div>

            {/* ADMIN */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-2xs hover:border-[#1557A6] transition-all">
              <div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-200 text-slate-800">
                  ADMIN
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-3 mb-1">Cadre Administration</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Institutional leadership and training managers at IMD HQ.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-700 shrink-0" />
                    <span>Manage users &amp; registration approvals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-700 shrink-0" />
                    <span>Monitor nationwide training completion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-700 shrink-0" />
                    <span>Analyze organizational competencies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-700 shrink-0" />
                    <span>Support algorithmic trainer selection</span>
                  </li>
                </ul>
              </div>

              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold border-slate-300 text-slate-800 hover:bg-slate-100 rounded-[20px]"
                >
                  Enter Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* 17. METEOROLOGICAL IMAGE BAND                             */}
      {/* ======================================================== */}
      <section id="resources" className="relative py-20 overflow-hidden bg-[#062B73] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('/images/indian-monsoon-clouds.jpg')",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#062B73]/95 via-[#062B73]/80 to-[#062B73]/90" />

        <Container className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-4 border border-white/20">
            <span>National Meteorological Surveillance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
            Building a stronger, weather-ready workforce.
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto font-normal leading-relaxed">
            Advancing national meteorological readiness, aviation safety, and agro-advisories through structured learning, continuous assessment, and verified competency benchmarks.
          </p>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* 18. CALL TO ACTION ("Start Your Learning Journey")        */}
      {/* ======================================================== */}
      <section className="w-full bg-white py-12 sm:py-16 border-b border-slate-200">
        <Container>
          <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#062B73] mb-1">
                Start Your Learning Journey
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                Access meteorological courses, assessments and competency insights through one connected platform.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
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
