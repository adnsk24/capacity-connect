import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/loading-skeleton"
import { coursesService, LessonItem, ResourceItem } from "@/services/courses"
import { getCourseThumbnail, getCourseThumbnailAlt } from "@/lib/courseImages"
import { ResourceCard } from "@/components/ui/ResourceCard"
import { VideoPlayerModal } from "@/components/ui/VideoPlayerModal"
import { AudioPlayerModal } from "@/components/ui/AudioPlayerModal"

export const LearningContentPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const queryClient = useQueryClient()
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [resourceFilter, setResourceFilter] = useState<"ALL" | "VIDEOS" | "AUDIO" | "DOCUMENTS" | "PRESENTATIONS">("ALL")
  const [activeVideo, setActiveVideo] = useState<ResourceItem | null>(null)
  const [activeAudio, setActiveAudio] = useState<ResourceItem | null>(null)

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

  // Resource completion mutation
  const completeResourceMutation = useMutation({
    mutationFn: (resourceId: string) => coursesService.completeResource(resourceId, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-learn", courseId] })
      queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] })
      queryClient.invalidateQueries({ queryKey: ["trainee-dashboard"] })
    },
  })

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-slate-600 font-medium">
            Course Completion: <span className="font-semibold text-slate-900">{course.completed_lessons_count}</span> of {course.total_lessons_count} ({course.progress_percentage || 0}%)
          </span>
          <div className="w-28">
            <ProgressBar value={course.progress_percentage || 0} size="sm" variant="primary" />
          </div>
        </div>
      </div>

      {/* Main LMS Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Pane: Syllabus Navigation (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col">
          <div className="relative h-24 overflow-hidden border-b border-slate-200 bg-slate-100">
            <img
              src={getCourseThumbnail(course.title)}
              alt={getCourseThumbnailAlt(course.title)}
              className="w-full h-full object-cover"
              loading="lazy"
              width="360"
              height="96"
            />
            <div className="absolute inset-0 bg-slate-900/60 p-3 flex flex-col justify-end text-white">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-blue-200">Official Syllabus</span>
              <h2 className="text-[13px] font-bold line-clamp-1 text-white">{course.title}</h2>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[680px] overflow-y-auto p-2 space-y-2">
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
                        className={`w-full p-2.5 rounded-md text-left text-[12px] transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-blue-50 text-[#1557A6] font-semibold border-l-2 border-[#1557A6]"
                            : "text-slate-700 hover:bg-slate-50 border-l-2 border-transparent"
                        }`}
                      >
                        {les.is_completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono ${
                            isSelected ? "border-[#1557A6] text-[#1557A6] bg-blue-100" : "border-slate-300 text-slate-500"
                          }`}>
                            {les.order_index}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{les.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {les.duration_minutes} min duration
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
        <div className="lg:col-span-8 space-y-5">
          {currentLesson ? (
            <Card className="border-slate-200 shadow-xs overflow-hidden bg-white">
              {/* Lesson Top Banner */}
              <div className="p-6 border-b border-slate-100 space-y-2 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-medium uppercase bg-blue-50 text-[#1557A6] border-blue-200">
                    {currentModuleTitle}
                  </Badge>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {currentLesson.duration_minutes} min duration
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {currentLesson.title}
                </h1>

                {currentLesson.description && (
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    {currentLesson.description}
                  </p>
                )}
              </div>

              {/* Lesson Instructional Content Body */}
              <CardContent className="p-6 space-y-6">
                <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
                  <div className="p-4 rounded-md bg-blue-50/60 border border-blue-200/80 text-slate-900">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1557A6] mb-1.5">
                      Instructional Core Narrative
                    </h4>
                    <p className="text-[13px] leading-relaxed text-slate-700">
                      {currentLesson.content_body || "Instructional module contents under live meteorological feed."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[14px] font-bold text-slate-900">
                      Operational Key Takeaways
                    </h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-[13px]">
                      <li>Maintain rigorous compliance with IMD and WMO operational reporting protocols.</li>
                      <li>Cross-reference radar, satellite, and surface observation networks during severe weather analysis.</li>
                      <li>Verify sensor calibration status and transmission timestamps prior to issuing alerts.</li>
                    </ul>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* LEARNING RESOURCES: Videos, Audio, Documents, PPT        */}
                {/* ======================================================== */}
                {(() => {
                  const relevantResources: ResourceItem[] = [
                    ...(currentLesson?.resources || []),
                    ...(course.modules.find((m) => m.id === currentLesson?.module_id)?.resources || []),
                    ...(course.resources || []),
                  ]
                  const uniqueResources = Array.from(new Map(relevantResources.map((r) => [r.id, r])).values())

                  const videosCount = uniqueResources.filter((r) => ["VIDEO", "EXTERNAL_VIDEO"].includes(r.resource_type.toUpperCase())).length
                  const audioCount = uniqueResources.filter((r) => r.resource_type.toUpperCase() === "AUDIO").length
                  const docCount = uniqueResources.filter((r) => ["DOCUMENT", "PDF"].includes(r.resource_type.toUpperCase())).length
                  const pptCount = uniqueResources.filter((r) => ["PRESENTATION", "PPT"].includes(r.resource_type.toUpperCase())).length

                  const filteredResources = uniqueResources.filter((r) => {
                    const type = r.resource_type.toUpperCase()
                    if (resourceFilter === "VIDEOS") return ["VIDEO", "EXTERNAL_VIDEO"].includes(type)
                    if (resourceFilter === "AUDIO") return type === "AUDIO"
                    if (resourceFilter === "DOCUMENTS") return ["DOCUMENT", "PDF"].includes(type)
                    if (resourceFilter === "PRESENTATIONS") return ["PRESENTATION", "PPT"].includes(type)
                    return true
                  })

                  if (uniqueResources.length === 0) return null

                  return (
                    <div className="pt-6 border-t border-slate-200 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <span>Learning Resources</span>
                            <Badge variant="secondary" className="text-[10px] font-mono">
                              {uniqueResources.length}
                            </Badge>
                          </h3>
                          <p className="text-[11.5px] text-slate-500 mt-0.5">
                            Instructional videos, audio commentaries, and reference materials.
                          </p>
                        </div>

                        {/* Resource Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                          <button
                            type="button"
                            onClick={() => setResourceFilter("ALL")}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer text-[11px] ${
                              resourceFilter === "ALL"
                                ? "bg-white text-[#1557A6] shadow-2xs font-bold"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            All ({uniqueResources.length})
                          </button>
                          {videosCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setResourceFilter("VIDEOS")}
                              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer text-[11px] ${
                                resourceFilter === "VIDEOS"
                                  ? "bg-white text-rose-700 shadow-2xs font-bold"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Videos ({videosCount})
                            </button>
                          )}
                          {audioCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setResourceFilter("AUDIO")}
                              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer text-[11px] ${
                                resourceFilter === "AUDIO"
                                  ? "bg-white text-purple-700 shadow-2xs font-bold"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Audio ({audioCount})
                            </button>
                          )}
                          {docCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setResourceFilter("DOCUMENTS")}
                              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer text-[11px] ${
                                resourceFilter === "DOCUMENTS"
                                  ? "bg-white text-[#1557A6] shadow-2xs font-bold"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Documents ({docCount})
                            </button>
                          )}
                          {pptCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setResourceFilter("PRESENTATIONS")}
                              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer text-[11px] ${
                                resourceFilter === "PRESENTATIONS"
                                  ? "bg-white text-amber-700 shadow-2xs font-bold"
                                  : "text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              Presentations ({pptCount})
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Resource Cards Grid / Stack */}
                      <div className="space-y-2.5">
                        {filteredResources.map((res) => (
                          <ResourceCard
                            key={res.id}
                            resource={res}
                            onPlay={(r) => {
                              const type = r.resource_type.toUpperCase()
                              if (type === "AUDIO") {
                                setActiveAudio(r)
                              } else {
                                setActiveVideo(r)
                              }
                            }}
                            onComplete={(r) => completeResourceMutation.mutate(r.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Completion & Navigation Controls Footer */}
                <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Mark as Complete button */}
                  <div>
                    {currentLesson.is_completed ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Lesson Completed</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => completeMutation.mutate(currentLesson!.id)}
                        disabled={completeMutation.isPending}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs h-9 px-4 flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{completeMutation.isPending ? "Recording Progress..." : "Mark Lesson Complete"}</span>
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
                        className="text-xs h-9 flex items-center gap-1 border-slate-200"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Previous</span>
                      </Button>
                    )}
                    {nextLesson && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedLessonId(nextLesson.id)}
                        className="bg-[#1557A6] hover:bg-[#0f4282] text-white text-xs font-medium h-9 flex items-center gap-1"
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
            <Card className="border-slate-200 p-8 text-center bg-white shadow-xs">
              <p className="text-xs text-slate-500">Select a lesson from the curriculum to begin studying.</p>
            </Card>
          )}
        </div>
      </div>

      {/* Video & Audio Player Modals */}
      {activeVideo && (
        <VideoPlayerModal
          resource={activeVideo}
          onClose={() => setActiveVideo(null)}
          onComplete={(r) => completeResourceMutation.mutate(r.id)}
        />
      )}

      {activeAudio && (
        <AudioPlayerModal
          resource={activeAudio}
          onClose={() => setActiveAudio(null)}
          onComplete={(r) => completeResourceMutation.mutate(r.id)}
        />
      )}
    </div>
  )
}
