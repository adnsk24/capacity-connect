import React, { useState } from "react"
import { Link } from "react-router-dom"
import { KeyRound, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
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
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500">
            Request single-use token to restore account credentials
          </p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Recovery Request</CardTitle>
            <CardDescription>
              Enter your registered email address to receive password reset instructions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="p-4 rounded-lg bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-200 dark:border-blue-800 space-y-3 text-center">
                <CheckCircle2 className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" />
                <p className="text-xs leading-relaxed">{responseMessage}</p>
                <div className="pt-2">
                  <Link to="/reset-password">
                    <Button size="sm" variant="default" className="w-full text-xs">
                      Have a reset token? Reset password here
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="email">
                    Registered Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@imd.gov.in"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                    </span>
                  ) : (
                    "Send Password Reset Link"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs text-slate-500">
            <Link to="/login" className="inline-flex items-center gap-1 hover:text-blue-600">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">
              Create Account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
