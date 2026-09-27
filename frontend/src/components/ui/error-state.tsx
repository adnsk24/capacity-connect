import React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "./button"

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Failed to load data",
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-red-200 rounded-lg bg-white text-center max-w-md mx-auto my-6 shadow-2xs">
      <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="text-[14px] font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-[13px] text-slate-500 mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="text-[12px] border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  )
}
