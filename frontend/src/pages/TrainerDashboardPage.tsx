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
import { Badge } from "@/components/ui/badge"
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              IMD Faculty & Instructor Operations
            </span>
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
              Live Database Telemetry
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trainer Command Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor curriculum delivery, grade assessments, and supervise operational meteorology trainees.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/trainer/courses">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-semibold">
              <Plus className="h-3.5 w-3.5" /> Author Course
            </Button>
          </Link>
          <Link to="/trainer/assessments">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 font-semibold">
              <ClipboardCheck className="h-3.5 w-3.5" /> Build Assessment
            </Button>
          </Link>
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
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#fff",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" /> Upcoming Deadlines
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
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1"
                  >
                    <span className="font-semibold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {dl.title}
                    </span>
                    <span className="text-[11px] text-slate-500 block">{dl.course_title}</span>
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-0.5">
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
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Live Trainee Activity Stream
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time chronological events across your assigned courses
              </CardDescription>
            </div>
            <Link to="/trainer/performance">
              <Button size="sm" variant="ghost" className="text-xs text-emerald-600 gap-1">
                Full Records <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {stats.recent_activity.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No student activity recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recent_activity.map((act, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{act.title}</span>
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
