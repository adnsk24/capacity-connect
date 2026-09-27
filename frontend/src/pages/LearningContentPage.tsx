import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  FileText,
  Download,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/loading-skeleton"
import { coursesService, LessonItem } from "@/services/courses"

export const LearningContentPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const queryClient = useQueryClient()
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)

  const { data: course, isLoading, error, refetch } = useQuery({
    queryKey: ["course-learn", courseId],
    queryFn: () => coursesService.getLearningContent(courseId!),
    enabled: !!courseId,
  })

  // Set default selected lesson to the first incomplete lesson, or first lesson
  useEffect(() => {
    if (course && !selectedLessonId) {
      for (const mod of course.modules) {
        for (const les of mod.lessons) {
          if (!les.is_completed) {
            setSelectedLessonId(les.id)
            return
          }
        }
      }
      // If all completed or none found, pick very first lesson
      if (course.modules[0]?.lessons[0]) {
        setSelectedLessonId(course.modules[0].lessons[0].id)
      }
    }
  }, [course, selectedLessonId])

  // Lesson completion mutation
  const completeMutation = useMutation({
    mutationFn: (lessonId: string) => coursesService.completeLesson(courseId!, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-learn", courseId] })
      queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] })
      queryClient.invalidateQueries({ queryKey: ["trainee-dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["trainee-learning"] })
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-6">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-96 md:col-span-1 rounded-2xl" />
          <Skeleton className="h-96 md:col-span-3 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <ErrorState
        title="Could not access learning module"
        message={error instanceof Error ? error.message : "You must be enrolled to view this content."}
        onRetry={() => refetch()}
      />
    )
  }

  // Find currently active lesson and module
  let currentLesson: LessonItem | undefined
  let currentModuleTitle = ""
  let allLessons: LessonItem[] = []

  for (const mod of course.modules) {
    for (const les of mod.lessons) {
      allLessons.push(les)
      if (les.id === selectedLessonId) {
        currentLesson = les
        currentModuleTitle = mod.title
      }
    }
  }

  const currentIndex = allLessons.findIndex((l) => l.id === selectedLessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const breadcrumbItems = [
    { label: "My Learning", href: "/trainee/learning" },
    { label: course.title, href: `/courses/${course.id}` },
    { label: currentLesson?.title || "Lesson" },
  ]

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">
            Progress: {course.completed_lessons_count} / {course.total_lessons_count} ({course.progress_percentage || 0}%)
          </span>
          <div className="w-28">
            <ProgressBar value={course.progress_percentage || 0} size="sm" variant="meteorological" />
          </div>
        </div>
      </div>

      {/* Main LMS Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Syllabus Navigation (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Course Syllabus
            </h3>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">
              {course.title}
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[650px] overflow-y-auto p-2 space-y-3">
            {course.modules.map((mod, mIdx) => (
              <div key={mod.id} className="pt-2">
                <div className="px-2 pb-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Module {mIdx + 1}: {mod.title}
                </div>
                <div className="space-y-1">
                  {mod.lessons.map((les) => {
                    const isSelected = les.id === selectedLessonId
                    return (
                      <button
                        key={les.id}
                        onClick={() => setSelectedLessonId(les.id)}
                        className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-blue-50 text-blue-900 font-bold border border-blue-200 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-800"
                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        {les.is_completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono ${
                            isSelected ? "border-blue-500 text-blue-600 bg-blue-100 dark:bg-blue-900" : "border-slate-300 text-slate-400"
                          }`}>
                            {les.order_index}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{les.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {les.duration_minutes} min
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Lesson Viewer & Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentLesson ? (
            <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
              {/* Lesson Top Banner */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 space-y-2 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono uppercase bg-blue-50 text-blue-700 border-blue-200">
                    {currentModuleTitle}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {currentLesson.duration_minutes} min duration
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {currentLesson.title}
                </h1>

                {currentLesson.description && (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {currentLesson.description}
                  </p>
                )}
              </div>

              {/* Lesson Instructional Content Body */}
              <CardContent className="p-6 space-y-6">
                <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-blue-950 dark:text-blue-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-1">
                      Instructional Core Narrative
                    </h4>
                    <p className="text-xs leading-relaxed">
                      {currentLesson.content_body || "Instructional module contents under live meteorological feed."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Operational Key Takeaways
                    </h4>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300 text-xs">
                      <li>Maintain rigorous compliance with IMD and WMO operational reporting protocols.</li>
                      <li>Cross-reference radar, satellite, and surface observation networks during severe weather analysis.</li>
                      <li>Verify sensor calibration status and transmission timestamps prior to issuing alerts.</li>
                    </ul>
                  </div>
                </div>

                {/* Lesson Resources if any */}
                {currentLesson.resources && currentLesson.resources.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Lesson Documentation & References
                    </h4>
                    {currentLesson.resources.map((res) => (
                      <div
                        key={res.id}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-red-500 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{res.title}</span>
                        </div>
                        <a
                          href={res.storage_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {/* Completion & Navigation Controls Footer */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Mark as Complete button */}
                  <div>
                    {currentLesson.is_completed ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Lesson Completed</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => completeMutation.mutate(currentLesson!.id)}
                        disabled={completeMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{completeMutation.isPending ? "Recording..." : "Mark Lesson Complete"}</span>
                      </Button>
                    )}
                  </div>

                  {/* Previous / Next Lesson Buttons */}
                  <div className="flex items-center gap-2">
                    {prevLesson && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLessonId(prevLesson.id)}
                        className="text-xs flex items-center gap-1"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Previous</span>
                      </Button>
                    )}
                    {nextLesson && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedLessonId(nextLesson.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <span>Next Lesson</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 dark:border-slate-800 p-8 text-center">
              <p className="text-xs text-slate-400">Select a lesson from the syllabus to begin learning.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
