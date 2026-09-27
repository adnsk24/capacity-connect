import React from "react"
import { Link, useLocation } from "react-router-dom"
import { Layers, Activity, LogIn, UserPlus, LogOut, LayoutDashboard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"

export const Navbar: React.FC = () => {
  const location = useLocation()
  const { user, isAuthenticated, clearSession } = useAuthStore()

  const isActive = (path: string) => location.pathname === path

  const roleBadgeVariants: Record<string, "default" | "success" | "warning"> = {
    ADMIN: "default",
    TRAINER: "success",
    TRAINEE: "warning",
  }

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
                  Phase 3
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
              to="/courses"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isActive("/courses")
                  ? "bg-slate-100 text-blue-600 font-semibold dark:bg-slate-800 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
              }`}
            >
              Courses
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
            {isAuthenticated && (
              <Link
                to="/trainee/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  location.pathname.startsWith("/trainee") || location.pathname === "/dashboard"
                    ? "bg-slate-100 text-blue-600 font-semibold dark:bg-slate-800 dark:text-blue-400"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-blue-500" />
                Trainee Portal
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {user.first_name}
                </span>
                <Badge variant={roleBadgeVariants[user.role] || "default"} className="text-[10px]">
                  {user.role}
                </Badge>
              </div>

              <Link to="/dashboard">
                <Button size="sm" variant="outline" className="hidden sm:flex items-center gap-1.5 text-xs">
                  <LayoutDashboard className="h-3.5 w-3.5" /> Workspace
                </Button>
              </Link>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => clearSession()}
                className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button size="sm" variant="ghost" className="text-xs flex items-center gap-1">
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" variant="default" className="text-xs flex items-center gap-1">
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
