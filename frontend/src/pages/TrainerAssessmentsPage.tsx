import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  ClipboardCheck,
  Plus,
  Clock,
  Award,
  RotateCcw,
  ArrowRight,
  Loader2,
  Trash2,
  AlertCircle,
  X,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { trainerService } from "@/services/trainer"
import { AssessmentListItem } from "@/services/assessments"

export const TrainerAssessmentsPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)

  // Form state
  const [courseId, setCourseId] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [durationMins, setDurationMins] = useState(30)
  const [passingPct, setPassingPct] = useState(60)
  const [totalMarks, setTotalMarks] = useState(25)
  const [maxAttempts, setMaxAttempts] = useState(3)
  const [statusVal, setStatusVal] = useState("PUBLISHED")
  const [formError, setFormError] = useState<string | null>(null)

  const { data: assessments, isLoading, error } = useQuery({
    queryKey: ["trainer-assessments"],
    queryFn: () => trainerService.listAssessments(),
  })

  const { data: courses } = useQuery({
    queryKey: ["trainer-courses"],
    queryFn: () => trainerService.listCourses(),
  })

  const createMutation = useMutation({
    mutationFn: trainerService.createAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-assessments"] })
      setShowModal(false)
      setTitle("")
      setDescription("")
      setFormError(null)
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to create assessment.")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: trainerService.deleteAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-assessments"] })
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !courseId) {
      setFormError("Title and course selection are required.")
      return
    }
    createMutation.mutate({
      course_id: courseId,
      title,
      description,
      duration_minutes: Number(durationMins),
      passing_percentage: Number(passingPct),
      total_marks: Number(totalMarks),
      max_attempts: Number(maxAttempts),
      status: statusVal,
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Assessment Authoring & Question Bank
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build timed MCQ examinations, establish rubrics, and manage questions.
          </p>
        </div>

        <Button
          onClick={() => {
            if (courses && courses.length > 0 && !courseId) setCourseId(courses[0].id)
            setShowModal(true)
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 font-bold self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Create Assessment
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading trainer assessments...</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-red-900">Failed to load assessments</h3>
            <p className="text-sm text-red-700 mt-1">{(error as Error).message}</p>
          </CardContent>
        </Card>
      ) : (assessments || []).length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <ClipboardCheck className="h-12 w-12 text-slate-300 mb-3" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-lg">No Assessments Created</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              Click 'Create Assessment' to configure your first examination and add MCQ questions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(assessments || []).map((ass: AssessmentListItem) => (
            <Card
              key={ass.id}
              className="flex flex-col justify-between hover:shadow-md transition-shadow border-slate-200 dark:border-slate-800"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
                    {ass.course_title}
                  </span>
                  <Badge
                    variant={ass.status === "PUBLISHED" ? "success" : "secondary"}
                    className="text-[10px]"
                  >
                    {ass.status}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  {ass.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {ass.description || "Modular competency evaluation."}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                    <span>{ass.duration_minutes || "—"} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    <span>Pass: {ass.passing_percentage}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{ass.questions_count} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5 text-purple-500" />
                    <span>{ass.user_attempts_count} Attempts</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link to={`/trainer/assessments/${ass.id}`} className="flex-1">
                    <Button variant="outline" className="w-full text-xs font-semibold justify-between">
                      <span>Question Builder</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this assessment?")) {
                        deleteMutation.mutate(ass.id)
                      }
                    }}
                    className="h-8 w-8 text-slate-400 hover:text-red-600 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Assessment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="max-w-lg w-full p-6 shadow-xl border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Assessment</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
              {formError && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Course Association *</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                >
                  {(courses || []).map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Assessment Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Synoptic Charting Examination"
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Duration (Mins)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Pass (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={passingPct}
                    onChange={(e) => setPassingPct(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Total Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Attempts</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Instructions / Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Exam scope, rubric, and rules..."
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Status</label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                >
                  <option value="PUBLISHED">PUBLISHED (Students can see & take)</option>
                  <option value="DRAFT">DRAFT (Hidden until questions completed)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {createMutation.isPending ? "Creating..." : "Save Assessment"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
