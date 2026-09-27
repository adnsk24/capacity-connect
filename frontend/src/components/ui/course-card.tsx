import React from "react"
import { Link } from "react-router-dom"
import { Clock, BookOpen, User as UserIcon, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "./button"
import { ProgressBar } from "./progress-bar"
import { CourseCard as CourseCardType } from "@/services/courses"
import { getCourseThumbnail, getCourseThumbnailAlt } from "@/lib/courseImages"

interface CourseCardProps {
  course: CourseCardType
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

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const diffColor = difficultyColor[course.difficulty_level] || "bg-slate-100 text-slate-600 border-slate-200"
  const diffLabel = difficultyLabel[course.difficulty_level] || course.difficulty_level

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-[0_1px_3px_0_rgb(0,0,0,0.06)] hover:border-blue-200 hover:shadow-sm transition-all flex flex-col h-full overflow-hidden">
      {/* Authentic Meteorological Thumbnail */}
      <div className="p-3 pb-0">
        <div className="relative overflow-hidden rounded-md border border-slate-200 h-32 w-full bg-slate-100">
          <img
            src={getCourseThumbnail(course.title, course.category_name)}
            alt={getCourseThumbnailAlt(course.title)}
            className="w-full h-full object-cover"
            loading="lazy"
            width="320"
            height="160"
          />
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-white/95 text-[#1557A6] border border-slate-200 shadow-2xs">
              {course.category_code}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border shadow-2xs ${diffColor}`}>
              {diffLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Top section */}
      <div className="p-4 border-b border-slate-100 flex-1">

        {/* Code + Title */}
        <div className="mb-2">
          <div className="text-[10px] text-slate-400 font-mono mb-0.5">{course.code}</div>
          <h3 className="text-[14px] font-semibold text-slate-900 line-clamp-2 leading-snug">
            {course.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
          {course.description || "Comprehensive IMD curriculum for operational meteorological capacity building."}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[12px] text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {course.duration_hours}h
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            {course.total_lessons} lessons
          </span>
        </div>

        {/* Competencies */}
        {course.competencies && course.competencies.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {course.competencies.slice(0, 2).map((comp, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
              >
                {comp}
              </span>
            ))}
            {course.competencies.length > 2 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{course.competencies.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Trainer */}
        {course.trainer && (
          <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
              <UserIcon className="h-3 w-3 text-slate-500" />
            </div>
            <span className="text-[12px] text-slate-500">
              {course.trainer.first_name} {course.trainer.last_name}
            </span>
          </div>
        )}
      </div>

      {/* Footer / CTA */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 rounded-b-lg">
        {course.is_enrolled ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-medium text-slate-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                {(course.progress_percentage || 0) >= 100 ? "Completed" : "In Progress"}
              </span>
              <span className="font-semibold text-slate-700">{course.progress_percentage || 0}%</span>
            </div>
            <ProgressBar value={course.progress_percentage || 0} size="sm" variant={
              (course.progress_percentage || 0) >= 100 ? "success" : "primary"
            } />
            <Link to={`/courses/${course.id}/learn`} className="block w-full">
              <Button size="sm" className="w-full text-[12px] gap-1.5">
                Continue <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        ) : (
          <Link to={`/courses/${course.id}`} className="block w-full">
            <Button variant="outline" size="sm" className="w-full text-[12px] gap-1.5 hover:border-[#1557A6] hover:text-[#1557A6]">
              View Details <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
