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
    { to: "/", label: "Home" },
    { to: "/courses", label: "Courses" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto flex min-h-[76px] sm:h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3.5 flex-shrink-0 py-1.5">
          <img
            src="/branding/IMD_logo.png"
            alt="India Meteorological Department Emblem"
            className="h-12 sm:h-[64px] w-auto object-contain flex-shrink-0"
            height="64"
          />
          <div className="flex flex-col justify-center">
            <span className="text-[15px] sm:text-[16px] font-bold text-slate-900 tracking-tight leading-tight">
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

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                isActive(link.to)
                  ? "text-[#1557A6] bg-blue-50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && user && (
            <Link
              to={portalLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                location.pathname.startsWith("/trainee") ||
                location.pathname.startsWith("/trainer") ||
                location.pathname.startsWith("/admin")
                  ? "text-[#1557A6] bg-blue-50"
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
              <div className="flex items-center gap-2 px-2 py-1 rounded border border-slate-200 bg-slate-50">
                <div className="w-6 h-6 rounded-full bg-[#1557A6] text-white flex items-center justify-center text-[10px] font-semibold">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
                <span className="text-[13px] font-medium text-slate-700">{user.first_name} {user.last_name}</span>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-semibold">{roleName}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => clearSession()}
                className="text-[12px] text-slate-500 hover:text-red-600 hover:bg-red-50 gap-1"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <Button size="sm" variant="ghost" className="text-[13px] gap-1.5">
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="text-[13px] gap-1.5">
                  <UserPlus className="h-3.5 w-3.5" />
                  Register
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-1.5 rounded text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-3 py-2 text-[13px] font-medium text-slate-700 rounded hover:bg-slate-50"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && user ? (
            <>
              <Link
                to={portalLink}
                className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-slate-700 rounded hover:bg-slate-50"
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
            <>
              <Link
                to="/login"
                className="block px-3 py-2 text-[13px] font-medium text-slate-700 rounded hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 text-[13px] font-medium text-[#1557A6] rounded hover:bg-blue-50"
                onClick={() => setMobileOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
