import React from "react"

export interface StatusBadgeProps {
  status: string
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const normalized = status.toUpperCase().trim()

  const baseClass = `inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${className}`

  switch (normalized) {
    case "COMPLETED":
    case "VERIFIED":
    case "ACTIVE":
      return (
        <span className={`${baseClass} bg-green-50 text-green-700 border-green-200`}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" />
          {normalized === "COMPLETED" ? "Completed" : normalized === "VERIFIED" ? "Verified" : "Active"}
        </span>
      )

    case "IN_PROGRESS":
      return (
        <span className={`${baseClass} bg-blue-50 text-[#1557A6] border-blue-200`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1557A6] inline-block" />
          In Progress
        </span>
      )

    case "ENROLLED":
      return (
        <span className={`${baseClass} bg-blue-50 text-blue-700 border-blue-200`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
          Enrolled
        </span>
      )

    case "BEGINNER":
      return (
        <span className={`${baseClass} bg-green-50 text-green-700 border-green-200`}>
          Beginner
        </span>
      )

    case "INTERMEDIATE":
      return (
        <span className={`${baseClass} bg-amber-50 text-amber-700 border-amber-200`}>
          Intermediate
        </span>
      )

    case "ADVANCED":
      return (
        <span className={`${baseClass} bg-red-50 text-red-700 border-red-200`}>
          Advanced
        </span>
      )

    case "PENDING":
      return (
        <span className={`${baseClass} bg-amber-50 text-amber-700 border-amber-200`}>
          Pending
        </span>
      )

    case "PASSED":
      return (
        <span className={`${baseClass} bg-green-50 text-green-700 border-green-200`}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" />
          Passed
        </span>
      )

    case "FAILED":
      return (
        <span className={`${baseClass} bg-red-50 text-red-700 border-red-200`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
          Failed
        </span>
      )

    case "PUBLISHED":
      return (
        <span className={`${baseClass} bg-green-50 text-green-700 border-green-200`}>
          Published
        </span>
      )

    case "DRAFT":
      return (
        <span className={`${baseClass} bg-slate-100 text-slate-600 border-slate-200`}>
          Draft
        </span>
      )

    default:
      return (
        <span className={`${baseClass} bg-slate-100 text-slate-600 border-slate-200`}>
          {status}
        </span>
      )
  }
}
