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
  CloudRain,
  ShieldCheck,
  TrendingDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TraineeSidebarProps {
  isOpen: boolean
  onClose?: () => void
}

export const TraineeSidebar: React.FC<TraineeSidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    {
      to: "/trainee/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      to: "/trainee/profile",
      label: "My Profile",
      icon: <User className="h-4 w-4" />,
    },
    {
      to: "/courses",
      label: "Course Catalogue",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      to: "/trainee/learning",
      label: "My Learning",
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      to: "/trainee/assessments",
      label: "Assessments",
      icon: <ClipboardCheck className="h-4 w-4" />,
      badge: "Phase 4",
    },
    {
      to: "/trainee/competencies",
      label: "Competencies",
      icon: <Network className="h-4 w-4" />,
      badge: "3D Universe",
    },
    {
      to: "/trainee/skill-gap",
      label: "Skill Gap Audit",
      icon: <TrendingDown className="h-4 w-4" />,
    },
    {
      to: "/trainee/certificates",
      label: "Certificates",
      icon: <Award className="h-4 w-4" />,
    },
    {
      to: "/trainee/notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
    },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand & Mobile Close */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md">
              <CloudRain className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">IMD Capacity</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  v3.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400">National Training Portal</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Operational Badge */}
        <div className="px-4 py-3 border-b border-slate-800/60 bg-blue-950/30">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              NWFC Operational
            </span>
            <span className="text-[10px] font-mono text-blue-400">IMD-HQ</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Trainee Portal
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <Badge
                  variant="outline"
                  className="text-[9px] px-1.5 py-0 border-slate-700 bg-slate-800/80 text-slate-300"
                >
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          ))}
        </div>

        {/* Institutional Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-xs">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-medium text-slate-300">Govt. of India</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Ministry of Earth Sciences · India Meteorological Department
          </p>
        </div>
      </aside>
    </>
  )
}
