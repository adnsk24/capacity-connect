import React, { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Clock,
  BookOpen,
  User as UserIcon,
  CheckCircle2,
  ArrowRight,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/loading-skeleton"
import { coursesService } from "@/services/courses"
import { useAuthStore } from "@/store/useAuthStore"

export const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  const { data: course, isLoading, error, refetch } = useQuery({
    queryKey: ["course-detail", courseId],
    queryFn: () => coursesService.getCourseDetails(courseId!),
    enabled: !!courseId,
  })

  const enrollMutation = useMutation({
    mutationFn: () => coursesService.enrollInCourse(courseId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] })
      queryClient.invalidateQueries({ queryKey: ["trainee-dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["trainee-learning"] })
      navigate(`/courses/${courseId}/learn`)
    },
    onError: (err: Error) => {
      setEnrollError(err.message || "Failed to enroll in course.")
    },
  })

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-6">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 md:col-span-2 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <ErrorState
        title="Course Not Found"
        message={error instanceof Error ? error.message : "The requested course could not be retrieved."}
        onRetry={() => refetch()}
      />
    )
  }

  const breadcrumbItems = [
    { label: "Catalogue", href: "/courses" },
    { label: course.category.name, href: `/courses?category_id=${course.category.id}` },
    { label: course.title },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {course.code}
            </span>
            <Badge className="bg-white/10 text-white border-white/20 text-xs">
              {course.category.name}
            </Badge>
            <StatusBadge status={course.difficulty_level} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {course.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-400" />
              <span>{course.duration_hours} hours total</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>{course.modules.length} modules · {course.total_lessons_count} lessons</span>
            </div>
            {course.trainer && (
              <div className="flex items-center gap-1.5">
                <UserIcon className="h-4 w-4 text-emerald-400" />
                <span>Instructor: {course.trainer.first_name} {course.trainer.last_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enrollment Status Notice / Action Bar */}
      {enrollError && (
        <div className="p-3 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{enrollError}</span>
        </div>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Curriculum & Objectives */}
        <div className="lg:col-span-2 space-y-6">
          {/* Syllabus / Curriculum */}
          <Card className="border-slate-200/90 dark:border-slate-800">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>Curriculum & Lessons</span>
                </span>
                <span className="text-xs font-normal text-slate-500">
                  {course.modules.length} Modules · {course.total_lessons_count} Lessons
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3">
              {course.modules.map((module, mIdx) => {
                const isExpanded = expandedModules[module.id] ?? true
                return (
                  <div
                    key={module.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900"
                  >
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-semibold uppercase text-blue-600 tracking-wider">
                          Module {mIdx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                          {module.title}
                        </h4>
                        {module.description && (
                          <p className="text-[11px] text-slate-500 leading-tight">
                            {module.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-xs">{module.lessons.length} lessons</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-2 space-y-1">
                        {module.lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson.id}
                            className="p-3 rounded-lg flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.is_completed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                              ) : (
                                <span className="w-4 h-4 rounded-full border border-slate-300 text-[10px] font-mono flex items-center justify-center text-slate-400">
                                  {lIdx + 1}
                                </span>
                              )}
                              <div>
                                <span className={`font-medium ${lesson.is_completed ? "text-slate-500 line-through" : "text-slate-800 dark:text-slate-200"}`}>
                                  {lesson.title}
                                </span>
                                {lesson.description && (
                                  <p className="text-[10px] text-slate-400 line-clamp-1">
                                    {lesson.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-[11px] font-mono text-slate-400 shrink-0">
                              {lesson.duration_minutes} min
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Objectives and Prerequisites */}
          {(course.objectives || course.prerequisites) && (
            <Card className="border-slate-200/90 dark:border-slate-800">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold">Objectives & Prerequisites</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4 text-xs">
                {course.objectives && (
                  <div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      Learning Objectives
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {course.objectives}
                    </p>
                  </div>
                )}
                {course.prerequisites && (
                  <div>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      Target Audience & Prerequisites
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {course.prerequisites}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Learning Resources */}
          {course.resources.length > 0 && (
            <Card className="border-slate-200/90 dark:border-slate-800">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  <span>Downloadable Reference Material</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-2">
                {course.resources.map((res) => (
                  <div
                    key={res.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-red-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {res.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {res.resource_type} · {res.file_size_bytes ? `${(res.file_size_bytes / 1024 / 1024).toFixed(1)} MB` : "Document"}
                        </div>
                      </div>
                    </div>
                    {res.is_downloadable && (
                      <a
                        href={res.storage_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>View</span>
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (1 span): Enrollment Card & Competencies */}
        <div className="space-y-6">
          {/* Enrollment Action Box */}
          <Card className="border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 shadow-md">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold">Course Access</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              {course.is_enrolled ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>You are enrolled in this course</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      {course.completed_lessons_count} of {course.total_lessons_count} lessons completed ({course.progress_percentage || 0}%)
                    </p>
                  </div>
                  <ProgressBar value={course.progress_percentage || 0} size="md" variant="meteorological" />
                  <Link to={`/courses/${course.id}/learn`} className="block w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 py-2.5">
                      <span>Continue Learning</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ) : isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Enroll now to unlock lesson modules, operational datasets, and receive certified IMD competency credits upon completion.
                  </p>
                  <Button
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>{enrollMutation.isPending ? "Enrolling..." : "Enroll in Course"}</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Please log in with your IMD trainee credentials to enroll in this course.
                  </p>
                  <Link to="/login" className="block w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5">
                      Sign In to Enroll
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competency Mapping Box */}
          {course.competencies.length > 0 && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Competencies Acquired</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-2.5 text-xs">
                {course.competencies.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {comp.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                        Target Lvl {comp.target_level}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Discipline: {comp.category} · Weight: {Math.round(comp.contribution_weight * 100)}%
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Instructor Box */}
          {course.trainer && (
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold">Lead Instructor</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-2 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {course.trainer.first_name?.[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">
                      {course.trainer.first_name} {course.trainer.last_name}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      {course.trainer.designation || "Senior Meteorologist"}
                    </p>
                  </div>
                </div>
                {course.trainer.specialization && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                    Specialization: {course.trainer.specialization}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
