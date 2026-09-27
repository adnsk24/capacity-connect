import React, { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth"

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      setIsSubmitting(true)
      const res = await authService.forgotPassword(email.trim().toLowerCase())
      setResponseMessage(res.message)
      setSubmitted(true)
    } catch {
      // Security rule: Always return safe generic confirmation regardless of backend error
      setResponseMessage("If an account with that email address exists, password reset instructions have been generated.")
      setSubmitted(true)
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
            <h2 className="text-[15px] font-semibold text-slate-900">Password Recovery</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Enter your registered official email to receive a recovery token
            </p>
          </div>

          <div className="p-6">
            {submitted ? (
              <div className="p-4 rounded-md bg-blue-50 text-slate-800 border border-blue-200 space-y-3 text-center">
                <CheckCircle2 className="h-7 w-7 text-[#1557A6] mx-auto" />
                <p className="text-[12px] leading-relaxed text-slate-700">{responseMessage}</p>
                <div className="pt-2">
                  <Link to="/reset-password">
                    <Button size="sm" className="w-full text-xs bg-[#1557A6] hover:bg-[#0f4282] text-white">
                      Have a reset token? Enter it here
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-slate-700" htmlFor="email">
                    Registered Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@imd.gov.in"
                    className="w-full h-9 px-3 text-[13px] rounded-md border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-9 text-[13px] font-medium bg-[#1557A6] hover:bg-[#0f4282] text-white" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Transmitting...
                    </span>
                  ) : (
                    "Send Recovery Instructions"
                  )}
                </Button>
              </form>
            )}
          </div>

          <div className="px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500 rounded-b-lg">
            <Link to="/login" className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
            <Link to="/register" className="font-medium text-[#1557A6] hover:underline">
              Register New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

