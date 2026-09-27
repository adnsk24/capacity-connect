import React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  Bell,
  X,
  User,
  Award,
} from "lucide-react"

interface AdminSidebarProps {
  isOpen: boolean
  onClose?: () => void
}

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "User Management", icon: Users },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/assessments", label: "Assessments", icon: ClipboardCheck },
  { to: "/admin/trainer-recommendations", label: "Trainer Matching", icon: Award },
  { to: "/trainee/notifications", label: "Notifications", icon: Bell },
  { to: "/trainee/profile", label: "My Profile", icon: User },
]

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-white flex flex-col border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/branding/imd-emblem.svg"
              alt="India Meteorological Department"
              className="w-8 h-8 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-slate-900 leading-tight">CAPACITY CONNECT</div>
              <div className="text-[10px] text-[#1557A6] font-medium leading-tight">IMD · Admin Portal</div>
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

        {/* Nav section label */}
        <div className="px-4 pt-4 pb-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Administration</span>
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
          <div className="text-[11px] font-semibold text-slate-700">India Meteorological Department</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Platform Administration Console</div>
        </div>
      </aside>
    </>
  )
}
