import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Award, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { traineeService } from "@/services/trainee"

export const CertificatesPage: React.FC = () => {
  const { data } = useQuery({
    queryKey: ["trainee-dashboard"],
    queryFn: () => traineeService.getDashboard(),
  })

  const certificates = data?.certificates || []

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Award className="h-6 w-6 text-emerald-600" />
          <span>Accredited Certificates</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically verifiable certificates issued by the India Meteorological Department
        </p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          icon={<Award className="h-8 w-8" />}
          title="No Certificates Earned Yet"
          description="Certificates are automatically generated upon 100% syllabus completion and passing required course benchmarks."
          actionLabel="View My Learning"
          onAction={() => window.location.assign("/trainee/learning")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <Card key={cert.id} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
              <div className="h-3 bg-gradient-to-r from-emerald-500 to-teal-600" />
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                      IMD Official Credential
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {cert.title}
                    </h3>
                  </div>
                  <StatusBadge status={cert.verification_status} />
                </div>

                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span>Issuing Body</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{cert.issuing_organization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credential ID</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{cert.credential_id || "IMD-CERT-SYS"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date of Issue</span>
                    <span>{new Date(cert.issue_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Verify Authenticity</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
