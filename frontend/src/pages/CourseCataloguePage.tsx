import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Filter, Compass } from "lucide-react"
import { CourseCard } from "@/components/ui/course-card"
import { CourseCatalogSkeleton } from "@/components/ui/loading-skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { coursesService } from "@/services/courses"

export const CourseCataloguePage: React.FC = () => {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>()
  const [page, setPage] = useState(1)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["courses-catalogue", search, selectedCategory, selectedDifficulty, page],
    queryFn: () =>
      coursesService.getCatalogue({
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
        page,
        pageSize: 12,
      }),
  })

  const resetFilters = () => {
    setSearch("")
    setSelectedCategory(undefined)
    setSelectedDifficulty(undefined)
    setPage(1)
  }

  const difficulties = [
    { label: "All Levels", value: undefined },
    { label: "Beginner", value: "BEGINNER" },
    { label: "Intermediate", value: "INTERMEDIATE" },
    { label: "Advanced", value: "ADVANCED" },
  ]

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="pb-5 border-b border-slate-200">
        <h1 className="text-[22px] font-bold text-slate-900">Course Catalogue</h1>
        <p className="text-[13px] text-slate-500 mt-0.5">
          Standardized training syllabus aligned with WMO Basic Instruction Packages (BIP-M) and IMD operational requirements.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-[0_1px_3px_0_rgb(0,0,0,0.06)]">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by title, code, or topic..."
              className="w-full h-9 pl-9 pr-3 text-[13px] rounded-md border border-slate-300 bg-white focus:outline-none focus:border-[#1557A6] focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {difficulties.map((diff) => {
              const isSelected = selectedDifficulty === diff.value
              return (
                <button
                  key={diff.label}
                  onClick={() => {
                    setSelectedDifficulty(diff.value)
                    setPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors border ${
                    isSelected
                      ? "bg-[#1557A6] text-white border-[#1557A6]"
                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {diff.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Categories */}
        {data?.categories && data.categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 border-t border-slate-100 pt-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Category:
            </span>
            <button
              onClick={() => { setSelectedCategory(undefined); setPage(1) }}
              className={`px-2.5 py-1 rounded-md text-[12px] font-medium shrink-0 transition-colors border ${
                !selectedCategory
                  ? "bg-[#1557A6] text-white border-[#1557A6]"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              All
            </button>
            {data.categories.map((cat) => {
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setPage(1) }}
                  className={`px-2.5 py-1 rounded-md text-[12px] font-medium shrink-0 transition-colors border ${
                    isSelected
                      ? "bg-[#1557A6] text-white border-[#1557A6]"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cat.name}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Main Course Grid */}
      {isLoading ? (
        <CourseCatalogSkeleton />
      ) : error ? (
        <ErrorState
          title="Could not load courses"
          message={error instanceof Error ? error.message : "Error contacting course server"}
          onRetry={() => refetch()}
        />
      ) : data?.items.length === 0 ? (
        <EmptyState
          icon={<Compass className="h-8 w-8" />}
          title="No Courses Match Your Criteria"
          description="Try broadening your search term or clearing category and difficulty filters."
          actionLabel="Reset All Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800 dark:text-slate-200">{data?.items.length}</strong> of{" "}
              <strong className="text-slate-800 dark:text-slate-200">{data?.total}</strong> operational courses
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.items.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Pagination Controls */}
          {data && data.total_pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-xs"
              >
                Previous
              </Button>
              <span className="text-xs text-slate-600 font-medium px-2">
                Page {data.page} of {data.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
