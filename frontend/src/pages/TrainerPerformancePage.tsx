import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { trainerService, TraineePerformanceItem } from "@/services/trainer"

export const TrainerPerformancePage: React.FC = () => {
  const [search, setSearch] = useState("")
  const [courseFilter, setCourseFilter] = useState("")
  const [page, setPage] = useState(1)

  const { data: courses } = useQuery({
    queryKey: ["trainer-courses"],
    queryFn: () => trainerService.listCourses(),
  })

  const { data: perfData, isLoading, error } = useQuery({
    queryKey: ["trainer-performance", courseFilter, search, page],
    queryFn: () =>
      trainerService.getPerformance({
        course_id: courseFilter || undefined,
        search: search || undefined,
        page,
        page_size: 20,
      }),
  })

  const items = perfData?.items || []
  const totalCount = perfData?.total_count || 0
  const totalPages = Math.ceil(totalCount / 20) || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Users className="h-6 w-6 text-emerald-600" />
          <span>Trainee Competency & Performance</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor student progression, lesson completions, and assessment scores across all supervised courses.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search trainees by name or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            {/* Course Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={courseFilter}
                onChange={(e) => {
                  setCourseFilter(e.target.value)
                  setPage(1)
                }}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 w-full sm:w-60"
              >
                <option value="">All Managed Courses</option>
                {(courses || []).map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trainee Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Aggregating trainee records...</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-red-900">Failed to load performance data</h3>
            <p className="text-sm text-red-700 mt-1">{(error as Error).message}</p>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800">
          <CardContent className="py-12 text-center">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No trainee records match your current filter parameters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">Trainee</th>
                  <th className="p-3">Course</th>
                  <th className="p-3">Enrollment</th>
                  <th className="p-3">Curriculum Progress</th>
                  <th className="p-3">Lessons</th>
                  <th className="p-3">Attempts</th>
                  <th className="p-3">Latest Score</th>
                  <th className="p-3">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((t: TraineePerformanceItem) => (
                  <tr key={`${t.trainee_id}-${t.course_id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3">
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {t.trainee_name}
                      </span>
                      <span className="text-[11px] text-slate-400">{t.trainee_email}</span>
                    </td>
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                      {t.course_title}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={t.enrollment_status === "COMPLETED" ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {t.enrollment_status}
                      </Badge>
                    </td>
                    <td className="p-3 min-w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, t.progress_percentage)}%` }}
                          />
                        </div>
                        <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 shrink-0">
                          {t.progress_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {t.completed_lessons} / {t.total_lessons}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">
                      {t.assessment_attempts_count}
                    </td>
                    <td className="p-3 font-semibold">
                      {t.latest_score !== null && t.latest_score !== undefined
                        ? `${t.latest_score}%`
                        : "—"}
                    </td>
                    <td className="p-3">
                      {t.is_passed === true ? (
                        <Badge variant="success" className="text-[10px] gap-1 flex items-center">
                          <CheckCircle2 className="h-3 w-3" /> PASS
                        </Badge>
                      ) : t.is_passed === false ? (
                        <Badge variant="destructive" className="text-[10px] gap-1 flex items-center">
                          <XCircle className="h-3 w-3" /> FAIL
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Unassessed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>
              Showing {items.length} of {totalCount} trainees
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs"
              >
                Previous
              </Button>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
