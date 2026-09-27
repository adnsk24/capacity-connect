import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  BookOpen,
  Users,
  Award,
  ClipboardCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  Activity,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { trainerService } from "@/services/trainer"

export const TrainerDashboardPage: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["trainer-dashboard"],
    queryFn: () => trainerService.getDashboard(),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Aggregating trainer telemetry from database...</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <h3 className="font-semibold text-red-900">Dashboard Unavailable</h3>
          <p className="text-sm text-red-700 mt-1">{(error as Error)?.message || "Failed to load statistics."}</p>
        </CardContent>
      </Card>
    )
  }

  // Chart data
  const chartData = [
    { name: "Avg Score (%)", value: stats.average_assessment_score },
    { name: "Completion (%)", value: stats.completion_rate },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="pb-5 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1.5">
              <img src="/branding/imd-emblem.svg" alt="IMD" className="w-3.5 h-3.5 object-contain" />
              India Meteorological Department · Faculty Portal
            </div>
            <h1 className="text-[22px] font-bold text-slate-900">Trainer Command Center</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Monitor curriculum delivery, grade assessments, and track trainee progress.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/trainer/courses">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> New Course
              </Button>
            </Link>
            <Link to="/trainer/assessments">
              <Button size="sm" variant="outline" className="gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5" /> Assessment
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Courses</span>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.courses_managed}</p>
            <p className="text-[11px] text-slate-400">Under management</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Trainees</span>
              <Users className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.enrolled_trainees}</p>
            <p className="text-[11px] text-slate-400">Total enrolled</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Active</span>
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active_learners}</p>
            <p className="text-[11px] text-slate-400">Progressing now</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Assessments</span>
              <ClipboardCheck className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.assessments_count}</p>
            <p className="text-[11px] text-slate-400">Active exams</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Avg Score</span>
              <Award className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.average_assessment_score}%</p>
            <p className="text-[11px] text-slate-400">All submissions</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Completion</span>
              <TrendingUp className="h-4 w-4 text-teal-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completion_rate}%</p>
            <p className="text-[11px] text-slate-400">Graduation rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Deadlines Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metric Chart */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">
              Institutional Performance Benchmarks
            </CardTitle>
            <CardDescription className="text-xs">
              Aggregate student score and syllabus completion metrics
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} stroke="#cbd5e1" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#64748b" }} stroke="#cbd5e1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      color: "#1e293b",
                      borderRadius: "6px",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
                    }}
                  />
                  <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#1557A6]" /> Upcoming Deadlines
            </CardTitle>
            <CardDescription className="text-xs">Assessment due dates approaching</CardDescription>
          </CardHeader>

          <CardContent className="pt-3">
            {stats.upcoming_deadlines.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No imminent deadlines configured.</p>
            ) : (
              <div className="space-y-3">
                {stats.upcoming_deadlines.map((dl) => (
                  <div
                    key={dl.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1"
                  >
                    <span className="font-semibold text-xs text-slate-900 line-clamp-1">
                      {dl.title}
                    </span>
                    <span className="text-[11px] text-slate-500 block">{dl.course_title}</span>
                    <div className="flex items-center gap-1 text-[11px] text-amber-700 font-medium pt-0.5">
                      <Clock className="h-3 w-3" />
                      Due{" "}
                      {dl.due_at
                        ? new Date(dl.due_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "No deadline"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Live Trainee Activity Stream
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time chronological events across your assigned courses
              </CardDescription>
            </div>
            <Link to="/trainer/performance">
              <Button size="sm" variant="ghost" className="text-xs text-emerald-700 hover:text-emerald-800 gap-1">
                Full Records <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {stats.recent_activity.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No student activity recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recent_activity.map((act, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-800">{act.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {act.timestamp
                      ? new Date(act.timestamp).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Recently"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
