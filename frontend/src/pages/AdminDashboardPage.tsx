import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  Users,
  BookOpen,
  ClipboardCheck,
  UserCheck,
  Activity,
  Layers,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { adminService } from "@/services/admin"

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminService.getDashboard(),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Aggregating institutional governance telemetry...</p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <h3 className="font-semibold text-red-900">Governance Telemetry Unavailable</h3>
          <p className="text-sm text-red-700 mt-1">{(error as Error)?.message || "Failed to load telemetry."}</p>
        </CardContent>
      </Card>
    )
  }

  const roleChartData = Object.entries(stats.users_by_role || {}).map(([role, count]) => ({
    role,
    count,
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              IMD Institutional Administration
            </span>
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
              System Wide Metrics
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Administrative Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centralized portal monitoring, user approvals, course oversight, and examination integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/users">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 font-semibold">
              <UserCheck className="h-3.5 w-3.5" /> Manage Users
            </Button>
          </Link>
          <Link to="/admin/courses">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 font-semibold">
              <BookOpen className="h-3.5 w-3.5" /> Course Audit
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Total Users</span>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_users}</p>
            <p className="text-[11px] text-slate-400">Platform accounts</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Pending</span>
              <UserCheck className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending_users}</p>
            <p className="text-[11px] text-slate-400">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Active Trainees</span>
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.active_trainees}</p>
            <p className="text-[11px] text-slate-400">Verified learners</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Courses</span>
              <BookOpen className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_courses}</p>
            <p className="text-[11px] text-slate-400">{stats.published_courses} published</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Enrollments</span>
              <Layers className="h-4 w-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_enrollments}</p>
            <p className="text-[11px] text-slate-400">Total course seats</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span>Exams Taken</span>
              <ClipboardCheck className="h-4 w-4 text-teal-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.assessment_attempts}</p>
            <p className="text-[11px] text-slate-400">{stats.overall_completion_rate}% pass rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution Chart */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Platform Users by Role
            </CardTitle>
            <CardDescription className="text-xs">Distribution across Trainees, Trainers, and Administrators</CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="role" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      color: "#fff",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Category Breakdown */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Course Categories Distribution
            </CardTitle>
            <CardDescription className="text-xs">Offerings per meteorological specialization taxonomy</CardDescription>
          </CardHeader>

          <CardContent className="pt-3">
            <div className="space-y-3">
              {stats.category_distribution.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-28 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${Math.min(100, (cat.count / (stats.total_courses || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white min-w-6 text-right">
                      {cat.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Platform Activity Stream */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
            System Event Audit Trail
          </CardTitle>
          <CardDescription className="text-xs">
            Chronological log of user registrations, course enrollments, and examination submissions
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {stats.recent_activity.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No platform events logged yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recent_activity.map((act, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
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
