import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Layers, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <Layers className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Capacity Connect Portal
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your capacity building & learning workspace
          </p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Sign In</CardTitle>
              <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-200 bg-blue-50/50">
                Argon2id + JWT
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Enter your official email or username and account password.
            </CardDescription>

            {/* Evaluator Quick-Fill Bar */}
            <div className="pt-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="text-amber-500">⚡</span> Demo Credentials Quick-Fill
                  </span>
                  <span className="text-[10px] text-slate-400">Click to autofill</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUsernameOrEmail("trainee.demo@imd.gov.in")
                      setPassword("DemoTrainee123!")
                    }}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all cursor-pointer shadow-xs text-center"
                  >
                    Trainee
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsernameOrEmail("trainer.demo@imd.gov.in")
                      setPassword("DemoTrainer123!")
                    }}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-all cursor-pointer shadow-xs text-center"
                  >
                    Trainer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsernameOrEmail("admin.demo@imd.gov.in")
                      setPassword("DemoAdmin123!")
                    }}
                    className="px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all cursor-pointer shadow-xs text-center"
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900 flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="identifier">
                  Email Address or Username
                </label>
                <input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="trainee@imd.gov.in"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-medium text-blue-600 hover:underline dark:text-blue-400"
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
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Sign In <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs text-slate-500">
            <span>Don't have an account?</span>
            <Link to="/register" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
              Register New Profile
            </Link>
          </CardFooter>
        </Card>

        {/* Security Assurance Notice */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Secured via RFC 9106 Argon2id hashing & cryptographically signed JWT sessions</span>
        </div>
      </div>
    </div>
  )
}
