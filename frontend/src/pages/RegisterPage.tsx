import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  GraduationCap,
  Award,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { authService, type RegisterPayload } from "@/services/auth"

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<"TRAINEE" | "TRAINER">("TRAINEE")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [registeredSuccess, setRegisteredSuccess] = useState(false)

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0
    if (pass.length >= 8) score += 25
    if (/[A-Z]/.test(pass)) score += 25
    if (/[0-9]/.test(pass)) score += 25
    if (/[^A-Za-z0-9]/.test(pass)) score += 25
    return score
  }

  const strength = getPasswordStrength(password)
  const getStrengthLabel = (s: number) => {
    if (s <= 25) return { label: "Weak", color: "bg-red-500" }
    if (s <= 50) return { label: "Fair", color: "bg-amber-500" }
    if (s <= 75) return { label: "Good", color: "bg-blue-500" }
    return { label: "Strong", color: "bg-emerald-500" }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (password !== passwordConfirm) {
      setErrorMessage("Passwords do not match.")
      return
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.")
      return
    }

    const payload: RegisterPayload = {
      role,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim(),
      password,
      password_confirm: passwordConfirm,
    }

    try {
      setIsSubmitting(true)
      await authService.register(payload)
      setRegisteredSuccess(true)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage("Registration failed. Please check your information.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6">
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
              Create Portal Account
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              India Meteorological Department • Capacity Building Ecosystem
            </p>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900">Registration</CardTitle>
              <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">
                RBAC Enforced
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Select your persona and fill in your official details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registeredSuccess ? (
              <div className="p-6 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 space-y-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold">Registration Submitted!</h3>
                  <p className="text-xs text-emerald-800">
                    Your account has been registered with status: <strong>PENDING</strong>.
                  </p>
                </div>
                <div className="p-3 rounded-md bg-white text-left text-xs text-slate-600 space-y-1.5 border border-emerald-200">
                  <div className="font-semibold text-slate-900">Next Steps:</div>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    <li>An administrator will review and approve your cadre application.</li>
                    <li>Verify your email address using the verification link or token.</li>
                    <li>Once approved and active, you can sign in to your workspace.</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Link to="/verify-email" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Verify Email Token
                    </Button>
                  </Link>
                  <Link to="/login" className="flex-1">
                    <Button size="sm" className="w-full text-xs">
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-md bg-red-50 text-red-800 border border-red-200 flex items-start gap-2 text-xs">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Role Selector Tabs */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Platform Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("TRAINEE")}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-md border text-xs font-medium cursor-pointer transition-all ${
                        role === "TRAINEE"
                          ? "border-[#1557A6] bg-[#EFF6FF] text-[#1557A6] font-bold shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span>Trainee Persona</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("TRAINER")}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-md border text-xs font-medium cursor-pointer transition-all ${
                        role === "TRAINER"
                          ? "border-[#1557A6] bg-[#EFF6FF] text-[#1557A6] font-bold shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Award className="h-4 w-4" />
                      <span>Trainer Persona</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                    <span>Admin roles cannot be publicly registered (managed by institution).</span>
                  </div>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Aditya"
                      className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Sharma"
                      className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                      required
                    />
                  </div>
                </div>

                {/* Email & Username */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@imd.gov.in"
                      className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="aditya_sharma"
                      className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                      required
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Password (min. 8 characters)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 py-2 pr-10 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
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

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">Strength:</span>
                        <span className="font-semibold text-slate-700">
                          {getStrengthLabel(strength).label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getStrengthLabel(strength).color}`}
                          style={{ width: `${strength}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Confirm Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Registering Account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      Submit Registration <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
            <span>Already registered?</span>
            <Link to="/login" className="font-semibold text-[#1557A6] hover:underline">
              Sign In to Account
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
