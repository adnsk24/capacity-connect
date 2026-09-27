import React, { ReactNode } from "react"
import { Card, CardContent } from "./card"

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: {
    value: string
    isPositive?: boolean
  }
  accentColor?: "blue" | "emerald" | "amber" | "indigo" | "cyan"
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = "blue",
}) => {
  const iconBgClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/50",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/50",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/50",
    cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400 border border-cyan-200/50",
  }

  return (
    <Card className="border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {title}
            </p>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-none">
                {subtitle}
              </p>
            )}
            {trend && (
              <p
                className={`text-xs font-semibold ${
                  trend.isPositive ? "text-emerald-600" : "text-slate-500"
                }`}
              >
                {trend.value}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${iconBgClasses[accentColor]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
