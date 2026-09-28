import React, { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus,
  ArrowLeft,
  Layers,
  Loader2,
  AlertCircle,
  Video,
  Headphones,
  FileText,
  FileSpreadsheet,
  Globe,
  Film,
  UploadCloud,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { trainerService } from "@/services/trainer"
import { coursesService, ResourceItem } from "@/services/courses"
import { ResourceCard } from "@/components/ui/ResourceCard"
import { VideoPlayerModal } from "@/components/ui/VideoPlayerModal"
import { AudioPlayerModal } from "@/components/ui/AudioPlayerModal"

type AddMediaType = "VIDEO" | "AUDIO" | "DOCUMENT" | "PRESENTATION" | "EXTERNAL_VIDEO"

export const TrainerCourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const queryClient = useQueryClient()

  // Module & Lesson Modal states
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
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

  // Media Modal state
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [mediaType, setMediaType] = useState<AddMediaType>("VIDEO")
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null)

  // Media Form fields
  const [resTitle, setResTitle] = useState("")
  const [resDesc, setResDesc] = useState("")
  const [resModuleId, setResModuleId] = useState<string>("")
  const [resLessonId, setResLessonId] = useState<string>("")
  const [resFile, setResFile] = useState<File | null>(null)
  const [resExternalUrl, setResExternalUrl] = useState("")
  const [resThumbnailUrl, setResThumbnailUrl] = useState("")
  const [resThumbnailFile, setResThumbnailFile] = useState<File | null>(null)
  const [resDurationMinutes, setResDurationMinutes] = useState<number>(0)
  const [resDisplayOrder, setResDisplayOrder] = useState<number>(1)
  const [resIsPublished, setResIsPublished] = useState<boolean>(true)
  const [formError, setFormError] = useState<string | null>(null)

  // Media Player preview state
  const [activeMediaResource, setActiveMediaResource] = useState<ResourceItem | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showAudioModal, setShowAudioModal] = useState(false)

  // 1. Fetch Course Detail
  const {
    data: course,
    isLoading: isCourseLoading,
    error: courseError,
  } = useQuery({
    queryKey: ["trainer-course-detail", courseId],
    queryFn: () => trainerService.getCourseDetail(courseId!),
    enabled: !!courseId,
  })

  // 2. Fetch Course Resources
  const {
    data: resources = [],
    isLoading: isResourcesLoading,
    refetch: refetchResources,
  } = useQuery({
    queryKey: ["course-resources", courseId],
    queryFn: () => coursesService.getCourseResources(courseId!),
    enabled: !!courseId,
  })

  // Add Module Mutation
  const addModuleMutation = useMutation({
    mutationFn: (data: any) => trainerService.addModule(courseId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-course-detail", courseId] })
      setShowModuleModal(false)
      setModuleTitle("")
      setModuleDesc("")
    },
  })

  // Add Lesson Mutation
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

  // Course Publish Mutation
  const togglePublishMutation = useMutation({
    mutationFn: (newStatus: string) => trainerService.updateCourse(courseId!, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-course-detail", courseId] })
    },
  })

  // Resource Operations Mutations
  const saveMediaMutation = useMutation({
    mutationFn: async () => {
      setFormError(null)

      if (!resTitle.trim()) {
        throw new Error("Resource title is required.")
      }

      const durSeconds = resDurationMinutes > 0 ? Math.round(resDurationMinutes * 60) : undefined

      // Editing existing resource
      if (editingResource) {
        return trainerService.updateResource(editingResource.id, {
          title: resTitle.trim(),
          description: resDesc.trim() || undefined,
          resource_type: mediaType,
          media_url: resExternalUrl.trim() || editingResource.storage_url,
          thumbnail_url: resThumbnailUrl.trim() || undefined,
          module_id: resModuleId || null,
          lesson_id: resLessonId || null,
          duration_seconds: durSeconds,
          display_order: resDisplayOrder,
          is_published: resIsPublished,
        })
      }

      // If uploading a local file
      if (resFile) {
        const formData = new FormData()
        formData.append("file", resFile)
        formData.append("title", resTitle.trim())
        formData.append("resource_type", mediaType)
        if (resDesc.trim()) formData.append("description", resDesc.trim())
        if (resModuleId) formData.append("module_id", resModuleId)
        if (resLessonId) formData.append("lesson_id", resLessonId)
        if (durSeconds) formData.append("duration_seconds", durSeconds.toString())
        formData.append("display_order", resDisplayOrder.toString())
        formData.append("is_published", resIsPublished.toString())
        if (resThumbnailUrl.trim()) formData.append("thumbnail_url", resThumbnailUrl.trim())
        if (resThumbnailFile) formData.append("thumbnail_file", resThumbnailFile)

        return trainerService.uploadResource(courseId!, formData)
      }

      // If external video or link without file upload
      if (!resExternalUrl.trim()) {
        throw new Error("Please upload a file or provide a valid external URL.")
      }

      return trainerService.createResource(courseId!, {
        title: resTitle.trim(),
        resource_type: mediaType,
        media_url: resExternalUrl.trim(),
        description: resDesc.trim() || undefined,
        module_id: resModuleId || null,
        lesson_id: resLessonId || null,
        thumbnail_url: resThumbnailUrl.trim() || null,
        duration_seconds: durSeconds || null,
        display_order: resDisplayOrder,
        is_published: resIsPublished,
      })
    },
    onSuccess: () => {
      refetchResources()
      closeMediaModal()
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to save resource. Please check inputs.")
    },
  })

  const deleteResourceMutation = useMutation({
    mutationFn: (resourceId: string) => trainerService.deleteResource(resourceId),
    onSuccess: () => refetchResources(),
  })

  const toggleResourcePublishMutation = useMutation({
    mutationFn: ({ resourceId, isPublished }: { resourceId: string; isPublished: boolean }) =>
      trainerService.publishResource(resourceId, isPublished),
    onSuccess: () => refetchResources(),
  })

  const updateOrderMutation = useMutation({
    mutationFn: ({ resourceId, newOrder }: { resourceId: string; newOrder: number }) =>
      trainerService.updateResource(resourceId, { display_order: newOrder }),
    onSuccess: () => refetchResources(),
  })

  // Open modal in Add mode
  const openAddMediaModal = (type: AddMediaType, preselectedModuleId?: string) => {
    setMediaType(type)
    setEditingResource(null)
    setResTitle("")
    setResDesc("")
    setResModuleId(preselectedModuleId || "")
    setResLessonId("")
    setResFile(null)
    setResExternalUrl("")
    setResThumbnailUrl("")
    setResThumbnailFile(null)
    setResDurationMinutes(0)
    setResDisplayOrder(resources.length + 1)
    setResIsPublished(true)
    setFormError(null)
    setShowMediaModal(true)
  }

  // Open modal in Edit mode
  const openEditMediaModal = (res: ResourceItem) => {
    setEditingResource(res)
    setMediaType(res.resource_type.toUpperCase() as AddMediaType)
    setResTitle(res.title)
    setResDesc(res.description || "")
    setResModuleId(res.module_id || "")
    setResLessonId(res.lesson_id || "")
    setResFile(null)
    setResExternalUrl(res.storage_url.startsWith("http") ? res.storage_url : "")
    setResThumbnailUrl(res.thumbnail_url || "")
    setResThumbnailFile(null)
    setResDurationMinutes(res.duration_seconds ? Math.round(res.duration_seconds / 60) : 0)
    setResDisplayOrder(res.display_order ?? 1)
    setResIsPublished(res.is_published ?? true)
    setFormError(null)
    setShowMediaModal(true)
  }

  const closeMediaModal = () => {
    setShowMediaModal(false)
    setEditingResource(null)
    setResFile(null)
    setResThumbnailFile(null)
    setFormError(null)
  }

  // Move Up / Move Down handlers
  const handleMoveUp = (res: ResourceItem, idx: number) => {
    if (idx <= 0) return
    const prev = sortedResources[idx - 1]
    const curOrder = res.display_order ?? idx + 1
    const prevOrder = prev.display_order ?? idx
    updateOrderMutation.mutate({ resourceId: res.id, newOrder: Math.min(curOrder - 1, prevOrder - 1) })
  }

  const handleMoveDown = (res: ResourceItem, idx: number) => {
    if (idx >= sortedResources.length - 1) return
    const next = sortedResources[idx + 1]
    const curOrder = res.display_order ?? idx + 1
    const nextOrder = next.display_order ?? idx + 2
    updateOrderMutation.mutate({ resourceId: res.id, newOrder: Math.max(curOrder + 1, nextOrder + 1) })
  }

  // Preview Player
  const handlePlayPreview = (res: ResourceItem) => {
    setActiveMediaResource(res)
    const t = res.resource_type.toUpperCase()
    if (t === "VIDEO" || t === "EXTERNAL_VIDEO") {
      setShowVideoModal(true)
    } else if (t === "AUDIO") {
      setShowAudioModal(true)
    }
  }

  if (isCourseLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading course syllabus and media...</p>
      </div>
    )
  }

  if (courseError || !course) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <h3 className="font-semibold text-red-900">Failed to load course</h3>
          <p className="text-sm text-red-700 mt-1">{(courseError as Error)?.message || "Course not found."}</p>
        </CardContent>
      </Card>
    )
  }

  const isPublished = course.status === "PUBLISHED"
  const sortedResources = [...resources].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))

  // Find module lessons for select dropdown
  const selectedModule = course.modules.find((m: any) => m.id === resModuleId)
  const moduleLessons = selectedModule?.lessons || []

  return (
    <div className="space-y-8">
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
      <Card className="border-slate-200 shadow-2xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-[#1557A6] uppercase tracking-wider">
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
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
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
                    : "bg-[#1557A6] hover:bg-[#114687] text-white"
                }`}
              >
                {isPublished ? "Revert Course to Draft" : "Publish Course Offering"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* 2. LEARNING RESOURCES SECTION (REQUIRED) */}
      {/* ============================================================ */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Film className="h-5 w-5 text-[#1557A6]" /> LEARNING RESOURCES ({resources.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Attach video lectures, audio briefings, presentations, and documents for enrolled trainees.
            </p>
          </div>

          {/* The 5 Required Add Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => openAddMediaModal("VIDEO")}
              className="bg-[#1557A6] hover:bg-[#114687] text-white text-xs font-semibold gap-1.5 shadow-2xs"
            >
              <Video className="h-3.5 w-3.5" /> + Add Video
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAddMediaModal("AUDIO")}
              className="text-xs font-semibold gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Headphones className="h-3.5 w-3.5" /> + Add Audio
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAddMediaModal("DOCUMENT")}
              className="text-xs font-semibold gap-1.5 border-blue-300 text-[#1557A6] hover:bg-blue-50"
            >
              <FileText className="h-3.5 w-3.5" /> + Add Document
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAddMediaModal("PRESENTATION")}
              className="text-xs font-semibold gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> + Add Presentation
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAddMediaModal("EXTERNAL_VIDEO")}
              className="text-xs font-semibold gap-1.5 border-rose-300 text-rose-700 hover:bg-rose-50"
            >
              <Globe className="h-3.5 w-3.5" /> + Add External Video
            </Button>
          </div>
        </div>

        {/* Resources Cards Display */}
        {isResourcesLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading learning resources...</div>
        ) : sortedResources.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardContent className="py-10 text-center space-y-2">
              <Film className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">No learning resources attached to this course yet.</p>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                Use the buttons above to upload instructional video recordings, audio lectures, PDF manuals, or link verified IMD video broadcasts.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedResources.map((res, idx) => {
              // Find matching module/lesson label
              const mod = course.modules.find((m: any) => m.id === res.module_id)
              const les = mod?.lessons?.find((l: any) => l.id === res.lesson_id)

              return (
                <div key={res.id} className="relative">
                  {(mod || les) && (
                    <div className="text-[10px] font-semibold text-slate-400 mb-1 pl-1 flex items-center gap-1.5">
                      <span>Module: {mod?.title || "Course Wide"}</span>
                      {les && <span>• Lesson: {les.title}</span>}
                    </div>
                  )}
                  <ResourceCard
                    resource={res}
                    isTrainer={true}
                    onPlay={() => handlePlayPreview(res)}
                    onOpen={() => window.open(res.storage_url, "_blank")}
                    onEdit={() => openEditMediaModal(res)}
                    onDelete={() => {
                      if (window.confirm(`Are you sure you want to delete "${res.title}"?`)) {
                        deleteResourceMutation.mutate(res.id)
                      }
                    }}
                    onTogglePublish={() =>
                      toggleResourcePublishMutation.mutate({
                        resourceId: res.id,
                        isPublished: !res.is_published,
                      })
                    }
                    canMoveUp={idx > 0}
                    canMoveDown={idx < sortedResources.length - 1}
                    onMoveUp={() => handleMoveUp(res, idx)}
                    onMoveDown={() => handleMoveDown(res, idx)}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* SYLLABUS MODULES & LESSONS */}
      {/* ============================================================ */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#1557A6]" /> Syllabus Modules ({course.modules.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Structure the instructional syllabus and connect lessons to learning resources.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setShowModuleModal(true)}
            className="bg-[#1557A6] hover:bg-[#114687] text-white text-xs gap-1 font-semibold"
          >
            <Plus className="h-3.5 w-3.5" /> Add Module
          </Button>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {course.modules.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200">
              <CardContent className="py-10 text-center">
                <p className="text-xs text-slate-500">No modules added yet. Add a module to begin assembling lessons.</p>
              </CardContent>
            </Card>
          ) : (
            course.modules.map((m: any, idx: number) => {
              const moduleResCount = resources.filter((r) => r.module_id === m.id).length

              return (
                <Card key={m.id} className="border-slate-200 shadow-2xs">
                  <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">
                          Module {idx + 1}
                        </Badge>
                        {moduleResCount > 0 && (
                          <Badge className="bg-blue-50 text-[#1557A6] border-blue-200 text-[10px]">
                            {moduleResCount} Media Resource{moduleResCount > 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900">
                        {m.title}
                      </CardTitle>
                      {m.description && (
                        <CardDescription className="text-xs mt-0.5 text-slate-600">{m.description}</CardDescription>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAddMediaModal("VIDEO", m.id)}
                        className="text-xs gap-1 text-slate-700 hover:text-[#1557A6]"
                      >
                        <Plus className="h-3 w-3" /> Add Media
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setTargetModuleId(m.id)
                          setShowLessonModal(true)
                        }}
                        className="text-xs gap-1 text-slate-700"
                      >
                        <Plus className="h-3 w-3" /> Add Lesson
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    {m.lessons.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No instructional lessons in this module.</p>
                    ) : (
                      <div className="space-y-2">
                        {m.lessons.map((l: any, lIdx: number) => {
                          const lessonRes = resources.filter((r) => r.lesson_id === l.id)
                          return (
                            <div
                              key={l.id}
                              className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-400 text-[11px]">{idx + 1}.{lIdx + 1}</span>
                                <div>
                                  <span className="font-semibold text-slate-800 block">
                                    {l.title}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    {l.content_type} • {l.duration_minutes} mins
                                    {lessonRes.length > 0 && ` • ${lessonRes.length} attached media`}
                                  </span>
                                </div>
                              </div>

                              <Badge variant="secondary" className="text-[10px] self-start sm:self-center">
                                {l.content_type}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3, 4, 5. ADD / EDIT LEARNING RESOURCE MODAL */}
      {/* ============================================================ */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <Card className="max-w-lg w-full p-6 shadow-xl border-slate-200 bg-white my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {mediaType === "VIDEO" && <Video className="h-4 w-4 text-rose-600" />}
                  {mediaType === "AUDIO" && <Headphones className="h-4 w-4 text-purple-600" />}
                  {mediaType === "DOCUMENT" && <FileText className="h-4 w-4 text-[#1557A6]" />}
                  {mediaType === "PRESENTATION" && <FileSpreadsheet className="h-4 w-4 text-amber-600" />}
                  {mediaType === "EXTERNAL_VIDEO" && <Globe className="h-4 w-4 text-rose-600" />}
                  {editingResource ? "Edit Resource" : `Add ${mediaType.replace("_", " ")}`}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Consistent with IMD Digital Capacity Building Portal standards.
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold">
                {mediaType}
              </Badge>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-3.5 pt-4 text-xs">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  {mediaType === "VIDEO" ? "Video Title *" : mediaType === "AUDIO" ? "Audio Title *" : "Resource Title *"}
                </label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder={
                    mediaType === "VIDEO"
                      ? "e.g. Understanding Synoptic Charts & Pressure Gradients"
                      : mediaType === "AUDIO"
                      ? "e.g. Weather Briefing & Monsoon Outlook"
                      : mediaType === "EXTERNAL_VIDEO"
                      ? "e.g. IMD Official Weather Briefing Broadcast"
                      : "e.g. Radar Operations Protocol"
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  placeholder="Key meteorological concepts covered in this resource..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                />
              </div>

              {/* Module & Lesson Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Module (Optional)</label>
                  <select
                    value={resModuleId}
                    onChange={(e) => {
                      setResModuleId(e.target.value)
                      setResLessonId("")
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1557A6] bg-white text-xs"
                  >
                    <option value="">-- Course Wide (General) --</option>
                    {course.modules.map((m: any, idx: number) => (
                      <option key={m.id} value={m.id}>
                        Module {idx + 1}: {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Lesson (Optional)</label>
                  <select
                    value={resLessonId}
                    onChange={(e) => setResLessonId(e.target.value)}
                    disabled={!resModuleId || moduleLessons.length === 0}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1557A6] bg-white text-xs disabled:bg-slate-100"
                  >
                    <option value="">-- No specific lesson --</option>
                    {moduleLessons.map((l: any, lIdx: number) => (
                      <option key={l.id} value={l.id}>
                        Lesson {lIdx + 1}: {l.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload OR External URL */}
              {mediaType === "EXTERNAL_VIDEO" ? (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Video URL (YouTube or Official IMD URL) *</label>
                  <input
                    type="url"
                    required
                    value={resExternalUrl}
                    onChange={(e) => setResExternalUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://mausam.imd.gov.in/..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                  />
                  <p className="text-[10px] text-slate-400">
                    Safe verified external links only. Arbitrary executable URLs are rejected.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    {mediaType === "VIDEO" && "Video File (MP4, WebM — Max 100MB)"}
                    {mediaType === "AUDIO" && "Audio File (MP3, WAV, M4A, AAC — Max 30MB)"}
                    {mediaType === "DOCUMENT" && "Document File (PDF, DOCX — Max 25MB)"}
                    {mediaType === "PRESENTATION" && "Presentation File (PPTX, PDF — Max 25MB)"}
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-md p-3 bg-slate-50 text-center hover:border-slate-300 transition-colors">
                    <input
                      type="file"
                      id="resource-file-input"
                      className="hidden"
                      accept={
                        mediaType === "VIDEO"
                          ? "video/mp4,video/webm"
                          : mediaType === "AUDIO"
                          ? "audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg"
                          : mediaType === "DOCUMENT"
                          ? "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                          : "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"
                      }
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setResFile(e.target.files[0])
                        }
                      }}
                    />
                    <label htmlFor="resource-file-input" className="cursor-pointer block">
                      <UploadCloud className="h-6 w-6 text-slate-400 mx-auto mb-1" />
                      {resFile ? (
                        <p className="font-semibold text-emerald-700 truncate">{resFile.name} ({(resFile.size / (1024 * 1024)).toFixed(1)} MB)</p>
                      ) : (
                        <div>
                          <span className="font-semibold text-[#1557A6] hover:underline">Choose file</span>
                          <span className="text-slate-500"> or drag and drop</span>
                        </div>
                      )}
                    </label>
                  </div>
                  {/* Or external URL option */}
                  <div className="pt-1">
                    <span className="text-[10px] text-slate-500">Or link directly to an existing storage/official URL:</span>
                    <input
                      type="url"
                      value={resExternalUrl}
                      onChange={(e) => setResExternalUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full mt-0.5 px-2.5 py-1.5 border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Thumbnail (for video or external video) */}
              {(mediaType === "VIDEO" || mediaType === "EXTERNAL_VIDEO") && (
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Thumbnail Image (Optional)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="url"
                      value={resThumbnailUrl}
                      onChange={(e) => setResThumbnailUrl(e.target.value)}
                      placeholder="https://... or leave empty for IMD category fallback"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs"
                    />
                    <input
                      type="file"
                      id="thumbnail-file-input"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setResThumbnailFile(e.target.files[0])
                        }
                      }}
                    />
                    <label
                      htmlFor="thumbnail-file-input"
                      className="cursor-pointer shrink-0 px-2.5 py-2 border border-slate-300 rounded-md bg-slate-50 text-[11px] font-medium hover:bg-slate-100"
                    >
                      {resThumbnailFile ? resThumbnailFile.name.substring(0, 10) + "..." : "Upload"}
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    If omitted, official IMD category imagery (Satellite, Radar, Cyclone) is applied automatically.
                  </p>
                </div>
              )}

              {/* Duration & Display Order */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    value={resDurationMinutes || ""}
                    onChange={(e) => setResDurationMinutes(Number(e.target.value))}
                    placeholder="e.g. 15"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={resDisplayOrder}
                    onChange={(e) => setResDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs"
                  />
                </div>
              </div>

              {/* Publish Status */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Publish Status</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="publishStatus"
                      checked={resIsPublished}
                      onChange={() => setResIsPublished(true)}
                      className="text-[#1557A6]"
                    />
                    <span className="font-medium text-slate-800">PUBLISHED (Available to trainees)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="publishStatus"
                      checked={!resIsPublished}
                      onChange={() => setResIsPublished(false)}
                      className="text-[#1557A6]"
                    />
                    <span className="font-medium text-slate-600">DRAFT (Hidden from trainees)</span>
                  </label>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={closeMediaModal}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => saveMediaMutation.mutate()}
                  disabled={saveMediaMutation.isPending}
                  className="bg-[#1557A6] hover:bg-[#114687] text-white font-bold min-w-[100px]"
                >
                  {saveMediaMutation.isPending ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </span>
                  ) : editingResource ? (
                    "Update Resource"
                  ) : (
                    "Save Resource"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="max-w-md w-full p-6 shadow-xl border-slate-200 bg-white">
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
                  className="bg-[#1557A6] hover:bg-[#114687] text-white font-bold"
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
          <Card className="max-w-md w-full p-6 shadow-xl border-slate-200 bg-white">
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
                    className="w-full px-3 py-2 border rounded-md bg-white"
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
                <label className="font-semibold text-slate-700">Instructional Content / Notes</label>
                <textarea
                  rows={4}
                  value={contentBody}
                  onChange={(e) => setContentBody(e.target.value)}
                  placeholder="Lesson text, meteorological formulas, or instructions..."
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
                  className="bg-[#1557A6] hover:bg-[#114687] text-white font-bold"
                >
                  Save Lesson
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Trainer Preview Modals */}
      {showVideoModal && activeMediaResource && (
        <VideoPlayerModal
          resource={activeMediaResource}
          onClose={() => {
            setShowVideoModal(false)
            setActiveMediaResource(null)
          }}
        />
      )}

      {showAudioModal && activeMediaResource && (
        <AudioPlayerModal
          resource={activeMediaResource}
          onClose={() => {
            setShowAudioModal(false)
            setActiveMediaResource(null)
          }}
        />
      )}
    </div>
  )
}
