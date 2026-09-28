import React, { useRef } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  LogIn,
  Compass,
  ChevronLeft,
  ChevronRight,
  Radar,
  Satellite,
  Thermometer,
  CloudSun,
  Activity,
  Cpu,
  FileCheck,
  Laptop,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const HomePage: React.FC = () => {
  // Deterministic course categories matching exact requirements
  const initiatives = [
    {
      code: "GEN-MET",
      title: "General Meteorology",
      description: "Principles of atmospheric dynamics, thermodynamics, and physical meteorological processes.",
      image: "/images/atmospheric-clouds.jpg",
      icon: CloudSun,
    },
    {
      code: "OWF",
      title: "Weather Forecasting",
      description: "Synoptic charting, numerical guidance interpretation, and warning issuance protocols.",
      image: "/images/synoptic-weather-chart.jpg",
      icon: Compass,
    },
    {
      code: "SAT-MET",
      title: "Satellite Meteorology",
      description: "INSAT-3D/3DR payload interpretation, multispectral imagery, and rainfall diagnostics.",
      image: "/images/cyclone-satellite.jpg",
      icon: Satellite,
    },
    {
      code: "RAD-MET",
      title: "Radar Meteorology",
      description: "Doppler weather radar reflectivity, radial velocity, spectrum width, and severe storm nowcasting.",
      image: "/images/doppler-radar-tower.jpg",
      icon: Radar,
    },
    {
      code: "CYC-WARN",
      title: "Cyclone Warning Systems",
      description: "Tropical cyclone tracking, storm surge modeling, intensity estimation, and coastal warnings.",
      image: "/images/nwp-modeling.jpg",
      icon: Activity,
    },
    {
      code: "INST-OBS",
      title: "Instruments & Observations",
      description: "Surface weather sensors, barometers, AWS telemetry, sensor calibration, and QA.",
      image: "/images/automatic-weather-station.jpg",
      icon: Thermometer,
    },
    {
      code: "CLIM",
      title: "Climate Services",
      description: "Indian monsoon variability, teleconnections, long-range forecasts, and agro-advisories.",
      image: "/images/climate-services.jpg",
      icon: CloudSun,
    },
    {
      code: "MET-COMP",
      title: "Meteorological Computing",
      description: "Python, NWP model post-processing, NetCDF/GRIB data handling, and automated synoptic graphics.",
      image: "/images/python-meteorology.jpg",
      icon: Cpu,
    },
  ]

  // Carousel scroll handling
  const carouselRef = useRef<HTMLDivElement>(null)
  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 320
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // 4 Pillars of Learning
  const learningPillars = [
    {
      title: "Courses",
      tagline: "Structured Operational Syllabi",
      desc: "Curated learning paths aligned with IMD operational cadres, radar operations, and NWP modeling.",
      icon: BookOpen,
      link: "/courses",
    },
    {
      title: "Learning Resources",
      tagline: "Manuals & Operational Guides",
      desc: "Comprehensive observational handbooks, satellite interpretation guides, and sensor maintenance protocols.",
      icon: Laptop,
      link: "/courses",
    },
    {
      title: "Assessments",
      tagline: "Timed Evaluations & Scoring",
      desc: "Deterministic MCQ examinations and practical forecasting tests without black-box grading.",
      icon: FileCheck,
      link: "/login",
    },
    {
      title: "Certificates",
      tagline: "Verified Cadre Qualifications",
      desc: "Institutional credentials recognizing demonstrated mastery across meteorological skill standards.",
      icon: Award,
      link: "/login",
    },
  ]

  // Complete Learning Lifecycle
  const lifecycleSteps = [
    { step: "01", name: "Profile", desc: "Cadre & Cadre Role Setup" },
    { step: "02", name: "Learning", desc: "Structured Coursework" },
    { step: "03", name: "Assessment", desc: "Timed MCQ Examinations" },
    { step: "04", name: "Evidence", desc: "Multi-Source Proof Stream" },
    { step: "05", name: "Competency", desc: "Algorithmic Proficiency Level" },
    { step: "06", name: "Skill Gap", desc: "Benchmarked Diagnostics" },
    { step: "07", name: "Recommendation", desc: "Targeted Syllabi Suggestions" },
    { step: "08", name: "Readiness", desc: "Verified Operational Deployment" },
  ]

  // Competency Levels
  const competencyLevels = [
    { level: "Level 1", title: "Foundational Observer", criteria: "Mastery of surface meteorological sensors, barometer readings, and standard observational logging." },
    { level: "Level 2", title: "Operational Assistant", criteria: "Routine synoptic chart interpretation, automated weather station (AWS) calibration, and QA verification." },
    { level: "Level 3", title: "Forecasting Practitioner", criteria: "Doppler radar console operations, severe convective storm nowcasting, and aerodrome warning issuance." },
    { level: "Level 4", title: "Senior Meteorological Officer", criteria: "Numerical Weather Prediction (NWP) model diagnostic analysis, cyclone tracking, and state-level bulletins." },
    { level: "Level 5", title: "Domain Specialist", criteria: "Advanced radar telemetry calibration, high-resolution NWP tuning, and specialized technical manual authorship." },
    { level: "Level 6", title: "National Cadre Expert", criteria: "National monsoon outlook reviews, strategic capacity-building policy formulation, and master cadre mentorship." },
  ]

  // Three User Roles
  const roles = [
    {
      role: "TRAINEE",
      desc: "Operational weather observers, meteorological assistants, and regional station cadres.",
      badge: "bg-blue-100 text-[#082B73]",
      points: [
        "Learn through structured meteorological syllabi",
        "Take timed MCQ and practical assessments",
        "Track progress in real time",
        "Build demonstrated competency across 6 levels",
      ],
      link: "/login",
    },
    {
      role: "TRAINER",
      desc: "Senior meteorologists, radar scientists, and specialized training faculty.",
      badge: "bg-emerald-100 text-emerald-800",
      points: [
        "Create courses and comprehensive modules",
        "Build standardized assessment question banks",
        "Monitor learners and review exam submissions",
        "Share observational and NWP reference resources",
      ],
      link: "/login",
    },
    {
      role: "ADMIN",
      desc: "Cadre directors, institutional training managers, and system administrators at IMD HQ.",
      badge: "bg-slate-200 text-slate-800",
      points: [
        "Manage users and cadre registration approvals",
        "Monitor organization-wide training completion",
        "Analyze organizational competency and skill gaps",
        "Support algorithmic trainer selection and deployment",
      ],
      link: "/login",
    },
  ]

  return (
    <div className="flex-1 bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* ======================================================== */}
      {/* 3. HERO / BANNER SECTION (Inspired by OpenForge Banner)   */}
      {/* ======================================================== */}
      <section className="relative bg-gradient-to-r from-[#EAF4FF] via-[#F4F9FF] to-[#FFFFFF] border-b border-slate-200 overflow-hidden py-10 sm:py-14 lg:py-16">
        {/* Subtle Decorative Weather Contour Lines (Contour Curves) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden"
          aria-hidden="true"
        >
          <svg className="absolute -right-20 -top-20 w-[600px] h-[600px] text-[#0B3D91]" viewBox="0 0 500 500" fill="none" stroke="currentColor" strokeWidth="1.2">
            <ellipse cx="250" cy="250" rx="220" ry="120" />
            <ellipse cx="250" cy="250" rx="180" ry="90" />
            <ellipse cx="250" cy="250" rx="130" ry="60" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Institutional Identity & Action */}
            <div className="lg:col-span-7 space-y-4">
              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-white/90 text-[#082B73] text-[12px] font-bold shadow-2xs">
                <img
                  src="/branding/IMD_logo.png"
                  alt="IMD Emblem"
                  className="h-4.5 w-auto object-contain"
                />
                <span>Capacity Connect • IMD Digital Capacity Building Portal</span>
              </div>

              {/* Main Banner Heading */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#082B73] tracking-tight leading-tight">
                  CAPACITY CONNECT
                </h1>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#0B3D91] mt-1">
                  Digital Capacity Building &amp; Learning Management Portal
                </div>
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 mt-1">
                  India Meteorological Department • Government of India
                </div>
              </div>

              {/* Institutional Statement Quote */}
              <blockquote className="border-l-3 border-[#0B3D91] pl-4 py-1 text-sm sm:text-base text-slate-700 italic font-medium bg-white/80 rounded-r shadow-2xs">
                "Building meteorological expertise through structured learning, assessment and competency development."
              </blockquote>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                A unified institutional platform engineered to transition workforce learning from passive course completion into measurable, verifiable organizational readiness across all observational, forecasting, and radar cadres.
              </p>

              {/* Action Buttons (Matches OpenForge Reference Styling) */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/courses">
                  <Button
                    size="lg"
                    className="bg-[#C05600] hover:bg-[#A34700] text-white font-bold px-6 h-12 rounded-md shadow-sm transition-all flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <BookOpen className="h-4 w-4" />
                    Explore Courses
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-300 bg-white hover:bg-slate-50 text-[#082B73] hover:text-[#0B3D91] font-bold px-6 h-12 rounded-md shadow-2xs transition-all flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Banner Image (Styled Graphic Composition inspired by OpenForge) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-lg rounded-2xl overflow-hidden border-2 border-slate-200 bg-white shadow-md p-2">
                <div className="relative rounded-xl overflow-hidden bg-slate-100 h-64 sm:h-72 lg:h-80">
                  <img
                    src="/images/imd-forecasting-center.jpg"
                    alt="IMD National Weather Forecasting Operations Center"
                    className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-[1.02]"
                    loading="eager"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#082B73]/95 via-[#082B73]/60 to-transparent p-4 text-white">
                    <div className="text-[13px] font-bold text-white tracking-wide">
                      IMD Weather Forecasting &amp; Radar Center
                    </div>
                    <div className="text-[11px] text-blue-200 mt-0.5">
                      Operational 24×7 Synoptic Surveillance &amp; Severe Weather Warning
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. ABOUT CAPACITY CONNECT SECTION (Matching Screenshot 1) */}
      {/* ======================================================== */}
      <section id="about" className="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: About Details */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#082B73] tracking-tight">
                About Capacity Connect
              </h2>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                Capacity Connect is a digital capacity-building and learning management platform designed to support structured professional development, competency assessment and knowledge sharing across meteorological cadres.
              </p>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                By bridging operational training with verifiable proficiency standards, the platform provides an evidence-based framework for archiving instructional courseware, evaluating demonstrated skills, identifying critical training gaps, and aligning qualified subject matter experts with emerging institutional requirements.
              </p>

              {/* Key Capabilities Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[
                  "Structured meteorological learning & syllabi",
                  "Timed assessment & objective examinations",
                  "Professional cadre profiles & portfolios",
                  "Multi-stream competency mapping",
                  "Institutional skill-gap identification",
                  "Algorithmic trainer matching",
                  "Enterprise capacity analytics for IMD HQ",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                    <Check className="h-4 w-4 text-[#0B3D91] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Amber/Orange "Visit Us / Explore Platform" CTA Button (Matching Screenshot 1) */}
              <div className="pt-4">
                <Link to="/courses">
                  <Button
                    size="lg"
                    className="bg-[#C05600] hover:bg-[#A34700] text-white font-bold px-7 h-11 rounded-md shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer text-sm"
                  >
                    Explore Platform
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Realistic Observational Display / Device Frame */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl p-3 shadow-lg">
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 h-64 sm:h-72">
                  <img
                    src="/images/imd-radar-facility.jpg"
                    alt="IMD Doppler Weather Radar Observation Facility"
                    className="w-full h-full object-cover opacity-90 transition-transform duration-500 hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                    <div className="inline-block px-2 py-0.5 bg-blue-600 rounded text-[10px] font-bold uppercase tracking-wider mb-1 w-max">
                      Observational Infrastructure
                    </div>
                    <div className="text-sm font-bold">Doppler Weather Radar Network</div>
                    <div className="text-[11px] text-slate-300">HQ New Delhi &bull; Established National Stations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. FEATURE / INITIATIVE CAROUSEL ("Explore Capacity Connect") */}
      {/* (Inspired by OpenForge Initiative Carousel in Screenshots 2 & 3) */}
      {/* ======================================================== */}
      <section className="py-12 sm:py-16 bg-[#F7F9FC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with Carousel Arrows */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-xs font-bold text-[#0B3D91] uppercase tracking-wider mb-1">
                Meteorological Domain Initiatives
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#082B73] tracking-tight">
                Explore Capacity Connect
              </h2>
            </div>

            {/* Carousel Navigation Arrow Buttons (Matching Reference Screenshots) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCarousel("left")}
                className="w-9 h-9 rounded-full bg-white border border-slate-300 hover:border-[#0B3D91] hover:text-[#0B3D91] text-slate-700 flex items-center justify-center shadow-xs cursor-pointer transition-colors"
                aria-label="Previous initiatives"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel("right")}
                className="w-9 h-9 rounded-full bg-white border border-slate-300 hover:border-[#0B3D91] hover:text-[#0B3D91] text-slate-700 flex items-center justify-center shadow-xs cursor-pointer transition-colors"
                aria-label="Next initiatives"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Carousel Container */}
          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {initiatives.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.code}
                  className="w-72 sm:w-80 shrink-0 snap-start bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#0B3D91] hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#082B73]/90 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      {item.code}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="h-4 w-4 text-[#0B3D91] shrink-0" />
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0B3D91] transition-colors leading-snug">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-[12px] text-slate-600 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    <Link
                      to="/courses"
                      className="inline-flex items-center text-[12px] font-bold text-[#0B3D91] hover:text-[#082B73] gap-1 pt-2 border-t border-slate-100"
                    >
                      View Syllabus Modules <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. LEARNING & TRAINING SECTION ("Learn. Assess. Grow.")   */}
      {/* ======================================================== */}
      <section id="learning" className="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold text-[#0B3D91] uppercase tracking-wider mb-1">
              Integrated Education Pillars
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082B73] tracking-tight">
              Learn. Assess. Grow.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Four unified institutional mechanisms driving continuous meteorological proficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {learningPillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div
                  key={pillar.title}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[#0B3D91] hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0B3D91] flex items-center justify-center mb-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-0.5">{pillar.title}</h3>
                    <div className="text-[11px] font-semibold text-[#0B3D91] mb-2">{pillar.tagline}</div>
                    <p className="text-[12px] text-slate-600 leading-relaxed mb-4">{pillar.desc}</p>
                  </div>

                  <Link
                    to={pillar.link}
                    className="inline-flex items-center text-xs font-bold text-[#0B3D91] hover:underline gap-1"
                  >
                    Access Section <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7 & 8. COMPETENCY INTELLIGENCE & LIFECYCLE SECTION        */}
      {/* ======================================================== */}
      <section id="competency" className="py-14 sm:py-20 bg-[#F7F9FC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <div className="text-xs font-bold text-[#0B3D91] uppercase tracking-wider mb-1">
              The Capacity Building Lifecycle
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082B73] tracking-tight">
              From Learning to Competency
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Moving beyond course attendance logs to verifiable operational readiness. Competency Intelligence is calculated objectively using multi-stream evidence.
            </p>
          </div>

          {/* Sequential Process Diagram (Flat, Professional IMD Blue) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8 shadow-2xs">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Closed-Loop Operational Competency Pipeline
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs font-bold">
              {lifecycleSteps.map((step) => (
                <div
                  key={step.name}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between"
                >
                  <span className="text-[10px] font-mono text-[#0B3D91] font-bold">{step.step}</span>
                  <span className="text-slate-900 mt-0.5">{step.name}</span>
                  <span className="text-[10px] text-slate-500 font-normal mt-1 leading-tight">{step.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Anchor: Explainable Competency Engine & 3D Competency Universe */}
          <div className="mb-8 p-4 rounded-lg bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <Cpu className="h-5 w-5 text-[#0B3D91] shrink-0" />
              <span>
                Audited with an <strong className="font-bold text-[#082B73]">Explainable Competency Engine</strong> and navigable in an interactive <strong className="font-bold text-[#082B73]">3D Competency Universe</strong> without black-box machine learning.
              </span>
            </div>
            <Link to="/courses" className="text-[#0B3D91] font-bold hover:underline shrink-0">
              Browse Syllabi &rarr;
            </Link>
          </div>

          {/* 6-Level Restrained Competency Matrix */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-[#082B73] uppercase tracking-wide">
                6-Level Institutional Proficiency Framework
              </span>
              <span className="text-[11px] text-slate-500">
                Audited against IMD Operational Cadres
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {competencyLevels.map((lvl) => (
                <div key={lvl.level} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="sm:w-1/4">
                    <span className="text-xs font-bold text-[#0B3D91]">{lvl.level}</span>
                    <div className="text-sm font-bold text-slate-900">{lvl.title}</div>
                  </div>
                  <div className="sm:w-3/4 text-[12px] text-slate-600 leading-normal">
                    {lvl.criteria}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. TRAINER MATCHING SECTION                              */}
      {/* ======================================================== */}
      <section className="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <div className="text-xs font-bold text-[#0B3D91] uppercase tracking-wider mb-1">
              Faculty Allocation
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082B73] tracking-tight">
              Find the Right Expertise
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Capacity Connect helps administrators identify suitable trainers using competency, experience, qualifications, certifications, assessment performance and feedback.
            </p>
          </div>

          {/* Infographic Visual Workflow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 text-center sm:text-left">
              <div className="text-xs font-bold text-slate-400 mb-1">STEP 1</div>
              <div className="text-sm font-bold text-slate-900 mb-1">Subject Requirement</div>
              <p className="text-[12px] text-slate-600">
                Identify specialized syllabus demands such as Doppler Radar, Satellite, or NWP.
              </p>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 text-center sm:text-left">
              <div className="text-xs font-bold text-slate-400 mb-1">STEP 2</div>
              <div className="text-sm font-bold text-slate-900 mb-1">Competency Evidence</div>
              <p className="text-[12px] text-slate-600">
                Audit candidate certifications, tenure, and verified examination benchmark scores.
              </p>
            </div>

            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 text-center sm:text-left">
              <div className="text-xs font-bold text-slate-400 mb-1">STEP 3</div>
              <div className="text-sm font-bold text-slate-900 mb-1">Trainer Profiles</div>
              <p className="text-[12px] text-slate-600">
                Screen operational experience, past course evaluations, and peer feedback metrics.
              </p>
            </div>

            <div className="p-4 border border-blue-200 rounded-xl bg-blue-50/70 text-center sm:text-left">
              <div className="text-xs font-bold text-[#0B3D91] mb-1">STEP 4</div>
              <div className="text-sm font-bold text-[#082B73] mb-1">Suitable Trainers</div>
              <p className="text-[12px] text-slate-700 font-medium">
                Deliver evidence-based nominations with transparent mathematical match scores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 10. THREE USER ROLES ("One Platform. Three Roles.")       */}
      {/* ======================================================== */}
      <section className="py-14 sm:py-20 bg-[#F7F9FC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold text-[#0B3D91] uppercase tracking-wider mb-1">
              Cadre Workspaces
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082B73] tracking-tight">
              One Platform. Three Roles.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Tailored workspaces engineered specifically for each user category in the meteorological ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r) => (
              <div
                key={r.role}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-2xs hover:border-[#0B3D91] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded ${r.badge}`}>
                      {r.role}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{r.role}</h3>
                  <p className="text-[12px] text-slate-500 mb-5 leading-relaxed">{r.desc}</p>

                  <ul className="space-y-2.5 mb-6">
                    {r.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-[12px] text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-[#0B3D91] shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to={r.link}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold border-slate-300 text-[#082B73] hover:bg-blue-50 hover:text-[#0B3D91] gap-1.5 cursor-pointer"
                  >
                    Enter {r.role} Workspace <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 11. METEOROLOGICAL IMAGE BAND                             */}
      {/* ======================================================== */}
      <section id="resources" className="relative py-20 overflow-hidden bg-[#082B73] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('/images/indian-monsoon-clouds.jpg')",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#082B73]/95 via-[#082B73]/80 to-[#082B73]/90" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-4 border border-white/20">
            <span>National Meteorological Surveillance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
            Building a stronger, weather-ready workforce.
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto font-normal leading-relaxed">
            Advancing national meteorological readiness, aviation safety, and agro-advisories through structured learning, continuous assessment, and verified competency benchmarks.
          </p>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 12. CALL TO ACTION ("Start Your Learning Journey")        */}
      {/* ======================================================== */}
      <section className="bg-white py-12 sm:py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-[#F7F9FC] p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#082B73] mb-1">
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
                  className="bg-[#C05600] hover:bg-[#A34700] text-white font-bold px-6 h-11 rounded-md shadow-sm transition-all cursor-pointer text-sm"
                >
                  Explore Courses
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-300 bg-white hover:bg-slate-50 text-[#082B73] hover:text-[#0B3D91] font-bold px-6 h-11 rounded-md cursor-pointer text-sm"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
