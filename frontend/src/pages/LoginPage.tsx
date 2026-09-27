import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Layers, ShieldAlert, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAppStore, type UserRole } from "@/store/useAppStore"

export const LoginPage: React.FC = () => {
  const { currentRole, setRole } = useAppStore()
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [simulatedLoginSuccess, setSimulatedLoginSuccess] = useState(false)

  const handleSimulatedSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setRole(selectedRole)
    setSimulatedLoginSuccess(true)
  }

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <Layers className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Capacity Connect Portal
          </h2>
          <p className="text-xs text-slate-500">
            Phase 0 Application Shell & Role Simulation
          </p>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>
              Select your persona to preview role-tailored workspaces.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {simulatedLoginSuccess ? (
              <div className="p-4 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 space-y-2 text-center">
                <CheckCircle2 className="h-6 w-6 mx-auto text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-semibold text-sm">Persona Selected: {selectedRole}</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Phase 0 stores this preview persona in the global Zustand state. Full Argon2id + JWT authentication will be implemented in Phase 2.
                </p>
                <div className="pt-2">
                  <Link to="/">
                    <Button size="sm" variant="default" className="w-full">
                      Return to Portal Overview
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSimulatedSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Role Persona
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Trainee", "Trainer", "Admin"] as UserRole[]).map((r) => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setSelectedRole(r)}
                        className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                          selectedRole === r
                            ? "border-blue-600 bg-blue-50 text-blue-700 font-bold dark:bg-blue-950 dark:border-blue-500 dark:text-blue-300 shadow-xs"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={`${selectedRole.toLowerCase()}@capacityconnect.gov`}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
                    <strong>Architectural Notice:</strong> Real authentication, password hashing, and JWT tokens are scheduled for Phase 2. This interface demonstrates shell interaction only.
                  </p>
                </div>

                <Button type="submit" className="w-full">
                  Sign In as {selectedRole} (Simulation)
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <Link to="/" className="inline-flex items-center gap-1 hover:text-blue-600">
              <ArrowLeft className="h-3 w-3" /> Back to Home
            </Link>
            <Badge variant="outline" className="text-[10px]">
              Phase 0 UI Mock
            </Badge>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
