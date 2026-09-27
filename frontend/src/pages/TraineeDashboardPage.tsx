import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowRight,
  ClipboardList,
  Network,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { traineeService } from "@/services/trainee"
import { getCourseThumbnail } from "@/lib/courseImages"

export const TraineeDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["trainee-dashboard"],
    queryFn: () => traineeService.getDashboard(),
  })

  if (isLoading) return <DashboardSkeleton />

  if (error || !data) {
    return (
      <ErrorState
        title="Dashboard Unavailable"
        message={error instanceof Error ? error.message : "Failed to load dashboard data."}
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Hero Area */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-[0_1px_3px_0_rgb(0,0,0,0.06)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: Content (58-65%) */}
          <div className="md:col-span-7 lg:col-span-7 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#1557A6] border border-blue-200 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1557A6]" />
                India Meteorological Department · Capacity Portal
              </div>
              <h1 className="text-[22px] sm:text-2xl font-bold text-slate-900 leading-tight">
                {data.welcome_message}
              </h1>
              <p className="text-[13px] text-slate-500 mt-1 max-w-xl">
                Continue your professional learning and competency development.
                {data.user_summary.department && (
                  <span className="ml-1 text-slate-400">· {data.user_summary.department}</span>
                )}
              </p>
            </div>

            {/* Profile completion bar */}
            {data.profile_completion_percentage < 100 && (
              <div className="p-3 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-[12px] font-medium mb-1.5">
                    <span className="text-amber-800">Profile Completion</span>
                    <span className="font-bold text-amber-900">{data.profile_completion_percentage}%</span>
                  </div>
                  <ProgressBar value={data.profile_completion_percentage} size="sm" variant="warning" />
                </div>
                <Link to="/trainee/profile" className="text-[12px] font-semibold text-amber-700 hover:underline flex-shrink-0">
                  Complete Profile →
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Link to="/courses">
                <Button size="sm" className="gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Browse Courses
                </Button>
              </Link>
              <Link to="/trainee/profile">
                <Button size="sm" variant="outline">
                  View Profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Authentic Meteorological Observation Facility Image (35-42%) */}
          <div className="md:col-span-5 lg:col-span-5">
            <div className="relative overflow-hidden rounded-lg border border-slate-200 shadow-xs h-48 sm:h-52 w-full bg-slate-100">
              <img
                src="/images/imd-radar-facility.jpg"
                alt="IMD Doppler Weather Radar Station"
                className="w-full h-full object-cover"
                loading="eager"
                width="640"
                height="360"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent p-2.5 pt-6 flex items-center justify-between text-white">
                <div className="text-[11px] font-medium truncate">IMD Doppler Weather Radar Station</div>
                <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 bg-emerald-600/90 rounded text-white flex-shrink-0">
                  Active Station
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Courses Enrolled"
          value={data.courses_enrolled_count}
          subtitle="Active tracks"
          icon={<BookOpen className="h-4 w-4" />}
          accentColor="blue"
        />
        <StatCard
          title="Completed"
          value={data.courses_completed_count}
          subtitle="Certified completions"
          icon={<CheckCircle2 className="h-4 w-4" />}
          accentColor="emerald"
        />
        <StatCard
          title="Avg. Progress"
          value={`${data.average_progress_percentage}%`}
          subtitle="Across enrolled"
          icon={<TrendingUp className="h-4 w-4" />}
          accentColor="indigo"
        />
        <StatCard
          title="Certificates"
          value={data.certificates.length}
          subtitle="Verified credentials"
          icon={<Award className="h-4 w-4" />}
          accentColor="amber"
        />
      </div>

      {/* Main 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: 2/3 width */}
        <div className="lg:col-span-2 space-y-5">
          {/* Recent Learning */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-[0_1px_3px_0_rgb(0,0,0,0.06)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-[14px] font-semibold text-slate-900">My Learning</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">Ongoing courses and progression</p>
              </div>
              <Link to="/trainee/learning">
                <Button variant="ghost" size="sm" className="gap-1 text-[12px] text-[#1557A6]">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {data.recent_learning.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="h-6 w-6" />}
                  title="No Enrolled Courses"
                  description="Browse the IMD course catalogue to get started."
                  actionLabel="Explore Courses"
                  onAction={() => navigate("/courses")}
                />
              ) : (
                data.recent_learning.map((item) => (
                  <div
                    key={item.enrollment_id}
                    className="p-4 rounded-md border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-200 transition-all flex flex-col sm:flex-row gap-3.5 items-start sm:items-center"
                  >
                    <div className="w-16 h-16 shrink-0 rounded overflow-hidden border border-slate-200 bg-slate-100 hidden sm:block">
                      <img
                        src={getCourseThumbnail(item.title, item.category_name)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        width="64"
                        height="64"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-1 w-full min-w-0">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                            {item.code}
                          </span>
                          <StatusBadge status={item.status} />
                          <span className="text-[11px] text-slate-400">{item.category_name}</span>
                        </div>
                        <h4 className="text-[13px] font-semibold text-slate-900 truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 text-[12px] text-slate-500">
                          <span>{item.completed_lessons_count} of {item.total_lessons_count} lessons</span>
                          <span>·</span>
                          <span>{item.progress_percentage}% complete</span>
                        </div>
                        <ProgressBar value={item.progress_percentage} size="sm" />
                      </div>
                      <Link to={`/courses/${item.course_id}/learn`} className="flex-shrink-0">
                        <Button size="sm" className="gap-1.5 text-[12px]">
                          Continue <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Assessments */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-[0_1px_3px_0_rgb(0,0,0,0.06)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-[14px] font-semibold text-slate-900">Assessments</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">Available and pending evaluations</p>
              </div>
              <Link to="/trainee/assessments">
                <Button variant="ghost" size="sm" className="gap-1 text-[12px] text-[#1557A6]">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-center py-8 text-center">
                <div>
                  <ClipboardList className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-[13px] font-medium text-slate-600">View your assessments</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">Timed MCQs and graded evaluations.</p>
                  <Link to="/trainee/assessments" className="mt-3 inline-block">
                    <Button size="sm" variant="outline" className="mt-2 gap-1.5">
                      Go to Assessments <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: 1/3 width */}
        <div className="space-y-5">
          {/* Competencies */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-[0_1px_3px_0_rgb(0,0,0,0.06)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-[14px] font-semibold text-slate-900">Competencies</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">Evaluated proficiencies</p>
              </div>
              <Link to="/trainee/competencies">
                <Button variant="ghost" size="sm" className="text-[12px] text-[#1557A6] gap-1">
                  Full View <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {data.competencies.length === 0 ? (
                <div className="text-center py-4">
                  <Network className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-[12px] text-slate-500">Complete courses to build competency scores.</p>
                </div>
              ) : (
                data.competencies.slice(0, 4).map((comp) => (
                  <div key={comp.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-slate-800 truncate max-w-[70%]">{comp.name}</span>
                      <span className="text-[11px] font-semibold text-[#1557A6] bg-blue-50 px-1.5 py-0.5 rounded">
                        L{comp.current_level}/5
                      </span>
                    </div>
                    <ProgressBar value={(comp.current_level / 5) * 100} size="sm" />
                    <div className="text-[11px] text-slate-400">{comp.category}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-[0_1px_3px_0_rgb(0,0,0,0.06)]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-[14px] font-semibold text-slate-900">Certificates</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">Issued credentials</p>
              </div>
              <Link to="/trainee/certificates">
                <Button variant="ghost" size="sm" className="text-[12px] text-[#1557A6] gap-1">
                  View <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="p-5 space-y-2">
              {data.certificates.length === 0 ? (
                <div className="text-center py-4">
                  <Award className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-[12px] text-slate-500">Complete courses to earn certificates.</p>
                </div>
              ) : (
                data.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-3 rounded-md border border-slate-200 bg-green-50 space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-[12px] font-semibold text-slate-800 line-clamp-1">{cert.title}</h5>
                      <StatusBadge status={cert.verification_status} className="text-[9px]" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono truncate">
                      {cert.credential_id || "IMD-VERIFIED"}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Issued: {new Date(cert.issue_date).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
