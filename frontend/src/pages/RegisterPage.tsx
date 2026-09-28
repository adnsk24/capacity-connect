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
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
    if (s <= 75) return { label: "Good", color: "bg-blue-600" }
    return { label: "Strong", color: "bg-emerald-600" }
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
    <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-[#F7F9FC]">
      {/* ======================================================== */}
      {/* LEFT COLUMN: Authentic IMD Meteorological Imagery        */}
      {/* (Distinct Doppler Radar Facility photograph)             */}
      {/* ======================================================== */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative overflow-hidden flex-col justify-between p-10 xl:p-14 text-white">
        {/* Natural Sky Photographic Background with Subtle Institutional Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100"
          style={{
            backgroundImage: "linear-gradient(rgba(12, 50, 95, 0.25), rgba(12, 50, 95, 0.35)), url('/images/imd-radar-facility.jpg')",
          }}
          aria-hidden="true"
        />

        {/* Ambient bottom contrast gradient for crystal-clear readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C325F]/90 via-transparent to-[#0C325F]/35" aria-hidden="true" />

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
          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight mb-2">
            CAPACITY CONNECT
          </h1>
          <h2 className="text-base xl:text-lg text-blue-100 font-semibold mb-4">
            Digital Capacity Building &amp; Learning Management Portal
          </h2>
          <blockquote className="border-l-3 border-blue-400 pl-4 py-1 text-sm xl:text-base text-slate-100 italic leading-relaxed font-normal bg-black/15 rounded-r">
            "Build your professional capabilities through structured meteorological learning and competency development."
          </blockquote>
        </div>

        {/* Left Bottom: Facility Metadata & Operational Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-blue-100/80 pt-4 border-t border-white/15">
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="h-3.5 w-3.5 text-blue-300" />
            <span>IMD Doppler Weather Radar &amp; Surface Observation Cadre Network</span>
          </div>
          <div className="font-mono text-[11px] text-blue-200">
            DWR-STATION / CADRE-2026
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: Clean, Institutional White Register Panel  */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-10 xl:p-14 bg-[#F7F9FC]">
        <div className="w-full max-w-lg bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
          {/* Mobile Meteorological Header Banner (< lg screens) */}
          <div className="lg:hidden relative h-36 sm:h-44 overflow-hidden bg-[#0C325F]">
            <img
              src="/images/imd-radar-facility.jpg"
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
            <h2 className="text-xl font-bold text-slate-900">Create your account</h2>
            <p className="text-[13px] text-slate-500 mt-1">
              Join Capacity Connect and begin your professional learning journey.
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6">
            {registeredSuccess ? (
              <div className="p-6 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-200 space-y-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold">Registration Submitted!</h3>
                  <p className="text-xs text-emerald-850">
                    Your account has been registered with status: <strong>PENDING</strong>.
                  </p>
                </div>
                <div className="p-3.5 rounded-md bg-white text-left text-xs text-slate-700 space-y-1.5 border border-emerald-200">
                  <div className="font-semibold text-slate-900">Next Steps:</div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                    <li>An administrator will review and approve your cadre application.</li>
                    <li>Verify your email address using the verification link or token.</li>
                    <li>Once approved and active, you can sign in to your workspace.</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Link to="/verify-email" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs border-slate-300">
                      Verify Email Token
                    </Button>
                  </Link>
                  <Link to="/login" className="flex-1">
                    <Button size="sm" className="w-full text-xs bg-[#1557A6] hover:bg-[#124A8D] text-white">
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
                    Select Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("TRAINEE")}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-md border text-xs font-medium cursor-pointer transition-colors ${
                        role === "TRAINEE"
                          ? "border-[#1557A6] bg-blue-50/70 text-[#1557A6] font-bold shadow-2xs"
                          : "border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span>Trainee Persona</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("TRAINER")}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-md border text-xs font-medium cursor-pointer transition-colors ${
                        role === "TRAINER"
                          ? "border-[#1557A6] bg-blue-50/70 text-[#1557A6] font-bold shadow-2xs"
                          : "border-[#E2E8F0] bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Award className="h-4 w-4" />
                      <span>Trainer Persona</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>Admin accounts cannot be publicly registered (managed by institution).</span>
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
                      className="w-full h-10 px-3 text-[13px] rounded-lg border border-[#CBD5E1] bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1557A6] focus:ring-1 focus:ring-[#1557A6] transition-colors"
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
                      className="w-full h-10 px-3 text-[13px] rounded-lg border border-[#CBD5E1] bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1557A6] focus:ring-1 focus:ring-[#1557A6] transition-colors"
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
                      className="w-full h-10 px-3 text-[13px] rounded-lg border border-[#CBD5E1] bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1557A6] focus:ring-1 focus:ring-[#1557A6] transition-colors"
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
                      className="w-full h-10 px-3 text-[13px] rounded-lg border border-[#CBD5E1] bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1557A6] focus:ring-1 focus:ring-[#1557A6] transition-colors"
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
                        className="w-full h-10 px-3 pr-10 text-[13px] rounded-lg border border-[#CBD5E1] bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1557A6] focus:ring-1 focus:ring-[#1557A6] transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500">Password strength:</span>
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
                      className="w-full h-10 px-3 text-[13px] rounded-lg border border-[#CBD5E1] bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1557A6] focus:ring-1 focus:ring-[#1557A6] transition-colors"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 mt-2 bg-[#1557A6] hover:bg-[#124A8D] text-white font-medium rounded-lg shadow-none cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      Create Account <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-500">
            <span>Already registered?</span>
            <Link to="/login" className="font-semibold text-[#1557A6] hover:underline">
              Sign In to Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
