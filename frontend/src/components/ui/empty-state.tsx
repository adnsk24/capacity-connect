import React, { ReactNode } from "react"
import { Button } from "./button"

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  actionLink?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-300 rounded-lg bg-slate-50">
      <div className="p-3 rounded-lg bg-slate-100 text-slate-500 mb-4">
        {icon}
      </div>
      <h3 className="text-[14px] font-semibold text-slate-700 mb-1">
        {title}
      </h3>
      <p className="text-[13px] text-slate-500 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
