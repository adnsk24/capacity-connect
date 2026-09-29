import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  HelpCircle,
  Loader2,
  CheckCircle,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { assessmentsService, AssessmentAttemptStartResponse } from "@/services/assessments"

export const AssessmentTakePage: React.FC = () => {
  const { assessmentId, attemptId } = useParams<{ assessmentId: string; attemptId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { data: attemptData, isLoading, error } = useQuery({
    queryKey: ["assessment-attempt", attemptId],
    queryFn: () => assessmentsService.getAttemptState(attemptId!),
    enabled: !!attemptId,
    refetchOnWindowFocus: false,
  })

  const attempt = attemptData as AssessmentAttemptStartResponse | undefined

  // If already evaluated, redirect to result
  useEffect(() => {
    if (attempt && attempt.status === "EVALUATED") {
      navigate(`/trainee/assessments/${assessmentId}/result/${attemptId}`, { replace: true })
    }
  }, [attempt, assessmentId, attemptId, navigate])

  // Initialize and run countdown timer
  useEffect(() => {
    if (attempt && attempt.remaining_seconds !== undefined && attempt.remaining_seconds !== null) {
      setRemainingSeconds(attempt.remaining_seconds)
    }
  }, [attempt])

  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          // Auto-submit when time expires
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [remainingSeconds])

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const handleSubmit = async (_isAuto = false) => {
    if (!attemptId || submitting) return
    setSubmitting(true)
    setErrorMsg(null)

    const payload = Object.entries(answers).map(([qId, optId]) => ({
      question_id: qId,
      selected_option_id: optId,
    }))

    try {
      await assessmentsService.submitAttempt(attemptId, payload)
      queryClient.invalidateQueries({ queryKey: ["trainee-learning"] })
      queryClient.invalidateQueries({ queryKey: ["trainee-certificates"] })
      queryClient.invalidateQueries({ queryKey: ["trainee-dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["assessment-history"] })
      navigate(`/trainee/assessments/${assessmentId}/result/${attemptId}`, { replace: true })
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit assessment answers.")
      setSubmitting(false)
      setShowConfirmModal(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Initializing secure exam environment...</p>
      </div>
    )
  }

  if (error || !attempt || !attempt.questions) {
    return (
      <Card className="border-red-200 bg-red-50/50 max-w-lg mx-auto">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <h3 className="font-semibold text-red-900">Exam Session Error</h3>
          <p className="text-sm text-red-700 mt-1">{(error as Error)?.message || "Unable to load attempt."}</p>
        </CardContent>
      </Card>
    )
  }

  const questions = attempt.questions
  const currentQ = questions[currentIndex]
  const totalQuestions = questions.length
  const answeredCount = Object.keys(answers).length

  // Timer formatting
  const formatTimer = (sec: number | null) => {
    if (sec === null) return "--:--"
    const mins = Math.floor(sec / 60)
    const secs = sec % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const isTimerCritical = remainingSeconds !== null && remainingSeconds < 180

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top Floating Control Bar */}
      <div className="sticky top-20 z-40 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-[#1557A6] uppercase tracking-wider block">
            {attempt.assessment_title}
          </span>
          <span className="text-[12px] text-slate-500">
            Attempt #{attempt.attempt_number} · Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono font-bold ${
              isTimerCritical
                ? "bg-red-50 border-red-200 text-red-700 animate-pulse"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <Clock className="h-4 w-4 text-current" />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>

          <Button
            size="sm"
            onClick={() => setShowConfirmModal(true)}
            disabled={submitting}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs h-8 gap-1.5"
          >
            <Send className="h-3.5 w-3.5" /> Submit Exam
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Main Examination Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Question & Choices Area (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-slate-200 shadow-xs bg-white">
            <CardHeader className="p-5 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[11px] font-medium border-slate-200 bg-slate-50 text-slate-700">
                  Question {currentIndex + 1} of {totalQuestions}
                </Badge>
                <span className="text-[12px] text-slate-500 font-medium">{currentQ.marks} Mark(s)</span>
              </div>
              <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 mt-2 leading-relaxed">
                {currentQ.question_text}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 pt-4 space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === opt.id
                const optionLabel = String.fromCharCode(65 + idx) // A, B, C, D

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full text-left p-3.5 rounded-md border transition-all flex items-start gap-3 text-[13px] ${
                      isSelected
                        ? "bg-blue-50/70 border-[#1557A6] text-slate-900 shadow-xs"
                        : "bg-white hover:bg-slate-50/80 border-slate-200 text-slate-700"
                    }`}
                  >
                    <span
                      className={`h-6 w-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? "bg-[#1557A6] text-white"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {optionLabel}
                    </span>
                    <span className="pt-0.5 leading-snug">{opt.option_text}</span>
                  </button>
                )
              })}
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="text-xs h-8 gap-1 border-slate-200"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <div className="text-xs text-slate-500 font-medium">
              {answers[currentQ.id] ? (
                <span className="text-emerald-700 flex items-center gap-1 font-medium">
                  <CheckCircle className="h-3.5 w-3.5" /> Selected
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5" /> Unselected
                </span>
              )}
            </div>

            {currentIndex < totalQuestions - 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="text-xs h-8 gap-1 border-slate-200"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowConfirmModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 gap-1 font-medium"
              >
                Finish <Send className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Palette Sidebar (1 col) */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-xs bg-white">
            <CardHeader className="p-4 pb-3 border-b border-slate-100">
              <CardTitle className="text-[12px] font-bold text-slate-800 uppercase tracking-wider">
                Question Index
              </CardTitle>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {answeredCount} of {totalQuestions} answered
              </p>
            </CardHeader>

            <CardContent className="p-4 pt-3">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex
                  const isAnswered = !!answers[q.id]

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-8 w-8 rounded-md text-xs font-semibold transition-all flex items-center justify-center ${
                        isCurrent
                          ? "border-2 border-[#1557A6] font-bold text-[#1557A6] bg-blue-50"
                          : isAnswered
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-5 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-sm bg-slate-200 border border-slate-300" />
                  <span>Unanswered ({totalQuestions - answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-sm border-2 border-[#1557A6] bg-blue-50" />
                  <span>Current Question</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <Card className="max-w-md w-full p-6 shadow-lg border-slate-200 bg-white">
            <h3 className="text-base font-bold text-slate-900">Confirm Assessment Submission</h3>
            <p className="text-[13px] text-slate-600 mt-2 leading-relaxed">
              You have answered <span className="font-semibold text-slate-900">{answeredCount}</span> of{" "}
              <span className="font-semibold text-slate-900">{totalQuestions}</span> questions.
              {totalQuestions - answeredCount > 0 && (
                <span className="text-amber-700 block mt-1.5 font-medium">
                  Notice: {totalQuestions - answeredCount} question(s) remain unanswered!
                </span>
              )}
            </p>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="text-xs h-8 border-slate-200"
              >
                Review Answers
              </Button>
              <Button
                size="sm"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs h-8 gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Evaluating Answers...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" /> Submit & Finalize
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
