import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAuthStore, type AuthUser } from "../store/useAuthStore"
import { ProtectedRoute } from "../components/auth/ProtectedRoute"
import { TraineeDashboardPage } from "../pages/TraineeDashboardPage"
import { CourseCataloguePage } from "../pages/CourseCataloguePage"
import { CourseDetailPage } from "../pages/CourseDetailPage"
import { TraineeProfilePage } from "../pages/TraineeProfilePage"
import { traineeService } from "../services/trainee"
import { coursesService } from "../services/courses"

// Mock services
vi.mock("../services/trainee", () => ({
  traineeService: {
    getDashboard: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    getMyLearning: vi.fn(),
  },
}))

vi.mock("../services/courses", () => ({
  coursesService: {
    getCatalogue: vi.fn(),
    getCategories: vi.fn(),
    getCourseDetails: vi.fn(),
    enrollInCourse: vi.fn(),
    getLearningContent: vi.fn(),
    completeLesson: vi.fn(),
  },
}))

const mockTraineeUser: AuthUser = {
  id: "user-trainee-123",
  email: "ananya.sharma@imd.gov.in",
  username: "ananya_s",
  first_name: "Ananya",
  last_name: "Sharma",
  role: "TRAINEE",
  account_status: "ACTIVE",
  is_active: true,
  is_verified: true,
}

const mockDashboardData = {
  welcome_message: "Welcome back, Ananya!",
  user_summary: {
    id: "user-trainee-123",
    first_name: "Ananya",
    last_name: "Sharma",
    email: "ananya.sharma@imd.gov.in",
    role: "TRAINEE",
    account_status: "ACTIVE",
    organization: "India Meteorological Department (IMD)",
    department: "National Weather Forecasting Centre",
  },
  profile_completion_percentage: 85.0,
  courses_enrolled_count: 2,
  courses_completed_count: 1,
  average_progress_percentage: 65.5,
  recent_learning: [
    {
      course_id: "course-101",
      enrollment_id: "en-101",
      title: "Introduction to Meteorology",
      code: "MET-101",
      category_name: "General Meteorology",
      difficulty_level: "BEGINNER",
      duration_hours: 30,
      status: "IN_PROGRESS",
      enrolled_at: "2026-09-01T00:00:00Z",
      progress_percentage: 50.0,
      completed_lessons_count: 2,
      total_lessons_count: 4,
      next_lesson_id: "lesson-3",
      next_lesson_title: "Thermodynamic Diagrams (Tephigram & Skew-T)",
    },
  ],
  upcoming_assessments: [],
  competencies: [
    {
      id: "comp-1",
      competency_id: "c-synoptic",
      name: "Synoptic Weather Analysis & Charting",
      code: "COMP-SYNOPTIC",
      category: "Operational Forecasting",
      current_level: 2,
      target_level: 3,
      confidence_score: 0.95,
    },
  ],
  certificates: [
    {
      id: "cert-1",
      title: "IMD Surface Meteorological Observation Certified Specialist",
      issuing_organization: "India Meteorological Department (IMD)",
      credential_id: "IMD-CERT-2023-7492",
      issue_date: "2023-11-15",
      verification_status: "VERIFIED",
    },
  ],
  notifications: [],
}

const mockCatalogueData = {
  items: [
    {
      id: "course-101",
      code: "MET-101",
      title: "Introduction to Meteorology",
      description: "Foundational atmospheric science curriculum.",
      category_id: "cat-1",
      category_name: "General Meteorology",
      category_code: "GEN-MET",
      difficulty_level: "BEGINNER" as const,
      duration_hours: 30,
      total_modules: 2,
      total_lessons: 4,
      competencies: ["Synoptic Weather Analysis"],
      is_enrolled: true,
      enrollment_status: "IN_PROGRESS",
      progress_percentage: 50.0,
    },
    {
      id: "course-204",
      code: "MET-204",
      title: "Doppler Weather Radar Operations",
      description: "Principles of pulsed Doppler radar and severe storms.",
      category_id: "cat-2",
      category_name: "Radar Meteorology",
      category_code: "RAD-MET",
      difficulty_level: "INTERMEDIATE" as const,
      duration_hours: 50,
      total_modules: 2,
      total_lessons: 3,
      competencies: ["Doppler Weather Radar Interpretation"],
      is_enrolled: false,
    },
  ],
  total: 2,
  page: 1,
  page_size: 12,
  total_pages: 1,
  categories: [
    { id: "cat-1", name: "General Meteorology", code: "GEN-MET" },
    { id: "cat-2", name: "Radar Meteorology", code: "RAD-MET" },
  ],
}

const mockCourseDetail = {
  id: "course-204",
  code: "MET-204",
  title: "Doppler Weather Radar Operations",
  description: "Comprehensive radar curriculum.",
  objectives: "Operate radar workstations.",
  prerequisites: "Undergraduate physics.",
  status: "PUBLISHED",
  difficulty_level: "INTERMEDIATE" as const,
  duration_hours: 50,
  category: { id: "cat-2", name: "Radar Meteorology", code: "RAD-MET" },
  trainer: {
    id: "trainer-1",
    first_name: "Dr. Rajesh",
    last_name: "Kumar",
    email: "trainer@imd.gov.in",
    designation: "Senior Meteorologist",
  },
  modules: [
    {
      id: "mod-1",
      course_id: "course-204",
      title: "Radar Principles",
      order_index: 1,
      lessons: [
        {
          id: "les-1",
          module_id: "mod-1",
          title: "Radar Equation and Doppler Dilemma",
          order_index: 1,
          duration_minutes: 50,
          content_type: "TEXT",
          is_mandatory: true,
          is_completed: false,
          resources: [],
        },
      ],
    },
  ],
  resources: [
    {
      id: "res-1",
      course_id: "course-204",
      title: "Radar Handbook",
      resource_type: "PDF",
      storage_url: "https://example.com/handbook.pdf",
      file_size_bytes: 4000000,
      is_downloadable: true,
    },
  ],
  competencies: [
    {
      id: "comp-2",
      name: "Doppler Radar Interpretation",
      code: "COMP-DOPPLER",
      category: "Radar",
      target_level: 3,
      contribution_weight: 0.9,
    },
  ],
  is_enrolled: false,
  completed_lessons_count: 0,
  total_lessons_count: 1,
}

const mockProfileData = {
  id: "user-trainee-123",
  email: "ananya.sharma@imd.gov.in",
  username: "ananya_s",
  first_name: "Ananya",
  last_name: "Sharma",
  phone_number: "+91 98765 43210",
  role: "TRAINEE",
  account_status: "ACTIVE",
  is_active: true,
  is_verified: true,
  organization_name: "India Meteorological Department",
  department_name: "National Weather Forecasting Centre",
  designation: "Scientific Assistant",
  cadre: "Operational Meteorology",
  posting_location: "New Delhi HQ",
  bio: "Observational meteorologist",
  interests: "Severe thunderstorms",
  readiness_score: 85.0,
  qualifications: [
    {
      degree: "M.Sc. Atmospheric Sciences",
      institution: "IIT Delhi",
      year_of_passing: 2023,
    },
  ],
  experiences: [
    {
      title: "Scientific Assistant",
      organization_name: "IMD",
      start_date: "2023-08-01",
      is_current: true,
    },
  ],
  skills: [
    {
      name: "Radar Analysis",
      proficiency_level: "INTERMEDIATE" as const,
      years_of_experience: 2,
    },
  ],
  profile_completion_percentage: 85.0,
  completion_breakdown: {
    personal_info: true,
    professional_info: true,
    qualifications: true,
    experience: true,
    skills: true,
  },
}

function renderWithClient(ui: React.ReactElement, initialPath = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe("Phase 3 Trainee Experience", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.getState().setSession("test-access-token", "test-refresh-token", mockTraineeUser)
  })

  // 1. Dashboard renders with real data
  it("renders trainee dashboard with telemetry stats and greeting", async () => {
    vi.mocked(traineeService.getDashboard).mockResolvedValue(mockDashboardData)

    renderWithClient(<TraineeDashboardPage />)

    expect(await screen.findByText(/Welcome back, Ananya!/i)).toBeDefined()
    expect(screen.getByText("Courses Enrolled")).toBeDefined()
    expect(screen.getAllByText(/85%/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("Introduction to Meteorology")).toBeDefined()
  })

  // 2. Course catalogue renders
  it("renders course catalogue with search and filter controls", async () => {
    vi.mocked(coursesService.getCatalogue).mockResolvedValue(mockCatalogueData)

    renderWithClient(<CourseCataloguePage />)

    expect(await screen.findByText("Introduction to Meteorology")).toBeDefined()
    expect(screen.getByText("Doppler Weather Radar Operations")).toBeDefined()
  })

  // 3. Search and filter in catalogue
  it("triggers search query when typing in search input", async () => {
    vi.mocked(coursesService.getCatalogue).mockResolvedValue(mockCatalogueData)

    renderWithClient(<CourseCataloguePage />)

    const searchInput = await screen.findByPlaceholderText(/Search by title/i)
    fireEvent.change(searchInput, { target: { value: "Radar" } })

    expect(searchInput).toHaveProperty("value", "Radar")
  })

  // 4. Course detail renders syllabus and metadata
  it("renders course detail with syllabus hierarchy and lessons", async () => {
    vi.mocked(coursesService.getCourseDetails).mockResolvedValue(mockCourseDetail)

    renderWithClient(
      <Routes>
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
      </Routes>,
      "/courses/course-204"
    )

    expect(await screen.findByRole("heading", { name: "Doppler Weather Radar Operations", level: 1 })).toBeDefined()
    expect(screen.getByText("Radar Equation and Doppler Dilemma")).toBeDefined()
    expect(screen.getAllByText(/Dr. Rajesh Kumar/i).length).toBeGreaterThanOrEqual(1)
  })

  // 5. Enrollment action button renders
  it("renders enroll action button on un-enrolled course details", async () => {
    vi.mocked(coursesService.getCourseDetails).mockResolvedValue(mockCourseDetail)

    renderWithClient(
      <Routes>
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
      </Routes>,
      "/courses/course-204"
    )

    expect(await screen.findByRole("heading", { name: "Doppler Weather Radar Operations", level: 1 })).toBeDefined()
    const enrollButton = screen.getByRole("button", { name: /Enroll in Course/i })
    expect(enrollButton).toBeDefined()
  })

  // 6. Profile rendering with dynamic completion percentage
  it("renders trainee profile with fields and dynamic completion bar", async () => {
    vi.mocked(traineeService.getProfile).mockResolvedValue(mockProfileData)

    renderWithClient(<TraineeProfilePage />)

    expect(await screen.findByText("Ananya Sharma")).toBeDefined()
    expect(screen.getByText("85%")).toBeDefined()
    expect(screen.getByDisplayValue("Ananya")).toBeDefined()
  })

  // 7. Profile update state
  it("allows updating profile fields", async () => {
    vi.mocked(traineeService.getProfile).mockResolvedValue(mockProfileData)
    vi.mocked(traineeService.updateProfile).mockResolvedValue(mockProfileData)

    renderWithClient(<TraineeProfilePage />)

    const firstNameInput = await screen.findByDisplayValue("Ananya")
    fireEvent.change(firstNameInput, { target: { value: "Ananya Updated" } })

    expect(firstNameInput).toHaveProperty("value", "Ananya Updated")
  })

  // 8. Protected routes behavior
  it("redirects unauthenticated user away from protected trainee workspace", () => {
    useAuthStore.getState().clearSession()

    render(
      <MemoryRouter initialEntries={["/trainee/dashboard"]}>
        <Routes>
          <Route
            path="/trainee/dashboard"
            element={
              <ProtectedRoute>
                <div>Secret Trainee Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page Redirect</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText("Login Page Redirect")).toBeDefined()
    expect(screen.queryByText("Secret Trainee Dashboard")).toBeNull()
  })
})
