import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: Array<"TRAINEE" | "TRAINER" | "ADMIN">
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Validating session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />
    if (user.role === "TRAINER") return <Navigate to="/trainer/dashboard" replace />
    return <Navigate to="/trainee/dashboard" replace />
  }

  return <>{children}</>
}
