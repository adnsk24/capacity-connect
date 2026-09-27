import React, { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { authService } from "@/services/auth"

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const initialToken = searchParams.get("token") || ""
  const [token, setToken] = useState(initialToken)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (initialToken) {
      handleVerification(initialToken)
    }
  }, [initialToken])

  const handleVerification = async (verifyToken: string) => {
    if (!verifyToken.trim()) return
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const res = await authService.verifyEmail(verifyToken.trim())
      setSuccessMessage(res.message || "Email verified successfully!")
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage("Verification failed. The token may be expired or invalid.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleVerification(token)
  }

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center mx-auto mb-2">
            <img
              src="/branding/imd-emblem.svg"
              alt="India Meteorological Department Emblem"
              className="h-14 w-14 object-contain"
              width="56"
              height="56"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Email Verification
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Confirm your official email to validate your portal identity
            </p>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Verify Address</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Enter the single-use verification token received upon registration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {successMessage && (
              <div className="p-4 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 space-y-2 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <h4 className="font-semibold text-sm">Verified!</h4>
                <p className="text-xs text-emerald-800">{successMessage}</p>
                <div className="pt-2">
                  <Link to="/login">
                    <Button size="sm" className="w-full text-xs">
                      Proceed to Sign In <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-md bg-red-50 text-red-800 border border-red-200 flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!successMessage && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700" htmlFor="token">
                    Verification Token
                  </label>
                  <input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste secure token"
                    className="w-full px-3 py-2 text-sm font-mono rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                    </span>
                  ) : (
                    "Confirm Email Verification"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t border-slate-100 pt-4 text-xs text-slate-500">
            <Link to="/login" className="hover:text-[#1557A6]">
              Back to Sign In
            </Link>
            <Link to="/register" className="font-semibold text-[#1557A6] hover:underline">
              Create New Account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
