import React from "react"
import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Users,
  Bell,
  X,
  Compass,
  User,
  ShieldCheck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TrainerSidebarProps {
  isOpen: boolean
  onClose?: () => void
}

export const TrainerSidebar: React.FC<TrainerSidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    {
      to: "/trainer/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      to: "/trainer/courses",
      label: "My Courses",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      to: "/trainer/assessments",
      label: "Assessments",
      icon: <ClipboardCheck className="h-4 w-4" />,
    },
    {
      to: "/trainer/performance",
      label: "Trainee Performance",
      icon: <Users className="h-4 w-4" />,
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
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
                  Capacity Connect
                </span>
                <Badge variant="outline" className="text-[9px] py-0 px-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                  Trainer
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Faculty Portal</p>
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

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Instructor Management
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300"
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

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-[11px] block text-slate-800 dark:text-slate-200">
                IMD Faculty System
              </span>
              <span className="text-[10px] text-slate-400">Authoring & Evaluation</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
