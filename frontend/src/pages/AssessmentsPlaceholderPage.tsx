import React from "react"
import { ClipboardList } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const AssessmentsPlaceholderPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <ClipboardList className="h-6 w-6 text-indigo-600" />
            <span>Assessments & Evaluations</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Formal examination testing, practical diagnostic evaluations, and cadre advancement checks
          </p>
        </div>
        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-300">
          Planned for Phase 4
        </Badge>
      </div>

      <Card className="border-slate-200 p-8 text-center bg-slate-50/50">
        <ClipboardList className="h-12 w-12 text-indigo-500 mx-auto mb-3 opacity-80" />
        <h3 className="text-base font-bold text-slate-800 mb-2">
          Assessment Engine Under Active Development
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
          The Phase 3 slice delivers Core Platform UI, Course Catalogue, Enrollment, and Lesson Progression. Integrated multiple-choice tests, automated grading, and proctored examinations will be activated in Phase 4.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left text-xs">
          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <span className="font-bold block text-slate-900">Formative Quizzes</span>
            <span className="text-[11px] text-slate-500">Module-level diagnostic questions</span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <span className="font-bold block text-slate-900">Practical Radar Cases</span>
            <span className="text-[11px] text-slate-500">Real severe storm radar simulations</span>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <span className="font-bold block text-slate-900">Certification Exams</span>
            <span className="text-[11px] text-slate-500">End-of-course credential verification</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
