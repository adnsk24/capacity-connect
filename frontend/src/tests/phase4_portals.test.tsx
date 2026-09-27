import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAuthStore, type AuthUser } from "../store/useAuthStore"
import { ProtectedRoute } from "../components/auth/ProtectedRoute"

import { TraineeAssessmentsPage } from "../pages/TraineeAssessmentsPage"
import { AssessmentDetailPage } from "../pages/AssessmentDetailPage"
import { AssessmentResultPage } from "../pages/AssessmentResultPage"
import { TrainerDashboardPage } from "../pages/TrainerDashboardPage"
import { TrainerCoursesPage } from "../pages/TrainerCoursesPage"
import { TrainerAssessmentBuilderPage } from "../pages/TrainerAssessmentBuilderPage"
import { TrainerPerformancePage } from "../pages/TrainerPerformancePage"
import { AdminDashboardPage } from "../pages/AdminDashboardPage"
import { AdminUsersPage } from "../pages/AdminUsersPage"

import { assessmentsService } from "../services/assessments"
import { trainerService } from "../services/trainer"
import { adminService } from "../services/admin"

// Mock Recharts ResponsiveContainer to avoid SVG size measuring issues in JSDOM
vi.mock("recharts", async () => {
  const original = await vi.importActual("recharts")
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  }
})

// Mock Services
vi.mock("../services/assessments", () => ({
  assessmentsService: {
    listAssessments: vi.fn(),
    getAssessment: vi.fn(),
    startAttempt: vi.fn(),
    getAttemptState: vi.fn(),
    submitAttempt: vi.fn(),
    getHistory: vi.fn(),
  },
}))

vi.mock("../services/trainer", () => ({
  trainerService: {
    getDashboard: vi.fn(),
    listCourses: vi.fn(),
    createCourse: vi.fn(),
    getCourseDetail: vi.fn(),
    updateCourse: vi.fn(),
    addModule: vi.fn(),
    addLesson: vi.fn(),
    addResource: vi.fn(),
    listAssessments: vi.fn(),
    createAssessment: vi.fn(),
    getAssessment: vi.fn(),
    updateAssessment: vi.fn(),
    deleteAssessment: vi.fn(),
    addQuestion: vi.fn(),
    deleteQuestion: vi.fn(),
    getAssessmentResults: vi.fn(),
    getPerformance: vi.fn(),
  },
}))

vi.mock("../services/admin", () => ({
  adminService: {
    getDashboard: vi.fn(),
    listUsers: vi.fn(),
    updateUserStatus: vi.fn(),
    updateUserRole: vi.fn(),
    listCourses: vi.fn(),
    updateCourseStatus: vi.fn(),
    listAssessments: vi.fn(),
  },
}))

vi.mock("../services/courses", () => ({
  coursesService: {
    getCatalogue: vi.fn().mockResolvedValue({ categories: [] }),
  },
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })

const mockTrainee: AuthUser = {
  id: "u-trainee-1",
  email: "trainee@imd.gov.in",
  username: "trainee1",
  first_name: "Aakash",
  last_name: "Verma",
  role: "TRAINEE",
  account_status: "ACTIVE",
  is_active: true,
  is_verified: true,
}

const mockTrainer: AuthUser = {
  id: "u-trainer-1",
  email: "trainer@imd.gov.in",
  username: "trainer1",
  first_name: "Dr. Rajesh",
  last_name: "Kumar",
  role: "TRAINER",
  account_status: "ACTIVE",
  is_active: true,
  is_verified: true,
}

const mockAdmin: AuthUser = {
  id: "u-admin-1",
  email: "admin@imd.gov.in",
  username: "admin1",
  first_name: "Director",
  last_name: "General",
  role: "ADMIN",
  account_status: "ACTIVE",
  is_active: true,
  is_verified: true,
}

describe("Phase 4: Trainee Assessments, Trainer Portal & Admin Portal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // 1. Trainee Assessments Page
  it("renders trainee assessments and handles tab filtering", async () => {
    useAuthStore.setState({ user: mockTrainee, isAuthenticated: true, isLoading: false })
    vi.mocked(assessmentsService.listAssessments).mockResolvedValue([
      {
        id: "ass-1",
        course_id: "c-1",
        course_title: "General Meteorology",
        title: "Atmospheric Thermodynamics Quiz",
        description: "Covers dry and moist adiabatic lapse rates",
        assessment_type: "MCQ",
        passing_percentage: 60,
        total_marks: 25,
        duration_minutes: 30,
        max_attempts: 3,
        status: "PUBLISHED",
        questions_count: 25,
        user_attempts_count: 0,
        user_attempts_remaining: 3,
        best_score: null,
        is_passed: null,
      },
    ])
    vi.mocked(assessmentsService.getHistory).mockResolvedValue([])

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <TraineeAssessmentsPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText("Atmospheric Thermodynamics Quiz")).toBeDefined()
    expect(screen.getByText("Available (1)")).toBeDefined()
    expect(screen.getByText("Start Assessment")).toBeDefined()
  })

  // 2. Assessment Detail Page
  it("displays assessment details and rules before starting", async () => {
    useAuthStore.setState({ user: mockTrainee, isAuthenticated: true, isLoading: false })
    vi.mocked(assessmentsService.getAssessment).mockResolvedValue({
      id: "ass-1",
      course_id: "c-1",
      course_title: "General Meteorology",
      title: "Atmospheric Thermodynamics Quiz",
      description: "Detailed instructions and guidelines",
      assessment_type: "MCQ",
      passing_percentage: 60,
      total_marks: 25,
      duration_minutes: 30,
      max_attempts: 3,
      status: "PUBLISHED",
      questions_count: 25,
      user_attempts_count: 0,
      user_attempts_remaining: 3,
      questions: [],
    })

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={["/trainee/assessments/ass-1"]}>
          <Routes>
            <Route path="/trainee/assessments/:assessmentId" element={<AssessmentDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText("Begin Examination Attempt")).toBeDefined()
    expect(screen.getByText("Examination Guidelines")).toBeDefined()
    expect(screen.getByText("30 Mins")).toBeDefined()
  })

  // 3. Assessment Result Review Page
  it("renders evaluated examination review with answers and explanations", async () => {
    useAuthStore.setState({ user: mockTrainee, isAuthenticated: true, isLoading: false })
    vi.mocked(assessmentsService.getAttemptState).mockResolvedValue({
      attempt_id: "att-1",
      assessment_id: "ass-1",
      assessment_title: "Atmospheric Thermodynamics Quiz",
      course_title: "General Meteorology",
      attempt_number: 1,
      status: "EVALUATED",
      total_marks: 10,
      score_obtained: 10,
      percentage: 100,
      is_passed: true,
      started_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      questions: [
        {
          question_id: "q-1",
          question_text: "What gas composes ~78% of Earth's atmosphere?",
          marks: 10,
          marks_awarded: 10,
          selected_option_id: "opt-1",
          is_correct: true,
          explanation: "Nitrogen comprises approximately 78% by volume.",
          options: [
            { id: "opt-1", question_id: "q-1", option_text: "Nitrogen", order_index: 1, is_correct: true },
            { id: "opt-2", question_id: "q-1", option_text: "Oxygen", order_index: 2, is_correct: false },
          ],
        },
      ],
    })

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={["/trainee/assessments/ass-1/result/att-1"]}>
          <Routes>
            <Route path="/trainee/assessments/:assessmentId/result/:attemptId" element={<AssessmentResultPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText("Evaluation Passed")).toBeDefined()
    expect(screen.getByText("100%")).toBeDefined()
    expect(screen.getByText("Nitrogen comprises approximately 78% by volume.")).toBeDefined()
  })

  // 4. Trainer Dashboard
  it("renders trainer dashboard with real metrics and activity", async () => {
    useAuthStore.setState({ user: mockTrainer, isAuthenticated: true, isLoading: false })
    vi.mocked(trainerService.getDashboard).mockResolvedValue({
      courses_managed: 4,
      enrolled_trainees: 42,
      active_learners: 28,
      assessments_count: 5,
      average_assessment_score: 76.5,
      completion_rate: 68.0,
      recent_activity: [{ type: "ENROLLMENT", title: "Aakash Verma enrolled in Radar Meteorology", timestamp: new Date().toISOString() }],
      upcoming_deadlines: [],
    })

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <TrainerDashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText("Trainer Command Center")).toBeDefined()
    expect(screen.getByText("42")).toBeDefined()
    expect(screen.getByText("76.5%")).toBeDefined()
    expect(screen.getByText("Aakash Verma enrolled in Radar Meteorology")).toBeDefined()
  })

  // 5. Trainer Courses Management
  it("renders trainer courses list", async () => {
    useAuthStore.setState({ user: mockTrainer, isAuthenticated: true, isLoading: false })
    vi.mocked(trainerService.listCourses).mockResolvedValue([
      {
        id: "c-1",
        title: "Doppler Weather Radar Operations",
        code: "RAD-301",
        description: "Operating S-band and C-band radar network",
        category_id: "cat-1",
        category_name: "Radar Meteorology",
        difficulty_level: "INTERMEDIATE",
        duration_hours: 24,
        status: "PUBLISHED",
        enrolled_count: 15,
        modules_count: 4,
      },
    ])

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <TrainerCoursesPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText("Doppler Weather Radar Operations")).toBeDefined()
    expect(screen.getByText("RAD-301")).toBeDefined()
    expect(screen.getByText("Manage Syllabus")).toBeDefined()
  })

  // 6. Trainer Question Builder
  it("renders question builder form and configured question list", async () => {
    useAuthStore.setState({ user: mockTrainer, isAuthenticated: true, isLoading: false })
    vi.mocked(trainerService.getAssessment).mockResolvedValue({
      id: "ass-1",
      course_id: "c-1",
      course_title: "Radar Meteorology",
      title: "Radar Operations Assessment",
      description: "Exam rubric",
      assessment_type: "MCQ",
      passing_percentage: 65,
      total_marks: 10,
      duration_minutes: 20,
      max_attempts: 2,
      status: "PUBLISHED",
      questions_count: 1,
      user_attempts_count: 0,
      user_attempts_remaining: 2,
      questions: [
        {
          id: "q-1",
          assessment_id: "ass-1",
          question_text: "What does base reflectivity measure?",
          question_type: "MCQ_SINGLE",
          marks: 5,
          explanation: "Measures echoed power proportional to precipitation intensity.",
          order_index: 1,
          options: [
            { id: "o-1", question_id: "q-1", option_text: "Precipitation intensity", order_index: 1, is_correct: true },
            { id: "o-2", question_id: "q-1", option_text: "Wind direction only", order_index: 2, is_correct: false },
          ],
        },
      ],
    })

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={["/trainer/assessments/ass-1"]}>
          <Routes>
            <Route path="/trainer/assessments/:assessmentId" element={<TrainerAssessmentBuilderPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText("Add MCQ Question")).toBeDefined()
    expect(screen.getByText("What does base reflectivity measure?")).toBeDefined()
    expect(screen.getByText("Precipitation intensity")).toBeDefined()
  })

  // 7. Trainer Performance Table
  it("renders trainee performance monitoring table", async () => {
    useAuthStore.setState({ user: mockTrainer, isAuthenticated: true, isLoading: false })
    vi.mocked(trainerService.listCourses).mockResolvedValue([])
    vi.mocked(trainerService.getPerformance).mockResolvedValue({
      total_count: 1,
      page: 1,
      page_size: 20,
      items: [
        {
          trainee_id: "t-1",
          trainee_name: "Vikram Malhotra",
          trainee_email: "vikram@imd.gov.in",
          course_id: "c-1",
          course_title: "Satellite Meteorology",
          enrollment_status: "ACTIVE",
          enrolled_at: new Date().toISOString(),
          progress_percentage: 75.0,
          completed_lessons: 6,
          total_lessons: 8,
          assessment_attempts_count: 2,
          latest_score: 85.0,
          is_passed: true,
        },
      ],
    })

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <TrainerPerformancePage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText("Vikram Malhotra")).toBeDefined()
    expect(screen.getByText("75%")).toBeDefined()
    expect(screen.getByText("85%")).toBeDefined()
    expect(screen.getByText("PASS")).toBeDefined()
  })

  // 8. Admin Dashboard
  it("renders admin system dashboard with cross-institutional metrics", async () => {
    useAuthStore.setState({ user: mockAdmin, isAuthenticated: true, isLoading: false })
    vi.mocked(adminService.getDashboard).mockResolvedValue({
      total_users: 120,
      pending_users: 3,
      active_trainees: 95,
      active_trainers: 15,
      total_courses: 12,
      published_courses: 10,
      total_enrollments: 340,
      assessment_attempts: 215,
      certifications_count: 85,
      overall_completion_rate: 72.4,
      users_by_role: { TRAINEE: 100, TRAINER: 16, ADMIN: 4 },
      category_distribution: [{ category: "Radar Meteorology", count: 3 }],
      recent_activity: [],
    })

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText("Administrative Governance")).toBeDefined()
    expect(screen.getByText("120")).toBeDefined()
    expect(screen.getAllByText("3").length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText("340")).toBeDefined()
  })

  // 9. Admin User Governance
  it("renders admin user management table with approval actions", async () => {
    useAuthStore.setState({ user: mockAdmin, isAuthenticated: true, isLoading: false })
    vi.mocked(adminService.listUsers).mockResolvedValue([
      {
        id: "u-pending-1",
        email: "newtrainee@imd.gov.in",
        username: "new_trainee",
        first_name: "Kavita",
        last_name: "Iyer",
        role: "TRAINEE",
        account_status: "PENDING",
        is_active: false,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText("Kavita Iyer")).toBeDefined()
    expect(screen.getByText("PENDING APPROVAL")).toBeDefined()
    expect(screen.getByText("Approve")).toBeDefined()
    expect(screen.getByText("Reject")).toBeDefined()
  })

  // 10. Role-based Route Protection
  it("enforces role-based route guard and redirects unauthorized users", () => {
    useAuthStore.setState({ user: mockTrainee, isAuthenticated: true, isLoading: false })

    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <div>Super Secret Admin Panel</div>
              </ProtectedRoute>
            }
          />
          <Route path="/trainee/dashboard" element={<div>Redirected to Trainee Home</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.queryByText("Super Secret Admin Panel")).toBeNull()
    expect(screen.getByText("Redirected to Trainee Home")).toBeDefined()
  })
})
