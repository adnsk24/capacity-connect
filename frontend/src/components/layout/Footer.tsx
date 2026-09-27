import React from "react"
import { Layers } from "lucide-react"

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white/70 py-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Capacity Connect</span>
          <span className="text-slate-400">|</span>
          <span>Digital Capacity Building & LMS Portal</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span>Phase 0: Foundation Architecture</span>
          <span>•</span>
          <span>PostgreSQL & Supabase Ready</span>
          <span>•</span>
          <span>FastAPI + React 19</span>
        </div>
      </div>
    </footer>
  )
}
