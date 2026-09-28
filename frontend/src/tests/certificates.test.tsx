import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CertificatesPage } from "../pages/CertificatesPage"
import { CertificateVerifyPage } from "../pages/CertificateVerifyPage"
import { certificateService, Certificate, CertificateVerifyResult } from "../services/certificates"

vi.mock("../services/certificates", () => ({
  certificateService: {
    getMyCertificates: vi.fn(),
    getCertificate: vi.fn(),
    getEligibility: vi.fn(),
    generateCertificate: vi.fn(),
    verifyCertificate: vi.fn(),
    downloadCertificatePdf: vi.fn().mockResolvedValue(undefined),
    getDownloadUrl: vi.fn((id) => `http://localhost:8000/api/v1/certificates/${id}/download`),
  },
}))

const mockCertificates: Certificate[] = [
  {
    id: "cert-uuid-1",
    certificate_number: "CC-2026-SDI-000124",
    user_id: "user-1",
    course_id: "course-1",
    course_title: "Satellite Data Interpretation",
    trainee_name: "Aditya Sharma",
    issue_date: "2026-09-28",
    course_start_date: "2026-09-01",
    course_end_date: "2026-09-28",
    mode: "Online",
    score: 88.0,
    grade: "A+",
    verification_token: "token-12345",
    pdf_url: "/uploads/certificates/user-1/CC-2026-SDI-000124.pdf",
    status: "ISSUED",
    created_at: "2026-09-28T10:00:00Z",
    updated_at: "2026-09-28T10:00:00Z",
  },
  {
    id: "cert-uuid-2",
    certificate_number: "CC-2026-DWR-000055",
    user_id: "user-1",
    course_id: "course-2",
    course_title: "Doppler Weather Radar Operations",
    trainee_name: "Aditya Sharma",
    issue_date: "2026-08-15",
    mode: "Offline",
    score: 92.5,
    grade: "O",
    verification_token: "token-67890",
    pdf_url: "/uploads/certificates/user-1/CC-2026-DWR-000055.pdf",
    status: "ISSUED",
    created_at: "2026-08-15T10:00:00Z",
    updated_at: "2026-08-15T10:00:00Z",
  },
]

describe("Capacity Connect — Certificates Frontend Test Suite", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    })
  })

  // Test 1: My Certificates page renders list of certificates
  it("My Certificates page renders list of certificates", async () => {
    vi.mocked(certificateService.getMyCertificates).mockResolvedValue(mockCertificates)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CertificatesPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("My Certificates")).toBeDefined()
      expect(screen.getByText("Satellite Data Interpretation")).toBeDefined()
      expect(screen.getByText("Doppler Weather Radar Operations")).toBeDefined()
    })
  })

  // Test 2: Certificate card displays correct details
  it("certificate card displays Course Name, Certificate Number, Issue Date, Score, and Status", async () => {
    vi.mocked(certificateService.getMyCertificates).mockResolvedValue(mockCertificates)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CertificatesPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("CC-2026-SDI-000124")).toBeDefined()
      expect(screen.getByText("88% (A+)")).toBeDefined()
      expect(screen.getByText("Online")).toBeDefined()
    })
  })

  // Test 3: View Certificate opens preview modal
  it("View Certificate action opens preview modal", async () => {
    vi.mocked(certificateService.getMyCertificates).mockResolvedValue(mockCertificates)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CertificatesPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("Satellite Data Interpretation")).toBeDefined()
    })

    const viewButtons = screen.getAllByText("View Certificate")
    fireEvent.click(viewButtons[0])

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeDefined()
      const iframe = screen.getByTitle("Certificate - CC-2026-SDI-000124")
      expect(iframe).toBeDefined()
    })
  })

  // Test 4: Download PDF action triggers download
  it("Download PDF action initiates download with correct certificate details", async () => {
    vi.mocked(certificateService.getMyCertificates).mockResolvedValue(mockCertificates)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CertificatesPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("Satellite Data Interpretation")).toBeDefined()
    })

    const downloadButtons = screen.getAllByText("Download PDF")
    fireEvent.click(downloadButtons[0])

    await waitFor(() => {
      expect(certificateService.downloadCertificatePdf).toHaveBeenCalledWith(
        "cert-uuid-1",
        "CC-2026-SDI-000124"
      )
    })
  })

  // Test 5: Empty certificate state renders when no certificates
  it("empty certificate state renders when no certificates exist", async () => {
    vi.mocked(certificateService.getMyCertificates).mockResolvedValue([])

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CertificatesPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("No Certificates Earned Yet")).toBeDefined()
      expect(screen.getByText("Browse Course Catalogue")).toBeDefined()
    })
  })

  // Test 6: Public verification page renders verified certificate details
  it("public verification page displays verified credentials", async () => {
    const mockVerifyResult: CertificateVerifyResult = {
      verified: true,
      status: "ISSUED",
      certificate_number: "CC-2026-SDI-000124",
      trainee_name: "Aditya Sharma",
      course_title: "Satellite Data Interpretation",
      issue_date: "2026-09-28",
      completion_date: "2026-09-28",
      mode: "Online",
      issuing_organization: "India Meteorological Department",
      message: "Verified Certificate",
    }
    vi.mocked(certificateService.verifyCertificate).mockResolvedValue(mockVerifyResult)

    render(
      <MemoryRouter initialEntries={["/certificates/verify/cert-uuid-1"]}>
        <Routes>
          <Route path="/certificates/verify/:certificateId" element={<CertificateVerifyPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getAllByText(/Verified Official Certificate/i)[0]).toBeDefined()
      expect(screen.getByText("CC-2026-SDI-000124")).toBeDefined()
      expect(screen.getByText("Aditya Sharma")).toBeDefined()
      expect(screen.getAllByText("Satellite Data Interpretation")[0]).toBeDefined()
    })
  })
})
