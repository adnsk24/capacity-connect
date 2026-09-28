import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowLeft, CheckCircle2, Building, Calendar, User, BookOpen, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { certificateService, CertificateVerifyResult } from "@/services/certificates"

export const CertificateVerifyPage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>()
  const [result, setResult] = useState<CertificateVerifyResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!certificateId) {
      setLoading(false)
      setError("No certificate identifier provided.")
      return
    }

    const fetchVerification = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await certificateService.verifyCertificate(certificateId)
        setResult(data)
      } catch (err: any) {
        setError(err.message || "Failed to verify certificate authenticity.")
      } finally {
        setLoading(false)
      }
    }

    fetchVerification()
  }, [certificateId])

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A"
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
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Government / IMD Header Banner */}
        <div className="text-center space-y-2 border-b border-slate-200 pb-6">
          <div className="flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <Award className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h2 className="text-xs uppercase tracking-wider font-bold text-slate-700">
                भारत मौसम विज्ञान विभाग • India Meteorological Department
              </h2>
              <p className="text-[11px] text-slate-500">
                Ministry of Earth Sciences, Government of India
              </p>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight pt-2">
            Public Certificate Verification Registry
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Official cryptographic verification service for accredited training credentials and certificates of completion.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="border-slate-200 bg-white p-8 text-center shadow-xs">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-700"></div>
              <p className="text-sm font-medium text-slate-600">Verifying credential authenticity...</p>
            </div>
          </Card>
        )}

        {/* Error State / Not Found */}
        {!loading && (error || !result || result.status === "NOT_FOUND") && (
          <Card className="border-red-200 bg-red-50/50 shadow-sm overflow-hidden">
            <div className="h-2 bg-red-600" />
            <CardContent className="p-8 text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-red-900">Certificate Not Found</h2>
                <p className="text-xs text-red-700 max-w-md mx-auto">
                  No valid certificate record was found matching the identifier{" "}
                  <code className="bg-red-100 px-1.5 py-0.5 rounded font-mono font-semibold">{certificateId}</code> in the
                  IMD national training registry.
                </p>
              </div>
              <div className="pt-4 flex justify-center gap-3">
                <Button variant="outline" asChild size="sm" className="text-xs">
                  <Link to="/">
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                    Back to Portal Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revoked State */}
        {!loading && result && result.status === "REVOKED" && (
          <Card className="border-amber-300 bg-amber-50/50 shadow-sm overflow-hidden">
            <div className="h-2 bg-amber-600" />
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-4 border-b border-amber-200 pb-5">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <div className="inline-block px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[11px] uppercase tracking-wider mb-1">
                    Certificate Revoked
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {result.course_title || "Accredited Training Course"}
                  </h2>
                  <p className="text-xs text-amber-800 mt-0.5">
                    This certificate was formally revoked and is no longer valid.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white/80 p-3.5 rounded-lg border border-amber-200">
                  <span className="text-slate-500 block mb-0.5">Certificate Number</span>
                  <span className="font-mono font-bold text-slate-800">{result.certificate_number}</span>
                </div>
                <div className="bg-white/80 p-3.5 rounded-lg border border-amber-200">
                  <span className="text-slate-500 block mb-0.5">Recipient Name</span>
                  <span className="font-semibold text-slate-800">{result.trainee_name}</span>
                </div>
                <div className="bg-white/80 p-3.5 rounded-lg border border-amber-200">
                  <span className="text-slate-500 block mb-0.5">Date of Issue</span>
                  <span className="font-medium text-slate-800">{formatDate(result.issue_date)}</span>
                </div>
                <div className="bg-white/80 p-3.5 rounded-lg border border-amber-200">
                  <span className="text-slate-500 block mb-0.5">Status</span>
                  <span className="font-bold text-red-700 uppercase">Revoked</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <Button variant="outline" asChild size="sm" className="text-xs">
                  <Link to="/">
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                    Back to Portal Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Valid Verified State */}
        {!loading && result && result.status === "ISSUED" && result.verified && (
          <Card className="border-emerald-200 bg-white shadow-md overflow-hidden">
            <div className="h-2.5 bg-emerald-700" />
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Verification Badge Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified Official Certificate
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                      {result.course_title}
                    </h2>
                  </div>
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Certificate Number
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200/60 inline-block mt-0.5">
                    {result.certificate_number}
                  </span>
                </div>
              </div>

              {/* Verified Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-100 flex items-start gap-3">
                  <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 block mb-0.5">Trainee Name</span>
                    <span className="font-bold text-slate-900 text-sm">{result.trainee_name}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-100 flex items-start gap-3">
                  <BookOpen className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 block mb-0.5">Course Completed</span>
                    <span className="font-semibold text-slate-800">{result.course_title}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-100 flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 block mb-0.5">Date of Issue</span>
                    <span className="font-semibold text-slate-800">{formatDate(result.issue_date)}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-100 flex items-start gap-3">
                  <Building className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-500 block mb-0.5">Issuing Authority</span>
                    <span className="font-medium text-slate-800">{result.issuing_organization}</span>
                  </div>
                </div>
              </div>

              {/* Trust statement */}
              <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 text-xs text-emerald-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  Authenticated by Capacity Building & Training Platform
                </p>
                <p className="text-[11px] text-emerald-800/80">
                  This electronic credential was issued pursuant to the completion of all mandated instructional curriculum
                  and benchmark assessments established by the India Meteorological Department.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <Button variant="outline" asChild size="sm" className="text-xs">
                  <Link to="/">
                    <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                    Back to Portal Home
                  </Link>
                </Button>
                <Button asChild size="sm" className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white">
                  <Link to="/courses">Browse More Courses</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 mt-10">
        © 2026 India Meteorological Department, Ministry of Earth Sciences. All rights reserved.
      </div>
    </div>
  )
}
