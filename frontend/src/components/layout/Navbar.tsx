import React from "react"
import { Link, useLocation } from "react-router-dom"
import { ShieldCheck, Layers, Activity, LogIn } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/store/useAppStore"

export const Navbar: React.FC = () => {
  const location = useLocation()
  const { currentRole, setRole } = useAppStore()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight">Capacity Connect</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-blue-50 text-blue-700 border-blue-200">
                  Phase 0
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 leading-none hidden sm:block">
                Digital Capacity Building Portal
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isActive("/")
                  ? "bg-slate-100 text-blue-600 font-semibold dark:bg-slate-800 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
              }`}
            >
              Overview
            </Link>
            <Link
              to="/health"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isActive("/health")
                  ? "bg-slate-100 text-blue-600 font-semibold dark:bg-slate-800 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
              }`}
            >
              <Activity className="h-3.5 w-3.5 text-emerald-500" />
              API Health
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Role Preview Switcher (UI Simulator for Phase 0) */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-medium">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setRole(e.target.value as "Trainee" | "Trainer" | "Admin")}
              className="bg-transparent font-semibold text-blue-600 dark:text-blue-400 focus:outline-none cursor-pointer"
              aria-label="Simulate User Role"
            >
              <option value="Trainee">Trainee</option>
              <option value="Trainer">Trainer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <Link to="/login">
            <Button size="sm" variant="default" className="flex items-center gap-1.5">
              <LogIn className="h-3.5 w-3.5" />
              <span>Login Portal</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
