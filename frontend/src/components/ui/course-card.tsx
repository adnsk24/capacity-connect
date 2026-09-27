import React from "react"
import { Link } from "react-router-dom"
import { Clock, BookOpen, User as UserIcon, CheckCircle2, ArrowRight } from "lucide-react"
import { Card, CardContent } from "./card"
import { Badge } from "./badge"
import { Button } from "./button"
import { ProgressBar } from "./progress-bar"
import { StatusBadge } from "./status-badge"
import { CourseCard as CourseCardType } from "@/services/courses"

interface CourseCardProps {
  course: CourseCardType
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  // Atmospheric dynamic gradient based on category
  const categoryGradients: Record<string, string> = {
    "GEN-MET": "from-sky-700 via-blue-800 to-indigo-900",
    CLIM: "from-teal-700 via-emerald-800 to-slate-900",
    OWF: "from-blue-700 via-indigo-800 to-slate-900",
    "SAT-MET": "from-violet-800 via-purple-900 to-slate-950",
    "RAD-MET": "from-cyan-800 via-blue-900 to-slate-950",
    "INST-OBS": "from-slate-700 via-slate-800 to-slate-900",
    "MET-COMP": "from-blue-900 via-indigo-950 to-slate-950",
  }

  const gradient = categoryGradients[course.category_code] || "from-blue-800 to-slate-900"

  return (
    <Card className="flex flex-col h-full border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
      {/* Visual Header / Atmospheric Banner */}
      <div className={`h-36 bg-gradient-to-br ${gradient} p-4 relative flex flex-col justify-between text-white overflow-hidden`}>
        {/* Subtle decorative atmospheric pattern */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`isobar-${course.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 20 Q 20 0 40 20 T 80 20" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#isobar-${course.id})`} />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-2">
          <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 text-[10px] font-semibold tracking-wider uppercase">
            {course.category_code}
          </Badge>
          <StatusBadge status={course.difficulty_level} />
        </div>

        <div className="relative z-10">
          <span className="text-[11px] font-mono text-white/80">{course.code}</span>
          <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-blue-200 transition-colors">
            {course.title}
          </h3>
        </div>
      </div>

      {/* Card Content Body */}
      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {course.description || "Comprehensive IMD curriculum designed for operational meteorological capacity building."}
          </p>

          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              <span>{course.duration_hours} hrs</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
              <span>{course.total_modules} modules · {course.total_lessons} lessons</span>
            </div>
          </div>

          {/* Competency Tags */}
          {course.competencies && course.competencies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {course.competencies.slice(0, 2).map((comp, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {comp}
                </span>
              ))}
              {course.competencies.length > 2 && (
                <span className="text-[10px] text-slate-400 self-center">
                  +{course.competencies.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Trainer Info */}
          {course.trainer && (
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold">
                <UserIcon className="h-3 w-3" />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {course.trainer.first_name} {course.trainer.last_name}
              </span>
            </div>
          )}
        </div>

        {/* Progress or Enrollment CTA Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {course.is_enrolled ? (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {course.progress_percentage !== undefined && course.progress_percentage >= 100
                    ? "Completed"
                    : "Enrolled"}
                </span>
                <span className="font-mono text-[11px] text-slate-500 font-medium">
                  {course.progress_percentage || 0}%
                </span>
              </div>
              <ProgressBar value={course.progress_percentage || 0} size="sm" />
              <Link to={`/courses/${course.id}/learn`} className="block w-full pt-1">
                <Button size="sm" className="w-full text-xs font-semibold flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700">
                  <span>Continue Learning</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <Link to={`/courses/${course.id}`} className="block w-full">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-slate-800"
              >
                <span>View Course Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
