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
    <div className="space-y-6">
      {/* Top Atmospheric Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              IMD Curriculum
            </span>
            <span className="text-xs text-slate-300">Operational Capacity Building</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Meteorological Course Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Standardized training syllabus designed in accordance with WMO Basic Instruction Packages for Meteorologists (BIP-M) and IMD operational requirements.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by title, code, or topic (e.g., Radar, Monsoon)..."
              className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Difficulty Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {difficulties.map((diff) => {
              const isSelected = selectedDifficulty === diff.value
              return (
                <button
                  key={diff.label}
                  onClick={() => {
                    setSelectedDifficulty(diff.value)
                    setPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {diff.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Categories Bar */}
        {data?.categories && data.categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Discipline:
            </span>
            <button
              onClick={() => {
                setSelectedCategory(undefined)
                setPage(1)
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
                !selectedCategory
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              All Disciplines
            </button>
            {data.categories.map((cat) => {
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id)
                    setPage(1)
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
