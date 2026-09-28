import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  ClipboardCheck,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  BookOpen,
  Layers,
  ArrowRight,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { assessmentsService } from "@/services/assessments"

export const TraineeAssessmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"available" | "completed" | "all">("available")

  const { data: assessments, isLoading, error } = useQuery({
    queryKey: ["trainee-assessments"],
    queryFn: assessmentsService.listAssessments,
  })

  const { data: history } = useQuery({
    queryKey: ["trainee-assessment-history"],
    queryFn: assessmentsService.getHistory,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <h3 className="font-semibold text-red-900">Failed to load assessments</h3>
          <p className="text-sm text-red-700 mt-1">{(error as Error).message}</p>
        </CardContent>
      </Card>
    )
  }

  const items = assessments || []
  const availableItems = items.filter((a) => a.user_attempts_remaining > 0)
  const completedItems = items.filter((a) => a.user_attempts_count > 0)

  const displayedItems =
    activeTab === "available"
      ? availableItems
      : activeTab === "completed"
      ? completedItems
      : items

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1557A6]">
              Examination & Evaluation Engine
            </span>
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-[#1557A6] border-blue-200">
              Deterministic Grading
            </Badge>
          </div>
          <h1 className="text-[22px] font-bold text-slate-900">
            Course Assessments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Take official IMD competency tests, view real-time grading reports, and review answers.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto border border-slate-200">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "available"
                ? "bg-white text-[#1557A6] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Available ({availableItems.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "completed"
                ? "bg-white text-[#1557A6] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Completed ({completedItems.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === "all"
                ? "bg-white text-[#1557A6] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({items.length})
          </button>
        </div>
      </div>

      {/* Grid of Assessments */}
      {displayedItems.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <ClipboardCheck className="h-12 w-12 text-slate-300 mb-3" />
            <h3 className="font-semibold text-slate-800 text-base">
              {activeTab === "available" ? "No assessments are currently available" : "No Completed Assessments"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              {activeTab === "available"
                ? "You have completed all assessments for your currently enrolled courses, or no tests are published yet."
                : "You haven't completed any assessments yet. Start an available test to evaluate your competency."}
            </p>
            <Link to="/trainee/courses" className="mt-4">
              <Button size="sm" variant="outline" className="text-xs">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Explore Course Catalogue
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedItems.map((ass) => (
            <Card
              key={ass.id}
              className="flex flex-col justify-between hover:shadow-xs transition-shadow border-slate-200 bg-white"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold text-[#1557A6] truncate">
                    {ass.course_title}
                  </span>
                  {ass.is_passed === true ? (
                    <Badge variant="success" className="text-[10px] gap-1 flex items-center">
                      <CheckCircle2 className="h-3 w-3" /> Passed
                    </Badge>
                  ) : ass.is_passed === false ? (
                    <Badge variant="destructive" className="text-[10px] gap-1 flex items-center">
                      <XCircle className="h-3 w-3" /> Failed
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      {ass.assessment_type}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base font-bold text-slate-900 line-clamp-1">
                  {ass.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {ass.description || "Comprehensive modular evaluation."}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {/* Meta Attributes */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-md border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    <span>{ass.duration_minutes ? `${ass.duration_minutes} Mins` : "Self-paced"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Award className="h-3.5 w-3.5 text-amber-600" />
                    <span>Pass: {ass.passing_percentage}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Layers className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{ass.questions_count} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <RotateCcw className="h-3.5 w-3.5 text-purple-600" />
                    <span>
                      {ass.user_attempts_remaining > 0
                        ? `${ass.user_attempts_remaining} left`
                        : "Limit reached"}
                    </span>
                  </div>
                </div>

                {/* Score Summary if attempted */}
                {ass.best_score !== null && ass.best_score !== undefined && (
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="text-slate-500">Highest Score:</span>
                    <span className="font-bold text-slate-800">
                      {ass.best_score} / {ass.total_marks} ({Math.round((ass.best_score / ass.total_marks) * 100)}%)
                    </span>
                  </div>
                )}

                {/* Action button */}
                <div className="pt-2">
                  <Link to={`/trainee/assessments/${ass.id}`}>
                    <Button className="w-full text-xs font-semibold justify-center gap-1.5 shadow-xs">
                      {ass.user_attempts_remaining > 0 ? (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          {ass.user_attempts_count === 0 ? "Start Assessment" : "Retake Assessment"}
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> View Details & History
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Trainee Attempt History Table */}
      {history && history.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Examination History</h2>
              <p className="text-xs text-slate-500">Record of your past examination submissions and scores.</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Assessment</th>
                  <th className="p-3">Course</th>
                  <th className="p-3">Attempt</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Result</th>
                  <th className="p-3">Submitted At</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h.attempt_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{h.assessment_title}</td>
                    <td className="p-3 text-slate-600">{h.course_title}</td>
                    <td className="p-3 font-mono text-slate-600">#{h.attempt_number}</td>
                    <td className="p-3 font-semibold text-slate-800">
                      {h.score_obtained !== null && h.score_obtained !== undefined
                        ? `${h.score_obtained} / ${h.total_marks} (${h.percentage}%)`
                        : "Pending"}
                    </td>
                    <td className="p-3">
                      {h.is_passed === true ? (
                        <Badge variant="success" className="text-[10px]">
                          PASS
                        </Badge>
                      ) : h.is_passed === false ? (
                        <Badge variant="destructive" className="text-[10px]">
                          FAIL
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          {h.status}
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">
                      {h.submitted_at
                        ? new Date(h.submitted_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                    <td className="p-3 text-right">
                      <Link to={`/trainee/assessments/${h.assessment_id}/result/${h.attempt_id}`}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-[#1557A6] hover:text-[#124A8D]">
                          Review <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
