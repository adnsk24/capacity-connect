import React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  User,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Network,
  Award,
  Bell,
  X,
  TrendingDown,
} from "lucide-react"

interface TraineeSidebarProps {
  isOpen: boolean
  onClose?: () => void
}

const navItems = [
  { to: "/trainee/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trainee/profile", label: "My Profile", icon: User },
  { to: "/courses", label: "Course Catalogue", icon: BookOpen },
  { to: "/trainee/learning", label: "My Learning", icon: GraduationCap },
  { to: "/trainee/assessments", label: "Assessments", icon: ClipboardCheck },
  { to: "/trainee/competencies", label: "Competencies", icon: Network },
  { to: "/trainee/skill-gap", label: "Skill Gap", icon: TrendingDown },
  { to: "/trainee/certificates", label: "Certificates", icon: Award },
  { to: "/trainee/notifications", label: "Notifications", icon: Bell },
]

export const TraineeSidebar: React.FC<TraineeSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
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
              <div className="text-[11px] text-[#1557A6] font-medium leading-tight truncate">IMD · Trainee Portal</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden flex-shrink-0"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav section label */}
        <div className="px-4 pt-4 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Navigation</span>
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
                      ? "bg-blue-50 text-[#1557A6]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-[#1557A6]" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="text-[11px] font-semibold text-slate-700 leading-tight">India Meteorological Department</div>
          <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Ministry of Earth Sciences · Govt. of India</div>
        </div>
      </aside>
    </>
  )
}
