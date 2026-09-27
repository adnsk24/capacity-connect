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
    <div className="flex flex-col items-center justify-center p-8 border border-red-200 dark:border-red-900/50 rounded-2xl bg-red-50/50 dark:bg-red-950/20 text-center max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-red-900 dark:text-red-200 mb-1">{title}</h3>
      <p className="text-xs text-red-700 dark:text-red-300 mb-4">{message}</p>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="text-xs border-red-300 text-red-800 hover:bg-red-100 flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  )
}
