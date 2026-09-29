import React, { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ShieldCheck,
  FileQuestion,
} from "lucide-react"
import { trainerService, TrainerCourseItem } from "@/services/trainer"
import { AssessmentListItem } from "@/services/assessments"
import { aiService, AIQuizDraftItem } from "@/services/aiService"

export const TrainerAiQuizGeneratorPage: React.FC = () => {
  const queryClient = useQueryClient()

  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [selectedModuleId, setSelectedModuleId] = useState<string>("")
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([])
  const [questionCount, setQuestionCount] = useState<number>(3)
  const [difficulty, setDifficulty] = useState<string>("INTERMEDIATE")
  const [bloomLevel, setBloomLevel] = useState<string>("Bloom Level 3 — Apply")
  const [targetAssessmentId, setTargetAssessmentId] = useState<string>("")
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<AIQuizDraftItem>>({})

  // Fetch Trainer Courses
  const { data: rawCourses } = useQuery({
    queryKey: ["trainer-courses"],
    queryFn: () => trainerService.listCourses(),
  })
  const courses: TrainerCourseItem[] = rawCourses || []

  useEffect(() => {
    if (rawCourses && rawCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(rawCourses[0].id)
    }
  }, [rawCourses, selectedCourseId])

  // Fetch Course Detail for modules
  const { data: courseDetail } = useQuery({
    queryKey: ["trainer-course-detail", selectedCourseId],
    queryFn: () => trainerService.getCourseDetail(selectedCourseId),
    enabled: !!selectedCourseId,
  })
  const modules = courseDetail?.modules || []

  // Fetch Assessments for selected course
  const { data: allAssessments } = useQuery({
    queryKey: ["trainer-assessments"],
    queryFn: () => trainerService.listAssessments(),
  })
  const assessments = React.useMemo(() => {
    if (!allAssessments) return []
    return allAssessments.filter(
      (a: AssessmentListItem) => !selectedCourseId || a.course_id === selectedCourseId
    )
  }, [allAssessments, selectedCourseId])

  useEffect(() => {
    if (assessments.length > 0 && !targetAssessmentId) {
      setTargetAssessmentId(assessments[0].id)
    }
  }, [assessments.length, targetAssessmentId])

  // Fetch AI Resources
  const { data: rawResources } = useQuery({
    queryKey: ["ai-notebook-resources", selectedCourseId, selectedModuleId],
    queryFn: () => aiService.getNotebookResources(selectedCourseId, selectedModuleId || undefined),
    enabled: !!selectedCourseId,
  })

  useEffect(() => {
    if (rawResources && rawResources.length > 0) {
      setSelectedResourceIds(rawResources.map((r) => r.id))
    }
  }, [rawResources])

  // Fetch Drafts for selected course
  const { data: drafts = [], isLoading: isLoadingDrafts } = useQuery({
    queryKey: ["ai-quiz-drafts", selectedCourseId],
    queryFn: () => aiService.getQuizDrafts({ course_id: selectedCourseId }),
    enabled: !!selectedCourseId,
  })

  // Mutations
  const generateMutation = useMutation({
    mutationFn: () =>
      aiService.generateQuizQuestions({
        course_id: selectedCourseId,
        module_id: selectedModuleId || undefined,
        resource_ids: selectedResourceIds.length > 0 ? selectedResourceIds : undefined,
        question_count: questionCount,
        difficulty,
        bloom_level: bloomLevel,
        target_assessment_id: targetAssessmentId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-quiz-drafts", selectedCourseId] })
    },
    onError: (err: any) => {
      alert(err?.message || "Failed to generate quiz questions.")
    },
  })

  const approveMutation = useMutation({
    mutationFn: (draftId: string) =>
      aiService.approveQuizDraft(draftId, targetAssessmentId || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-quiz-drafts", selectedCourseId] })
      queryClient.invalidateQueries({ queryKey: ["course-assessments", selectedCourseId] })
    },
    onError: (err: any) => {
      alert(err?.message || "Failed to approve question.")
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (draftId: string) => aiService.rejectQuizDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-quiz-drafts", selectedCourseId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (draftId: string) => aiService.deleteQuizDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-quiz-drafts", selectedCourseId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ draftId, data }: { draftId: string; data: Partial<AIQuizDraftItem> }) =>
      aiService.updateQuizDraft(draftId, data),
    onSuccess: () => {
      setEditingDraftId(null)
      queryClient.invalidateQueries({ queryKey: ["ai-quiz-drafts", selectedCourseId] })
    },
  })

  const startEdit = (draft: AIQuizDraftItem) => {
    setEditingDraftId(draft.id)
    setEditFormData({
      question: draft.question,
      options: [...draft.options],
      correct_answer: draft.correct_answer,
      explanation: draft.explanation,
    })
  }

  const handleSaveEdit = (draftId: string) => {
    updateMutation.mutate({ draftId, data: editFormData })
  }

  const handleOptionChange = (idx: number, text: string) => {
    const nextOpts = [...(editFormData.options || [])]
    nextOpts[idx] = { ...nextOpts[idx], option_text: text }
    setEditFormData({ ...editFormData, options: nextOpts })
  }

  const handleSetCorrectOption = (idx: number) => {
    const nextOpts = (editFormData.options || []).map((opt, i) => ({
      ...opt,
      is_correct: i === idx,
    }))
    const correctText = nextOpts[idx]?.option_text || ""
    setEditFormData({ ...editFormData, options: nextOpts, correct_answer: correctText })
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-50 text-[#1557A6] rounded-md">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Assessment Quiz Generator</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1557A6] border border-blue-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Human Review Enforced
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Generate high-order Bloom L3 (Apply) & L4 (Analyze) questions grounded in verified curriculum resources. All items require trainer review before entering active assessments.
          </p>
        </div>
      </div>

      {/* Generator Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <FileQuestion className="h-4 w-4 text-[#1557A6]" />
          Generation Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value)
                setSelectedModuleId("")
              }}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800"
            >
              {courses.map((c: TrainerCourseItem) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Module Scope
            </label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800"
            >
              <option value="">All Course Modules</option>
              {modules.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Target Existing Assessment
            </label>
            <select
              value={targetAssessmentId}
              onChange={(e) => setTargetAssessmentId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800"
            >
              {assessments.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Cognitive Level (Bloom Taxonomy)
            </label>
            <select
              value={bloomLevel}
              onChange={(e) => setBloomLevel(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 font-medium"
            >
              <option value="Bloom Level 3 — Apply">Bloom Level 3 — Apply (Operational Scenario)</option>
              <option value="Bloom Level 4 — Analyze">Bloom Level 4 — Analyze (Diagnostic Evaluation)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800"
            >
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Number of Questions
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800"
            />
          </div>
        </div>

        <div className="pt-3 flex justify-between items-center border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Initial review status: <span className="font-semibold text-amber-700">AI GENERATED — PENDING REVIEW</span>
          </div>

          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !selectedCourseId}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1557A6] hover:bg-[#114380] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Sparkles className={`h-4 w-4 ${generateMutation.isPending ? "animate-spin" : ""}`} />
            {generateMutation.isPending ? "Generating Grounded Questions..." : "Generate AI Questions"}
          </button>
        </div>
      </div>

      {/* Draft Questions Review Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-[#1557A6]" />
            Generated Question Bank ({drafts.length})
          </h2>
          <span className="text-xs text-slate-500">
            Pending: {drafts.filter((d) => d.status === "PENDING_REVIEW").length} | Approved: {drafts.filter((d) => d.status === "APPROVED").length}
          </span>
        </div>

        {isLoadingDrafts ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-400">
            Loading draft questions...
          </div>
        ) : drafts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-2">
            <FileQuestion className="h-8 w-8 text-slate-300 mx-auto" />
            <div className="font-medium text-sm text-slate-700">No questions generated yet</div>
            <p className="text-xs text-slate-400">Configure parameters above and click "Generate AI Questions".</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft, idx) => {
              const isEditing = editingDraftId === draft.id
              const isApproved = draft.status === "APPROVED"
              const isRejected = draft.status === "REJECTED"

              return (
                <div
                  key={draft.id}
                  className={`bg-white border rounded-xl p-5 shadow-sm space-y-4 transition-all ${
                    isApproved
                      ? "border-emerald-200 bg-emerald-50/20"
                      : isRejected
                      ? "border-rose-200 bg-rose-50/20 opacity-70"
                      : "border-slate-200"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isRejected
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {draft.review_status}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {draft.bloom_level}
                      </span>
                      <span className="text-[11px] text-slate-500 uppercase font-medium">
                        {draft.difficulty}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {!isApproved && !isRejected && (
                        <>
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(draft.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => setEditingDraftId(null)}
                                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-medium"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(draft)}
                                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                                title="Edit Question"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => approveMutation.mutate(draft.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-2xs"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => rejectMutation.mutate(draft.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-medium"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                        </>
                      )}

                      <button
                        onClick={() => deleteMutation.mutate(draft.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete Question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Question Prompt
                        </label>
                        <textarea
                          value={editFormData.question || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, question: e.target.value })
                          }
                          rows={3}
                          className="w-full text-xs rounded border border-slate-300 p-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-600">
                          Options (Select radio for correct answer)
                        </label>
                        {editFormData.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-opt-${draft.id}`}
                              checked={opt.is_correct}
                              onChange={() => handleSetCorrectOption(oIdx)}
                            />
                            <input
                              type="text"
                              value={opt.option_text}
                              onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                              className="flex-1 text-xs rounded border border-slate-300 p-1.5"
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Explanation
                        </label>
                        <textarea
                          value={editFormData.explanation || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, explanation: e.target.value })
                          }
                          rows={2}
                          className="w-full text-xs rounded border border-slate-300 p-2"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                        {draft.question}
                      </div>

                      {/* 4 Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {draft.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                              opt.is_correct
                                ? "bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium"
                                : "bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            <span className="font-bold uppercase text-slate-400">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <span className="flex-1">{opt.option_text}</span>
                            {opt.is_correct && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Diagnostic Explanation & Citation */}
                      {draft.explanation && (
                        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                          <span className="font-bold text-slate-800">Diagnostic Justification:</span>{" "}
                          {draft.explanation}
                        </div>
                      )}

                      {draft.source_citation && (
                        <div className="text-[11px] text-[#1557A6] font-medium flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Grounded Citation: {draft.source_citation}</span>
                        </div>
                      )}

                      {isApproved && draft.injected_question_id && (
                        <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 pt-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Pushed to Assessment Bank (Question ID: {draft.injected_question_id.slice(0, 8)}...)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default TrainerAiQuizGeneratorPage
