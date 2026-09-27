import React, { useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth"

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState(searchParams.get("token") || "")
  const [newPassword, setNewPassword] = useState("")
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0
    if (pass.length >= 8) score += 25
    if (/[A-Z]/.test(pass)) score += 25
    if (/[0-9]/.test(pass)) score += 25
    if (/[^A-Za-z0-9]/.test(pass)) score += 25
    return score
  }

  const strength = getPasswordStrength(newPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (newPassword !== newPasswordConfirm) {
      setErrorMessage("Passwords do not match.")
      return
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.")
      return
    }

    try {
      setIsSubmitting(true)
      await authService.resetPassword(token.trim(), newPassword, newPasswordConfirm)
      setSuccess(true)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage("Password reset failed. Token may be invalid or expired.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <h2 className="text-[15px] font-semibold text-slate-900">Set New Password</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Enter your recovery token and define new security credentials
            </p>
          </div>

          <div className="p-6">
            {success ? (
              <div className="p-4 rounded-md bg-emerald-50 text-slate-800 border border-emerald-200 space-y-3 text-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-600 mx-auto" />
                <h4 className="font-semibold text-[13px] text-slate-900">Password Updated</h4>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  Your credentials have been securely updated. All prior sessions have been invalidated.
                </p>
                <div className="pt-2">
                  <Button size="sm" onClick={() => navigate("/login")} className="w-full text-xs bg-[#1557A6] hover:bg-[#0f4282] text-white">
                    Sign In with New Password
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-md bg-red-50 text-red-800 border border-red-200 flex items-start gap-2 text-[12px]">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-slate-700" htmlFor="reset-token">
                    Reset Token
                  </label>
                  <input
                    id="reset-token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter security token"
                    className="w-full h-9 px-3 text-[13px] font-mono rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-slate-700" htmlFor="new-password">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-9 px-3 pr-10 text-[13px] rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                      disabled={isSubmitting}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">Strength:</span>
                      <span className="font-semibold text-slate-700">
                        {strength >= 75 ? "Strong" : strength >= 50 ? "Good" : "Fair"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strength >= 75 ? "bg-emerald-500" : strength >= 50 ? "bg-blue-600" : "bg-amber-500"
                        }`}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-slate-700" htmlFor="confirm-new-password">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-9 px-3 text-[13px] rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-9 mt-2 text-[13px] font-medium bg-[#1557A6] hover:bg-[#0f4282] text-white" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
          </div>

          <div className="px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500 rounded-b-lg">
            <Link to="/login" className="hover:text-slate-900 transition-colors">
              Back to Sign In
            </Link>
            <Link to="/forgot-password" className="text-[#1557A6] hover:underline">
              Request New Token
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

