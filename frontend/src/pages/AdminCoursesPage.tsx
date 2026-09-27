import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { BookOpen, Archive } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableSkeleton } from "@/components/ui/loading-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { adminService, AdminCourseItem } from "@/services/admin"

export const AdminCoursesPage: React.FC = () => {
  const queryClient = useQueryClient()

  const { data: courses, isLoading, error } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: () => adminService.listCourses(),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ courseId, status }: { courseId: string; status: string }) =>
      adminService.updateCourseStatus(courseId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] })
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] })
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-[22px] font-bold text-slate-900 flex items-center gap-2.5">
          <BookOpen className="h-6 w-6 text-[#1557A6]" />
          <span>Institutional Course Governance</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review curriculum offerings across all IMD divisions, inspect assigned trainers, and control publishing state.
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} columns={7} />
      ) : error ? (
        <ErrorState
          title="Unable to load course catalogue"
          message="Could not load the institutional course registry. Please try again."
          onRetry={() => queryClient.invalidateQueries({ queryKey: ["admin-courses"] })}
        />
      ) : (courses || []).length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No courses registered"
          description="There are currently no training courses configured in the system."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Course Code & Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Assigned Trainer</th>
                <th className="p-3">Difficulty</th>
                <th className="p-3">Enrollments</th>
                <th className="p-3">Completion</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(courses || []).map((c: AdminCourseItem) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <span className="font-semibold text-slate-900 block">
                      {c.title}
                    </span>
                    <span className="font-mono text-[11px] text-[#1557A6]">{c.code}</span>
                  </td>
                  <td className="p-3 text-slate-600">{c.category_name}</td>
                  <td className="p-3 font-medium text-slate-800">{c.trainer_name}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200 text-slate-700">
                      {c.difficulty_level}
                    </Badge>
                  </td>
                  <td className="p-3 font-semibold text-slate-700">
                    {c.enrollments_count}
                  </td>
                  <td className="p-3 font-semibold text-slate-700">
                    {c.completion_rate}%
                  </td>
                  <td className="p-3">
                    <Badge
                      variant={c.status === "PUBLISHED" ? "success" : "secondary"}
                      className="text-[10px]"
                    >
                      {c.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {c.status === "DRAFT" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ courseId: c.id, status: "PUBLISHED" })}
                          disabled={updateStatusMutation.isPending}
                          className="h-7 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                        >
                          Publish
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateStatusMutation.mutate({ courseId: c.id, status: "DRAFT" })}
                          disabled={updateStatusMutation.isPending}
                          className="h-7 text-xs text-amber-700 hover:text-amber-800"
                        >
                          Unpublish
                        </Button>
                      )}

                      {c.status !== "ARCHIVED" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateStatusMutation.mutate({ courseId: c.id, status: "ARCHIVED" })}
                          disabled={updateStatusMutation.isPending}
                          className="h-7 text-xs text-slate-400 hover:text-slate-700"
                          title="Archive Course"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
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
