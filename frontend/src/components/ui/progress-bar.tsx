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
  variant = "primary",
  className = "",
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }

  const fillColors = {
    primary: "#1557A6",
    success: "#15803D",
    warning: "#D97706",
    meteorological:
      percentage >= 100 ? "#15803D" : percentage >= 50 ? "#1557A6" : "#2563EB",
  }

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-medium text-slate-600">
          <span>Progress</span>
          <span className="font-semibold">{percentage}%</span>
        </div>
      )}
      <div className={`w-full rounded-full bg-slate-200 overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out`}
          style={{
            width: `${percentage}%`,
            backgroundColor: fillColors[variant],
          }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
