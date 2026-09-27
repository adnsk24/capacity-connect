import React from "react"

interface ProgressBarProps {
  value: number // 0 to 100
  max?: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  variant?: "primary" | "success" | "warning" | "meteorological"
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = "md",
  showLabel = false,
  variant = "meteorological",
  className = "",
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  }

  const variantGradients = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600",
    success: "bg-gradient-to-r from-emerald-500 to-teal-600",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500",
    meteorological:
      percentage >= 100
        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
        : percentage >= 50
        ? "bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600"
        : "bg-gradient-to-r from-blue-500 to-cyan-500",
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">
          <span>Progress</span>
          <span className="font-semibold">{percentage}%</span>
        </div>
      )}
      <div className={`w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variantGradients[variant]}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
