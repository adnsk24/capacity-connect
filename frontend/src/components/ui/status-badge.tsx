import React from "react"
import { Badge } from "./badge"

export interface StatusBadgeProps {
  status: string
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const normalized = status.toUpperCase().trim()

  switch (normalized) {
    case "COMPLETED":
    case "VERIFIED":
    case "ACTIVE":
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
          {normalized === "COMPLETED" ? "Completed" : normalized === "VERIFIED" ? "Verified" : "Active"}
        </Badge>
      )

    case "IN_PROGRESS":
      return (
        <Badge
          variant="outline"
          className={`bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 inline-block animate-pulse" />
          In Progress
        </Badge>
      )

    case "ENROLLED":
      return (
        <Badge
          variant="outline"
          className={`bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800 ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1.5 inline-block" />
          Enrolled
        </Badge>
      )

    case "BEGINNER":
      return (
        <Badge variant="outline" className={`bg-emerald-50/80 text-emerald-700 border-emerald-200 text-[11px] ${className}`}>
          Beginner
        </Badge>
      )

    case "INTERMEDIATE":
      return (
        <Badge variant="outline" className={`bg-amber-50/80 text-amber-700 border-amber-200 text-[11px] ${className}`}>
          Intermediate
        </Badge>
      )

    case "ADVANCED":
      return (
        <Badge variant="outline" className={`bg-purple-50/80 text-purple-700 border-purple-200 text-[11px] ${className}`}>
          Advanced
        </Badge>
      )

    case "PENDING":
      return (
        <Badge
          variant="outline"
          className={`bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 ${className}`}
        >
          Pending
        </Badge>
      )

    default:
      return (
        <Badge variant="outline" className={`bg-slate-50 text-slate-700 border-slate-200 ${className}`}>
          {status}
        </Badge>
      )
  }
}
