import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  BookOpen,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { trainerService, TrainerCourseItem } from "@/services/trainer"
import { coursesService } from "@/services/courses"

export const TrainerCoursesPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [code, setCode] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [difficulty, setDifficulty] = useState("BEGINNER")
  const [durationHours, setDurationHours] = useState(10)
  const [description, setDescription] = useState("")
  const [objectives, setObjectives] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  const { data: courses, isLoading, error } = useQuery({
    queryKey: ["trainer-courses"],
    queryFn: () => trainerService.listCourses(),
  })

  const { data: catalogue } = useQuery({
    queryKey: ["course-categories"],
    queryFn: () => coursesService.getCatalogue({ pageSize: 1 }),
  })
  const categories = catalogue?.categories || []

  const createCourseMutation = useMutation({
    mutationFn: trainerService.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-courses"] })
      setShowCreateModal(false)
      setTitle("")
      setCode("")
      setDescription("")
      setObjectives("")
      setFormError(null)
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to create course.")
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !code || !categoryId) {
      setFormError("Title, course code, and category are required.")
      return
    }
    createCourseMutation.mutate({
      title,
      code,
      category_id: categoryId,
      difficulty_level: difficulty,
      duration_hours: Number(durationHours),
      description,
      objectives,
      status: "DRAFT",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-emerald-700" />
            <span>Curriculum Authoring & Course Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Author and publish meteorological training modules, lessons, and learning resources.
          </p>
        </div>

        <Button
          onClick={() => {
            if (categories.length > 0 && !categoryId) setCategoryId(categories[0].id)
            setShowCreateModal(true)
          }}
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5 font-semibold self-start sm:self-auto shadow-xs"
        >
          <Plus className="h-4 w-4" /> Create New Course
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-emerald-700 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading managed courses...</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-red-900">Failed to load courses</h3>
            <p className="text-sm text-red-700 mt-1">{(error as Error).message}</p>
          </CardContent>
        </Card>
      ) : (courses || []).length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <BookOpen className="h-12 w-12 text-slate-300 mb-3" />
            <h3 className="font-semibold text-slate-800 text-base">No Courses Managed Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              You haven't authored any courses. Click 'Create New Course' to establish your first syllabus.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(courses || []).map((c: TrainerCourseItem) => (
            <Card
              key={c.id}
              className="flex flex-col justify-between hover:shadow-sm transition-shadow border-slate-200 bg-white"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-emerald-700">
                    {c.code}
                  </span>
                  <Badge
                    variant={c.status === "PUBLISHED" ? "success" : "secondary"}
                    className="text-[10px] font-semibold"
                  >
                    {c.status}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 line-clamp-1">
                  {c.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {c.description || "Comprehensive syllabus for meteorological officers."}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-md border border-slate-100 text-slate-600">
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] text-slate-400">Enrolled</span>
                    <span className="font-bold text-slate-800">{c.enrolled_count}</span>
                  </div>
                  <div className="flex flex-col items-center text-center border-x border-slate-200">
                    <span className="text-[10px] text-slate-400">Modules</span>
                    <span className="font-bold text-slate-800">{c.modules_count}</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-[10px] text-slate-400">Duration</span>
                    <span className="font-bold text-slate-800">{c.duration_hours}h</span>
                  </div>
                </div>

                <Link to={`/trainer/courses/${c.id}`} className="block">
                  <Button variant="outline" className="w-full text-xs font-semibold justify-between hover:bg-slate-50">
                    <span>Manage Syllabus</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Course Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <Card className="max-w-xl w-full p-6 shadow-xl border-slate-200 my-8 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Author New Course</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
              {formError && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-md border border-red-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Advanced Radar Nowcasting"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. RAD-401"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md uppercase bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of course content and meteorological scope..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Learning Objectives</label>
                <textarea
                  rows={2}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="Key competencies acquired upon completion..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createCourseMutation.isPending}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold gap-1.5 shadow-xs"
                >
                  {createCourseMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating...
                    </>
                  ) : (
                    "Save & Author Syllabus"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
