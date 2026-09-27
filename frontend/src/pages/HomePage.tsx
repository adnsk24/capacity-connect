import React from "react"
import { Link } from "react-router-dom"
import {
  GraduationCap,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Users,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Compass,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"

export const HomePage: React.FC = () => {
  const { currentRole } = useAppStore()

  const lifecycleStages = [
    { title: "Targeted Training", desc: "Curated learning modules & resources", icon: GraduationCap },
    { title: "Rigorous Assessment", desc: "MCQ & rubric-based scenario evaluation", icon: Award },
    { title: "Certified Milestone", desc: "Verifiable credentials & completion proofs", icon: ShieldCheck },
    { title: "Competency Mapping", desc: "Framework-driven multi-dimensional tagging", icon: Compass },
    { title: "Skill Gap Analysis", desc: "Real-time deficit detection across cohorts", icon: TrendingUp },
    { title: "Recommendation", desc: "Algorithmic trainer & path matching", icon: Cpu },
  ]

  const roleDetails = {
    Trainee: {
      tag: "Active Preview Role: Trainee",
      headline: "Personalized Upskilling & Verified Competencies",
      description:
        "Trainees will access cohort courses, complete timed assessments, track skill readiness radars, and follow adaptive learning paths.",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    },
    Trainer: {
      tag: "Active Preview Role: Trainer",
      headline: "Curriculum Design & Cohort Evaluation",
      description:
        "Trainers author courses, publish multimedia learning assets, build assessment banks, review trainee outcomes, and receive demand recommendations.",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    },
    Admin: {
      tag: "Active Preview Role: Admin",
      headline: "Enterprise Governance & Capacity Analytics",
      description:
        "Platform administrators govern taxonomy, manage institutional roles, inspect system health, and review cross-organizational readiness indices.",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
    },
  }

  const roleInfo = roleDetails[currentRole]

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 backdrop-blur-sm border border-blue-400/30">
              <Layers className="h-3.5 w-3.5" />
              <span>Phase 0: Project Foundation & Architecture Active</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Bridging Training to Measurable <span className="text-blue-400">Organizational Readiness</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Capacity Connect is an enterprise capacity-building portal that turns training into verifiable
              competency evidence, automated skill gap diagnostics, and actionable trainer recommendations.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link to="/health">
                <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-md">
                  <Activity className="h-4 w-4 mr-1" /> Check Backend Health
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white">
                  Access Portal Shell <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Dynamic Role Simulation Preview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Role Context Simulator</h2>
              <p className="text-sm text-slate-500">Previewing portal views for the three core platform roles.</p>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${roleInfo.badgeColor}`}>
              {roleInfo.tag}
            </span>
          </div>

          <Card className="border-blue-100 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle>{roleInfo.headline}</CardTitle>
              </div>
              <CardDescription>{roleInfo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Foundation Status</span>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" /> Architectural Shell Ready
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Phase 0 complete; auth & data logic scheduled for Phase 1-2.</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Database Target</span>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
                    <Layers className="h-4 w-4" /> PostgreSQL / Supabase
                  </div>
                  <p className="mt-1 text-xs text-slate-500">SQLAlchemy 2.0 & Alembic migration pipeline configured.</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">FastAPI Gateway</span>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
                    <Activity className="h-4 w-4" /> /api/v1/health
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Versioned REST structure active with CORS and OpenAPI docs.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Capacity Building Lifecycle Pipeline */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              The Capacity Building Lifecycle
            </h2>
            <p className="text-sm text-slate-500">
              How Capacity Connect transforms simple course completions into institutional capability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {lifecycleStages.map((stage, idx) => {
              const Icon = stage.icon
              return (
                <Card key={idx} className="hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Step {idx + 1}</span>
                      <CardTitle className="text-base">{stage.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{stage.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
