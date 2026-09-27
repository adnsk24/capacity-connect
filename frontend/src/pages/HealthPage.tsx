import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Activity, Database, CheckCircle2, XCircle, RefreshCw, Server } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchHealth } from "@/services/health"
import { API_BASE_URL } from "@/services/api"

export const HealthPage: React.FC = () => {
  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["backend-health"],
    queryFn: fetchHealth,
    retry: 1,
    refetchInterval: 15000,
  })

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" /> System Health Diagnostics
            </h1>
            <p className="text-sm text-slate-500">
              Live heartbeat and connectivity check between the React frontend, FastAPI gateway, and PostgreSQL.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 self-start"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>{isFetching ? "Pinging..." : "Refresh Status"}</span>
          </Button>
        </div>

        {/* API Target Information */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Connection Target
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Gateway Base URL</span>
              <code className="bg-slate-100 px-2 py-0.5 rounded text-blue-600 font-mono">
                {API_BASE_URL}
              </code>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Versioned Health Endpoint</span>
              <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">
                GET /api/v1/health
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Live Diagnostics Card */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-blue-600" />
                <CardTitle>FastAPI Gateway Status</CardTitle>
              </div>
              {isLoading ? (
                <Badge variant="outline">Connecting...</Badge>
              ) : error ? (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> Unreachable
                </Badge>
              ) : (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Operational
                </Badge>
              )}
            </div>
            <CardDescription>
              Real-time response verification from the Capacity Connect backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="py-8 text-center text-sm text-slate-500 animate-pulse">
                Initiating connection to FastAPI backend...
              </div>
            ) : error ? (
              <div className="p-4 rounded-lg bg-red-50 text-red-800 border border-red-200 text-sm space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" /> Backend Server Not Detected
                </div>
                <p className="text-xs">
                  Ensure the FastAPI backend is running via:
                </p>
                <code className="block bg-red-100 p-2 rounded text-xs font-mono">
                  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
                </code>
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                    <Server className="h-4 w-4 text-blue-600" /> Service Details
                  </div>
                  <div className="text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Service:</span>
                      <span className="font-semibold text-slate-800">{data.app}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Version:</span>
                      <span className="font-mono text-slate-800">v{data.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Environment:</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {data.environment}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Server Time (UTC):</span>
                      <span className="font-mono text-[11px] text-slate-700">
                        {new Date(data.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
                    <Database className="h-4 w-4 text-blue-600" /> Database Connection
                  </div>
                  <div className="text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Connection State:</span>
                      {data.database?.status === "connected" ? (
                        <Badge variant="success" className="text-[10px]">Connected</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] text-amber-700 bg-amber-50">
                          {data.database?.status || "Pending"}
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target Engine:</span>
                      <span className="font-medium text-slate-800">
                        {data.database?.database || "PostgreSQL / Supabase"}
                      </span>
                    </div>
                    {data.database?.error && (
                      <p className="text-[11px] text-amber-600 pt-1">
                        Note: Local PostgreSQL service not started yet (standard for Phase 0 before Docker/DB launch).
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
