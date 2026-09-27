import React from "react"

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
)

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 w-full max-w-7xl mx-auto py-6">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 rounded-lg border border-slate-200 space-y-3 bg-white">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-6 w-44" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  </div>
)

export const CourseCatalogSkeleton: React.FC = () => (
  <div className="space-y-6 w-full max-w-7xl mx-auto py-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80" />
    </div>

    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <Skeleton className="h-10 w-full sm:w-80" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-72 rounded-lg border border-slate-200 p-4 space-y-3 bg-white">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full mt-4" />
        </div>
      ))}
    </div>
  </div>
)

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden">
    <div className="h-11 bg-slate-50 border-b border-slate-200 px-4 flex items-center gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="h-14 px-4 flex items-center gap-4">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
)

