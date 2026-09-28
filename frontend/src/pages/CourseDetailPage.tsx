import React, { useState } from "react"
import { useParams, Link, useNavigate, useLocation } from "react-router-dom"
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
  Star,
  MessageSquare,
  Send,
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
import { feedbackService } from "@/services/feedback"
import { useAuthStore } from "@/store/useAuthStore"
import { getCourseThumbnail, getCourseThumbnailAlt } from "@/lib/courseImages"

export const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

  // Feedback State & Query
  const [feedbackRating, setFeedbackRating] = useState<number>(5)
  const [feedbackComment, setFeedbackComment] = useState<string>("")
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false)

  const { data: feedbackData, refetch: refetchFeedback } = useQuery({
    queryKey: ["course-feedback", courseId],
    queryFn: () => feedbackService.getCourseFeedback(courseId!),
    enabled: !!courseId,
  })

  const feedbackMutation = useMutation({
    mutationFn: () =>
      feedbackService.submitCourseFeedback(courseId!, {
        course_rating: feedbackRating,
        trainer_rating: feedbackRating,
        content_rating: feedbackRating,
        comments: feedbackComment,
      }),
    onSuccess: () => {
      setFeedbackSuccess(true)
      setFeedbackComment("")
      refetchFeedback()
    },
  })

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

  const isTrainee = location.pathname.startsWith("/trainee")
  const catalogueUrl = isTrainee ? "/trainee/courses" : "/courses"
  const catalogueLabel = isTrainee ? "Course Catalogue" : "Catalogue"

  const breadcrumbItems = [
    { label: catalogueLabel, href: catalogueUrl },
    {
      label: course.category?.name || "General Meteorology",
      href: course.category?.id ? `${catalogueUrl}?category_id=${course.category.id}` : catalogueUrl,
    },
    { label: course.title },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero Banner */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Details (65-70%) */}
          <div className="md:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#1557A6] border border-blue-200">
                {course.code}
              </span>
              <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">
                {course.category.name}
              </Badge>
              <StatusBadge status={course.difficulty_level} />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-500 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#1557A6]" />
                <span>{course.duration_hours} hours total</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-[#1557A6]" />
                <span>{course.modules.length} modules · {course.total_lessons_count} lessons</span>
              </div>
              {course.trainer && (
                <div className="flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4 text-emerald-700" />
                  <span>Instructor: {course.trainer.first_name} {course.trainer.last_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Authentic Course Thumbnail (30-35%) */}
          <div className="md:col-span-4">
            <div className="relative overflow-hidden rounded-lg border border-slate-200 shadow-2xs h-40 sm:h-44 w-full bg-slate-100">
              <img
                src={getCourseThumbnail(course.title, course.category?.name)}
                alt={getCourseThumbnailAlt(course.title)}
                className="w-full h-full object-cover"
                loading="eager"
                width="360"
                height="220"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-2 text-white text-[10px] font-medium flex items-center justify-between">
                <span>IMD Operational Syllabus</span>
                <span className="font-mono text-[9px] bg-slate-800/80 px-1 py-0.5 rounded">{course.category.code}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Status Notice / Action Bar */}
      {enrollError && (
        <div className="p-3 rounded-md bg-red-50 text-red-800 border border-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{enrollError}</span>
        </div>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Curriculum & Objectives */}
        <div className="lg:col-span-2 space-y-6">
          {/* Syllabus / Curriculum */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#1557A6]" />
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
                    className="border border-slate-200 rounded-lg overflow-hidden bg-white"
                  >
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-semibold uppercase text-[#1557A6] tracking-wider">
                          Module {mIdx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
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
                      <div className="divide-y divide-slate-100 bg-slate-50/60 p-2 space-y-1">
                        {module.lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson.id}
                            className="p-3 rounded-md flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.is_completed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              ) : (
                                <span className="w-4 h-4 rounded-full border border-slate-300 text-[10px] font-mono flex items-center justify-center text-slate-400">
                                  {lIdx + 1}
                                </span>
                              )}
                              <div>
                                <span className={`font-medium ${lesson.is_completed ? "text-slate-500 line-through" : "text-slate-800"}`}>
                                  {lesson.title}
                                </span>
                                {lesson.description && (
                                  <p className="text-[10px] text-slate-500 line-clamp-1">
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
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold text-slate-900">Objectives & Prerequisites</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4 text-xs">
                {course.objectives && (
                  <div>
                    <h5 className="font-semibold text-slate-800 mb-1">
                      Learning Objectives
                    </h5>
                    <p className="text-slate-600 leading-relaxed">
                      {course.objectives}
                    </p>
                  </div>
                )}
                {course.prerequisites && (
                  <div>
                    <h5 className="font-semibold text-slate-800 mb-1">
                      Target Audience & Prerequisites
                    </h5>
                    <p className="text-slate-600 leading-relaxed">
                      {course.prerequisites}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Learning Resources */}
          {course.resources.length > 0 && (
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <FileText className="h-5 w-5 text-[#1557A6]" />
                  <span>Downloadable Reference Material</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-2">
                {course.resources.map((res) => (
                  <div
                    key={res.id}
                    className="p-3 rounded-md border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-[#1557A6] shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-800">
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
                        className="text-xs font-semibold text-[#1557A6] hover:underline flex items-center gap-1"
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

          {/* Course Feedback & Evaluation System */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
                  <span>Course & Instructor Evaluations</span>
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span className="text-amber-600 font-bold">{feedbackData?.average_course_rating.toFixed(1) || "5.0"}</span>
                  <span className="text-slate-400">/ 5.0</span>
                  <span className="text-slate-400 text-[11px]">({feedbackData?.feedback_count || 0} reviews)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              {/* If enrolled, allow submitting feedback */}
              {course.is_enrolled && (
                <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-[#1557A6]" />
                      <span>Submit Your Evaluation</span>
                    </span>
                    {/* Star selector */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="cursor-pointer focus:outline-none"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              star <= feedbackRating
                                ? "text-amber-500 fill-amber-400"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share your feedback on course materials, radar exercises, or instructor delivery..."
                      className="flex-1 px-3 py-2 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                    />
                    <Button
                      size="sm"
                      onClick={() => feedbackMutation.mutate()}
                      disabled={feedbackMutation.isPending || !feedbackComment.trim()}
                      className="text-xs px-3 cursor-pointer shrink-0"
                    >
                      <Send className="h-3.5 w-3.5 mr-1" />
                      <span>Submit</span>
                    </Button>
                  </div>

                  {feedbackSuccess && (
                    <p className="text-[11px] text-emerald-700 font-medium">
                      ✓ Thank you! Your feedback has been recorded and integrated into institutional metrics.
                    </p>
                  )}
                </div>
              )}

              {/* Feedbacks list */}
              {feedbackData && feedbackData.feedbacks.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  {feedbackData.feedbacks.slice(0, 3).map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-md border border-slate-100 text-xs space-y-1 bg-white"
                    >
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-semibold text-slate-800">
                          {f.user_name || "Verified Trainee"}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-400" />
                          <span className="font-bold text-slate-700">
                            {f.course_rating}.0
                          </span>
                        </div>
                      </div>
                      {f.comments && (
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          "{f.comments}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-1">
                  No trainee feedback recorded yet for this course. Be the first to review!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Enrollment Card & Competencies */}
        <div className="space-y-6">
          {/* Enrollment Action Box */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-bold text-slate-900">Course Access</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              {course.is_enrolled ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>You are enrolled in this course</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      {course.completed_lessons_count} of {course.total_lessons_count} lessons completed ({course.progress_percentage || 0}%)
                    </p>
                  </div>
                  <ProgressBar value={course.progress_percentage || 0} size="md" variant="meteorological" />
                  <Link to={`/courses/${course.id}/learn`} className="block w-full">
                    <Button className="w-full font-semibold text-xs flex items-center justify-center gap-1.5 py-2.5 shadow-xs">
                      <span>Continue Learning</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ) : isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enroll now to unlock lesson modules, operational datasets, and receive certified IMD competency credits upon completion.
                  </p>
                  <Button
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                    className="w-full font-semibold text-xs py-2.5 flex items-center justify-center gap-2 shadow-xs"
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
                    <Button className="w-full font-semibold text-xs py-2.5 shadow-xs">
                      Sign In to Enroll
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competency Mapping Box */}
          {course.competencies.length > 0 && (
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
                  <Sparkles className="h-4 w-4 text-[#1557A6]" />
                  <span>Competencies Acquired</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-2.5 text-xs">
                {course.competencies.map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3 rounded-md border border-slate-200 bg-slate-50 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {comp.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-[#1557A6] font-bold">
                        Target Lvl {comp.target_level}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Discipline: {comp.category} · Weight: {Math.round(comp.contribution_weight * 100)}%
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Instructor Box */}
          {course.trainer && (
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold text-slate-900">Lead Instructor</CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-2 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1557A6] flex items-center justify-center font-bold text-sm">
                    {course.trainer.first_name?.[0]}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">
                      {course.trainer.first_name} {course.trainer.last_name}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      {course.trainer.designation || "Senior Meteorologist"}
                    </p>
                  </div>
                </div>
                {course.trainer.specialization && (
                  <p className="text-[11px] text-slate-600 pt-1">
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
