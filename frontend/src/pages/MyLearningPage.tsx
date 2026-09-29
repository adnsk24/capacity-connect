import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Calendar,
  Compass,
  Award,
  ShieldCheck,
  Download,
  Eye,
  ClipboardCheck,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { StatusBadge } from "@/components/ui/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/loading-skeleton"
import { traineeService, EnrolledCourseItem } from "@/services/trainee"
import { getCourseThumbnail, getCourseThumbnailAlt } from "@/lib/courseImages"
import { CertificatePreviewModal } from "@/components/certificates/CertificatePreviewModal"
import { Certificate, certificateService } from "@/services/certificates"
import { useAuthStore } from "@/store/useAuthStore"

type FilterTab = "ALL" | "IN_PROGRESS" | "COMPLETED" | "CERTIFICATES"

export const MyLearningPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL")
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null)

  const { data: enrolledCourses, isLoading, error, refetch } = useQuery({
    queryKey: ["trainee-learning"],
    queryFn: () => traineeService.getMyLearning(),
  })

  const handleOpenCertificate = (course: EnrolledCourseItem) => {
    if (!course.certificate_id) return
    const cert: Certificate = {
      id: course.certificate_id,
      certificate_number: course.certificate_number || "CC-CERT",
      user_id: user?.id || "",
      course_id: course.course_id,
      course_title: course.title,
      trainee_name: user ? `${user.first_name} ${user.last_name}`.trim() : undefined,
      issue_date: course.certificate_issue_date || new Date().toISOString(),
      mode: "Online",
      verification_token: "",
      pdf_url: course.certificate_pdf_url,
      status: (course.certificate_status as "ISSUED" | "REVOKED") || "ISSUED",
      created_at: course.certificate_issue_date || new Date().toISOString(),
      updated_at: course.certificate_issue_date || new Date().toISOString(),
    }
    setSelectedCert(cert)
    setIsPreviewOpen(true)
  }

  const handleDownloadPdf = async (certId: string, certNumber: string) => {
    try {
      setDownloadingCertId(certId)
      await certificateService.downloadCertificatePdf(certId, certNumber)
    } catch (err: any) {
      console.error("Failed to download certificate PDF:", err)
    } finally {
      setDownloadingCertId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !enrolledCourses) {
    return (
      <ErrorState
        title="Could not load your learning portfolio"
        message={error instanceof Error ? error.message : "Error retrieving enrollments."}
        onRetry={() => refetch()}
      />
    )
  }

  // Filter calculations
  const inProgressCourses = enrolledCourses.filter(
    (c) => c.status === "IN_PROGRESS" || (c.status === "ENROLLED" && c.progress_percentage < 100)
  )
  const completedCourses = enrolledCourses.filter(
    (c) => c.status === "COMPLETED" || c.progress_percentage >= 100
  )
  const certifiedCourses = enrolledCourses.filter((c) => !!c.certificate_id)

  const displayedCourses = enrolledCourses.filter((course) => {
    if (activeTab === "IN_PROGRESS") {
      return course.status === "IN_PROGRESS" || (course.status === "ENROLLED" && course.progress_percentage < 100)
    }
    if (activeTab === "COMPLETED") {
      return course.status === "COMPLETED" || course.progress_percentage >= 100
    }
    if (activeTab === "CERTIFICATES") {
      return !!course.certificate_id
    }
    return true
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-[#1557A6]" />
            <span>My Learning Portfolio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your ongoing courses, lesson completions, and operational skill development
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/trainee/certificates">
            <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50">
              <Award className="h-4 w-4 text-emerald-700" />
              <span>All Certificates ({certifiedCourses.length})</span>
            </Button>
          </Link>
          <Link to="/trainee/courses">
            <Button size="sm" variant="outline" className="text-xs flex items-center gap-1.5 hover:bg-slate-50">
              <Compass className="h-4 w-4" />
              <span>Browse Catalogue</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Filter */}
      {enrolledCourses.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "ALL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Courses ({enrolledCourses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("IN_PROGRESS")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "IN_PROGRESS"
                ? "bg-white text-[#1557A6] shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            In Progress ({inProgressCourses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("COMPLETED")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "COMPLETED"
                ? "bg-white text-emerald-800 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Completed ({completedCourses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CERTIFICATES")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "CERTIFICATES"
                ? "bg-white text-emerald-800 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Award className="h-3.5 w-3.5 text-emerald-700" />
            <span>Accredited Certificates ({certifiedCourses.length})</span>
          </button>
        </div>
      )}

      {/* Courses List */}
      {enrolledCourses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="No Active Enrollments"
          description="You have not enrolled in any operational meteorology courses yet. Explore our course catalogue to advance your competencies."
          actionLabel="Explore Course Catalogue"
          onAction={() => navigate("/trainee/courses")}
        />
      ) : displayedCourses.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {activeTab === "CERTIFICATES"
              ? "No Accredited Certificates in this Filter"
              : "No Courses Found"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {activeTab === "CERTIFICATES"
              ? "Complete all lessons and pass the required assessments for your courses to automatically earn official India Meteorological Department certificates."
              : "Switch filter tabs or enroll in new courses from the catalogue to see them listed here."}
          </p>
          {activeTab === "CERTIFICATES" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab("ALL")}
              className="mt-4 text-xs"
            >
              View All Enrolled Courses
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedCourses.map((course) => (
            <Card
              key={course.enrollment_id}
              className={`border transition-all shadow-xs overflow-hidden ${
                course.certificate_id
                  ? "border-emerald-200/90 bg-linear-to-b from-white to-emerald-50/20 hover:border-emerald-300"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Course Thumbnail */}
                  <div className="w-full sm:w-36 h-28 shrink-0 rounded-md overflow-hidden border border-slate-200 bg-slate-100 relative group">
                    <img
                      src={getCourseThumbnail(course.title, course.category_name)}
                      alt={getCourseThumbnailAlt(course.title)}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                      width="144"
                      height="112"
                    />
                    {course.certificate_id && (
                      <div className="absolute top-1.5 right-1.5 p-1 bg-emerald-700 text-white rounded-full shadow-xs" title="Official Certificate Issued">
                        <Award className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 flex-1 w-full">
                    {/* Left: Course details and next lesson */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {course.code}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {course.category_name}
                        </span>
                        <StatusBadge status={course.status} />
                        {course.certificate_id && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Award className="h-3 w-3" />
                            <span>Certificate Issued</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {course.title}
                      </h3>

                      {/* Next Lesson or Completion Callout */}
                      {course.next_lesson_title ? (
                        <div className="p-2.5 rounded-md bg-blue-50/70 border border-blue-100 text-xs text-[#1557A6] flex items-center gap-2">
                          <span className="font-semibold shrink-0">Up Next:</span>
                          <span className="truncate">{course.next_lesson_title}</span>
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>All syllabus lessons completed!</span>
                        </div>
                      )}

                      {/* CERTIFICATE INTEGRATION CALLOUT */}
                      {course.certificate_id ? (
                        <div className="mt-3 p-3 rounded-lg bg-emerald-50/90 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-emerald-100 rounded-md text-emerald-800 shrink-0">
                              <Award className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-emerald-950">
                                  Accredited Certificate Issued
                                </span>
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                              </div>
                              <div className="text-[11px] font-mono font-semibold text-emerald-800">
                                {course.certificate_number}
                                {course.certificate_issue_date && (
                                  <span className="font-sans text-slate-500 font-normal ml-2">
                                    • Issued {new Date(course.certificate_issue_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenCertificate(course)}
                              className="text-xs h-8 flex items-center gap-1.5 bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>View Certificate</span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownloadPdf(course.certificate_id!, course.certificate_number || "CERT")}
                              disabled={downloadingCertId === course.certificate_id}
                              className="text-xs h-8 flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>{downloadingCertId === course.certificate_id ? "Downloading..." : "Download PDF"}</span>
                            </Button>
                          </div>
                        </div>
                      ) : course.has_pending_assessment && course.progress_percentage >= 100 ? (
                        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-amber-100 rounded-md text-amber-800 shrink-0">
                              <ClipboardCheck className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-amber-950">
                                Final Assessment Required for Certificate
                              </div>
                              <p className="text-[11.5px] text-amber-800 mt-0.5">
                                Pass {course.pending_assessment_title ? `"${course.pending_assessment_title}"` : "the comprehensive course assessment"} to unlock your official accredited certificate.
                              </p>
                            </div>
                          </div>

                          <Link
                            to={course.pending_assessment_id ? `/trainee/assessments/${course.pending_assessment_id}` : "/trainee/assessments"}
                            className="shrink-0"
                          >
                            <Button
                              size="sm"
                              className="text-xs h-8 bg-amber-700 hover:bg-amber-800 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <span>Take Assessment</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{course.duration_hours} hours total</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            Enrolled: {new Date(course.enrolled_at).toLocaleDateString()}
                          </span>
                        </div>
                        {course.last_accessed_at && (
                          <span>
                            Last active: {new Date(course.last_accessed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Progress and Action */}
                    <div className="lg:w-64 shrink-0 space-y-3 pt-3 lg:pt-0 lg:border-l lg:border-slate-100 lg:pl-6">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-medium text-slate-600">
                            {course.completed_lessons_count} of {course.total_lessons_count} lessons
                          </span>
                          <span className="font-bold font-mono text-slate-900">
                            {course.progress_percentage}%
                          </span>
                        </div>
                        <ProgressBar value={course.progress_percentage} size="md" variant="meteorological" />
                      </div>

                      <Link to={`/courses/${course.course_id}/learn`} className="block w-full">
                        <Button className="w-full font-semibold text-xs py-2 flex items-center justify-center gap-1.5 shadow-xs">
                          <span>{course.progress_percentage >= 100 ? "Review Course" : "Resume Course"}</span>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>

                      {course.certificate_id ? (
                        <Button
                          variant="outline"
                          onClick={() => handleOpenCertificate(course)}
                          className="w-full text-xs flex items-center justify-center gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                        >
                          <Award className="h-3.5 w-3.5 text-emerald-700" />
                          <span>View Certificate</span>
                        </Button>
                      ) : course.has_pending_assessment && course.progress_percentage >= 100 ? (
                        <Link
                          to={course.pending_assessment_id ? `/trainee/assessments/${course.pending_assessment_id}` : "/trainee/assessments"}
                          className="block w-full"
                        >
                          <Button
                            variant="outline"
                            className="w-full text-xs flex items-center justify-center gap-1.5 border-amber-300 text-amber-800 hover:bg-amber-50 cursor-pointer"
                          >
                            <ClipboardCheck className="h-3.5 w-3.5 text-amber-700" />
                            <span>Take Assessment</span>
                          </Button>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
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
        onDownload={selectedCert ? () => handleDownloadPdf(selectedCert.id, selectedCert.certificate_number) : undefined}
      />
    </div>
  )
}
export default MyLearningPage
