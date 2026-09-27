import React, { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus,
  ArrowLeft,
  Trash2,
  HelpCircle,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { trainerService } from "@/services/trainer"

export const TrainerAssessmentBuilderPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const queryClient = useQueryClient()

  // Question builder form state
  const [questionText, setQuestionText] = useState("")
  const [marks, setMarks] = useState(1.0)
  const [explanation, setExplanation] = useState("")
  const [options, setOptions] = useState([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ])
  const [formError, setFormError] = useState<string | null>(null)

  const { data: assessment, isLoading, error } = useQuery({
    queryKey: ["trainer-assessment-detail", assessmentId],
    queryFn: () => trainerService.getAssessment(assessmentId!),
    enabled: !!assessmentId,
  })

  const addQuestionMutation = useMutation({
    mutationFn: (data: any) => trainerService.addQuestion(assessmentId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-assessment-detail", assessmentId] })
      setQuestionText("")
      setExplanation("")
      setOptions([
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ])
      setFormError(null)
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to add question.")
    },
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: (qId: string) => trainerService.deleteQuestion(qId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-assessment-detail", assessmentId] })
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (newStatus: string) => trainerService.updateAssessment(assessmentId!, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trainer-assessment-detail", assessmentId] })
    },
  })

  const handleOptionTextChange = (idx: number, text: string) => {
    setOptions((prev) => {
      const copy = [...prev]
      copy[idx].text = text
      return copy
    })
  }

  const handleSetCorrect = (idx: number) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({
        ...opt,
        isCorrect: i === idx,
      }))
    )
  }

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!questionText.trim()) {
      setFormError("Question prompt is required.")
      return
    }

    const filledOptions = options.filter((o) => o.text.trim() !== "")
    if (filledOptions.length < 2) {
      setFormError("You must provide at least 2 non-empty options.")
      return
    }

    if (!filledOptions.some((o) => o.isCorrect)) {
      setFormError("You must designate one of the options as the correct answer.")
      return
    }

    addQuestionMutation.mutate({
      question_text: questionText,
      marks: Number(marks),
      explanation: explanation || undefined,
      order_index: (assessment?.questions?.length || 0) + 1,
      options: filledOptions.map((o, idx) => ({
        option_text: o.text,
        is_correct: o.isCorrect,
        order_index: idx + 1,
      })),
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading assessment question bank...</p>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <h3 className="font-semibold text-red-900">Failed to load assessment</h3>
          <p className="text-sm text-red-700 mt-1">{(error as Error)?.message}</p>
        </CardContent>
      </Card>
    )
  }

  const isPublished = assessment.status === "PUBLISHED"

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/trainer/assessments"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Assessments
        </Link>
      </div>

      {/* Header Summary */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {assessment.course_title}
                </span>
                <Badge variant={isPublished ? "success" : "secondary"} className="text-[10px]">
                  {assessment.status}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {assessment.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {assessment.questions_count} Questions • {assessment.duration_minutes || "—"} mins • Passing:{" "}
                {assessment.passing_percentage}%
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => toggleStatusMutation.mutate(isPublished ? "DRAFT" : "PUBLISHED")}
              disabled={toggleStatusMutation.isPending}
              className={`text-xs font-bold ${
                isPublished ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isPublished ? "Revert to Draft" : "Publish to Trainees"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Question Authoring Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-emerald-600" /> Add MCQ Question
              </CardTitle>
              <CardDescription className="text-xs">
                Author question text, choices, marks, and explanation
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleAddQuestion} className="space-y-4 text-xs">
                {formError && (
                  <div className="p-2.5 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {formError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Question Prompt *</label>
                  <textarea
                    rows={3}
                    required
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="e.g. Which layer of the atmosphere contains the ozone layer?"
                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700 leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Marks Awarded</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>

                {/* Options with Correct Choice Radio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Answer Choices (Select the correct one) *
                    </label>
                  </div>

                  {options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx)
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetCorrect(idx)}
                          className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            opt.isCorrect
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800"
                          }`}
                          title={opt.isCorrect ? "Correct answer" : "Click to mark as correct"}
                        >
                          {letter}
                        </button>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                          placeholder={`Option ${letter}`}
                          className={`flex-1 px-3 py-1.5 border rounded-md dark:bg-slate-900 ${
                            opt.isCorrect
                              ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
                              : "dark:border-slate-700"
                          }`}
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Scientific Explanation (Revealed on Evaluation)
                  </label>
                  <textarea
                    rows={2}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Provide physics/meteorology justification..."
                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-900 dark:border-slate-700"
                  />
                </div>

                <Button
                  type="submit"
                  size="sm"
                  disabled={addQuestionMutation.isPending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {addQuestionMutation.isPending ? "Adding..." : "Save Question to Bank"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Existing Question Bank (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Configured Questions ({assessment.questions.length})
            </h2>
          </div>

          {assessment.questions.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800">
              <CardContent className="py-12 text-center">
                <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No questions in this assessment yet. Use the form to add questions.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {assessment.questions.map((q, idx) => (
                <Card key={q.id} className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          Q{idx + 1}
                        </Badge>
                        <span className="text-[11px] text-slate-500">{q.marks} Mark(s)</span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteQuestionMutation.mutate(q.id)}
                        className="h-6 w-6 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                      {q.question_text}
                    </p>

                    {/* Options preview */}
                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={opt.id}
                          className={`px-2.5 py-1 rounded text-[11px] flex items-center justify-between ${
                            opt.is_correct
                              ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                            <span>{opt.option_text}</span>
                          </div>
                          {opt.is_correct && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              <Check className="h-3 w-3" /> Correct
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100 dark:border-slate-800">
                        Explanation: {q.explanation}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
