import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Clock,
  BookOpen,
  User as UserIcon,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Loader2,
  FileCheck2,
} from "lucide-react"
import { Button } from "./button"
import { ProgressBar } from "./progress-bar"
import { CourseCard as CourseCardType, coursesService } from "@/services/courses"
import { getCourseThumbnail, getCourseThumbnailAlt } from "@/lib/courseImages"
import { useAuthStore } from "@/store/useAuthStore"

interface CourseCardProps {
  course: CourseCardType
  basePath?: string
}

const difficultyLabel: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
}

const difficultyColor: Record<string, string> = {
  BEGINNER: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INTERMEDIATE: "bg-amber-50 text-amber-700 border-amber-200",
  ADVANCED: "bg-rose-50 text-rose-700 border-rose-200",
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, basePath = "/courses" }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()
  const [enrollError, setEnrollError] = useState<string | null>(null)

  const diffColor = difficultyColor[course.difficulty_level] || "bg-slate-100 text-slate-700 border-slate-200"
  const diffLabel = difficultyLabel[course.difficulty_level] || course.difficulty_level

  const enrollMutation = useMutation({
    mutationFn: () => coursesService.enrollInCourse(course.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses-catalogue"] })
      queryClient.invalidateQueries({ queryKey: ["course-detail", course.id] })
      queryClient.invalidateQueries({ queryKey: ["trainee-dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["trainee-learning"] })
      navigate(`/courses/${course.id}/learn`)
    },
    onError: (err: Error) => {
      setEnrollError(err.message || "Failed to enroll")
    },
  })

  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate(`/login?redirect=/courses/${course.id}`)
      return
    }
    enrollMutation.mutate()
  }

  // Primary assessment display label
  const assessmentLabel =
    course.assessment_types && course.assessment_types.length > 0
      ? course.assessment_types[0]
      : "MCQ Exam"

  const passMarkText = course.passing_marks || "60% Pass Mark"

  return (
    <div className="group bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_0_rgb(0,0,0,0.05)] hover:border-[#1557A6]/40 hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden">
      {/* Course Image Header with Responsive Aspect Ratio */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 border-b border-slate-100">
        <img
          src={getCourseThumbnail(course.title, course.category_name, course.thumbnail_url)}
          alt={getCourseThumbnailAlt(course.title)}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Subtle Dark Gradient at bottom of image for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* Category Code Pill on Top-Left */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider bg-white/95 text-[#1557A6] border border-slate-200 shadow-xs backdrop-blur-xs">
            {course.category_code}
          </span>
        </div>

        {/* Difficulty Pill on Top-Right */}
        <div className="absolute top-2.5 right-2.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border shadow-xs backdrop-blur-xs ${diffColor}`}
          >
            {diffLabel}
          </span>
        </div>

        {/* Course Duration on Bottom-Right */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/75 text-white backdrop-blur-xs border border-white/20">
            <Clock className="h-3 w-3 text-amber-300" />
            {course.duration_hours}h
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Badge Text */}
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#1557A6] mb-1">
            {course.category_name}
          </div>

          {/* Title */}
          <Link to={`${basePath}/${course.id}`}>
            <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-[#1557A6] transition-colors line-clamp-2 leading-snug mb-2">
              {course.title}
            </h3>
          </Link>

          {/* Short 1-2 line description */}
          <p className="text-[12px] text-slate-600 line-clamp-2 leading-relaxed mb-3.5">
            {course.description || "Comprehensive IMD curriculum for operational meteorological capacity building."}
          </p>
        </div>

        <div>
          {/* Syllabus & Assessment Details Row */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11.5px] text-slate-700 font-medium">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[#1557A6]" />
                {course.total_modules || course.module_names?.length || 1} Modules
              </span>
              <span className="flex items-center gap-1.5 text-slate-800">
                <FileCheck2 className="h-3.5 w-3.5 text-blue-600" />
                {assessmentLabel}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                {passMarkText}
              </span>
              {course.trainer ? (
                <span className="flex items-center gap-1 text-slate-500 truncate max-w-[140px]" title={`${course.trainer.first_name} ${course.trainer.last_name}`}>
                  <UserIcon className="h-3 w-3 text-slate-400 shrink-0" />
                  {course.trainer.first_name} {course.trainer.last_name}
                </span>
              ) : (
                <span className="text-slate-400 text-[10px]">IMD Faculty</span>
              )}
            </div>
          </div>

          {/* Enrollment Progress if Enrolled */}
          {course.is_enrolled && (
            <div className="mb-3 space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {(course.progress_percentage || 0) >= 100 ? "Completed" : "In Progress"}
                </span>
                <span className="font-bold text-slate-800">{course.progress_percentage || 0}%</span>
              </div>
              <ProgressBar
                value={course.progress_percentage || 0}
                size="sm"
                variant={(course.progress_percentage || 0) >= 100 ? "success" : "primary"}
              />
            </div>
          )}

          {enrollError && (
            <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded p-1.5 mb-2">
              {enrollError}
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA Buttons */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
        <Link to={`${basePath}/${course.id}`} className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-[12px] h-8 font-semibold border-slate-300 text-slate-700 hover:text-[#1557A6] hover:border-[#1557A6] bg-white transition-colors"
          >
            View Course
          </Button>
        </Link>

        {course.is_enrolled ? (
          <Link to={`/courses/${course.id}/learn`} className="flex-1">
            <Button
              size="sm"
              className="w-full text-[12px] h-8 font-semibold bg-[#1557A6] hover:bg-[#114687] text-white gap-1 transition-colors"
            >
              Continue <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        ) : (
          <Button
            size="sm"
            onClick={handleEnroll}
            disabled={enrollMutation.isPending}
            className="flex-1 text-[12px] h-8 font-semibold bg-[#1557A6] hover:bg-[#114687] text-white gap-1 transition-colors shadow-2xs"
          >
            {enrollMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                Enroll Now <Sparkles className="h-3 w-3 text-amber-300" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
