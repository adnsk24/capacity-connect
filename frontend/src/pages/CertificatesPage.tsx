import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  Award,
  Download,
  Eye,
  ShieldCheck,
  Calendar,
  Sparkles,
  FileCheck2,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/loading-skeleton"
import { CertificatePreviewModal } from "@/components/certificates/CertificatePreviewModal"
import { certificateService, Certificate } from "@/services/certificates"

export const CertificatesPage: React.FC = () => {
  const navigate = useNavigate()
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => certificateService.getMyCertificates(),
  })

  const handleViewCertificate = (cert: Certificate) => {
    setSelectedCert(cert)
    setIsPreviewOpen(true)
  }

  const handleDownloadPdf = async (cert: Certificate) => {
    try {
      setDownloadingId(cert.id)
      await certificateService.downloadCertificatePdf(cert.id, cert.certificate_number)
    } catch (err) {
      console.error("Failed to download certificate:", err)
      alert("Failed to download certificate. Please try again.")
    } finally {
      setDownloadingId(null)
    }
  }

  const handleVerify = (cert: Certificate) => {
    window.open(`/certificates/verify/${cert.id}`, "_blank")
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 flex items-center gap-2.5">
            <Award className="h-6 w-6 text-emerald-700" />
            <span>My Certificates</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official accredited completion credentials issued by India Meteorological Department (IMD)
          </p>
        </div>

        {certificates.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{certificates.length} {certificates.length === 1 ? "Credential" : "Credentials"} Earned</span>
            </span>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && certificates.length === 0 && (
        <EmptyState
          icon={<Award className="h-8 w-8 text-emerald-700" />}
          title="No Certificates Earned Yet"
          description="Certificates are automatically generated upon course completion and passing required assessments."
          actionLabel="Browse Course Catalogue"
          onAction={() => navigate("/courses")}
        />
      )}

      {/* Certificates Grid */}
      {!isLoading && certificates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certificates.map((cert) => (
            <Card
              key={cert.id}
              className="border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className={`h-2 ${cert.status === "REVOKED" ? "bg-amber-600" : "bg-emerald-700"}`} />
                <CardContent className="p-5 space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <FileCheck2 className="h-3.5 w-3.5 text-emerald-700" />
                        <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase tracking-wider">
                          IMD Accredited Credential
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {cert.course_title || "Accredited Training Course"}
                      </h3>
                    </div>
                    <StatusBadge status={cert.status} />
                  </div>

                  {/* Metadata Grid */}
                  <div className="space-y-2 text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Certificate Number</span>
                      <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                        {cert.certificate_number}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Issue Date</span>
                      <span className="font-medium text-slate-700 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {formatDate(cert.issue_date)}
                      </span>
                    </div>

                    {cert.score !== null && cert.score !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Assessment Score</span>
                        <span className="font-semibold text-emerald-700 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {cert.score.toFixed(0)}% {cert.grade ? `(${cert.grade})` : ""}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Training Mode</span>
                      <span className="font-medium text-slate-700">{cert.mode || "Online"}</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Action Buttons */}
              <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewCertificate(cert)}
                  className="flex-1 text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Certificate</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleDownloadPdf(cert)}
                  disabled={downloadingId === cert.id}
                  className="flex-1 text-xs flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{downloadingId === cert.id ? "Downloading..." : "Download PDF"}</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleVerify(cert)}
                  className="text-xs px-2.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50"
                  title="Verify Authenticity"
                >
                  <ShieldCheck className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Certificate Preview Modal */}
      <CertificatePreviewModal
        certificate={selectedCert}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
          setSelectedCert(null)
        }}
        onDownload={handleDownloadPdf}
      />
    </div>
  )
}
export default CertificatesPage
