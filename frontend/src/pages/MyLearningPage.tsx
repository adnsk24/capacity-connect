import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/loading-skeleton"
import { traineeService } from "@/services/trainee"

export const MyLearningPage: React.FC = () => {
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <span>My Learning Portfolio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your ongoing courses, lesson completions, and operational skill development
          </p>
        </div>
        <Link to="/courses">
          <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5">
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
          onAction={() => window.location.assign("/courses")}
        />
      ) : (
        <div className="space-y-4">
          {enrolledCourses.map((course) => (
            <Card
              key={course.enrollment_id}
              className="border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all shadow-sm"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Course details and next lesson */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {course.code}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {course.category_name}
                      </span>
                      <StatusBadge status={course.status} />
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {course.title}
                    </h3>

                    {/* Next Lesson Callout */}
                    {course.next_lesson_title ? (
                      <div className="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 flex items-center gap-2">
                        <span className="font-semibold shrink-0">Up Next:</span>
                        <span className="truncate">{course.next_lesson_title}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
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
                  <div className="lg:w-72 shrink-0 space-y-3 pt-3 lg:pt-0 lg:border-l lg:border-slate-100 dark:lg:border-slate-800 lg:pl-6">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          {course.completed_lessons_count} of {course.total_lessons_count} lessons
                        </span>
                        <span className="font-bold font-mono text-slate-900 dark:text-white">
                          {course.progress_percentage}%
                        </span>
                      </div>
                      <ProgressBar value={course.progress_percentage} size="md" variant="meteorological" />
                    </div>

                    <Link to={`/courses/${course.course_id}/learn`} className="block w-full">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 flex items-center justify-center gap-1.5 shadow-sm">
                        <span>{course.progress_percentage >= 100 ? "Review Course" : "Resume Course"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
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
