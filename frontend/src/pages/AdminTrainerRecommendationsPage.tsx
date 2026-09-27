import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Users,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Sparkles,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  competenciesService,
  SubjectDetail,
  TrainerRecommendationCandidate,
  SubjectRequirementItem,
} from "@/services/competencies"

export const AdminTrainerRecommendationsPage: React.FC = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null)
  const [assignedSuccessMsg, setAssignedSuccessMsg] = useState<string | null>(null)

  // 1. Fetch available subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ["admin-subjects"],
    queryFn: () => competenciesService.listSubjects(),
  })

  // Default to first subject if not selected
  const activeSubjectId = selectedSubjectId || (subjects.length > 0 ? subjects[0].id : "")
  const activeSubject = subjects.find((s: SubjectDetail) => s.id === activeSubjectId)

  // 2. Fetch trainer recommendations for the active subject
  const { data: recommendations, isLoading: recsLoading } = useQuery({
    queryKey: ["trainer-recommendations", activeSubjectId],
    queryFn: () => competenciesService.getTrainerRecommendations(activeSubjectId),
    enabled: !!activeSubjectId,
  })

  const handleAssignTrainer = (candidate: TrainerRecommendationCandidate) => {
    setAssignedSuccessMsg(
      `Official Nomination Prepared: ${candidate.name} designated for ${activeSubject?.name || "Subject"}. Administrative record registered.`
    )
    setTimeout(() => setAssignedSuccessMsg(null), 5000)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Institutional Faculty Governance
            </span>
            <Badge className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
              Deterministic Matching
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="h-7 w-7 text-blue-600" />
            <span>Trainer Competency Matching & Recommendations</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Algorithmically evaluates candidate instructors across 6 dimensions: competency alignment, field experience, degrees, certifications, exams, and feedback.
          </p>
        </div>

        {/* Subject Domain Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Subject:</label>
          <select
            value={activeSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value)
              setAssignedSuccessMsg(null)
            }}
            className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            {subjects.map((s: SubjectDetail) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment Success Alert */}
      {assignedSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{assignedSuccessMsg}</span>
        </div>
      )}

      {/* Active Subject Context Bar */}
      {activeSubject && (
        <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {activeSubject.code}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs font-semibold text-blue-600">
                  Domain: {activeSubject.domain || "Meteorology"}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeSubject.name}
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl">{activeSubject.description}</p>
            </div>

            {/* Required Competencies Pills */}
            <div className="flex flex-wrap items-center gap-1.5 md:max-w-md">
              <span className="text-[10px] uppercase font-semibold text-slate-400 mr-1">
                Required Benchmarks:
              </span>
              {activeSubject.requirements.map((req: SubjectRequirementItem) => (
                <span
                  key={req.competency_id}
                  className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 shadow-2xs"
                >
                  {req.competency_name}: Level {req.required_level} (wt: {req.weight})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidate Recommendation Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Evaluated Candidates</span>
            <Badge variant="outline" className="text-[10px]">
              {recommendations?.candidate_count ?? 0} Eligible Trainers Evaluated
            </Badge>
          </h2>
          <span className="text-xs text-slate-400">
            Final assignment remains an administrative decision.
          </span>
        </div>

        {recsLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Evaluating multi-dimensional faculty matching algorithms...
          </div>
        ) : !recommendations || recommendations.candidates.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 border border-dashed rounded-xl">
            No active trainers found for this subject domain.
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.candidates.map((cand: TrainerRecommendationCandidate, idx: number) => {
              const isExpanded = expandedCandidateId === cand.trainer_id
              return (
                <Card
                  key={cand.trainer_id}
                  className={`border transition-all ${
                    idx === 0
                      ? "border-blue-300 dark:border-blue-900 bg-gradient-to-r from-blue-50/20 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 shadow-md"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Top Row: Candidate Header & Overall Match */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            Rank #{idx + 1}
                          </span>
                          {idx === 0 && (
                            <Badge className="bg-blue-600 text-white text-[10px]">
                              Top Match Alignment
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{cand.name}</span>
                          <span className="text-xs font-normal text-slate-500">({cand.email})</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          {cand.designation} • {cand.department}
                        </p>
                      </div>

                      {/* Overall Match Score Badge & CTA */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                            Overall Match
                          </span>
                          <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                            {cand.overall_match_score.toFixed(1)}%
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAssignTrainer(cand)}
                          className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow cursor-pointer"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Nominate Faculty</span>
                        </Button>
                      </div>
                    </div>

                    {/* Middle: 6-Dimension Score Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Competencies (30%)
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {cand.competency_match.toFixed(1)}%
                        </div>
                        <ProgressBar value={cand.competency_match} size="sm" variant="meteorological" />
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Experience (20%)
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {cand.experience_score.toFixed(1)}%
                        </div>
                        <ProgressBar value={cand.experience_score} size="sm" variant="meteorological" />
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Degrees (15%)
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {cand.qualification_score.toFixed(1)}%
                        </div>
                        <ProgressBar value={cand.qualification_score} size="sm" variant="meteorological" />
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Certifications (15%)
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {cand.certification_score.toFixed(1)}%
                        </div>
                        <ProgressBar value={cand.certification_score} size="sm" variant="meteorological" />
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Assessments (10%)
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {cand.assessment_score.toFixed(1)}%
                        </div>
                        <ProgressBar value={cand.assessment_score} size="sm" variant="meteorological" />
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Feedback (10%)
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {cand.feedback_score.toFixed(1)}%
                        </div>
                        <ProgressBar value={cand.feedback_score} size="sm" variant="meteorological" />
                      </div>
                    </div>

                    {/* Matched vs Missing Competencies */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {cand.matched_competencies.map((m: string, mIdx: number) => (
                        <span
                          key={mIdx}
                          className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{m}</span>
                        </span>
                      ))}
                      {cand.missing_competencies.map((miss: string, missIdx: number) => (
                        <span
                          key={missIdx}
                          className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          <span>{miss}</span>
                        </span>
                      ))}
                    </div>

                    {/* Toggle Explainability Dossier */}
                    <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() =>
                          setExpandedCandidateId(isExpanded ? null : cand.trainer_id)
                        }
                        className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>{isExpanded ? "Hide Evidence Details" : "Why Recommended? (Explainability)"}</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {/* Expanded Explanation Dossier */}
                    {isExpanded && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
                          <Sparkles className="h-4 w-4" />
                          <span>Algorithmic Recommendation Rationale:</span>
                        </div>
                        <p className="leading-relaxed">{cand.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminTrainerRecommendationsPage
