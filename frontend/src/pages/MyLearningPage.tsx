import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  Award,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/loading-skeleton"
import { traineeService } from "@/services/trainee"
import { getCourseThumbnail, getCourseThumbnailAlt } from "@/lib/courseImages"

export const MyLearningPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: enrolledCourses, isLoading, error, refetch } = useQuery({
    queryKey: ["trainee-learning"],
    queryFn: () => traineeService.getMyLearning(),
  })

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !enrolledCourses) {
    return (
      <ErrorState
        title="Could not load your learning portfolio"
        message={error instanceof Error ? error.message : "Error retrieving enrollments."}
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-[#1557A6]" />
            <span>My Learning Portfolio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your ongoing courses, lesson completions, and operational skill development
          </p>
        </div>
        <Link to="/courses">
          <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5 hover:bg-slate-50">
            <Compass className="h-4 w-4" />
            <span>Browse More Courses</span>
          </Button>
        </Link>
      </div>

      {/* Courses List */}
      {enrolledCourses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="No Active Enrollments"
          description="You have not enrolled in any operational meteorology courses yet. Explore our course catalogue to advance your competencies."
          actionLabel="Explore Course Catalogue"
          onAction={() => navigate("/courses")}
        />
      ) : (
        <div className="space-y-4">
          {enrolledCourses.map((course) => (
            <Card
              key={course.enrollment_id}
              className="border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Authentic Course Thumbnail */}
                  <div className="w-full sm:w-36 h-28 shrink-0 rounded-md overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={getCourseThumbnail(course.title, course.category_name)}
                      alt={getCourseThumbnailAlt(course.title)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width="144"
                      height="112"
                    />
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 flex-1 w-full">
                    {/* Left: Course details and next lesson */}
                    <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {course.code}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {course.category_name}
                      </span>
                      <StatusBadge status={course.status} />
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {course.title}
                    </h3>

                    {/* Next Lesson Callout */}
                    {course.next_lesson_title ? (
                      <div className="p-2.5 rounded-md bg-blue-50/70 border border-blue-100 text-xs text-[#1557A6] flex items-center gap-2">
                        <span className="font-semibold shrink-0">Up Next:</span>
                        <span className="truncate">{course.next_lesson_title}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>All syllabus lessons completed!</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{course.duration_hours} hours total</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          Enrolled: {new Date(course.enrolled_at).toLocaleDateString()}
                        </span>
                      </div>
                      {course.last_accessed_at && (
                        <span>
                          Last active: {new Date(course.last_accessed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Progress and Action */}
                  <div className="lg:w-72 shrink-0 space-y-3 pt-3 lg:pt-0 lg:border-l lg:border-slate-100 lg:pl-6">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-medium text-slate-600">
                          {course.completed_lessons_count} of {course.total_lessons_count} lessons
                        </span>
                        <span className="font-bold font-mono text-slate-900">
                          {course.progress_percentage}%
                        </span>
                      </div>
                      <ProgressBar value={course.progress_percentage} size="md" variant="meteorological" />
                    </div>

                    <Link to={`/courses/${course.course_id}/learn`} className="block w-full">
                      <Button className="w-full font-semibold text-xs py-2 flex items-center justify-center gap-1.5 shadow-xs">
                        <span>{course.progress_percentage >= 100 ? "Review Course" : "Resume Course"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>

                    {course.progress_percentage >= 100 && (
                      <Link to="/trainee/certificates" className="block w-full">
                        <Button
                          variant="outline"
                          className="w-full text-xs flex items-center justify-center gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                        >
                          <Award className="h-3.5 w-3.5 text-emerald-700" />
                          <span>View Certificate</span>
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
