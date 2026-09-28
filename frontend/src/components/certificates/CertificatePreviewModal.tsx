import React from "react"
import { X, Download, ShieldCheck, ExternalLink, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Certificate, certificateService } from "@/services/certificates"

interface CertificatePreviewModalProps {
  certificate: Certificate | null
  isOpen: boolean
  onClose: () => void
  onDownload?: (cert: Certificate) => void
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  certificate,
  isOpen,
  onClose,
  onDownload,
}) => {
  if (!isOpen || !certificate) return null

  // Use download URL or direct storage URL
  const pdfSource = certificate.pdf_url
    ? (certificate.pdf_url.startsWith("http") ? certificate.pdf_url : `http://localhost:8000${certificate.pdf_url}`)
    : certificateService.getDownloadUrl(certificate.id)

  const handleDownload = () => {
    if (onDownload) {
      onDownload(certificate)
    } else {
      certificateService.downloadCertificatePdf(certificate.id, certificate.certificate_number)
    }
  }

  const handleVerify = () => {
    window.open(`/certificates/verify/${certificate.id}`, "_blank")
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cert-preview-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h2 id="cert-preview-title" className="text-base font-bold text-slate-900 leading-tight">
                {certificate.course_title || "Accredited Certificate of Completion"}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="font-mono font-semibold text-emerald-800">{certificate.certificate_number}</span>
                <span>•</span>
                <span>Issued on {new Date(certificate.issue_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PDF Viewer Frame */}
        <div className="flex-1 bg-slate-900 p-2 sm:p-4 overflow-hidden flex items-center justify-center min-h-[420px] sm:min-h-[500px]">
          <iframe
            src={`${pdfSource}#toolbar=0&navpanes=0`}
            title={`Certificate - ${certificate.certificate_number}`}
            className="w-full h-full min-h-[420px] sm:min-h-[500px] rounded-lg border-0 shadow-inner bg-white"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-200 bg-slate-50 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>Official Government Credential issued by India Meteorological Department</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerify}
              className="text-xs flex items-center gap-1.5 border-slate-300 hover:bg-slate-100"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-600" />
              <span>Verify Authenticity</span>
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              className="text-xs flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
