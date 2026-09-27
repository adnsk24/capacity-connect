import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Compass,
  Building,
  GraduationCap,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { traineeService } from "@/services/trainee"

export const TraineeDashboardPage: React.FC = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["trainee-dashboard"],
    queryFn: () => traineeService.getDashboard(),
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Dashboard Offline"
        message={error instanceof Error ? error.message : "Failed to load trainee telemetry"}
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Welcome & Meteorological Institutional Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-md">
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dashboard-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dashboard-grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                IMD TRAINEE PORTAL
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5 text-blue-400" />
                {data.user_summary.department || "National Weather Forecasting Centre"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {data.welcome_message}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Active in the India Meteorological Department capacity building network. Track your learning progression, operational competencies, and certified meteorological standards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/courses">
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5">
                <Compass className="h-4 w-4" />
                <span>Browse Courses</span>
              </Button>
            </Link>
            <Link to="/trainee/profile">
              <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-xs font-semibold">
                View Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. Profile Completion Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 flex-1 max-w-md">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Profile Completion
              </span>
              <span className="font-bold text-white font-mono">
                {data.profile_completion_percentage}%
              </span>
            </div>
            <ProgressBar value={data.profile_completion_percentage} size="sm" variant="meteorological" />
          </div>
          {data.profile_completion_percentage < 100 && (
            <Link to="/trainee/profile" className="text-xs text-blue-300 hover:text-white underline underline-offset-4 shrink-0 font-medium">
              Complete your profile for full credentialing →
            </Link>
          )}
        </div>
      </div>

      {/* 3. Real Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Courses Enrolled"
          value={data.courses_enrolled_count}
          subtitle="Active curriculum tracks"
          icon={<BookOpen className="h-5 w-5" />}
          accentColor="blue"
        />
        <StatCard
          title="Courses Completed"
          value={data.courses_completed_count}
          subtitle="Fully certified completions"
          icon={<CheckCircle2 className="h-5 w-5" />}
          accentColor="emerald"
        />
        <StatCard
          title="Average Progress"
          value={`${data.average_progress_percentage}%`}
          subtitle="Across all enrolled courses"
          icon={<TrendingUp className="h-5 w-5" />}
          accentColor="cyan"
        />
        <StatCard
          title="Certifications"
          value={data.certificates.length}
          subtitle="Verified credentials"
          icon={<Award className="h-5 w-5" />}
          accentColor="indigo"
        />
      </div>

      {/* 4. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Recent Learning & In-Progress Tracks */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200/90 dark:border-slate-800">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <span>Recent Learning</span>
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Your ongoing operational courses and syllabus progression
                </p>
              </div>
              <Link to="/trainee/learning">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold flex items-center gap-1">
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              {data.recent_learning.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="h-6 w-6" />}
                  title="No Enrolled Courses Yet"
                  description="You are not enrolled in any operational courses. Browse the IMD course catalogue to get started."
                  actionLabel="Explore Course Catalogue"
                  onAction={() => window.location.assign("/courses")}
                />
              ) : (
                data.recent_learning.map((item) => (
                  <div
                    key={item.enrollment_id}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-300 dark:hover:border-blue-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.code}
                        </span>
                        <StatusBadge status={item.status} />
                        <span className="text-[11px] text-slate-400">· {item.category_name}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span>{item.completed_lessons_count} of {item.total_lessons_count} lessons</span>
                        <span>·</span>
                        <span>{item.progress_percentage}% complete</span>
                      </div>
                      <div className="pt-1 max-w-sm">
                        <ProgressBar value={item.progress_percentage} size="sm" />
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Link to={`/courses/${item.course_id}/learn`}>
                        <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5">
                          <span>Continue</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Assessments (Honest Placeholder) */}
          <Card className="border-slate-200/90 dark:border-slate-800">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-600" />
                <span>Upcoming Assessments</span>
              </CardTitle>
              <p className="text-xs text-slate-500">
                Examination schedule and diagnostic testing
              </p>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center py-6">
                <ClipboardList className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-60" />
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No Assessments Scheduled
                </h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                  Assessments are scheduled upon course completion or cadre evaluation cycles in Phase 4.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Competencies & Verified Credentials */}
        <div className="space-y-6">
          {/* Competency Overview */}
          <Card className="border-slate-200/90 dark:border-slate-800">
            <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span>Competencies</span>
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Evaluated operational proficiencies
                </p>
              </div>
              <Link to="/trainee/competencies">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 font-semibold p-1">
                  Universe →
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              {data.competencies.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No evaluated competencies yet. Enrolling and completing courses unlocks verified proficiencies.
                </p>
              ) : (
                data.competencies.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {comp.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded">
                        Lvl {comp.current_level}/5
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{comp.category}</span>
                      <span>Confidence: {Math.round(comp.confidence_score * 100)}%</span>
                    </div>
                    <ProgressBar
                      value={(comp.current_level / 5) * 100}
                      size="sm"
                      variant="meteorological"
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Certificates Summary */}
          <Card className="border-slate-200/90 dark:border-slate-800">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" />
                <span>Certificates</span>
              </CardTitle>
              <p className="text-xs text-slate-500">
                Official accreditation & verified credentials
              </p>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2.5">
              {data.certificates.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  <Award className="h-6 w-6 text-slate-300 mx-auto mb-1 opacity-60" />
                  <span>Complete courses to earn official IMD certificates.</span>
                </div>
              ) : (
                data.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {cert.title}
                      </h5>
                      <StatusBadge status={cert.verification_status} className="text-[9px] py-0 px-1" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">
                      ID: {cert.credential_id || "IMD-VERIFIED"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Issued: {new Date(cert.issue_date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
