import React from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Info,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { assessmentsService, AssessmentResultResponse } from "@/services/assessments"

export const AssessmentResultPage: React.FC = () => {
  const { assessmentId, attemptId } = useParams<{ assessmentId: string; attemptId: string }>()

  const { data: resultData, isLoading, error } = useQuery({
    queryKey: ["assessment-result", attemptId],
    queryFn: () => assessmentsService.getAttemptState(attemptId!),
    enabled: !!attemptId,
  })

  const result = resultData as AssessmentResultResponse | undefined

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Generating evaluation report...</p>
      </div>
    )
  }

  if (error || !result) {
    return (
      <Card className="border-red-200 bg-red-50/50 max-w-lg mx-auto">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <h3 className="font-semibold text-red-900">Result Not Found</h3>
          <p className="text-sm text-red-700 mt-1">{(error as Error)?.message || "Unable to display result."}</p>
        </CardContent>
      </Card>
    )
  }

  const passed = result.is_passed

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/trainee/assessments"
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Assessments
        </Link>
      </div>

      {/* Hero Result Banner */}
      <Card
        className={`border shadow-xs ${
          passed
            ? "border-emerald-200 bg-emerald-50/40"
            : "border-red-200 bg-red-50/40"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div
                className={`h-14 w-14 rounded-lg flex items-center justify-center shrink-0 ${
                  passed
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {passed ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <Badge variant={passed ? "success" : "destructive"} className="text-[11px] font-semibold uppercase tracking-wider">
                    {passed ? "Evaluation Passed" : "Needs Improvement"}
                  </Badge>
                  <span className="text-[12px] text-slate-500">Attempt #{result.attempt_number}</span>
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  {result.assessment_title}
                </h1>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  {result.course_title} · Evaluated on{" "}
                  {result.submitted_at
                    ? new Date(result.submitted_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </p>
              </div>
            </div>

            {/* Score Pill */}
            <div className="flex flex-col items-center sm:items-end justify-center bg-white p-4 rounded-md border border-slate-200 min-w-36 shadow-xs">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Final Score</span>
              <div className="text-2xl font-bold text-slate-900 mt-0.5">
                {result.score_obtained}{" "}
                <span className="text-sm text-slate-500 font-normal">/ {result.total_marks}</span>
              </div>
              <span
                className={`text-[13px] font-bold mt-0.5 ${
                  passed ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {result.percentage}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action shortcuts */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-bold text-slate-900">
          Question-by-Question Review
        </h2>
        <div className="flex items-center gap-2">
          <Link to={`/trainee/assessments/${assessmentId}`}>
            <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 border-slate-200">
              <RotateCcw className="h-3.5 w-3.5" /> Retake
            </Button>
          </Link>
          <Link to="/courses">
            <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 border-slate-200">
              <BookOpen className="h-3.5 w-3.5" /> Catalogue
            </Button>
          </Link>
        </div>
      </div>

      {/* Question Breakdown List */}
      <div className="space-y-4">
        {result.questions.map((q, idx) => {
          const isCorrect = q.is_correct

          return (
            <Card
              key={q.question_id}
              className={`border bg-white shadow-xs ${
                isCorrect ? "border-slate-200" : "border-red-200"
              }`}
            >
              <CardHeader className="p-4 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={isCorrect ? "success" : "destructive"} className="text-[11px] font-medium gap-1">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" /> Correct
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" /> Incorrect
                        </>
                      )}
                    </Badge>
                    <span className="text-[12px] font-semibold text-slate-500">Question {idx + 1}</span>
                  </div>
                  <span className="text-[12px] font-medium text-slate-700">
                    {q.marks_awarded} / {q.marks} Mark(s)
                  </span>
                </div>
                <CardTitle className="text-sm font-semibold text-slate-900 mt-2">
                  {q.question_text}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-4 pt-3 space-y-2.5">
                {/* Options List */}
                <div className="space-y-1.5">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = q.selected_option_id === opt.id
                    const isActualCorrect = opt.is_correct === true
                    const optionLetter = String.fromCharCode(65 + oIdx)

                    let optionStyle =
                      "border-slate-200 text-slate-700 bg-white"
                    if (isActualCorrect) {
                      optionStyle =
                        "border-emerald-500 bg-emerald-50/70 text-slate-900 font-medium"
                    } else if (isSelected && !isActualCorrect) {
                      optionStyle =
                        "border-red-400 bg-red-50/60 text-slate-900"
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-md border text-xs flex items-center justify-between gap-3 ${optionStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="h-5 w-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 bg-slate-100 text-slate-600 border border-slate-200">
                            {optionLetter}
                          </span>
                          <span>{opt.option_text}</span>
                        </div>

                        <div className="shrink-0 flex items-center gap-1.5">
                          {isSelected && (
                            <Badge variant="outline" className="text-[10px] py-0 border-slate-300">
                              Your Answer
                            </Badge>
                          )}
                          {isActualCorrect && (
                            <Badge variant="success" className="text-[10px] py-0 gap-1 flex items-center">
                              <CheckCircle2 className="h-3 w-3" /> Correct Answer
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Explanation Box */}
                {q.explanation && (
                  <div className="mt-3 p-3 bg-blue-50/60 rounded-md border border-blue-200 flex items-start gap-2.5 text-xs text-slate-800">
                    <Info className="h-4 w-4 text-[#1557A6] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#1557A6] block mb-0.5">Scientific Rationale:</span>
                      <p className="leading-relaxed text-slate-700">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
