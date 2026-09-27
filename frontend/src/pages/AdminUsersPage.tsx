import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Users,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { adminService, AdminUserItem } from "@/services/admin"
import { useAuthStore } from "@/store/useAuthStore"

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient()
  const { user: currentAdmin } = useAuthStore()

  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [search, setSearch] = useState("")
  const page = 1

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin-users", roleFilter, statusFilter, search, page],
    queryFn: () =>
      adminService.listUsers({
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        search: search || undefined,
        page,
        page_size: 50,
      }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      adminService.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] })
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] })
    },
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="success" className="text-[10px]">ACTIVE</Badge>
      case "PENDING":
        return <Badge variant="warning" className="text-[10px]">PENDING APPROVAL</Badge>
      case "SUSPENDED":
        return <Badge variant="destructive" className="text-[10px]">SUSPENDED</Badge>
      case "REJECTED":
        return <Badge variant="destructive" className="text-[10px]">REJECTED</Badge>
      default:
        return <Badge variant="secondary" className="text-[10px]">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Users className="h-6 w-6 text-blue-600" />
          <span>User Access & Role Governance</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Verify registrations, approve operational staff accounts, enforce role restrictions, and audit account states.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or username..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">All Roles</option>
              <option value="TRAINEE">TRAINEE</option>
              <option value="TRAINER">TRAINER</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">All Account Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading user records...</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-red-900">Failed to load users</h3>
            <p className="text-sm text-red-700 mt-1">{(error as Error).message}</p>
          </CardContent>
        </Card>
      ) : (users || []).length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800">
          <CardContent className="py-12 text-center">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">No users match your selected criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Username</th>
                <th className="p-3">Role</th>
                <th className="p-3">Account Status</th>
                <th className="p-3">Registered On</th>
                <th className="p-3 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(users || []).map((u: AdminUserItem) => {
                const isSelf = currentAdmin?.id === u.id

                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {u.first_name} {u.last_name}
                        </span>
                        {isSelf && (
                          <Badge variant="outline" className="text-[9px] py-0">
                            You
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block">{u.email}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{u.username}</td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        disabled={isSelf || updateRoleMutation.isPending}
                        onChange={(e) =>
                          updateRoleMutation.mutate({ userId: u.id, role: e.target.value })
                        }
                        className="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 dark:bg-slate-900 font-semibold text-slate-800 dark:text-slate-200 disabled:opacity-60"
                      >
                        <option value="TRAINEE">TRAINEE</option>
                        <option value="TRAINER">TRAINER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-3">{getStatusBadge(u.account_status)}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.account_status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ userId: u.id, status: "ACTIVE" })}
                              disabled={updateStatusMutation.isPending}
                              className="h-7 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ userId: u.id, status: "REJECTED" })}
                              disabled={updateStatusMutation.isPending}
                              className="h-7 text-xs bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {u.account_status === "ACTIVE" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatusMutation.mutate({ userId: u.id, status: "SUSPENDED" })}
                            disabled={isSelf || updateStatusMutation.isPending}
                            className="h-7 text-xs text-amber-600 hover:text-amber-700 disabled:opacity-40"
                            title={isSelf ? "You cannot suspend your own administrative account" : undefined}
                          >
                            Suspend
                          </Button>
                        )}

                        {u.account_status === "SUSPENDED" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatusMutation.mutate({ userId: u.id, status: "ACTIVE" })}
                            disabled={updateStatusMutation.isPending}
                            className="h-7 text-xs text-emerald-600 hover:text-emerald-700"
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
