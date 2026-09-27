import React, { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus,
  ArrowLeft,
  Layers,
  Paperclip,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { trainerService } from "@/services/trainer"

export const TrainerCourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const queryClient = useQueryClient()

  // Modal states
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null)

  // Module form
  const [moduleTitle, setModuleTitle] = useState("")
  const [moduleDesc, setModuleDesc] = useState("")

  // Lesson form
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonDesc, setLessonDesc] = useState("")
  const [contentType, setContentType] = useState("TEXT")
  const [contentBody, setContentBody] = useState("")
  const [durationMins, setDurationMins] = useState(15)

  // Resource form
  const [resTitle, setResTitle] = useState("")
  const [resType, setResType] = useState("DOCUMENT")
  const [resUrl, setResUrl] = useState("")

  const { data: course, isLoading, error } = useQuery({
    queryKey: ["trainer-course-detail", courseId],
    queryFn: () => trainerService.getCourseDetail(courseId!),
    enabled: !!courseId,
  })

  const addModuleMutation = useMutation({
    mutationFn: (data: any) => trainerService.addModule(courseId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-course-detail", courseId] })
      setShowModuleModal(false)
      setModuleTitle("")
      setModuleDesc("")
    },
  })

  const addLessonMutation = useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: string; data: any }) =>
      trainerService.addLesson(courseId!, moduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-course-detail", courseId] })
      setShowLessonModal(false)
      setLessonTitle("")
      setLessonDesc("")
      setContentBody("")
    },
  })

  const addResourceMutation = useMutation({
    mutationFn: (data: any) => trainerService.addResource(courseId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-course-detail", courseId] })
      setShowResourceModal(false)
      setResTitle("")
      setResUrl("")
    },
  })

  const togglePublishMutation = useMutation({
    mutationFn: (newStatus: string) => trainerService.updateCourse(courseId!, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-course-detail", courseId] })
    },
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading course syllabus...</p>
      </div>
    )
  }

  if (error || !course) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <h3 className="font-semibold text-red-900">Failed to load course</h3>
          <p className="text-sm text-red-700 mt-1">{(error as Error)?.message || "Course not found."}</p>
        </CardContent>
      </Card>
    )
  }

  const isPublished = course.status === "PUBLISHED"

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/trainer/courses"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to My Courses
        </Link>
      </div>

      {/* Header Card */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  {course.code}
                </span>
                <Badge
                  variant={isPublished ? "success" : "secondary"}
                  className="text-[10px] font-semibold"
                >
                  {course.status}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {course.difficulty_level}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {course.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {course.description || "No description provided."}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => togglePublishMutation.mutate(isPublished ? "DRAFT" : "PUBLISHED")}
                disabled={togglePublishMutation.isPending}
                className={`text-xs font-bold ${
                  isPublished
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isPublished ? "Revert to Draft" : "Publish Course Offering"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="h-5 w-5 text-emerald-600" /> Syllabus Modules ({course.modules.length})
        </h2>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowModuleModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
          >
            <Plus className="h-3.5 w-3.5" /> Add Module
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowResourceModal(true)}
            className="text-xs gap-1"
          >
            <Paperclip className="h-3.5 w-3.5" /> Add Resource
          </Button>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {course.modules.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200">
            <CardContent className="py-12 text-center">
              <p className="text-xs text-slate-500">No modules added yet. Add a module to begin assembling lessons.</p>
            </CardContent>
          </Card>
        ) : (
          course.modules.map((m: any, idx: number) => (
            <Card key={m.id} className="border-slate-200">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <Badge variant="outline" className="text-[10px] mb-1">
                    Module {idx + 1}
                  </Badge>
                  <CardTitle className="text-base font-bold text-slate-900">
                    {m.title}
                  </CardTitle>
                  {m.description && (
                    <CardDescription className="text-xs mt-0.5">{m.description}</CardDescription>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTargetModuleId(m.id)
                    setShowLessonModal(true)
                  }}
                  className="text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Lesson
                </Button>
              </CardHeader>

              <CardContent className="pt-4">
                {m.lessons.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No instructional lessons in this module.</p>
                ) : (
                  <div className="space-y-2">
                    {m.lessons.map((l: any, lIdx: number) => (
                      <div
                        key={l.id}
                        className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-400 text-[11px]">{idx + 1}.{lIdx + 1}</span>
                          <div>
                            <span className="font-semibold text-slate-800 block">
                              {l.title}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {l.content_type} • {l.duration_minutes} mins
                            </span>
                          </div>
                        </div>

                        <Badge variant="secondary" className="text-[10px]">
                          {l.content_type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="max-w-md w-full p-6 shadow-xl border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Add Instructional Module</h3>
            <div className="space-y-3 pt-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Module Title *</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="e.g. Atmospheric Thermodynamics"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  placeholder="Brief synopsis of topics covered..."
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => setShowModuleModal(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    addModuleMutation.mutate({
                      title: moduleTitle,
                      description: moduleDesc,
                      order_index: course.modules.length + 1,
                    })
                  }
                  disabled={!moduleTitle || addModuleMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Create Module
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="max-w-md w-full p-6 shadow-xl border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Add Lesson</h3>
            <div className="space-y-3 pt-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Lesson Title *</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="e.g. Dry and Moist Adiabatic Lapse Rates"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Content Type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="TEXT">TEXT</option>
                    <option value="VIDEO">VIDEO</option>
                    <option value="DOCUMENT">DOCUMENT</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Duration (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Instructional Content / Markdown</label>
                <textarea
                  rows={4}
                  value={contentBody}
                  onChange={(e) => setContentBody(e.target.value)}
                  placeholder="Lesson text, meteorological formulas, or video links..."
                  className="w-full px-3 py-2 border rounded-md font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => setShowLessonModal(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    addLessonMutation.mutate({
                      moduleId: targetModuleId!,
                      data: {
                        title: lessonTitle,
                        description: lessonDesc,
                        content_type: contentType,
                        content_body: contentBody,
                        duration_minutes: durationMins,
                      },
                    })
                  }
                  disabled={!lessonTitle || addLessonMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Lesson
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="max-w-md w-full p-6 shadow-xl border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Add Learning Resource</h3>
            <div className="space-y-3 pt-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. IMD Radar Operations Manual"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Resource Type</label>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="DOCUMENT">DOCUMENT</option>
                  <option value="PDF">PDF</option>
                  <option value="LINK">LINK</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">URL or File Path *</label>
                <input
                  type="text"
                  required
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  placeholder="https://mausam.imd.gov.in/docs/manual.pdf"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => setShowResourceModal(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    addResourceMutation.mutate({
                      title: resTitle,
                      resource_type: resType,
                      url_or_path: resUrl,
                    })
                  }
                  disabled={!resTitle || !resUrl || addResourceMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Add Resource
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
