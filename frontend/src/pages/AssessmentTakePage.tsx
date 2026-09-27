import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Floating Control Bar */}
      <div className="sticky top-20 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            {attempt.assessment_title}
          </span>
          <span className="text-xs text-slate-500">
            Attempt #{attempt.attempt_number} • Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
              isTimerCritical
                ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-950/40 dark:border-red-800 animate-pulse"
                : "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            }`}
          >
            <Clock className="h-4 w-4 text-current" />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>

          <Button
            size="sm"
            onClick={() => setShowConfirmModal(true)}
            disabled={submitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5"
          >
            <Send className="h-3.5 w-3.5" /> Submit Exam
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Main Examination Card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question & Choices Area (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs font-semibold">
                  Question {currentIndex + 1}
                </Badge>
                <span className="text-xs text-slate-500 font-medium">{currentQ.marks} Mark(s)</span>
              </div>
              <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mt-2 leading-relaxed">
                {currentQ.question_text}
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === opt.id
                const optionLabel = String.fromCharCode(65 + idx) // A, B, C, D

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 text-xs sm:text-sm ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-500 text-blue-900 dark:bg-blue-950/40 dark:border-blue-500 dark:text-blue-100 shadow-xs"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
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
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="text-xs gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>

            <div className="text-xs text-slate-500 font-medium">
              {answers[currentQ.id] ? (
                <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                  <CheckCircle className="h-3.5 w-3.5" /> Answered
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <HelpCircle className="h-3.5 w-3.5" /> Unanswered
                </span>
              )}
            </div>

            {currentIndex < totalQuestions - 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="text-xs gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowConfirmModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
              >
                Finish <Send className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Question Palette Sidebar (1 col) */}
        <div className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Question Palette
              </CardTitle>
              <p className="text-[11px] text-slate-500">
                {answeredCount} of {totalQuestions} answered
              </p>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex
                  const isAnswered = !!answers[q.id]

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-8 w-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                        isCurrent
                          ? "ring-2 ring-blue-600 font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-950/60"
                          : isAnswered
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-emerald-500" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-slate-200 dark:bg-slate-700" />
                  <span>Unanswered ({totalQuestions - answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm border-2 border-blue-600 bg-blue-50" />
                  <span>Current Question</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="max-w-md w-full p-6 shadow-xl border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Exam Submission</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              You have answered <span className="font-bold text-slate-900 dark:text-white">{answeredCount}</span> out
              of <span className="font-bold text-slate-900 dark:text-white">{totalQuestions}</span> questions.
              {totalQuestions - answeredCount > 0 && (
                <span className="text-amber-600 dark:text-amber-400 block mt-1">
                  Warning: {totalQuestions - answeredCount} question(s) remain unanswered!
                </span>
              )}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="text-xs"
              >
                Review Questions
              </Button>
              <Button
                size="sm"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Grading Answers...
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
