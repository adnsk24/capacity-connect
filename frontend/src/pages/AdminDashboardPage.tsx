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
} from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { adminService } from "@/services/admin"

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminService.getDashboard(),
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error || !stats) {
    return (
      <ErrorState
        title="Governance Telemetry Unavailable"
        message="Could not aggregate platform telemetry. Please check server connectivity."
        onRetry={() => refetch()}
      />
    )
  }

  const roleChartData = Object.entries(stats.users_by_role || {}).map(([role, count]) => ({
    role,
    count,
  }))

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="pb-5 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#1557A6] border border-blue-200 mb-1.5">
              <img src="/branding/imd-emblem.svg" alt="IMD" className="w-3.5 h-3.5 object-contain" />
              India Meteorological Department · Administration
            </div>
            <h1 className="text-[22px] font-bold text-slate-900">Administrative Governance</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Platform-wide metrics, user management, course oversight, and assessment governance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/admin/users">
              <Button size="sm" className="gap-1.5">
                <UserCheck className="h-3.5 w-3.5" /> Manage Users
              </Button>
            </Link>
            <Link to="/admin/courses">
              <Button size="sm" variant="outline" className="gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Courses
              </Button>
            </Link>
          </div>
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
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">
              Platform Users by Role
            </CardTitle>
            <CardDescription className="text-xs">Distribution across Trainees, Trainers, and Administrators</CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="role" tick={{ fontSize: 12, fill: "#64748b" }} stroke="#cbd5e1" />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} stroke="#cbd5e1" allowDecimals={false} />
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
                  <Bar dataKey="count" fill="#1557A6" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Category Breakdown */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-slate-900">
              Course Categories Distribution
            </CardTitle>
            <CardDescription className="text-xs">Offerings per meteorological specialization taxonomy</CardDescription>
          </CardHeader>

          <CardContent className="pt-3">
            <div className="space-y-3">
              {stats.category_distribution.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-28 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#1557A6] rounded-full"
                        style={{ width: `${Math.min(100, (cat.count / (stats.total_courses || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="font-bold text-slate-900 min-w-6 text-right">
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
      <Card className="border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">
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
            <div className="divide-y divide-slate-100">
              {stats.recent_activity.map((act, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#1557A6] shrink-0" />
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
