import React from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  ShieldCheck,
  Activity,
  Compass,
  Sparkles,
  BookOpen,
  Network,
  Target,
  BarChart3,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const HomePage: React.FC = () => {
  const lifecycleStages = [
    {
      title: "1. Structured Learning",
      desc: "Comprehensive syllabi mapped directly to IMD operational protocols, radar systems, and NWP charts.",
      icon: BookOpen,
      tag: "Curriculum",
    },
    {
      title: "2. Rigorous Assessment",
      desc: "Timed MCQ examination engine with automated grading and server-side anti-tamper security.",
      icon: Award,
      tag: "Verification",
    },
    {
      title: "3. Competency Mapping",
      desc: "Multi-stream evidence engine evaluating capabilities across exams, course completion, skills, and field tenure.",
      icon: Network,
      tag: "Intelligence",
    },
    {
      title: "4. Skill Gap Diagnostics",
      desc: "Prioritized deficiency detection comparing demonstrated levels against mission-critical operational benchmarks.",
      icon: TrendingUp,
      tag: "Audit",
    },
    {
      title: "5. Targeted Recommendations",
      desc: "Personalized syllabus suggestions targeting identified open gaps with explainable 'Why Recommended' rationale.",
      icon: Target,
      tag: "Optimization",
    },
    {
      title: "6. Faculty Matching",
      desc: "Algorithmic 6-dimension trainer candidate scoring to support transparent institutional faculty nomination.",
      icon: Users,
      tag: "Governance",
    },
  ]

  const featurePillars = [
    {
      title: "Explainable Competency Engine",
      description:
        "Deterministic 0.0 to 5.0 level scoring aggregating 6 evidence streams without black-box AI APIs or commercial fees.",
      badge: "100% Deterministic",
      icon: Compass,
      color: "text-blue-500",
    },
    {
      title: "3D Competency Universe",
      description:
        "Interactive orbital constellation rendered in Three.js and React Three Fiber with code-splitting and accessible 2D fallback.",
      badge: "Three.js / WebGL",
      icon: Sparkles,
      color: "text-sky-400",
    },
    {
      title: "Training Readiness Index",
      description:
        "Transparent mathematical readiness score indicating capability alignment for operational weather forecasting roles.",
      badge: "Transparent Formula",
      icon: BarChart3,
      color: "text-emerald-500",
    },
    {
      title: "Institutional RBAC & Privacy",
      description:
        "Enterprise-grade security using Argon2id password hashing, JWT session rotation, and strictly isolated trainee data.",
      badge: "Zero-Trust RBAC",
      icon: ShieldCheck,
      color: "text-indigo-400",
    },
  ]

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Flagship Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-8 sm:p-14 text-white shadow-2xl">
          {/* Subtle meteorological constellation background glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md border border-blue-400/30 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              <span>Capacity Connect • IMD Digital Capacity Building Portal</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Evidence-Based <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300">Competency Intelligence</span> for Operational Meteorology
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Capacity Connect connects learning management, timed assessments, multi-source competency evaluations, diagnostic skill gap analysis, and faculty matching into a unified, ₹0-cost institutional portal for the India Meteorological Department.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link to="/courses">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/30 cursor-pointer">
                  <BookOpen className="h-4 w-4 mr-2" /> Explore Course Catalogue
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-white cursor-pointer">
                  Sign In to Portal <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/health">
                <Button size="lg" variant="ghost" className="text-slate-400 hover:text-white cursor-pointer">
                  <Activity className="h-4 w-4 mr-1 text-emerald-400" /> System Health
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Pillars Grid */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Core Architectural Pillars
              </h2>
              <p className="text-xs text-slate-500">
                Deterministic algorithms and open-source standards driving nationwide meteorological readiness.
              </p>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50/50 self-start sm:self-auto text-xs">
              ₹0 Operational Cost
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {featurePillars.map((pillar, idx) => {
              const Icon = pillar.icon
              return (
                <Card key={idx} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all">
                  <CardHeader className="p-5 pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                        <Icon className={`h-5 w-5 ${pillar.color}`} />
                      </div>
                      <Badge className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0">
                        {pillar.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                      {pillar.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* 6-Stage Capacity Building Pipeline */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 text-xs">
              Closed-Loop Capability Pipeline
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              The Capacity Building Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Transforming syllabus progression into verifiable institutional readiness and transparent faculty assignments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lifecycleStages.map((stage, idx) => {
              const Icon = stage.icon
              return (
                <Card key={idx} className="border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 transition-all shadow-sm">
                  <CardHeader className="flex flex-row items-center gap-3.5 pb-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {stage.tag}
                      </span>
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">{stage.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {stage.desc}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Demonstration Portals Overview */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-slate-100 via-blue-50/40 to-slate-100 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Three Integrated Role Experiences
              </h3>
              <p className="text-xs text-slate-500">
                Experience the dedicated vertical slices for <strong>Trainees</strong> (learning, testing, competency universe), <strong>Trainers</strong> (course management, question banks, grading), and <strong>Administrators</strong> (governance, telemetry, faculty recommendations).
              </p>
            </div>
            <Link to="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer shrink-0">
                <span>Launch Demo Environment</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
