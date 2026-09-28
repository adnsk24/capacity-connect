import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, LogIn, UserPlus, LogOut, LayoutDashboard, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"

export const Navbar: React.FC = () => {
  const location = useLocation()
  const { user, isAuthenticated, clearSession } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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
    { to: "/#about", label: "About Us" },
    { to: "/#learning", label: "Learning" },
    { to: "/courses", label: "Courses" },
    { to: "/#competency", label: "Competency" },
    { to: "/#resources", label: "Resources" },
  ]

  const changeFontSize = (delta: number) => {
    const current = parseFloat(getComputedStyle(document.documentElement).fontSize) || 14
    const next = delta === 0 ? 14 : Math.min(Math.max(current + delta, 12), 18)
    document.documentElement.style.fontSize = `${next}px`
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <>
      {/* ======================================================== */}
      {/* 1. TOP GOVERNMENT OF INDIA BAR (Deep Navy #082B73)        */}
      {/* ======================================================== */}
      <div className="bg-[#082B73] text-slate-100 text-[11px] h-10 px-4 sm:px-6 lg:px-8 border-b border-blue-950/40 select-none flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Left: Indian Flag + Hindi/English Government Title */}
          <div className="flex items-center gap-2.5 font-medium tracking-normal text-slate-200">
            <span className="text-sm leading-none" role="img" aria-label="Indian Flag">
              🇮🇳
            </span>
            <span className="font-semibold text-white">भारत सरकार</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-200">Government of India</span>
          </div>

          {/* Right: Accessibility Controls & Language Selector */}
          <div className="flex items-center gap-3 sm:gap-4 text-slate-200 text-[11px]">
            <a
              href="#about"
              className="hidden md:inline-block text-slate-300 hover:text-white transition-colors"
            >
              Skip to content
            </a>
            <span className="hidden md:inline text-slate-500">|</span>

            {/* Accessibility Font Size Buttons */}
            <div className="flex items-center gap-1 font-semibold">
              <button
                type="button"
                onClick={() => changeFontSize(1)}
                className="px-1.5 py-0.5 hover:bg-white/20 rounded cursor-pointer transition-colors text-white"
                title="Increase Font Size"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => changeFontSize(0)}
                className="px-1.5 py-0.5 hover:bg-white/20 rounded cursor-pointer transition-colors text-white"
                title="Default Font Size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => changeFontSize(-1)}
                className="px-1.5 py-0.5 hover:bg-white/20 rounded cursor-pointer transition-colors text-white"
                title="Decrease Font Size"
              >
                A-
              </button>
            </div>

            <span className="text-slate-500">|</span>

            {/* Language Selector */}
            <div className="flex items-center gap-1 text-slate-200 cursor-pointer hover:text-white font-medium">
              <span className="text-xs">🌐</span>
              <span>English</span>
              <span className="text-[9px]">▼</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MAIN GOVERNMENT NAVIGATION HEADER (White, 90–100px)    */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-2xs">
        <div className="max-w-7xl mx-auto flex min-h-[88px] lg:h-24 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          {/* Brand - Left: Real IMD Logo + Portal Identity */}
          <Link to="/" className="flex items-center gap-3.5 sm:gap-4 flex-shrink-0 py-2 group">
            <img
              src="/branding/IMD_logo.png"
              alt="India Meteorological Department Emblem"
              className="h-[62px] sm:h-[72px] w-auto object-contain flex-shrink-0 drop-shadow-2xs"
              height="72"
            />
            <div className="flex flex-col justify-center border-l-2 border-slate-200 pl-3.5 sm:pl-4">
              <span className="text-[16px] sm:text-[18px] font-extrabold text-[#082B73] tracking-tight leading-tight">
                CAPACITY CONNECT
              </span>
              <span className="text-[12px] sm:text-[13px] font-bold text-[#0B3D91] leading-tight mt-0.5">
                India Meteorological Department
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 leading-tight hidden lg:block mt-0.5">
                Digital Capacity Building &amp; Learning Management Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.to}
                className={`px-3 py-2 text-[14px] font-semibold rounded-md transition-colors ${
                  isActive(link.to)
                    ? "text-[#0B3D91] bg-blue-50/80 font-bold"
                    : "text-[#172033] hover:text-[#0B3D91] hover:bg-slate-50"
                }`}
              >
                {link.label}
              </a>
            ))}
            {isAuthenticated && user && (
              <Link
                to={portalLink}
                className={`flex items-center gap-1.5 px-3 py-2 text-[14px] font-bold rounded-md transition-colors ${
                  location.pathname.startsWith("/trainee") ||
                  location.pathname.startsWith("/trainer") ||
                  location.pathname.startsWith("/admin")
                    ? "text-[#0B3D91] bg-blue-50 font-bold"
                    : "text-[#172033] hover:text-[#0B3D91] hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-[#0B3D91]" />
                {roleName} Portal
              </Link>
            )}
          </nav>

          {/* Right Header: Search Bar + Auth Buttons */}
          <div className="flex items-center gap-3">
            {/* Header Search Box (Matches Reference Screenshot) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-48 lg:w-56 h-9 pl-3.5 pr-8 text-xs rounded-full border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B3D91] focus:ring-1 focus:ring-[#0B3D91] transition-all"
              />
              <button
                type="submit"
                className="absolute right-2.5 text-slate-500 hover:text-[#0B3D91] cursor-pointer"
                title="Search"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-slate-200 bg-slate-50">
                  <div className="w-6 h-6 rounded-full bg-[#0B3D91] text-white flex items-center justify-center text-[10px] font-bold">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  <span className="text-[12px] font-bold text-slate-700">{user.first_name} {user.last_name}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">{roleName}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => clearSession()}
                  className="text-[12px] text-slate-600 hover:text-red-600 hover:bg-red-50 gap-1 font-semibold"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[13px] border-slate-300 text-[#082B73] hover:bg-slate-50 hover:text-[#0B3D91] font-bold px-3.5 h-9 rounded-md"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="sm"
                    className="text-[13px] bg-[#0B3D91] hover:bg-[#082B73] text-white font-bold px-3.5 h-9 rounded-md shadow-none"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              className="xl:hidden p-2 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full h-9 pl-3.5 pr-8 text-xs rounded-full border border-slate-300 bg-white text-slate-800"
              />
              <button
                type="submit"
                className="absolute right-3 text-slate-500 hover:text-[#0B3D91]"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>

            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.to}
                className="block px-3 py-2 text-[13px] font-semibold text-slate-700 rounded hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {isAuthenticated && user ? (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <Link
                  to={portalLink}
                  className="flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-[#0B3D91] rounded hover:bg-blue-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {roleName} Portal
                </Link>
                <button
                  className="flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-red-600 rounded hover:bg-red-50 w-full text-left"
                  onClick={() => {
                    clearSession()
                    setMobileOpen(false)
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-[13px] font-bold text-slate-700 rounded border border-slate-200 text-center hover:bg-slate-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 text-[13px] font-bold text-white bg-[#0B3D91] rounded text-center hover:bg-[#082B73]"
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
