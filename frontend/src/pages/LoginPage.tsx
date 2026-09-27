import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight, ShieldCheck, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth"
import { useAuthStore } from "@/store/useAuthStore"

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setSession } = useAuthStore()

  const [usernameOrEmail, setUsernameOrEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage("Please enter both username/email and password.")
      return
    }
    try {
      setIsSubmitting(true)
      const data = await authService.login({
        username_or_email: usernameOrEmail.trim(),
        password,
      })
      setSession(data.access_token, data.refresh_token, data.user)

      // Derive strict destination based on authenticated user's actual role
      let targetPath = "/dashboard"
      if (data.user.role === "ADMIN") {
        targetPath = from.startsWith("/admin") ? from : "/admin/dashboard"
      } else if (data.user.role === "TRAINER") {
        targetPath = from.startsWith("/trainer") ? from : "/trainer/dashboard"
      } else {
        // TRAINEE
        targetPath = (from.startsWith("/trainee") || from.startsWith("/courses")) ? from : "/trainee/dashboard"
      }
      navigate(targetPath, { replace: true })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage("An unexpected error occurred during authentication.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const demoUsers = [
    { label: "Trainee", email: "trainee.demo@imd.gov.in", password: "DemoTrainee123!" },
    { label: "Trainer", email: "trainer.demo@imd.gov.in", password: "DemoTrainer123!" },
    { label: "Admin", email: "admin.demo@imd.gov.in", password: "DemoAdmin123!" },
  ]

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-[#F7F9FC]">
      {/* ======================================================== */}
      {/* LEFT COLUMN: Authentic IMD Meteorological Imagery & Identity */}
      {/* ======================================================== */}
      <div className="hidden lg:flex lg:w-[56%] xl:w-[58%] relative overflow-hidden flex-col justify-between p-10 xl:p-14 text-white">
        {/* Natural Sky Photographic Background with Subtle Institutional Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100"
          style={{
            backgroundImage: "linear-gradient(rgba(12, 50, 95, 0.28), rgba(12, 50, 95, 0.38)), url('/images/imd-login-bg.webp')",
          }}
          aria-hidden="true"
        />

        {/* Ambient bottom contrast gradient for crystal-clear readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C325F]/85 via-transparent to-[#0C325F]/35" aria-hidden="true" />

        {/* Left Top: Official Institutional Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-5">
            <img
              src="/branding/IMD_logo.png"
              alt="India Meteorological Department Emblem"
              className="h-20 xl:h-24 w-auto object-contain flex-shrink-0 drop-shadow-md"
            />
            <div className="border-l-2 border-white/30 pl-4">
              <div className="text-[12px] font-medium tracking-widest uppercase text-blue-200">
                Government of India • Ministry of Earth Sciences
              </div>
              <div className="text-xl xl:text-2xl font-bold tracking-tight text-white leading-tight">
                India Meteorological Department
              </div>
              <div className="text-[13px] text-blue-100/90 font-medium">
                भारत मौसम विज्ञान विभाग • Established 1875
              </div>
            </div>
          </div>
        </div>

        {/* Left Middle: Portal Mission Statement & Identity */}
        <div className="relative z-10 max-w-xl my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-semibold text-white mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            National Operational Capacity Building
          </div>
          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight mb-3">
            CAPACITY CONNECT
          </h1>
          <h2 className="text-base xl:text-lg text-blue-100 font-semibold mb-4">
            Digital Capacity Building &amp; Learning Management Portal
          </h2>
          <blockquote className="border-l-3 border-blue-400 pl-4 py-1 text-sm xl:text-base text-slate-100 italic leading-relaxed font-normal bg-black/15 rounded-r">
            "Building meteorological expertise through structured learning, assessment and competency development."
          </blockquote>
        </div>

        {/* Left Bottom: Facility Metadata & Operational Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-blue-100/80 pt-4 border-t border-white/15">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="h-3.5 w-3.5 text-blue-300" />
            <span>IMD Doppler Weather Radar Network &bull; HQ New Delhi</span>
          </div>
          <div className="font-mono text-[11px] text-blue-200">
            DWR-DEL / MET-OPS-2026
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: Clean, Institutional White Login Panel     */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-10 xl:p-14 bg-[#F7F9FC]">
        <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
          {/* Mobile Meteorological Header Banner (< lg screens) */}
          <div className="lg:hidden relative h-36 sm:h-44 overflow-hidden bg-[#0C325F]">
            <img
              src="/images/imd-login-bg.webp"
              alt="IMD Weather Observation Facility"
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C325F] via-[#0C325F]/60 to-transparent flex flex-col justify-end p-4 text-white">
              <div className="flex items-center gap-3">
                <img
                  src="/branding/IMD_logo.png"
                  alt="India Meteorological Department Emblem"
                  className="h-12 w-auto object-contain drop-shadow"
                />
                <div>
                  <div className="text-sm font-bold tracking-tight">CAPACITY CONNECT</div>
                  <div className="text-[11px] text-blue-200 font-medium">India Meteorological Department</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="px-6 pt-6 pb-4 border-b border-[#E2E8F0]">
            <div className="hidden lg:flex items-center gap-2.5 mb-3">
              <img
                src="/branding/IMD_logo.png"
                alt="IMD Emblem"
                className="h-10 w-auto object-contain"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 tracking-tight leading-none">CAPACITY CONNECT</div>
                <div className="text-[10px] text-[#1557A6] font-semibold">India Meteorological Department</div>
              </div>
            </div>
            <h2 className="text-lg font-bold text-[#172033]">Welcome back</h2>
            <p className="text-[13px] text-[#64748B] mt-0.5">
              Sign in with your institutional credentials to continue.
            </p>
          </div>

          {/* Demo Quick-Fill Access */}
          <div className="px-6 py-3.5 border-b border-[#E2E8F0] bg-[#F7F9FC]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Demo access</span>
              <span className="text-[10px] text-slate-400">Click to autofill credentials</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {demoUsers.map((u) => (
                <button
                  key={u.label}
                  type="button"
                  onClick={() => {
                    setUsernameOrEmail(u.email)
                    setPassword(u.password)
                  }}
                  className="py-1.5 px-2 text-center rounded border border-[#E2E8F0] bg-white text-[12px] font-semibold text-[#172033] hover:border-[#1557A6] hover:text-[#1557A6] hover:bg-blue-50/50 transition-all cursor-pointer shadow-2xs"
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Login Form */}
          <div className="p-6">
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-start gap-2.5 text-[13px]">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#172033] mb-1.5" htmlFor="identifier">
                  Email Address or Username
                </label>
                <input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="trainee@imd.gov.in"
                  className="w-full h-10 px-3 text-[13px] rounded-lg border border-[#E2E8F0] bg-white text-[#172033] placeholder-slate-400 focus:outline-none focus:border-[#1557A6] focus:ring-2 focus:ring-blue-100 transition-colors"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-semibold text-[#172033]" htmlFor="password">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[12px] font-medium text-[#1557A6] hover:text-[#124A8D] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 px-3 pr-10 text-[13px] rounded-lg border border-[#E2E8F0] bg-white text-[#172033] placeholder-slate-400 focus:outline-none focus:border-[#1557A6] focus:ring-2 focus:ring-blue-100 transition-colors"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-[#1557A6] hover:bg-[#124A8D] text-white font-medium text-[13px] gap-2 shadow-xs cursor-pointer transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Footer Registration Link */}
          <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#F7F9FC] flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[#64748B]">
            <span>Don't have an account?</span>
            <Link to="/register" className="font-semibold text-[#1557A6] hover:text-[#124A8D] hover:underline">
              Register Profile
            </Link>
          </div>
        </div>

        {/* Security & Institutional Trust Badge */}
        <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-[#64748B]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Secured via Argon2id &bull; IMD Capacity Connect Portal</span>
        </div>
      </div>
    </div>
  )
}
