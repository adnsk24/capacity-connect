import React, { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Printer,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
} from "lucide-react"
import { coursesService, CourseCard } from "@/services/courses"
import { aiService, AIStudyGuideResponse, AIResourceItem } from "@/services/aiService"

export const TraineeStudyGuidePage: React.FC = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [selectedModuleId, setSelectedModuleId] = useState<string>("")
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [studyGuide, setStudyGuide] = useState<AIStudyGuideResponse | null>(null)
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({})

  // Catalogue courses
  const { data: catalogue } = useQuery({
    queryKey: ["trainee-catalogue-courses"],
    queryFn: () => coursesService.getCatalogue({ pageSize: 50 }),
  })
  const courses: CourseCard[] = catalogue?.items || []

  useEffect(() => {
    if (catalogue?.items && catalogue.items.length > 0 && !selectedCourseId) {
      setSelectedCourseId(catalogue.items[0].id)
    }
  }, [catalogue, selectedCourseId])

  // Modules for selected course
  const { data: courseDetail } = useQuery({
    queryKey: ["course-detail-modules", selectedCourseId],
    queryFn: () => coursesService.getCourseDetails(selectedCourseId),
    enabled: !!selectedCourseId,
  })
  const modules = courseDetail?.modules || []

  // Resources
  const { data: rawResources } = useQuery({
    queryKey: ["ai-notebook-resources", selectedCourseId, selectedModuleId],
    queryFn: () => aiService.getNotebookResources(selectedCourseId, selectedModuleId || undefined),
    enabled: !!selectedCourseId,
  })
  const resources: AIResourceItem[] = rawResources || []

  useEffect(() => {
    if (rawResources && rawResources.length > 0) {
      setSelectedResourceIds(rawResources.map((r) => r.id))
    }
  }, [rawResources])

  const toggleResource = (id: string) => {
    setSelectedResourceIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    )
  }

  const handleGenerate = async () => {
    if (!selectedCourseId || isGenerating) return
    setIsGenerating(true)
    try {
      const res = await aiService.generateStudyGuide({
        course_id: selectedCourseId,
        module_id: selectedModuleId || undefined,
        resource_ids: selectedResourceIds.length > 0 ? selectedResourceIds : undefined,
      })
      setStudyGuide(res)
      setRevealedHints({})
    } catch (err: any) {
      alert(err?.message || "Failed to generate study guide.")
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleHint = (idx: number) => {
    setRevealedHints((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-50 text-[#1557A6] rounded-md">
              <FileText className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Grounded Study Guide</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Grounded in training materials
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Generate an exhaustive 6-part revision study guide synthesised directly from approved syllabus documents and operational manuals.
          </p>
        </div>

        {studyGuide && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        )}
      </div>

      {/* Selector Controls Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Course Offering
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value)
                setSelectedModuleId("")
              }}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800"
            >
              {courses.map((c: CourseCard) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Curriculum Module Focus
            </label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800"
            >
              <option value="">Full Course Scope</option>
              {modules.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resources selection chips */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Selected Grounding Resources ({selectedResourceIds.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {resources.map((res: AIResourceItem) => {
              const isChecked = selectedResourceIds.includes(res.id)
              return (
                <button
                  type="button"
                  key={res.id}
                  onClick={() => toggleResource(res.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    isChecked
                      ? "bg-blue-50 border-blue-300 text-[#1557A6]"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {res.title}
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedCourseId}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1557A6] hover:bg-[#114380] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Sparkles className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Synthesizing Grounded Study Guide..." : "Generate Study Guide"}
          </button>
        </div>
      </div>

      {/* Generated Guide Presentation */}
      {studyGuide && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-8 print:border-none print:shadow-none">
          <div className="border-b border-slate-200 pb-4">
            <div className="text-xs font-bold uppercase tracking-widest text-[#1557A6] mb-1">
              Curriculum Study Guide
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{studyGuide.course_title}</h2>
            <div className="text-xs text-slate-500 mt-1">
              Grounded Citation: <span className="font-semibold text-slate-700">{studyGuide.guide.source_citation}</span>
            </div>
          </div>

          {/* 1. Topic Overview */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-l-4 border-[#1557A6] pl-2.5">
              1. Operational Topic Overview
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              {studyGuide.guide.topic_overview}
            </p>
          </section>

          {/* 2. Key Concepts */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-l-4 border-[#1557A6] pl-2.5">
              2. Core Physical & Forecasting Principles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {studyGuide.guide.key_concepts.map((kc, idx) => (
                <div key={idx} className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-lg text-xs text-slate-800 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1557A6] flex-shrink-0 mt-0.5" />
                  <span>{kc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Important Terminology */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-l-4 border-[#1557A6] pl-2.5">
              3. Essential Terminology & Technical Definitions
            </h3>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
              {studyGuide.guide.important_terminology.map((t, idx) => (
                <div key={idx} className="p-3.5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-900 md:w-1/3">{t.term}</span>
                  <span className="text-slate-600 md:w-2/3">{t.definition}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Concept Explanations */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-l-4 border-[#1557A6] pl-2.5">
              4. Grounded Concept Explanations
            </h3>
            <div className="space-y-3">
              {studyGuide.guide.concept_explanations.map((ce, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs">
                  <div className="font-bold text-slate-900 text-sm">{ce.title}</div>
                  <p className="text-slate-700 leading-relaxed">{ce.explanation}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. Revision Points */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-l-4 border-[#1557A6] pl-2.5">
              5. Quick Revision Checklist
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              {studyGuide.guide.revision_points.map((rp, idx) => (
                <li key={idx}>{rp}</li>
              ))}
            </ul>
          </section>

          {/* 6. Self-Check Questions */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-l-4 border-[#1557A6] pl-2.5">
              6. Self-Evaluation Questions
            </h3>
            <div className="space-y-3">
              {studyGuide.guide.self_check_questions.map((q, idx) => (
                <div key={idx} className="p-4 bg-white border border-slate-200 rounded-lg space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-[#1557A6] flex-shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-900">{q.question}</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleHint(idx)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1557A6] hover:underline"
                    >
                      <Lightbulb className="h-3 w-3 text-amber-500" />
                      {revealedHints[idx] ? "Hide Operational Hint" : "Reveal Operational Hint"}
                    </button>
                    {revealedHints[idx] && (
                      <div className="mt-1.5 p-2.5 bg-amber-50/70 border border-amber-200 rounded text-xs text-amber-950">
                        {q.hint}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default TraineeStudyGuidePage
