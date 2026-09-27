import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react"
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
      navigate(from, { replace: true })
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
    { label: "Trainee", email: "trainee.demo@imd.gov.in", password: "DemoTrainee123!", color: "text-[#1557A6] hover:bg-blue-50 border-blue-200" },
    { label: "Trainer", email: "trainer.demo@imd.gov.in", password: "DemoTrainer123!", color: "text-green-700 hover:bg-green-50 border-green-200" },
    { label: "Admin", email: "admin.demo@imd.gov.in", password: "DemoAdmin123!", color: "text-slate-700 hover:bg-slate-100 border-slate-300" },
  ]

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-[#F7F9FC]">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <img
              src="/branding/imd-emblem.svg"
              alt="India Meteorological Department Emblem"
              className="h-16 w-16 object-contain"
              width="64"
              height="64"
            />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">CAPACITY CONNECT</h1>
          <p className="text-[13px] font-semibold text-[#1557A6] mt-0.5">India Meteorological Department</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Digital Capacity Building &amp; Learning Management Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <h2 className="text-[15px] font-semibold text-slate-900">Sign In</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Enter your institutional credentials to continue.</p>
          </div>

          {/* Demo quick-fill */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <p className="text-[11px] font-semibold text-slate-500 mb-2">Demo Quick-Fill</p>
            <div className="flex gap-2">
              {demoUsers.map((u) => (
                <button
                  key={u.label}
                  type="button"
                  onClick={() => {
                    setUsernameOrEmail(u.email)
                    setPassword(u.password)
                  }}
                  className={`flex-1 py-1.5 rounded border text-[11px] font-semibold transition-colors ${u.color}`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 py-5">
            {errorMessage && (
              <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200 flex items-start gap-2 text-[13px]">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1" htmlFor="identifier">
                  Email Address or Username
                </label>
                <input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="trainee@imd.gov.in"
                  className="w-full h-9 px-3 text-[13px] rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1557A6] focus:ring-2 focus:ring-blue-100 transition-colors"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[12px] font-semibold text-slate-700" htmlFor="password">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-medium text-[#1557A6] hover:underline"
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
                    className="w-full h-9 px-3 pr-10 text-[13px] rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1557A6] focus:ring-2 focus:ring-blue-100 transition-colors"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
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

          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-slate-500">
            <span>Don't have an account?</span>
            <Link to="/register" className="font-semibold text-[#1557A6] hover:underline">
              Register Profile
            </Link>
          </div>
        </div>

        {/* Security notice */}
        <div className="flex items-center justify-center gap-1.5 mt-5 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
          <span>Secured via Argon2id + JWT session signing</span>
        </div>
      </div>
    </div>
  )
}
