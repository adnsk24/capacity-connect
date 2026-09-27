import React, { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  ClipboardCheck,
  Clock,
  Award,
  AlertTriangle,
  ArrowLeft,
  Play,
  RotateCcw,
  ShieldAlert,
  Loader2,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { assessmentsService } from "@/services/assessments"

export const AssessmentDetailPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const navigate = useNavigate()
  const [starting, setStarting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { data: assessment, isLoading, error } = useQuery({
    queryKey: ["assessment-detail", assessmentId],
    queryFn: () => assessmentsService.getAssessment(assessmentId!),
    enabled: !!assessmentId,
  })

  const handleStartExam = async () => {
    if (!assessmentId) return
    setStarting(true)
    setErrorMsg(null)
    try {
      const res = await assessmentsService.startAttempt(assessmentId)
      navigate(`/trainee/assessments/${assessmentId}/take/${res.attempt_id}`)
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate examination session.")
    } finally {
      setStarting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading assessment parameters...</p>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="pt-6 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <h3 className="font-semibold text-red-900">Assessment Unavailable</h3>
          <p className="text-sm text-red-700 mt-1">{(error as Error)?.message || "Assessment not found."}</p>
          <Link to="/trainee/assessments" className="mt-4 inline-block">
            <Button size="sm" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Assessments
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/trainee/assessments"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Assessments
        </Link>
      </div>

      {/* Main Assessment Brief */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {assessment.course_title}
            </span>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              {assessment.assessment_type} Evaluation
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {assessment.title}
          </CardTitle>
          <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {assessment.description || "Official evaluation module assessing core domain competencies."}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Clock className="h-3.5 w-3.5 text-blue-500" /> Duration
              </div>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                {assessment.duration_minutes ? `${assessment.duration_minutes} Mins` : "Untimed"}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Award className="h-3.5 w-3.5 text-amber-500" /> Pass Mark
              </div>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                {assessment.passing_percentage}%
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" /> Total Questions
              </div>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                {assessment.questions_count}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <RotateCcw className="h-3.5 w-3.5 text-purple-500" /> Max Attempts
              </div>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                {assessment.max_attempts}
              </p>
            </div>
          </div>

          {/* Exam Instructions */}
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-lg space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200 text-xs uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Examination Guidelines
            </div>
            <ul className="text-xs text-amber-800 dark:text-amber-300/90 space-y-1.5 list-disc list-inside">
              <li>Deterministic scoring is computed immediately upon submission.</li>
              <li>Questions are presented without correct-answer disclosures until submitted.</li>
              <li>The exam countdown timer is synchronized with the server.</li>
              <li>Do not refresh or leave the examination window during an active attempt.</li>
            </ul>
          </div>

          {/* Error alert if starting failed */}
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={handleStartExam}
              disabled={starting}
              className="w-full sm:w-auto px-8 py-2.5 font-bold text-sm bg-blue-600 hover:bg-blue-700 shadow-sm gap-2"
            >
              {starting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Preparing Exam Environment...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" /> Begin Examination Attempt
                </>
              )}
            </Button>
            <Link to="/trainee/assessments" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full text-xs">
                Cancel
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
