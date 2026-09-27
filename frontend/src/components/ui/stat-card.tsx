import React, { ReactNode } from "react"

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: {
    value: string
    isPositive?: boolean
  }
  accentColor?: "blue" | "emerald" | "amber" | "indigo" | "cyan" | "red"
}

const accentMap = {
  blue:    { icon: "text-[#1557A6]", iconBg: "bg-blue-50" },
  emerald: { icon: "text-green-700",  iconBg: "bg-green-50" },
  amber:   { icon: "text-amber-700",  iconBg: "bg-amber-50" },
  indigo:  { icon: "text-indigo-700", iconBg: "bg-indigo-50" },
  cyan:    { icon: "text-cyan-700",   iconBg: "bg-cyan-50" },
  red:     { icon: "text-red-700",    iconBg: "bg-red-50" },
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = "blue",
}) => {
  const accent = accentMap[accentColor]

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_0_rgb(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            {title}
          </p>
          <div className="text-2xl font-700 font-bold text-slate-900 tracking-tight">
            {value}
          </div>
          {subtitle && (
            <p className="text-[12px] text-slate-500 leading-tight">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-[12px] font-semibold ${trend.isPositive ? "text-green-700" : "text-slate-500"}`}>
              {trend.value}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-md flex-shrink-0 ${accent.iconBg}`}>
          <span className={accent.icon}>{icon}</span>
        </div>
      </div>
    </div>
  )
}
