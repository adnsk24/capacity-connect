import React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Users,
  Bell,
  X,
  User,
} from "lucide-react"

interface TrainerSidebarProps {
  isOpen: boolean
  onClose?: () => void
}

const navItems = [
  { to: "/trainer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trainer/courses", label: "My Courses", icon: BookOpen },
  { to: "/trainer/assessments", label: "Assessments", icon: ClipboardCheck },
  { to: "/trainer/performance", label: "Trainee Performance", icon: Users },
  { to: "/trainee/notifications", label: "Notifications", icon: Bell },
  { to: "/trainee/profile", label: "My Profile", icon: User },
]

export const TrainerSidebar: React.FC<TrainerSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-white flex flex-col border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-[72px] flex items-center justify-between px-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/branding/imd-emblem.svg"
              alt="India Meteorological Department"
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-slate-900 leading-tight">CAPACITY CONNECT</div>
              <div className="text-[11px] text-green-700 font-medium leading-tight">IMD · Trainer Portal</div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav label */}
        <div className="px-4 pt-4 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Instructor</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-green-50 text-green-800"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-green-700" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="text-[11px] font-semibold text-slate-700">India Meteorological Department</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Faculty Authoring & Evaluation System</div>
        </div>
      </aside>
    </>
  )
}
