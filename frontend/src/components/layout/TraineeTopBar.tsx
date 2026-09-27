import React from "react"
import { useNavigate, Link } from "react-router-dom"
import { Menu, Bell, LogOut } from "lucide-react"
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
      // Ignore errors on logout
    } finally {
      clearSession()
      navigate("/login", { replace: true })
    }
  }

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U"
    : "U"

  const roleLabel =
    user?.role === "ADMIN"
      ? "Administrator"
      : user?.role === "TRAINER"
      ? "Trainer"
      : "Trainee"

  const profileLink =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "TRAINER"
      ? "/trainer/dashboard"
      : "/trainee/profile"

  const notificationsLink =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "TRAINER"
      ? "/trainer/dashboard"
      : "/trainee/notifications"

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb / context */}
        <div className="hidden sm:flex items-center gap-2.5 text-xs">
          <img
            src="/branding/IMD_logo.png"
            alt="IMD"
            className="h-8 w-auto object-contain flex-shrink-0"
          />
          <span className="font-semibold text-slate-800">India Meteorological Department</span>
          <span className="text-slate-300">/</span>
          <span className="text-[#1557A6] font-medium">Capacity Connect</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <Link
          to={notificationsLink}
          className="relative p-2 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#1557A6]" aria-label="Unread notifications" />
        </Link>

        {/* User avatar + name */}
        {user && (
          <Link
            to={profileLink}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#1557A6] text-white flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-[13px] font-semibold text-slate-800 leading-tight">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-[11px] text-slate-500">{roleLabel}</div>
            </div>
          </Link>
        )}

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline font-medium">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
