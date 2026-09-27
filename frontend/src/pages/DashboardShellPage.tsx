import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  User as UserIcon,
  Shield,
  CheckCircle2,
  LogOut,
  ShieldAlert,
  Loader2,
  RefreshCw,
  MailCheck,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/useAuthStore"
import { authService } from "@/services/auth"

export const DashboardShellPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, refreshToken, clearSession } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      clearSession()
      setIsLoggingOut(false)
      navigate("/login", { replace: true })
    }
  }

  const handleLogoutAll = async () => {
    setIsLoggingOut(true)
    try {
      const res = await authService.logoutAll()
      setLogoutMessage(res.message)
      setTimeout(() => {
        clearSession()
        navigate("/login", { replace: true })
      }, 1200)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLogoutMessage(err.message)
      }
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!user) return null

  const roleBadgeVariants: Record<string, "default" | "success" | "warning"> = {
    ADMIN: "default",
    TRAINER: "success",
    TRAINEE: "warning",
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 w-full">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Authenticated Workspace
            </h1>
            <Badge variant={roleBadgeVariants[user.role] || "default"}>
              {user.role}
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Phase 2: Authentication, Security & Role-Based Access Control Active
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogoutAll}
            disabled={isLoggingOut}
            className="text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Revoke All Devices</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-xs flex items-center gap-1.5"
          >
            {isLoggingOut ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
            <span>Sign Out</span>
          </Button>
        </div>
      </div>

      {logoutMessage && (
        <div className="p-3 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs">
          {logoutMessage}
        </div>
      )}

      {/* Verification Notice */}
      {!user.is_verified && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <MailCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-amber-900">Email Verification Pending</h4>
              <p className="text-xs text-amber-800">
                Your account email has not been verified yet. Please enter your verification token to complete registration.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/verify-email")}
            className="text-xs shrink-0 border-amber-300 text-amber-900 hover:bg-amber-100"
          >
            Verify Now
          </Button>
        </div>
      )}

      {/* User Information & Session Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">Identity Profile</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Cryptographically verified user token claims
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Full Name</span>
              <span className="font-semibold text-slate-800">
                {user.first_name} {user.last_name}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Email</span>
              <span className="font-mono text-slate-800">{user.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Username</span>
              <span className="font-mono text-slate-800">{user.username}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Account Status</span>
              <Badge variant="success" className="text-[10px] capitalize">
                {user.account_status}
              </Badge>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">UUID Identifier</span>
              <span className="font-mono text-[10px] text-slate-500 truncate max-w-[180px]">
                {user.id}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Security & RBAC Guard Card */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base">RBAC Permissions</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Backend enforced role capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Assigned Role
              </span>
              <div className="font-bold text-sm text-slate-900">
                {user.role}
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>JWT Access Token (30 min lifetime)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Hashed Refresh Token Session (7 days)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Argon2id Password Storage (RFC 9106)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Phase Notice */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">Architectural Boundary</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Phase 2 completes Authentication & RBAC
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 space-y-2">
            <p>
              In this phase, backend authorization guards (<code>get_current_user</code>, <code>require_role</code>) and frontend session state are fully wired.
            </p>
            <p className="text-[11px] text-slate-400">
              Complete profile management, course catalogs, assessments, and dashboards will be built in Phase 3+.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
