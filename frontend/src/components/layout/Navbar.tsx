import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, LogIn, UserPlus, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"

export const Navbar: React.FC = () => {
  const location = useLocation()
  const { user, isAuthenticated, clearSession } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const portalLink =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "TRAINER"
      ? "/trainer/dashboard"
      : "/trainee/dashboard"

  const roleName =
    user?.role === "ADMIN" ? "Admin" : user?.role === "TRAINER" ? "Trainer" : "Trainee"

  const navLinks = [
    { to: "/#about", label: "About" },
    { to: "/courses", label: "Learning" },
    { to: "/#competency", label: "Competency" },
    { to: "/#resources", label: "Resources" },
  ]

  return (
    <>
      {/* 1. Top Government Identity Bar */}
      <div className="bg-[#0C325F] text-slate-100 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium tracking-normal text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>Capacity Connect — Digital Capacity Building &amp; Learning Management Portal for IMD</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-300 text-[11px]">
            <span>Government of India</span>
            <span className="text-slate-500">•</span>
            <span>Ministry of Earth Sciences</span>
          </div>
        </div>
      </div>

      {/* 2. Main Government-Style Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex min-h-[72px] sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand - Left */}
          <Link to="/" className="flex items-center gap-3.5 sm:gap-4 flex-shrink-0 py-2">
            <img
              src="/branding/IMD_logo.png"
              alt="India Meteorological Department Emblem"
              className="h-[52px] sm:h-[66px] w-auto object-contain flex-shrink-0"
              height="66"
            />
            <div className="flex flex-col justify-center">
              <span className="text-[15px] sm:text-[17px] font-bold text-slate-900 tracking-tight leading-tight">
                CAPACITY CONNECT
              </span>
              <span className="text-[12px] sm:text-[13px] font-semibold text-[#1557A6] leading-tight mt-0.5">
                India Meteorological Department
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 leading-tight hidden lg:block mt-0.5">
                Digital Capacity Building &amp; Learning Management Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav - Middle */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.to}
                href={link.to}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                  isActive(link.to)
                    ? "text-[#1557A6] bg-blue-50 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </a>
            ))}
            {isAuthenticated && user && (
              <Link
                to={portalLink}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                  location.pathname.startsWith("/trainee") ||
                  location.pathname.startsWith("/trainer") ||
                  location.pathname.startsWith("/admin")
                    ? "text-[#1557A6] bg-blue-50 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                {roleName} Portal
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-slate-200 bg-slate-50">
                  <div className="w-6 h-6 rounded-full bg-[#1557A6] text-white flex items-center justify-center text-[10px] font-semibold">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  <span className="text-[13px] font-medium text-slate-700">{user.first_name} {user.last_name}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-semibold">{roleName}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => clearSession()}
                  className="text-[12px] text-slate-600 hover:text-red-600 hover:bg-red-50 gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[13px] border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-[#1557A6] gap-1.5 font-medium"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="text-[13px] bg-[#1557A6] hover:bg-[#124A8D] text-white gap-1.5 font-medium shadow-none rounded-md"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded border border-slate-200 text-slate-700 hover:bg-slate-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1.5">
            {navLinks.map((link) => (
              <a
                key={link.to}
                href={link.to}
                className="block px-3 py-2 text-[13px] font-medium text-slate-700 rounded hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {isAuthenticated && user ? (
              <>
                <Link
                  to={portalLink}
                  className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-[#1557A6] rounded hover:bg-blue-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {roleName} Portal
                </Link>
                <button
                  className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-red-600 rounded hover:bg-red-50 w-full text-left"
                  onClick={() => { clearSession(); setMobileOpen(false) }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-[13px] font-semibold text-slate-700 rounded border border-slate-200 text-center hover:bg-slate-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-[13px] font-semibold text-white bg-[#1557A6] rounded text-center hover:bg-[#124A8D]"
                  onClick={() => setMobileOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  )
}
