import { fetchJson, API_BASE_URL } from "./api"

export interface Certificate {
  id: string
  certificate_number: string
  user_id: string
  course_id: string
  course_title?: string
  trainee_name?: string
  issue_date: string
  course_start_date?: string
  course_end_date?: string
  mode: string
  score?: number | null
  grade?: string | null
  verification_token: string
  pdf_url?: string | null
  status: "ISSUED" | "REVOKED"
  created_at: string
  updated_at: string
}

export interface CertificateVerifyResult {
  verified: boolean
  status: "ISSUED" | "REVOKED" | "NOT_FOUND"
  certificate_number?: string
  trainee_name?: string
  course_title?: string
  issue_date?: string
  completion_date?: string
  mode?: string
  issuing_organization: string
  message?: string
}

export interface CertificateEligibility {
  eligible: boolean
  reason?: string
  enrollment_status?: string
  progress_percentage?: number
  assessment_passed?: boolean
  assessment_score?: number
  certificate_id?: string
  certificate_number?: string
}

export interface CertificateListResponse {
  certificates: Certificate[]
  total: number
}

export const certificateService = {
  async getMyCertificates(): Promise<Certificate[]> {
    return fetchJson<Certificate[]>("/certificates/me")
  },

  async getCertificate(id: string): Promise<Certificate> {
    return fetchJson<Certificate>(`/certificates/${id}`)
  },

  async getEligibility(courseId: string): Promise<CertificateEligibility> {
    return fetchJson<CertificateEligibility>(`/certificates/eligibility/${courseId}`)
  },

  async generateCertificate(courseId: string): Promise<Certificate> {
    return fetchJson<Certificate>("/certificates/generate", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId }),
    })
  },

  async verifyCertificate(identifier: string): Promise<CertificateVerifyResult> {
    return fetchJson<CertificateVerifyResult>(`/certificates/verify/${identifier}`)
  },

  async adminListCertificates(search?: string, skip = 0, limit = 50): Promise<CertificateListResponse> {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    params.append("skip", String(skip))
    params.append("limit", String(limit))
    return fetchJson<CertificateListResponse>(`/certificates/admin/all?${params.toString()}`)
  },

  async adminRevokeCertificate(id: string, reason?: string): Promise<Certificate> {
    return fetchJson<Certificate>(`/certificates/admin/${id}/revoke`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    })
  },

  getDownloadUrl(id: string): string {
    return `${API_BASE_URL}/certificates/${id}/download`
  },

  async downloadCertificatePdf(id: string, certificateNumber: string): Promise<void> {
    const token = localStorage.getItem("cc_access_token")
    const url = `${API_BASE_URL}/certificates/${id}/download`
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    if (!res.ok) {
      throw new Error(`Failed to download certificate: ${res.statusText}`)
    }

    const blob = await res.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = blobUrl
    link.download = `Capacity_Connect_Certificate_${certificateNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  },
}
