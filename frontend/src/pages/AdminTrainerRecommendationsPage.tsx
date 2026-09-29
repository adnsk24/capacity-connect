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
import { Skeleton } from "@/components/ui/loading-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import {
  competenciesService,
  SubjectDetail,
  TrainerRecommendationCandidate,
  SubjectRequirementItem,
} from "@/services/competencies"
import { aiService, AITrainerMatchExplainResponse } from "@/services/aiService"

export const AdminTrainerRecommendationsPage: React.FC = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null)
  const [assignedSuccessMsg, setAssignedSuccessMsg] = useState<string | null>(null)
  const [explainModalData, setExplainModalData] = useState<AITrainerMatchExplainResponse | null>(null)
  const [isExplainingId, setIsExplainingId] = useState<string | null>(null)

  const handleExplainMatch = async (trainerId: string) => {
    setIsExplainingId(trainerId)
    try {
      const res = await aiService.explainTrainerMatch({
        subject_id: activeSubjectId,
        trainer_id: trainerId,
      })
      setExplainModalData(res)
    } catch (err: any) {
      alert(err?.message || "Failed to generate match explanation.")
    } finally {
      setIsExplainingId(null)
    }
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1557A6]">
              Institutional Faculty Governance
            </span>
            <Badge className="text-[10px] bg-blue-50 text-[#1557A6] border-blue-200">
              Deterministic Matching
            </Badge>
          </div>
          <h1 className="text-[22px] font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="h-6 w-6 text-[#1557A6]" />
            <span>Trainer Competency Matching & Recommendations</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Algorithmically evaluates candidate instructors across 6 dimensions: competency alignment, field experience, degrees, certifications, exams, and feedback.
          </p>
        </div>

        {/* Subject Domain Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Subject:</label>
          <select
            value={activeSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value)
              setAssignedSuccessMsg(null)
            }}
            className="text-xs rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-900 shadow-xs focus:outline-none focus:ring-1 focus:ring-[#1557A6] font-medium"
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
        <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs shadow-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{assignedSuccessMsg}</span>
        </div>
      )}

      {/* Active Subject Context Bar */}
      {activeSubject && (
        <Card className="border-slate-200 bg-slate-50/70">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {activeSubject.code}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-[#1557A6]">
                  Domain: {activeSubject.domain || "Meteorology"}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                {activeSubject.name}
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl">{activeSubject.description}</p>
            </div>

            {/* Required Competencies Pills */}
            <div className="flex flex-wrap items-center gap-1.5 md:max-w-md">
              <span className="text-[10px] uppercase font-semibold text-slate-500 mr-1">
                Required Benchmarks:
              </span>
              {activeSubject.requirements.map((req: SubjectRequirementItem) => (
                <span
                  key={req.competency_id}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-700 shadow-2xs"
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
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Evaluated Candidates</span>
            <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 border-slate-200">
              {recommendations?.candidate_count ?? 0} Eligible Trainers Evaluated
            </Badge>
          </h2>
          <span className="text-xs text-slate-400">
            Final assignment remains an administrative decision.
          </span>
        </div>

        {recsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5 rounded-lg border border-slate-200 bg-white space-y-3">
                <div className="flex justify-between items-center">
                  <div className="space-y-1.5">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3.5 w-64" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : !recommendations || recommendations.candidates.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No Matching Trainers Found"
            description="No active faculty members currently meet the matching thresholds for this subject domain."
          />
        ) : (
          <div className="space-y-4">
            {recommendations.candidates.map((cand: TrainerRecommendationCandidate, idx: number) => {
              const isExpanded = expandedCandidateId === cand.trainer_id
              return (
                <Card
                  key={cand.trainer_id}
                  className={`border transition-all ${
                    idx === 0
                      ? "border-blue-200 bg-blue-50/20 shadow-xs"
                      : "border-slate-200"
                  }`}
                >
                  <CardContent className="p-4 sm:p-5 space-y-4">
                    {/* Top Row: Candidate Header & Overall Match */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            Rank #{idx + 1}
                          </span>
                          {idx === 0 && (
                            <Badge className="bg-[#1557A6] text-white text-[10px]">
                              Top Match Alignment
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
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
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">
                            Overall Match
                          </span>
                          <span className="text-2xl font-black text-[#1557A6]">
                            {cand.overall_match_score.toFixed(1)}%
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleExplainMatch(cand.trainer_id)}
                          disabled={isExplainingId === cand.trainer_id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1557A6] rounded-md text-xs font-semibold border border-blue-200 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Sparkles className={`h-3.5 w-3.5 ${isExplainingId === cand.trainer_id ? "animate-spin" : ""}`} />
                          <span>Explain Match</span>
                        </button>
                        <Button
                          size="sm"
                          onClick={() => handleAssignTrainer(cand)}
                          className="text-xs font-semibold gap-1.5 shadow-xs"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Nominate Faculty</span>
                        </Button>
                      </div>
                    </div>

                    {/* Middle: 6-Dimension Score Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2 border-t border-slate-100">
                      <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">
                          Competencies (30%)
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {cand.competency_match.toFixed(1)}%
                        </div>
                        <ProgressBar value={cand.competency_match} size="sm" variant="meteorological" />
                      </div>

                      <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">
                          Experience (20%)
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {cand.experience_score.toFixed(1)}%
                        </div>
                        <ProgressBar value={cand.experience_score} size="sm" variant="meteorological" />
                      </div>

                      <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">
                          Degrees (15%)
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {cand.qualification_score.toFixed(1)}%
                        </div>
                        <ProgressBar value={cand.qualification_score} size="sm" variant="meteorological" />
                      </div>

                      <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">
                          Certifications (15%)
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {cand.certification_score.toFixed(1)}%
                        </div>
                        <ProgressBar value={cand.certification_score} size="sm" variant="meteorological" />
                      </div>

                      <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">
                          Assessments (10%)
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {cand.assessment_score.toFixed(1)}%
                        </div>
                        <ProgressBar value={cand.assessment_score} size="sm" variant="meteorological" />
                      </div>

                      <div className="p-2.5 rounded-md bg-slate-50 border border-slate-200 space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">
                          Feedback (10%)
                        </div>
                        <div className="text-sm font-bold text-slate-900">
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
                          className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>{m}</span>
                        </span>
                      ))}
                      {cand.missing_competencies.map((miss: string, missIdx: number) => (
                        <span
                          key={missIdx}
                          className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold flex items-center gap-1"
                        >
                          <AlertCircle className="h-3 w-3 text-amber-600" />
                          <span>{miss}</span>
                        </span>
                      ))}
                    </div>

                    {/* Toggle Explainability Dossier */}
                    <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                      <button
                        onClick={() =>
                          setExpandedCandidateId(isExpanded ? null : cand.trainer_id)
                        }
                        className="text-xs text-[#1557A6] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>{isExpanded ? "Hide Evidence Details" : "Why Recommended? (Explainability)"}</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {/* Expanded Explanation Dossier */}
                    {isExpanded && (
                      <div className="p-3.5 rounded-md bg-slate-50 text-xs text-slate-700 border border-slate-200 space-y-2">
                        <div className="flex items-center gap-2 text-[#1557A6] font-semibold">
                          <Sparkles className="h-4 w-4" />
                          <span>Algorithmic Recommendation Rationale:</span>
                        </div>
                        <p className="leading-relaxed text-slate-600">{cand.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* AI Explainable Trainer Match Modal */}
      {explainModalData && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-[#1557A6] text-white rounded">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">Explainable Trainer Matching</h3>
              </div>
              <button
                onClick={() => setExplainModalData(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{explainModalData.trainer_name}</div>
                  <div className="text-slate-500">{explainModalData.designation} • {explainModalData.department}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">Overall Match</div>
                  <div className="text-xl font-black text-[#1557A6]">
                    {explainModalData.overall_match_score.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                  Authoritative Deterministic Evidence Subscores
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 text-center">
                    <div className="text-[10px] text-slate-500 font-medium">Competency</div>
                    <div className="font-bold text-slate-900">
                      {explainModalData.evidence_subscores.competency_match.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 text-center">
                    <div className="text-[10px] text-slate-500 font-medium">Experience</div>
                    <div className="font-bold text-slate-900">
                      {explainModalData.evidence_subscores.experience_score.toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 text-center">
                    <div className="text-[10px] text-slate-500 font-medium">Degrees</div>
                    <div className="font-bold text-slate-900">
                      {explainModalData.evidence_subscores.qualification_score.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  AI Explainable Narrative
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {explainModalData.ai_explainable_rationale}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Source: {explainModalData.authoritative_source}</span>
                <span className="font-semibold text-slate-700">Admin holds final appointment authority</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={() => setExplainModalData(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTrainerRecommendationsPage
