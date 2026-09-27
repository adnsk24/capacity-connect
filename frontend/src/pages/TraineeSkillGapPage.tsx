import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Filter,
  ShieldCheck,
} from "lucide-react"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { competenciesService, SkillGapItem, SubjectDetail } from "@/services/competencies"

export const TraineeSkillGapPage: React.FC = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")

  // Fetch subjects catalog
  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects-catalog"],
    queryFn: () => competenciesService.listSubjects(),
  })

  // Fetch gaps for selected subject or baseline
  const { data: gaps = [] } = useQuery({
    queryKey: ["skill-gaps", selectedSubjectId],
    queryFn: () => competenciesService.getMySkillGaps(selectedSubjectId || undefined),
  })

  // Fetch readiness for selected subject or baseline
  const { data: readiness } = useQuery({
    queryKey: ["readiness", selectedSubjectId],
    queryFn: () => competenciesService.getMyReadiness(selectedSubjectId || undefined),
  })

  const highGaps = gaps.filter((g: SkillGapItem) => g.priority === "HIGH")
  const metGaps = gaps.filter((g: SkillGapItem) => g.gap <= 0.2)

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Diagnostic Audit
            </span>
            <Badge className="text-[10px] bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300">
              Gap Matrix
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <TrendingDown className="h-7 w-7 text-rose-600" />
            <span>Skill Gap & Capability Deficiency Analysis</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Comparative analysis evaluating your demonstrated proficiencies against institutional operational benchmarks.
          </p>
        </div>

        {/* Subject Domain Selector */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Baseline: General Operational Meteorology (All 7)</option>
            {subjects.map((s: SubjectDetail) => (
              <option key={s.id} value={s.id}>
                Subject: {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Readiness for this domain */}
        <Card className="border-slate-200 dark:border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Domain Training Readiness</span>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {readiness?.overall_readiness_percentage.toFixed(1) ?? "0.0"}%
          </div>
          <ProgressBar
            value={readiness?.overall_readiness_percentage ?? 0}
            variant="meteorological"
            size="sm"
          />
        </Card>

        {/* High Priority Deficiencies */}
        <Card className="border-slate-200 dark:border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>High Priority Gaps (Deficit &gt; 1.0)</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {highGaps.length}
          </div>
          <p className="text-[11px] text-slate-500">
            Urgent capability gaps requiring structured coursework or assessment.
          </p>
        </Card>

        {/* Satisfied Benchmarks */}
        <Card className="border-slate-200 dark:border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Satisfied Benchmarks</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {metGaps.length}
          </div>
          <p className="text-[11px] text-slate-500">
            Demonstrated competencies meeting or exceeding required operational levels.
          </p>
        </Card>
      </div>

      {/* Main Gaps Table / Card Breakdown */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="p-4 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Competency Gap Audit Table</span>
            <span className="text-xs text-slate-500 font-normal">
              Showing {gaps.length} competency requirements
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
          {gaps.map((item: SkillGapItem) => {
            const percentageMet = Math.min(100, Math.round((item.current_level / item.required_level) * 100))
            return (
              <div
                key={item.competency_id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
              >
                {/* Left: Competency Info */}
                <div className="space-y-1 md:max-w-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {item.code}
                    </span>
                    <Badge
                      className={`text-[9px] font-semibold ${
                        item.priority === "HIGH"
                          ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300"
                          : item.priority === "MEDIUM"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                      }`}
                    >
                      {item.priority} PRIORITY
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {item.evidence_summary}
                  </p>
                </div>

                {/* Center: Comparison Visualizer */}
                <div className="flex-1 max-w-md space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      Demonstrated:{" "}
                      <strong className="text-blue-600">L{item.current_level.toFixed(1)}</strong>
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      Required:{" "}
                      <strong className="text-slate-900 dark:text-white">
                        L{item.required_level.toFixed(1)}
                      </strong>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden flex">
                    <div
                      className={`h-full transition-all ${
                        item.gap <= 0.2
                          ? "bg-emerald-500"
                          : item.priority === "HIGH"
                          ? "bg-rose-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${percentageMet}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Alignment: {percentageMet}%</span>
                    <span>Weight: {item.weight.toFixed(1)}</span>
                  </div>
                </div>

                {/* Right: Gap Delta and Action */}
                <div className="flex items-center gap-3 justify-between md:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                      Deficit Gap
                    </span>
                    <span
                      className={`text-base font-extrabold ${
                        item.gap <= 0.2
                          ? "text-emerald-600"
                          : item.priority === "HIGH"
                          ? "text-rose-600"
                          : "text-amber-600"
                      }`}
                    >
                      {item.gap <= 0.2 ? "Met (0.0)" : `-${item.gap.toFixed(1)} Levels`}
                    </span>
                  </div>
                  {item.gap > 0.2 && (
                    <Link to="/trainee/competencies#recommended-courses">
                      <Button size="sm" variant="outline" className="text-xs gap-1 cursor-pointer">
                        <span>Find Course</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

export default TraineeSkillGapPage
