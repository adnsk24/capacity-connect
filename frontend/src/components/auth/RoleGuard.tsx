import React from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

interface RoleGuardProps {
  allowedRoles: Array<"TRAINEE" | "TRAINER" | "ADMIN">
  children: React.ReactNode
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user } = useAuthStore()

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Access Restricted
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your current role (<strong>{user?.role || "GUEST"}</strong>) does not have authorization to view this area.
            Authorized roles: {allowedRoles.join(", ")}.
          </p>
          <div className="pt-2">
            <Link to="/">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5 mx-auto">
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
