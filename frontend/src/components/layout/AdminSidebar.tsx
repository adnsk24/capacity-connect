import React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  ShieldCheck,
  Bell,
  X,
  ShieldAlert,
  User,
  Award,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AdminSidebarProps {
  isOpen: boolean
  onClose?: () => void
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    {
      to: "/admin/dashboard",
      label: "System Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      to: "/admin/users",
      label: "User Management",
      icon: <Users className="h-4 w-4" />,
    },
    {
      to: "/admin/courses",
      label: "Course Governance",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      to: "/admin/assessments",
      label: "Assessment Oversight",
      icon: <ClipboardCheck className="h-4 w-4" />,
    },
    {
      to: "/admin/trainer-recommendations",
      label: "Trainer Matching",
      icon: <Award className="h-4 w-4" />,
    },
    {
      to: "/trainee/notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
    },
    {
      to: "/trainee/profile",
      label: "My Profile",
      icon: <User className="h-4 w-4" />,
    },
  ]

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
                  Capacity Connect
                </span>
                <Badge variant="outline" className="text-[9px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200">
                  Admin
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Institutional Governance</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Platform Administration
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold dark:bg-blue-950/40 dark:text-blue-300"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <ShieldAlert className="h-4 w-4 text-blue-500 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-[11px] block text-slate-800 dark:text-slate-200">
                IMD Root Control
              </span>
              <span className="text-[10px] text-slate-400">Security & RBAC Enforcement</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
