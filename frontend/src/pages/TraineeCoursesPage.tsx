import React, { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { Search, Filter, BookOpen, Layers, RotateCcw, Compass } from "lucide-react"
import { CourseCard } from "@/components/ui/course-card"
import { CourseCatalogSkeleton } from "@/components/ui/loading-skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { coursesService } from "@/services/courses"

export const TraineeCoursesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get("category_id") || undefined

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>()
  const [page, setPage] = useState(1)

  // Sync category state if URL query param changes
  useEffect(() => {
    const catId = searchParams.get("category_id") || undefined
    setSelectedCategory(catId)
    setPage(1)
  }, [searchParams])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["trainee-courses-catalogue", search, selectedCategory, selectedDifficulty, page],
    queryFn: () =>
      coursesService.getCatalogue({
        search: search.trim() || undefined,
        categoryId: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
        page,
        pageSize: 12,
      }),
  })

  // Calculate total course count across all categories
  const totalAllCourses = useMemo(() => {
    if (!data?.categories || data.categories.length === 0) return 12
    return data.categories.reduce((acc, cat) => acc + (cat.course_count || 0), 0)
  }, [data?.categories])

  const handleCategorySelect = (categoryId?: string) => {
    setSelectedCategory(categoryId)
    setPage(1)
    if (categoryId) {
      setSearchParams({ category_id: categoryId })
    } else {
      setSearchParams({})
    }
  }

  const resetFilters = () => {
    setSearch("")
    setSelectedCategory(undefined)
    setSelectedDifficulty(undefined)
    setPage(1)
    setSearchParams({})
  }

  const difficulties = [
    { label: "All Levels", value: undefined },
    { label: "Beginner", value: "BEGINNER" },
    { label: "Intermediate", value: "INTERMEDIATE" },
    { label: "Advanced", value: "ADVANCED" },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-[#1557A6] border border-blue-200">
                Official Curriculum
              </span>
              <span className="text-[12px] text-slate-400 font-medium">BIP-M / WMO Standards</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <BookOpen className="h-7 w-7 text-[#1557A6]" />
              <span>Course Catalogue</span>
            </h1>
            <p className="text-[13px] text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Standardized capacity building courses aligned with WMO Basic Instruction Packages (BIP-M) and operational IMD mandates across meteorology, forecasting, radar, satellites, and climate science.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {(selectedCategory || selectedDifficulty || search) && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-xs h-8 text-slate-600 hover:text-slate-900 gap-1.5"
              >
                <RotateCcw className="h-3 w-3" /> Reset Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation Bar with Course Counts */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Layers className="h-3.5 w-3.5 text-[#1557A6]" />
            <span>Browse by Discipline</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            {data?.categories ? `${data.categories.length} Disciplines` : "8 Disciplines"}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin scrollbar-thumb-slate-200">
          {/* All Courses Tab */}
          <button
            type="button"
            onClick={() => handleCategorySelect(undefined)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold shrink-0 transition-all cursor-pointer border ${
              !selectedCategory
                ? "bg-[#1557A6] text-white border-[#1557A6] shadow-xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <span>All Courses</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                !selectedCategory ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {totalAllCourses}
            </span>
          </button>

          {/* Dynamic Category Tabs */}
          {data?.categories &&
            data.categories.map((cat) => {
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold shrink-0 transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[#1557A6] text-white border-[#1557A6] shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {cat.course_count ?? 0}
                  </span>
                </button>
              )
            })}
        </div>
      </div>

      {/* Search & Difficulty Filter Sub-Bar */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search courses by title, code, or topic..."
            className="w-full h-9 pl-9 pr-3 text-[13px] rounded-lg border border-slate-300 bg-white placeholder-slate-400 focus:outline-none focus:border-[#1557A6] focus:ring-2 focus:ring-blue-100 transition-colors"
          />
        </div>

        {/* Difficulty filter buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Level:
          </span>
          {difficulties.map((diff) => {
            const isSelected = selectedDifficulty === diff.value
            return (
              <button
                type="button"
                key={diff.label}
                onClick={() => {
                  setSelectedDifficulty(diff.value)
                  setPage(1)
                }}
                className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors border cursor-pointer ${
                  isSelected
                    ? "bg-[#1557A6] text-white border-[#1557A6] shadow-2xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100/80"
                }`}
              >
                {diff.label}
              </button>
            )
          })}
        </div>
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
          title="No Courses Match Your Selection"
          description="Try selecting a different category or clearing search and difficulty filters."
          actionLabel="View All Courses"
          onAction={resetFilters}
        />
      ) : (
        <div className="space-y-6">
          {/* Results Summary Header */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
            <span>
              Showing <strong className="text-slate-800 font-semibold">{data?.items.length}</strong> of{" "}
              <strong className="text-slate-800 font-semibold">{data?.total}</strong> operational courses
              {selectedCategory && (
                <span className="ml-1 text-[#1557A6] font-medium">
                  in {data?.categories.find((c) => c.id === selectedCategory)?.name || "selected category"}
                </span>
              )}
            </span>
          </div>

          {/* Responsive Course Grid: Mobile 1, Tablet 2, Desktop/Laptop 3 or 4 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data?.items.map((course) => (
              <CourseCard key={course.id} course={course} basePath="/trainee/courses" />
            ))}
          </div>

          {/* Pagination Controls */}
          {data && data.total_pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1))
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
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
                onClick={() => {
                  setPage((p) => Math.min(data.total_pages, p + 1))
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
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
