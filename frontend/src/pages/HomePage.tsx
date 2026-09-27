import React from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  BookOpen,
  Network,
  Target,
  CheckCircle2,
  LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const capabilities = [
  {
    icon: BookOpen,
    title: "Structured Learning",
    description: "Comprehensive syllabi mapped to IMD operational protocols, radar systems, and NWP charts.",
  },
  {
    icon: Award,
    title: "Explainable Competency Engine",
    description: "Multi-stream evidence engine evaluating capabilities across exams, courses, skills, and tenure.",
  },
  {
    icon: Network,
    title: "3D Competency Universe",
    description: "Interactive WebGL visualization exploring multi-dimensional proficiencies and clusters.",
  },
  {
    icon: TrendingUp,
    title: "Skill Gap Analysis",
    description: "Prioritized gap detection comparing demonstrated levels against operational benchmarks.",
  },
  {
    icon: Target,
    title: "Personalized Recommendations",
    description: "Syllabus suggestions targeting identified gaps with transparent 'Why Recommended' rationale.",
  },
  {
    icon: Users,
    title: "Trainer Matching",
    description: "Algorithmic 6-dimension trainer candidate scoring for transparent faculty nomination.",
  },
]

const highlights = [
  { label: "Deterministic", sub: "No black-box AI APIs" },
  { label: "₹0 Cost", sub: "Open source stack" },
  { label: "RBAC Secured", sub: "Argon2id + JWT" },
  { label: "3D Analytics", sub: "WebGL competency universe" },
]

const roles = [
  {
    role: "Trainee",
    color: "border-l-[#1557A6]",
    badge: "bg-blue-50 text-[#1557A6]",
    features: ["Browse & enroll in courses", "Take timed MCQ assessments", "View competency universe", "Track skill gaps"],
    link: "/login",
  },
  {
    role: "Trainer",
    color: "border-l-green-700",
    badge: "bg-green-50 text-green-800",
    features: ["Author & manage courses", "Create question banks", "Grade assessments", "Monitor trainee progress"],
    link: "/login",
  },
  {
    role: "Administrator",
    color: "border-l-slate-700",
    badge: "bg-slate-100 text-slate-700",
    features: ["User & role management", "Platform governance", "Trainer matching engine", "System analytics"],
    link: "/login",
  },
]

export const HomePage: React.FC = () => {
  return (
    <div className="flex-1">
      {/* ===== HERO ===== */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Institutional Text */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-blue-200 bg-blue-50 text-[#1557A6] text-[12px] font-semibold mb-5">
                <img
                  src="/branding/IMD_logo.png"
                  alt="IMD Emblem"
                  className="h-5 w-auto object-contain"
                />
                Capacity Connect • IMD Digital Capacity Building Portal
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight mb-2">
                CAPACITY CONNECT
                <span className="block text-xl sm:text-2xl text-[#1557A6] font-semibold mt-1">
                  Digital Capacity Building &amp; Learning Management Portal
                </span>
                <span className="block text-sm sm:text-base text-slate-600 font-medium mt-1">
                  India Meteorological Department
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-700 italic font-medium my-3 border-l-2 border-[#1557A6] pl-3 py-0.5">
                "Building meteorological expertise through structured learning, assessment and competency intelligence."
              </p>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-6 max-w-xl">
                A unified institutional platform connecting structured learning, competency evaluation, skill gap diagnostics, and trainer matching for operational meteorological professionals across India.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/login">
                  <Button size="lg" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In to Portal
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Browse Courses
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Authentic IMD Meteorological Imagery */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-slate-100">
                <img
                  src="/images/imd-forecasting-center.jpg"
                  alt="IMD National Weather Forecasting Centre Operations"
                  className="w-full h-72 sm:h-80 object-cover"
                  loading="eager"
                  width="640"
                  height="400"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent p-3 pt-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[12px] font-semibold text-white">IMD Meteorological Centre</div>
                      <div className="text-[10px] text-slate-300">Weather Forecasting &amp; Radar Operations Section</div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-600/90 rounded text-white border border-blue-400/30">
                      24×7 Operations
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-12 pt-10 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {highlights.map((h) => (
              <div key={h.label}>
                <div className="text-lg font-bold text-slate-900">{h.label}</div>
                <div className="text-[12px] text-slate-500 mt-0.5">{h.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CAPABILITIES & LIFECYCLE ===== */}
      <section className="bg-[#F7F9FC] border-b border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="text-xs font-bold text-[#1557A6] uppercase tracking-wider mb-1">Closed-Loop Framework</div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">The Capacity Building Lifecycle</h2>
            <p className="text-[13px] text-slate-500">Six integrated capabilities forming a closed-loop institutional capacity building pipeline.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-200 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded bg-blue-50">
                      <Icon className="h-4 w-4 text-[#1557A6]" />
                    </div>
                    <h3 className="text-[14px] font-semibold text-slate-900">{cap.title}</h3>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-relaxed">{cap.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== ROLE PORTALS ===== */}
      <section className="bg-white border-b border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Three Role Experiences</h2>
            <p className="text-[13px] text-slate-500">Dedicated vertical slices for each institutional user type.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {roles.map((r) => (
              <div key={r.role} className={`bg-white border border-slate-200 border-l-4 ${r.color} rounded-lg p-5`}>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold mb-4 ${r.badge}`}>
                  {r.role}
                </div>
                <ul className="space-y-2 mb-5">
                  {r.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-slate-700">
                      <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={r.link}>
                  <Button size="sm" variant="outline" className="w-full gap-1.5">
                    Enter Portal <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="bg-[#1557A6] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Ready to get started?</h3>
            <p className="text-[13px] text-blue-200">Sign in with your IMD institutional credentials or register a new profile.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/login">
              <Button size="lg" className="bg-white text-[#1557A6] hover:bg-blue-50 gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-blue-300 text-white hover:bg-blue-700 gap-2">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
