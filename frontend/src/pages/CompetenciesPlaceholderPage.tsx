import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Network, Box, Grid } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { traineeService } from "@/services/trainee"

export const CompetenciesPlaceholderPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "universe">("grid")
  const { data } = useQuery({
    queryKey: ["trainee-dashboard"],
    queryFn: () => traineeService.getDashboard(),
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Network className="h-6 w-6 text-blue-600" />
            <span>Organizational Competency Framework</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            WMO / IMD certified meteorological capability standards and skill matrix
          </p>
        </div>

        {/* View Switcher: Prepared for Future 3D Competency Universe */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Grid className="h-3.5 w-3.5" />
            <span>Grid View</span>
          </button>
          <button
            onClick={() => setViewMode("universe")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "universe"
                ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Box className="h-3.5 w-3.5 text-indigo-500" />
            <span>Competency Universe</span>
            <Badge className="text-[9px] py-0 px-1 bg-indigo-50 text-indigo-700 border-indigo-200">
              Phase 5
            </Badge>
          </button>
        </div>
      </div>

      {viewMode === "universe" ? (
        /* Future 3D Competency Universe Viewport */
        <Card className="border-slate-200 dark:border-slate-800 p-8 text-center bg-slate-950 text-white rounded-2xl relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
          <div className="relative z-10 space-y-3 max-w-md">
            <div className="w-16 h-16 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
              <Box className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white">Competency Universe (3D Canvas)</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Three.js and React Three Fiber interactive 3D constellation architecture is isolated for the dedicated Competency Visualization slice.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setViewMode("grid")}
              className="text-xs border-white/20 text-white hover:bg-white/10"
            >
              Switch to Standard Grid View
            </Button>
          </div>
        </Card>
      ) : (
        /* Standard Competencies Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.competencies && data.competencies.length > 0 ? (
            data.competencies.map((comp) => (
              <Card key={comp.id} className="border-slate-200 dark:border-slate-800">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                      {comp.code}
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                      Level {comp.current_level} of {comp.target_level}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                    {comp.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Category: {comp.category}</span>
                    <span>Confidence: {Math.round(comp.confidence_score * 100)}%</span>
                  </div>
                  <ProgressBar
                    value={(comp.current_level / comp.target_level) * 100}
                    size="sm"
                    variant="meteorological"
                  />
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 text-xs text-slate-400">
              No competencies evaluated yet. Enrolling and completing courses unlocks verified proficiencies.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
