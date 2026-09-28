import React, { useState, useMemo, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { Search, Filter, Compass, Layers, RotateCcw, X, BookOpen } from "lucide-react"
import { Container } from "@/components/layout/Container"
import { CourseCard } from "@/components/ui/course-card"
import { CourseCatalogSkeleton } from "@/components/ui/loading-skeleton"
import { ErrorState } from "@/components/ui/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { coursesService } from "@/services/courses"

export const CourseCataloguePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get("category_id") || undefined
  const initialSearch = searchParams.get("search") || ""

  const [search, setSearch] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>()
  const [page, setPage] = useState(1)

  // Sync category or search if URL query param changes
  useEffect(() => {
    const catId = searchParams.get("category_id") || undefined
    const searchParam = searchParams.get("search") || ""
    setSelectedCategory(catId)
    if (searchParam) setSearch(searchParam)
    setPage(1)
  }, [searchParams])

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

  // Calculate total course count across all categories
  const totalAllCourses = useMemo(() => {
    if (!data?.categories || data.categories.length === 0) return 12
    return data.categories.reduce((acc, cat) => acc + (cat.course_count || 0), 0)
  }, [data?.categories])

  const handleCategorySelect = (categoryId?: string) => {
    setSelectedCategory(categoryId)
    setPage(1)
    if (categoryId) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set("category_id", categoryId)
        return next
      })
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete("category_id")
        return next
      })
    }
  }

  const resetFilters = () => {
    setSearch("")
    setSelectedCategory(undefined)
    setSelectedDifficulty(undefined)
    setPage(1)
    setSearchParams({})
  }

  const hasActiveFilters = Boolean(selectedCategory || selectedDifficulty || search)

  const difficulties = [
    { label: "All Levels", value: undefined },
    { label: "Beginner", value: "BEGINNER" },
    { label: "Intermediate", value: "INTERMEDIATE" },
    { label: "Advanced", value: "ADVANCED" },
  ]

  return (
    <div className="w-full bg-[#F7F9FC] min-h-[calc(100vh-140px)] py-6 sm:py-8 lg:py-10">
      <Container className="space-y-6 sm:space-y-7">
        {/* ======================================================== */}
        {/* 1. HEADER / HERO SECTION                                 */}
        {/* ======================================================== */}
        <div className="pb-5 border-b border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-[#1557A6] border border-blue-200">
                  Official Curriculum
                </span>
                <span className="text-[12px] text-slate-500 font-medium">
                  WMO / BIP-M Standards · Capacity Building Portal
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#062B73] tracking-tight flex items-center gap-2.5">
                <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-[#1557A6] shrink-0" />
                <span>Course Catalogue</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                Standardized capacity building courses aligned with WMO Basic Instruction Packages (BIP-M) and operational IMD mandates across meteorology, forecasting, radar, satellites, and climate science.
              </p>
            </div>

            {hasActiveFilters && (
              <div className="shrink-0 self-start md:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs h-9 text-slate-600 hover:text-slate-900 border-slate-300 gap-1.5 shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-[#1557A6]" />
                  <span>Reset Filters</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. SEARCH & LEVEL FILTERS SECTION                        */}
        {/* ======================================================== */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row gap-3.5 md:items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md lg:max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search by title, code, or topic..."
              className="w-full h-10 pl-10 pr-9 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white placeholder-slate-400 focus:outline-none focus:border-[#1557A6] focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setPage(1)
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                title="Clear search input"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Difficulty Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3 text-[#1557A6]" /> Level:
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-[#1557A6] text-white border-[#1557A6] shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {diff.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. CATEGORY CONTROLS SECTION                             */}
        {/* ======================================================== */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              <Layers className="h-4 w-4 text-[#1557A6]" />
              <span>Browse by Discipline</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {data?.categories ? `${data.categories.length} Disciplines` : "8 Disciplines"}
            </span>
          </div>

          {/* Category Tabs Strip (Responsive touch scrolling) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scroll-smooth scrollbar-thin scrollbar-thumb-slate-200 touch-pan-x">
            {/* All Courses Tab */}
            <button
              type="button"
              onClick={() => handleCategorySelect(undefined)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-semibold shrink-0 transition-all cursor-pointer border ${
                !selectedCategory
                  ? "bg-[#1557A6] text-white border-[#1557A6] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              <span>All Disciplines</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-[13px] font-semibold shrink-0 transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#1557A6] text-white border-[#1557A6] shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
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

        {/* ======================================================== */}
        {/* 4. COURSE GRID SECTION                                   */}
        {/* ======================================================== */}
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
            icon={<Compass className="h-8 w-8 text-[#1557A6]" />}
            title="No Courses Match Your Selection"
            description="Try selecting a different category or clearing your search keywords and level filters."
            actionLabel="View All Courses"
            onAction={resetFilters}
          />
        ) : (
          <div className="space-y-6">
            {/* Results Meta Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 px-0.5">
              <span>
                Showing <strong className="text-slate-900 font-bold">{data?.items.length}</strong> of{" "}
                <strong className="text-slate-900 font-bold">{data?.total}</strong> operational courses
                {selectedCategory && (
                  <span className="ml-1 text-[#1557A6] font-semibold">
                    in {data?.categories.find((c) => c.id === selectedCategory)?.name || "selected category"}
                  </span>
                )}
              </span>
              {data && data.total_pages > 1 && (
                <span className="text-slate-500 font-medium">
                  Page {data.page} of {data.total_pages}
                </span>
              )}
            </div>

            {/* Responsive Course Grid:
                - Mobile (<640px): 1 column
                - Small Tablet (640px – 1023px): 2 columns
                - Tablet Landscape / Laptop (1024px – 1279px): 3 columns
                - Desktop / Large Desktop (1280px+): 4 columns
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 items-stretch">
              {data?.items.map((course) => (
                <div key={course.id} className="h-full flex">
                  <CourseCard course={course} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {data && data.total_pages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6 pb-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1))
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="text-xs h-9 px-4 font-semibold border-slate-300"
                >
                  Previous
                </Button>
                <span className="text-xs text-slate-700 font-semibold px-3 py-1.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                  Page {data.page} of {data.total_pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.total_pages}
                  onClick={() => {
                    setPage((p) => p + 1)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="text-xs h-9 px-4 font-semibold border-slate-300"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  )
}
