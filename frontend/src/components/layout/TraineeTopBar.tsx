import React from "react"
import { useNavigate, Link } from "react-router-dom"
import { Menu, Bell, LogOut, Radio, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/useAuthStore"
import { authService } from "@/services/auth"

interface TraineeTopBarProps {
  onToggleSidebar: () => void
}

export const TraineeTopBar: React.FC<TraineeTopBarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const { user, refreshToken, clearSession } = useAuthStore()

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      clearSession()
      navigate("/login", { replace: true })
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Toggle & Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 py-0.5 px-2 bg-blue-50/60 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
          >
            <Radio className="h-3 w-3 text-blue-500 animate-pulse" />
            <span>IMD Central Learning Grid</span>
          </Badge>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 font-medium">Phase 3 Active</span>
        </div>
      </div>

      {/* Right: Actions, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications Icon Link */}
        <Link to="/trainee/notifications">
          <button
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 relative transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
          </button>
        </Link>

        {/* User Mini Profile */}
        {user && (
          <Link
            to="/trainee/profile"
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user.first_name?.[0] || <UserIcon className="h-4 w-4" />}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {user.role}
              </div>
            </div>
          </Link>
        )}

        {/* Sign Out Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-xs flex items-center gap-1.5 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  )
}
