import React, { useState, Suspense, lazy } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  Network,
  Box,
  Grid,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  X,
  Sparkles,
  Loader2,
} from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  competenciesService,
  UserCompetency,
} from "@/services/competencies"

// Lazy-load Three.js 3D Universe to ensure it is isolated from the initial application bundle!
const CompetencyUniverse3D = lazy(
  () => import("@/components/competencies/CompetencyUniverse3D")
)

export const TraineeCompetenciesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d")
  const [selectedComp, setSelectedComp] = useState<UserCompetency | null>(null)
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false)

  // 1. Fetch user evaluated competencies
  const { data: competencies = [] } = useQuery({
    queryKey: ["my-competencies"],
    queryFn: () => competenciesService.getMyCompetencies(),
  })

  // 2. Fetch training readiness score
  const { data: readiness } = useQuery({
    queryKey: ["my-readiness"],
    queryFn: () => competenciesService.getMyReadiness(),
  })

  // 3. Fetch prioritized skill gaps
  const { data: skillGaps = [] } = useQuery({
    queryKey: ["my-skill-gaps"],
    queryFn: () => competenciesService.getMySkillGaps(),
  })

  // 4. Fetch personalized course recommendations
  const { data: recommendations = [] } = useQuery({
    queryKey: ["my-recommendations"],
    queryFn: () => competenciesService.getMyRecommendations(),
  })

  // 5. Fetch growth timeline if a competency is selected
  const { data: growthData } = useQuery({
    queryKey: ["competency-growth", selectedComp?.competency_id],
    queryFn: () =>
      selectedComp ? competenciesService.getMyGrowth(selectedComp.competency_id) : null,
    enabled: !!selectedComp,
  })

  // Radar chart data preparation
  const radarData = competencies.map((c: UserCompetency) => ({
    subject: c.code.replace("COMP-", ""),
    fullName: c.name,
    demonstrated: c.current_level,
    target: c.target_level,
  }))

  const highPriorityGaps = skillGaps.filter((g: any) => g.priority === "HIGH")

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1557A6]">
              IMD Competency Intelligence Engine
            </span>
            <Badge className="text-[10px] bg-blue-50 text-[#1557A6] border-blue-200">
              Deterministic Evidence
            </Badge>
          </div>
          <h1 className="text-[22px] font-bold text-slate-900 flex items-center gap-2.5">
            <Network className="h-6 w-6 text-[#1557A6]" />
            <span>Operational Meteorological Competencies</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Multi-stream verified capability evidence mapping examinations, syllabus completion, skills, and field postings.
          </p>
        </div>

        {/* View Switcher: 2D Matrix vs 3D Universe */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200">
          <button
            onClick={() => setViewMode("2d")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "2d"
                ? "bg-white text-[#1557A6] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>2D Analytical View</span>
          </button>
          <button
            onClick={() => setViewMode("3d")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "3d"
                ? "bg-[#1557A6] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Box className="h-3.5 w-3.5" />
            <span>3D Competency Universe</span>
          </button>
        </div>
      </div>

      {/* Readiness KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Readiness Score */}
        <Card className="md:col-span-2 border-slate-200 bg-white shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-slate-500">
              Training Readiness Score
            </CardTitle>
            <button
              onClick={() => setShowFormulaModal(true)}
              className="text-slate-400 hover:text-[#1557A6] transition-colors cursor-pointer"
              title="View documented calculation formula"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold tracking-tight text-[#1557A6]">
                {readiness?.overall_readiness_percentage.toFixed(1) ?? "0.0"}%
              </span>
              <span className="text-xs font-medium text-slate-500">
                against Operational Meteorological Standard
              </span>
            </div>
            <ProgressBar
              value={readiness?.overall_readiness_percentage ?? 0}
              variant="meteorological"
              size="md"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
              <span>
                Verified Met:{" "}
                <strong className="text-emerald-700">
                  {readiness?.met_competencies_count ?? 0} of {readiness?.required_competencies_count ?? 7}
                </strong>
              </span>
              <span>
                Remaining Gaps:{" "}
                <strong className="text-amber-700">
                  {readiness?.gaps_count ?? 0}
                </strong>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* High Priority Gaps Count */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-slate-500 flex items-center justify-between">
              <span>High Priority Gaps</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="text-2xl font-bold text-slate-900">
              {highPriorityGaps.length}
            </div>
            <p className="text-[11px] text-slate-500">
              Competency deficiencies exceeding 1.0 level on mission-critical workflows.
            </p>
            <Link
              to="/trainee/skill-gap"
              className="text-xs font-semibold text-[#1557A6] hover:underline flex items-center gap-1 pt-1"
            >
              <span>View Gap Audit</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Recommended Learning Courses */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-slate-500 flex items-center justify-between">
              <span>Actionable Courses</span>
              <BookOpen className="h-4 w-4 text-[#1557A6]" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="text-2xl font-bold text-slate-900">
              {recommendations.length}
            </div>
            <p className="text-[11px] text-slate-500">
              Syllabi algorithmically mapped to directly close your specific competency gaps.
            </p>
            <a
              href="#recommended-courses"
              className="text-xs font-semibold text-[#1557A6] hover:underline flex items-center gap-1 pt-1"
            >
              <span>Explore Curriculum</span>
              <ArrowRight className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>
      </div>

      {/* VIEWPORT: 3D Universe vs 2D Analytical Matrix */}
      {viewMode === "3d" ? (
        <div className="space-y-4">
          <Suspense
            fallback={
              <div className="w-full h-[520px] rounded-xl bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3 border border-slate-800">
                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                <span className="text-xs font-medium">Initializing 3D Constellation Canvas...</span>
              </div>
            }
          >
            <CompetencyUniverse3D
              competencies={competencies}
              selectedCompetencyId={selectedComp?.competency_id}
              onSelectCompetency={(comp) => setSelectedComp(comp)}
              onResetView={() => setSelectedComp(null)}
            />
          </Suspense>

          {/* Quick Guidance banner below 3D */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-900 text-slate-300 text-xs border border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <span>
                <strong>3D Controls:</strong> Rotate with left-click drag, zoom with mousewheel, and pan with right-click drag. Click any sphere to open its evidence dossier.
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewMode("2d")}
              className="text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
            >
              Switch to 2D Matrix
            </Button>
          </div>
        </div>
      ) : (
        /* 2D Analytical Section: Radar + Competency Cards */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Radar Chart (1 col) */}
          <Card className="border-slate-200 p-4 bg-white shadow-xs">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Competency Radar</span>
                <span className="text-[10px] text-slate-400 font-normal">Scale: 0.0 - 5.0</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#cbd5e1" strokeOpacity={0.6} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9 }} />
                  <Radar
                    name="Target Level (4.0)"
                    dataKey="target"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.15}
                  />
                  <Radar
                    name="Demonstrated Proficiency"
                    dataKey="demonstrated"
                    stroke="#1557A6"
                    fill="#1557A6"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex justify-center items-center gap-4 text-[10px] text-slate-500 pt-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#1557A6] inline-block" /> Demonstrated
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> Benchmark Target (4.0)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Competency Cards Grid (2 cols) */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {competencies.map((comp: UserCompetency) => {
              const isSelected = selectedComp?.competency_id === comp.competency_id
              return (
                <Card
                  key={comp.competency_id}
                  onClick={() => setSelectedComp(comp)}
                  className={`border transition-all cursor-pointer hover:shadow-xs bg-white ${
                    isSelected
                      ? "border-[#1557A6] ring-1 ring-[#1557A6] bg-blue-50/20"
                      : "border-slate-200"
                  }`}
                >
                  <CardHeader className="p-3.5 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {comp.code}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          comp.current_level >= 3.5
                            ? "bg-violet-50 text-violet-800 border border-violet-200"
                            : comp.current_level >= 2.5
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : comp.current_level >= 1.5
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        L{comp.current_level.toFixed(1)} / 5.0 • {comp.level_name}
                      </span>
                    </div>
                    <CardTitle className="text-xs font-bold text-slate-900 pt-1 line-clamp-1">
                      {comp.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-0 space-y-2">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Domain: {comp.category}</span>
                      <span>Confidence: {Math.round(comp.confidence_score * 100)}%</span>
                    </div>
                    <ProgressBar
                      value={(comp.current_level / 5.0) * 100}
                      variant="meteorological"
                      size="sm"
                    />
                    <div className="flex justify-between items-center pt-1 text-[11px]">
                      <span className="text-slate-500 line-clamp-1 max-w-[70%]">
                        {comp.evidence.find((e: any) => e.contribution > 0.4)?.title || "Developing"}
                      </span>
                      <span className="text-[#1557A6] font-semibold text-[10px] hover:underline">
                        Inspect Evidence →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected Competency Evidence Dossier Modal / Drawer */}
      {selectedComp && (
        <Card className="border-slate-200 bg-white shadow-md relative overflow-hidden">
          <button
            onClick={() => setSelectedComp(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          <CardHeader className="p-5 pb-3">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge className="bg-[#1557A6] text-white font-mono text-[10px]">
                {selectedComp.code}
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 border-slate-200">
                {selectedComp.category}
              </Badge>
              <span className="text-xs font-bold text-[#1557A6]">
                Demonstrated: Level {selectedComp.current_level.toFixed(1)} ({selectedComp.level_name})
              </span>
            </div>
            <CardTitle className="text-lg font-bold text-slate-900">
              {selectedComp.name} — Evidence Dossier
            </CardTitle>
            <p className="text-xs text-slate-600 max-w-3xl pt-1 leading-relaxed">
              {selectedComp.summary_explanation}
            </p>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            {/* 6 Deterministic Evidence Streams */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {selectedComp.evidence.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      {ev.type}
                    </span>
                    <span className="text-xs font-bold font-mono text-[#1557A6]">
                      +{ev.contribution.toFixed(2)} pts
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {ev.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Performance: {ev.score}%</span>
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1 leading-normal border-t border-slate-200">
                    {ev.detail}
                  </p>
                </div>
              ))}
            </div>

            {/* Growth Timeline if available */}
            {growthData && growthData.growth_points.length > 0 && (
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-[#1557A6]" />
                  <span>Historical Progression Milestones</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {growthData.growth_points.map((pt: any, pIdx: number) => (
                    <div
                      key={pIdx}
                      className="p-2 rounded bg-white border border-slate-200 text-[10px] space-y-0.5"
                    >
                      <div className="flex justify-between text-slate-500 font-mono">
                        <span>{pt.date}</span>
                        <span className="font-bold text-[#1557A6]">L{pt.level.toFixed(1)}</span>
                      </div>
                      <p className="text-slate-800 font-medium line-clamp-1">
                        {pt.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommended Learning Path Section */}
      <div id="recommended-courses" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#1557A6]" />
              <span>Personalized Learning Recommendations</span>
            </h2>
            <p className="text-xs text-slate-500">
              Courses algorithmically curated to address your identified skill gaps and accelerate operational readiness.
            </p>
          </div>
          <Link to="/trainee/skill-gap">
            <Button size="sm" variant="outline" className="text-xs gap-1 cursor-pointer hover:bg-slate-50">
              <span>Full Gap Analysis</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((rec: any) => (
            <Card
              key={rec.course_id}
              className="border-slate-200 flex flex-col justify-between bg-white shadow-xs"
            >
              <CardHeader className="p-4 pb-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {rec.code}
                  </span>
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                    {rec.match_score.toFixed(0)}% Relevance Match
                  </Badge>
                </div>
                <CardTitle className="text-sm font-bold text-slate-900 pt-1">
                  {rec.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Level: {rec.difficulty_level}</span>
                  <span>•</span>
                  <span>{rec.duration_hours}h duration</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="p-2.5 rounded-md bg-blue-50/60 border border-blue-100 text-[11px] text-slate-700 leading-relaxed">
                  <span className="font-semibold text-[#1557A6] block mb-0.5">
                    Why Recommended:
                  </span>
                  {rec.why_recommended}
                </div>
                <Link to={`/trainee/courses/${rec.course_id}`}>
                  <Button size="sm" className="w-full text-xs font-semibold shadow-xs">
                    Enroll to Close Gap
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Formula Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 border border-slate-200 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#1557A6]" />
                <span>Deterministic Readiness Calculation Formula</span>
              </h3>
              <button
                onClick={() => setShowFormulaModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                The <strong>Training Readiness Score</strong> reflects how closely a trainee's verified capabilities align with required operational standards, computed deterministically from six platform evidence channels:
              </p>
              <div className="p-3 rounded-md bg-slate-50 font-mono text-[11px] space-y-1 text-slate-800 border border-slate-200">
                <div>Readiness % = Sum(min(1.0, Level / Required) * Weight) / Sum(Weights) * 100</div>
              </div>
              <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-600">
                <li>30% Assessment Examinations (Best evaluated attempt)</li>
                <li>20% Syllabus & Lesson Progress</li>
                <li>20% Technical & Practical Skills</li>
                <li>15% Years in Operational Postings</li>
                <li>10% Verified WMO / Institutional Certifications</li>
                <li>5% Academic Qualifications (M.Sc / Ph.D.)</li>
              </ul>
              <p className="text-[11px] text-slate-400 italic">
                * Zero probabilistic black-box scoring. All calculations are traceable directly to database records.
              </p>
            </div>
            <Button
              className="w-full text-xs font-semibold"
              onClick={() => setShowFormulaModal(false)}
            >
              Close Guidelines
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TraineeCompetenciesPage
