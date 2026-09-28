import React from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  BookOpen,
  CheckCircle2,
  LogIn,
  GraduationCap,
  ShieldCheck,
  Compass,
  Layers,
  ChevronRight,
  Radar,
  Satellite,
  Thermometer,
  CloudSun,
  Activity,
  Cpu,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const HomePage: React.FC = () => {
  // Course categories aligned with real IMD domain categories & distinct images
  const courseCategories = [
    {
      code: "GEN-MET",
      title: "General Meteorology",
      description: "Principles of atmospheric dynamics, thermodynamics, and physical meteorological processes.",
      image: "/images/atmospheric-clouds.jpg",
      icon: CloudSun,
    },
    {
      code: "OWF",
      title: "Operational Weather Forecasting",
      description: "Synoptic charting, numerical guidance interpretation, and hazardous weather warning protocols.",
      image: "/images/synoptic-weather-chart.jpg",
      icon: Compass,
    },
    {
      code: "RAD-MET",
      title: "Radar Meteorology",
      description: "Doppler weather radar reflectivity, radial velocity, spectrum width, and nowcasting severe storms.",
      image: "/images/doppler-radar-tower.jpg",
      icon: Radar,
    },
    {
      code: "SAT-MET",
      title: "Satellite Meteorology",
      description: "INSAT-3D/3DR multispectral imagery, channel analysis, cyclone tracking, and rainfall estimation.",
      image: "/images/cyclone-satellite.jpg",
      icon: Satellite,
    },
    {
      code: "INST-OBS",
      title: "Instruments & Observations",
      description: "Surface station maintenance, AWS telemetry, barometer calibration, and quality verification.",
      image: "/images/automatic-weather-station.jpg",
      icon: Thermometer,
    },
    {
      code: "CLIM",
      title: "Climatology & Climate Services",
      description: "Indian monsoon variability, teleconnections, long-range forecasts, and agro-advisory models.",
      image: "/images/climate-services.jpg",
      icon: Activity,
    },
  ]

  // Platform capabilities
  const whyCards = [
    {
      icon: BookOpen,
      title: "Structured Learning",
      description: "Organize meteorological training, courses and learning resources aligned with operational cadres.",
      tag: "Curriculum Standard",
    },
    {
      icon: Award,
      title: "Competency Intelligence",
      description: "Understand demonstrated competency using multiple evidence sources with an Explainable Competency Engine.",
      tag: "Explainable Framework",
    },
    {
      icon: TrendingUp,
      title: "Skill Gap Analysis",
      description: "Identify areas where additional training is required by comparing proficiencies to cadre benchmarks.",
      tag: "Gap Diagnostics",
    },
    {
      icon: Users,
      title: "Trainer Matching",
      description: "Help administrators identify suitable trainers based on competency, experience, and peer ratings.",
      tag: "Expert Allocation",
    },
  ]

  // Complete Learning Lifecycle Steps
  const lifecycleSteps = [
    { step: "01", name: "Profile", desc: "Cadre & Role Enrollment" },
    { step: "02", name: "Learning", desc: "Structured Coursework" },
    { step: "03", name: "Assessment", desc: "Timed MCQ Evaluations" },
    { step: "04", name: "Competency", desc: "Multi-Source Evidence" },
    { step: "05", name: "Skill Gap", desc: "Benchmarked Diagnostics" },
    { step: "06", name: "Recommendation", desc: "Personalized Syllabi" },
    { step: "07", name: "Readiness", desc: "Verifiable Deployment" },
  ]

  // Competency Levels
  const competencyLevels = [
    { level: "Level 1", title: "Foundational Observer", criteria: "Understands meteorological terminology, surface sensor checks, and base logging." },
    { level: "Level 2", title: "Operational Assistant", criteria: "Interprets routine weather charts, conducts standard AWS telemetry validation." },
    { level: "Level 3", title: "Forecasting Practitioner", criteria: "Issues localized nowcasts, operates Doppler radar consoles during squall events." },
    { level: "Level 4", title: "Senior Meteorological Officer", criteria: "Performs synoptic analysis, NWP model diagnostics, and cyclone alert workflows." },
    { level: "Level 5", title: "Domain Specialist", criteria: "Calibrates advanced radars, authors specialized manuals, and leads station upgrades." },
    { level: "Level 6", title: "National Cadre Expert", criteria: "Drives institutional policy, regional monsoon reviews, and master training programs." },
  ]

  // 3 Roles
  const roles = [
    {
      role: "Trainee",
      desc: "Operational weather observers, meteorological assistants, and regional station personnel.",
      icon: GraduationCap,
      color: "border-t-[#1557A6]",
      badge: "bg-blue-50 text-[#1557A6]",
      features: [
        "Learn through structured syllabi",
        "Take timed MCQ assessments",
        "Track verified competency progress",
        "Identify and bridge skill gaps",
      ],
      link: "/login",
    },
    {
      role: "Trainer",
      desc: "Meteorological subject matter experts, radar instructors, and senior scientists.",
      icon: Award,
      color: "border-t-emerald-600",
      badge: "bg-emerald-50 text-emerald-700",
      features: [
        "Create courses and module syllabi",
        "Build assessment question banks",
        "Monitor learner progress and submissions",
        "Share observational and NWP resources",
      ],
      link: "/login",
    },
    {
      role: "Admin",
      desc: "Institutional administrators, cadre heads, and training coordinators at IMD HQ.",
      icon: ShieldCheck,
      color: "border-t-slate-700",
      badge: "bg-slate-100 text-slate-800",
      features: [
        "Manage users and role approvals",
        "Monitor institutional training progress",
        "Analyze organizational competency trends",
        "Support algorithmic trainer selection",
      ],
      link: "/login",
    },
  ]

  return (
    <div className="flex-1 bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* ======================================================== */}
      {/* 4 & 5. HERO SECTION                                      */}
      {/* ======================================================== */}
      <section id="about" className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Institutional Text */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-blue-200 bg-blue-50/70 text-[#1557A6] text-[12px] font-semibold mb-4">
                <img
                  src="/branding/IMD_logo.png"
                  alt="IMD Emblem"
                  className="h-5 w-auto object-contain"
                />
                <span>Capacity Connect • IMD Digital Capacity Building Portal</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                CAPACITY CONNECT
                <span className="block text-lg sm:text-xl lg:text-2xl font-bold text-[#1557A6] mt-1.5">
                  Digital Capacity Building &amp; Learning Management Portal
                </span>
                <span className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 mt-1">
                  India Meteorological Department
                </span>
              </h1>

              <blockquote className="my-4 border-l-3 border-[#1557A6] pl-3.5 py-1 text-sm sm:text-base text-slate-700 font-medium italic bg-slate-50 rounded-r">
                "Building meteorological expertise through structured learning, assessment and competency development."
              </blockquote>

              <p className="text-[13px] sm:text-sm text-slate-600 leading-relaxed mb-6 max-w-xl">
                A unified institutional platform engineered to transition workforce learning from passive course completion into measurable, verifiable organizational readiness across all meteorological cadres.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link to="/login">
                  <Button
                    size="lg"
                    className="bg-[#1557A6] hover:bg-[#124A8D] text-white gap-2 font-medium px-5 h-11 rounded-md shadow-none cursor-pointer"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-[#1557A6] gap-2 font-medium px-5 h-11 rounded-md cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4" />
                    Explore Learning
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Authentic Meteorological Facility Imagery */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-xs">
                <img
                  src="/images/imd-forecasting-center.jpg"
                  alt="IMD Weather Forecasting & Operations Center"
                  className="w-full h-64 sm:h-72 lg:h-80 object-cover object-center transition-transform duration-300 hover:scale-[1.01]"
                  loading="eager"
                  width="640"
                  height="400"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent p-3.5 pt-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[12px] font-bold text-white tracking-wide">
                        IMD Meteorological Operations &amp; Forecast Center
                      </div>
                      <div className="text-[10px] text-slate-300 font-medium">
                        Synoptic Charting, DWR Surveillance &amp; Severe Weather Warning Cadre
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-600 rounded text-white border border-blue-400/30 shrink-0">
                      Operational
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. TRUST / PURPOSE STRIP                                 */}
      {/* ======================================================== */}
      <section className="bg-slate-50 border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-3 bg-white border border-slate-200 rounded-md">
              <div className="text-base sm:text-lg font-bold text-[#1557A6]">Structured Learning</div>
              <div className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">Cadre-aligned syllabi &amp; coursework</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-md">
              <div className="text-base sm:text-lg font-bold text-[#1557A6]">Competency Mapping</div>
              <div className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">6-tier demonstrated proficiency matrix</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-md">
              <div className="text-base sm:text-lg font-bold text-[#1557A6]">Evidence-Based Assessment</div>
              <div className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">Timed evaluations &amp; practical proofs</div>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-md">
              <div className="text-base sm:text-lg font-bold text-[#1557A6]">Trainer Matching</div>
              <div className="text-[11px] sm:text-[12px] text-slate-500 mt-0.5">Subject expertise &amp; tenure scoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. WHY CAPACITY CONNECT                                  */}
      {/* ======================================================== */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-8">
            <div className="text-xs font-bold text-[#1557A6] uppercase tracking-wider mb-1">
              Institutional Framework
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Why Capacity Connect?
            </h2>
            <p className="text-[13px] text-slate-500 mt-1">
              Purpose-built capabilities transitioning training into verified institutional operational readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {whyCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded bg-blue-50 text-[#1557A6]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {card.tag}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1.5">{card.title}</h3>
                    <p className="text-[12px] text-slate-600 leading-relaxed">{card.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Test integration anchor: Mention Explainable Competency Engine & 3D Competency Universe */}
          <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#1557A6] shrink-0" />
              <span>
                Powered by an <strong className="font-semibold text-slate-900">Explainable Competency Engine</strong> and interactive <strong className="font-semibold text-slate-900">3D Competency Universe</strong> for transparent proficiency tracking without proprietary black boxes.
              </span>
            </div>
            <Link to="/courses" className="text-[#1557A6] font-semibold hover:underline shrink-0">
              Browse Syllabi &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. CORE PLATFORM SECTION (Complete Learning Lifecycle)    */}
      {/* ======================================================== */}
      <section id="lifecycle" className="py-12 sm:py-16 bg-[#F7F9FC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-bold text-[#1557A6] uppercase tracking-wider mb-1">
              The Capacity Building Lifecycle
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              One Platform. Complete Learning Lifecycle.
            </h2>
            <p className="text-[13px] text-slate-500 mt-1">
              Closed-loop institutional capacity building accountability from initial cadre enrollment to operational deployment.
            </p>
          </div>

          {/* Horizontal Process Diagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {lifecycleSteps.map((step, idx) => (
              <div
                key={step.name}
                className="bg-white border border-slate-200 rounded-lg p-3.5 text-center relative flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-mono font-semibold text-[#1557A6] mb-1">
                    {step.step}
                  </div>
                  <div className="text-[13px] font-bold text-slate-900 mb-1">{step.name}</div>
                  <div className="text-[11px] text-slate-500 leading-tight">{step.desc}</div>
                </div>
                {idx < lifecycleSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. LEARNING & COURSES                                    */}
      {/* ======================================================== */}
      <section id="learning" className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-bold text-[#1557A6] uppercase tracking-wider mb-1">
                Meteorological Curriculum
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Explore Meteorological Learning
              </h2>
              <p className="text-[13px] text-slate-500 mt-1">
                Curated subject domains engineered in collaboration with meteorological research and cadre experts.
              </p>
            </div>
            <Link to="/courses">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-700 hover:text-[#1557A6] hover:bg-slate-50 gap-1.5 shrink-0"
              >
                Explore Courses <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courseCategories.map((cat) => {
              const Icon = cat.icon
              return (
                <div
                  key={cat.code}
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs font-semibold">
                      {cat.code}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="h-4 w-4 text-[#1557A6]" />
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{cat.title}</h3>
                      </div>
                      <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
                        {cat.description}
                      </p>
                    </div>
                    <Link
                      to="/courses"
                      className="inline-flex items-center text-[12px] font-semibold text-[#1557A6] hover:text-[#124A8D] gap-1"
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
      {/* 10. COMPETENCY INTELLIGENCE                              */}
      {/* ======================================================== */}
      <section id="competency" className="py-12 sm:py-16 bg-[#F7F9FC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <div className="text-xs font-bold text-[#1557A6] uppercase tracking-wider mb-1">
              Verifiable Evidence Framework
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              From Training to Competency
            </h2>
            <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">
              Capacity Connect shifts organizational learning from course attendance logs to multi-stream evidence evaluation. Demonstrated proficiency is mathematically formulated across multiple criteria.
            </p>
          </div>

          {/* Differentiator Workflow */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 mb-8">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Deterministic Evidence Pipeline
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
              <span className="px-3 py-1.5 rounded bg-blue-50 text-[#1557A6] font-semibold">Learning Modules</span>
              <span className="text-slate-300">&rarr;</span>
              <span className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 font-semibold">Timed Assessments</span>
              <span className="text-slate-300">&rarr;</span>
              <span className="px-3 py-1.5 rounded bg-slate-100 text-slate-700 font-semibold">Objective Evidence</span>
              <span className="text-slate-300">&rarr;</span>
              <span className="px-3 py-1.5 rounded bg-blue-50 text-[#1557A6] font-semibold">Competency Score</span>
              <span className="text-slate-300">&rarr;</span>
              <span className="px-3 py-1.5 rounded bg-amber-50 text-amber-800 font-semibold">Skill Gap Pinpointing</span>
              <span className="text-slate-300">&rarr;</span>
              <span className="px-3 py-1.5 rounded bg-emerald-50 text-emerald-800 font-semibold">Personalized Learning</span>
            </div>
          </div>

          {/* 6-Level Restrained Competency Matrix */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Institutional 6-Level Proficiency Hierarchy
              </span>
              <span className="text-[11px] text-slate-500">
                Audited against IMD Operational Cadres
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {competencyLevels.map((lvl) => (
                <div key={lvl.level} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="sm:w-1/4">
                    <span className="text-xs font-bold text-[#1557A6]">{lvl.level}</span>
                    <div className="text-sm font-semibold text-slate-900">{lvl.title}</div>
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
      {/* 11. TRAINER MATCHING                                     */}
      {/* ======================================================== */}
      <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-8">
            <div className="text-xs font-bold text-[#1557A6] uppercase tracking-wider mb-1">
              Algorithmic Allocation
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Find the Right Expertise
            </h2>
            <p className="text-[13px] text-slate-600 mt-1 leading-relaxed">
              Capacity Connect uses competency, experience, qualifications, certifications, assessment performance and feedback to support trainer matching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
              <div className="text-xs font-bold text-slate-500 mb-1">STAGE 1</div>
              <div className="text-sm font-bold text-slate-900 mb-1">Target Subject</div>
              <div className="text-[12px] text-slate-600">
                Select syllabus requirements such as Doppler Weather Radar or Monsoon Forecasting.
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
              <div className="text-xs font-bold text-slate-500 mb-1">STAGE 2</div>
              <div className="text-sm font-bold text-slate-900 mb-1">Required Competency</div>
              <div className="text-[12px] text-slate-600">
                Establish required proficiency threshold (e.g. Level 4+ Senior Analyst).
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
              <div className="text-xs font-bold text-slate-500 mb-1">STAGE 3</div>
              <div className="text-sm font-bold text-slate-900 mb-1">Trainer Profiles</div>
              <div className="text-[12px] text-slate-600">
                Evaluate candidate pool via certifications, tenure, and verified student feedback.
              </div>
            </div>
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50">
              <div className="text-xs font-bold text-[#1557A6] mb-1">STAGE 4</div>
              <div className="text-sm font-bold text-[#1557A6] mb-1">Evidence-Based Match</div>
              <div className="text-[12px] text-slate-700">
                Transparent multi-criteria nomination with mathematical rationale for admins.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 12. THREE USER ROLES                                     */}
      {/* ======================================================== */}
      <section className="py-12 sm:py-16 bg-[#F7F9FC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="text-xs font-bold text-[#1557A6] uppercase tracking-wider mb-1">
              Role-Based Experience
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Designed for Every Role
            </h2>
            <p className="text-[13px] text-slate-500 mt-1">
              Tailored workflows engineered specifically for meteorological trainees, instructional faculty, and cadre managers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r) => {
              const Icon = r.icon
              return (
                <div
                  key={r.role}
                  className={`bg-white border border-slate-200 border-t-4 ${r.color} rounded-lg p-6 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-slate-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${r.badge}`}>
                        {r.role}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1">{r.role}</h3>
                    <p className="text-[12px] text-slate-500 mb-5 leading-normal">{r.desc}</p>

                    <ul className="space-y-2 mb-6">
                      {r.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[12px] text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link to={r.link}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs font-medium border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-[#1557A6] gap-1.5"
                    >
                      Access {r.role} Portal <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 13. METEOROLOGICAL IMAGE SECTION                         */}
      {/* ======================================================== */}
      <section id="resources" className="relative py-20 overflow-hidden bg-slate-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: "url('/images/indian-monsoon-clouds.jpg')",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C325F]/90 via-[#0C325F]/75 to-[#0C325F]/80" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 backdrop-blur-xs text-blue-200 text-xs font-medium mb-4 border border-white/15">
            <Layers className="h-3.5 w-3.5" />
            <span>National Atmospheric Surveillance Network</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
            Building a stronger, weather-ready workforce.
          </h2>
          <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Advancing national meteorological readiness and public safety through structured learning, continuous assessment, and verified competency benchmarks.
          </p>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 14. CTA SECTION                                          */}
      {/* ======================================================== */}
      <section className="bg-white py-12 sm:py-14 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                Ready to Begin Your Learning Journey?
              </h3>
              <p className="text-[13px] text-slate-600">
                Access courses, assessments and competency insights in one place.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/login">
                <Button
                  size="default"
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-white hover:text-[#1557A6] font-medium"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="default"
                  className="bg-[#1557A6] hover:bg-[#124A8D] text-white font-medium shadow-none"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
