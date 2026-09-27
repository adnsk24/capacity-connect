import React from "react"
import { useQuery } from "@tanstack/react-query"
import { ClipboardCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TableSkeleton } from "@/components/ui/loading-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { adminService, AdminAssessmentItem } from "@/services/admin"

export const AdminAssessmentsPage: React.FC = () => {
  const { data: assessments, isLoading, error } = useQuery({
    queryKey: ["admin-assessments"],
    queryFn: () => adminService.listAssessments(),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <ClipboardCheck className="h-6 w-6 text-blue-600" />
          <span>Cross-Institutional Examination Monitoring</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor examination standards, passing rates, attempt volumes, and faculty question banks.
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} columns={9} />
      ) : error ? (
        <ErrorState
          title="Unable to load examination telemetry"
          message="Could not retrieve assessment performance metrics. Please try again."
        />
      ) : (assessments || []).length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-6 w-6" />}
          title="No assessments recorded"
          description="There are currently no active assessments or examination records."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Assessment Title</th>
                <th className="p-3">Course</th>
                <th className="p-3">Trainer</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Passing Req</th>
                <th className="p-3">Submissions</th>
                <th className="p-3">Average Score</th>
                <th className="p-3">Pass Rate</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(assessments || []).map((a: AdminAssessmentItem) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">
                    {a.title}
                  </td>
                  <td className="p-3 text-slate-600">{a.course_title}</td>
                  <td className="p-3 font-medium text-slate-800">{a.trainer_name}</td>
                  <td className="p-3 text-slate-500">{a.duration_minutes ? `${a.duration_minutes}m` : "—"}</td>
                  <td className="p-3 font-semibold text-slate-700">{a.passing_percentage}%</td>
                  <td className="p-3 font-bold text-slate-800">{a.attempts_count}</td>
                  <td className="p-3 font-semibold text-slate-800">{a.average_score}%</td>
                  <td className="p-3">
                    <span
                      className={`font-bold ${
                        a.pass_rate >= 60 ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {a.pass_rate}%
                    </span>
                  </td>
                  <td className="p-3">
                    <Badge variant={a.status === "PUBLISHED" ? "success" : "secondary"} className="text-[10px]">
                      {a.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
