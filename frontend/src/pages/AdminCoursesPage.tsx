import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  BookOpen,
  Archive,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <span>Institutional Course Governance</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review curriculum offerings across all IMD divisions, inspect assigned trainers, and control publishing state.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Auditing course registry...</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-red-900">Failed to load courses</h3>
            <p className="text-sm text-red-700 mt-1">{(error as Error).message}</p>
          </CardContent>
        </Card>
      ) : (courses || []).length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800">
          <CardContent className="py-12 text-center">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No courses registered in the database.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(courses || []).map((c: AdminCourseItem) => (
                <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {c.title}
                    </span>
                    <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">{c.code}</span>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{c.category_name}</td>
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{c.trainer_name}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[10px]">
                      {c.difficulty_level}
                    </Badge>
                  </td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                    {c.enrollments_count}
                  </td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
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
                          className="h-7 text-xs text-amber-600 hover:text-amber-700"
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
