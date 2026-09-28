import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAuthStore, type AuthUser } from "../store/useAuthStore"
import { ProtectedRoute } from "../components/auth/ProtectedRoute"
import { TraineeLayout } from "../components/layout/TraineeLayout"
import { AppShell } from "../components/layout/AppShell"
import { TraineeCoursesPage } from "../pages/TraineeCoursesPage"
import { CourseCataloguePage } from "../pages/CourseCataloguePage"
import { CourseDetailPage } from "../pages/CourseDetailPage"
import { TraineeDashboardPage } from "../pages/TraineeDashboardPage"
import { coursesService } from "../services/courses"
import { traineeService } from "../services/trainee"

// Mock services
vi.mock("../services/courses", () => ({
  coursesService: {
    getCatalogue: vi.fn(),
    getCategories: vi.fn(),
    getCourseDetails: vi.fn(),
    enrollInCourse: vi.fn(),
    getLearningContent: vi.fn(),
  },
}))

vi.mock("../services/trainee", () => ({
  traineeService: {
    getDashboard: vi.fn(),
    getMyLearning: vi.fn(),
  },
}))

vi.mock("../services/feedback", () => ({
  feedbackService: {
    getCourseFeedback: vi.fn().mockResolvedValue({
      average_course_rating: 4.8,
      feedback_count: 12,
      feedbacks: [],
    }),
    submitCourseFeedback: vi.fn(),
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

const mockTrainerUser: AuthUser = {
  id: "user-trainer-456",
  email: "trainer@imd.gov.in",
  username: "trainer_p",
  first_name: "Dr. Rajesh",
  last_name: "Patel",
  role: "TRAINER",
  account_status: "ACTIVE",
  is_active: true,
  is_verified: true,
}

const mockCoursesCatalogue = {
  items: [
    {
      id: "course-101",
      code: "MET-101",
      title: "Introduction to Operational Meteorology",
      description: "Fundamental meteorological atmospheric physics and observation methods.",
      category_id: "cat-1",
      category_code: "GEN-MET",
      category_name: "General Meteorology",
      difficulty_level: "BEGINNER",
      duration_hours: 30,
      total_modules: 4,
      total_lessons: 16,
      passing_marks: "60% Pass Mark",
      is_enrolled: false,
      progress_percentage: 0,
      trainer: {
        id: "trainer-1",
        first_name: "Dr. Rajesh",
        last_name: "Patel",
      },
      assessment_types: ["MCQ Exam"],
    },
    {
      id: "course-102",
      code: "RAD-201",
      title: "Doppler Weather Radar Interpretation",
      description: "Interpretation of reflectivity and radial velocity for severe weather.",
      category_id: "cat-2",
      category_code: "RADAR",
      category_name: "Radar Meteorology",
      difficulty_level: "INTERMEDIATE",
      duration_hours: 45,
      total_modules: 5,
      total_lessons: 20,
      passing_marks: "70% Pass Mark",
      is_enrolled: true,
      progress_percentage: 40,
      trainer: {
        id: "trainer-2",
        first_name: "Sunita",
        last_name: "Rao",
      },
      assessment_types: ["Practical Simulation"],
    },
  ],
  total: 2,
  page: 1,
  pageSize: 12,
  total_pages: 1,
  categories: [
    { id: "cat-1", name: "General Meteorology", code: "GEN-MET", course_count: 1 },
    { id: "cat-2", name: "Radar Meteorology", code: "RADAR", course_count: 1 },
  ],
}

const mockCourseDetail = {
  id: "course-101",
  code: "MET-101",
  title: "Introduction to Operational Meteorology",
  description: "Fundamental meteorological atmospheric physics and observation methods.",
  category: { id: "cat-1", name: "General Meteorology", code: "GEN-MET" },
  difficulty_level: "BEGINNER",
  duration_hours: 30,
  total_lessons_count: 16,
  completed_lessons_count: 0,
  is_enrolled: false,
  progress_percentage: 0,
  trainer: {
    first_name: "Dr. Rajesh",
    last_name: "Patel",
    designation: "Lead Instructor",
  },
  modules: [
    {
      id: "mod-1",
      title: "Atmospheric Thermodynamics",
      lessons: [
        { id: "les-1", title: "Atmospheric Layers", duration_minutes: 45, is_completed: false },
      ],
    },
  ],
  competencies: [],
  resources: [],
}

describe("Trainee Course Catalogue Navigation & Portal Separation", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    ;(coursesService.getCatalogue as any).mockResolvedValue(mockCoursesCatalogue)
    ;(coursesService.getCourseDetails as any).mockResolvedValue(mockCourseDetail)
    ;(traineeService.getDashboard as any).mockResolvedValue({
      welcome_message: "Welcome Ananya",
      user_summary: mockTraineeUser,
      profile_completion_percentage: 80,
      courses_enrolled_count: 1,
      courses_completed_count: 0,
      average_progress_percentage: 40,
      recent_learning: [],
      upcoming_assessments: [],
      competencies: [],
      certificates: [],
    })
  })

  it("renders public Course Catalogue inside public AppShell for unauthenticated users", async () => {
    useAuthStore.setState({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null, isLoading: false })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/courses"]}>
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route path="courses" element={<CourseCataloguePage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Should render public catalogue header
    expect(await screen.findByText("Course Catalogue")).toBeDefined()
    expect(screen.getByText("Official Curriculum")).toBeDefined()
    // Should render course items
    expect(await screen.findByText("Introduction to Operational Meteorology")).toBeDefined()

    // Public course cards should point to /courses/course-101
    const viewCourseLinks = screen.getAllByRole("link", { name: /view course/i })
    expect(viewCourseLinks[0].getAttribute("href")).toBe("/courses/course-101")
  })

  it("renders TraineeSidebar with Course Catalogue linking to /trainee/courses", async () => {
    useAuthStore.getState().setSession("mock-token", "mock-refresh", mockTraineeUser)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/trainee/dashboard"]}>
          <Routes>
            <Route
              path="/trainee"
              element={
                <ProtectedRoute allowedRoles={["TRAINEE"]}>
                  <TraineeLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<TraineeDashboardPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Verify Trainee Portal brand header
    expect(await screen.findByText("IMD · Trainee Portal")).toBeDefined()

    // Find the Course Catalogue link in the sidebar
    const catalogueNavLink = screen.getByRole("link", { name: /course catalogue/i })
    expect(catalogueNavLink).toBeDefined()
    expect(catalogueNavLink.getAttribute("href")).toBe("/trainee/courses")
  })

  it("navigates to /trainee/courses when Trainee Dashboard 'Browse Courses' is clicked", async () => {
    useAuthStore.getState().setSession("mock-token", "mock-refresh", mockTraineeUser)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/trainee/dashboard"]}>
          <Routes>
            <Route
              path="/trainee"
              element={
                <ProtectedRoute allowedRoles={["TRAINEE"]}>
                  <TraineeLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<TraineeDashboardPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    const browseLink = await screen.findByRole("link", { name: /browse courses/i })
    expect(browseLink).toBeDefined()
    expect(browseLink.getAttribute("href")).toBe("/trainee/courses")
  })

  it("renders TraineeCoursesPage within TraineeLayout shell and links courses to /trainee/courses/:id", async () => {
    useAuthStore.getState().setSession("mock-token", "mock-refresh", mockTraineeUser)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/trainee/courses"]}>
          <Routes>
            <Route
              path="/trainee"
              element={
                <ProtectedRoute allowedRoles={["TRAINEE"]}>
                  <TraineeLayout />
                </ProtectedRoute>
              }
            >
              <Route path="courses" element={<TraineeCoursesPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Shell check: IMD Trainee Portal sidebar header must be present
    expect(await screen.findByText("IMD · Trainee Portal")).toBeDefined()
    expect(screen.getByText("Navigation")).toBeDefined()

    // Trainee Course Catalogue content check
    expect(await screen.findByText("Introduction to Operational Meteorology")).toBeDefined()
    expect(screen.getByText("Doppler Weather Radar Interpretation")).toBeDefined()

    // Course cards in trainee portal must link to /trainee/courses/:id
    const viewCourseButtons = screen.getAllByRole("link", { name: /view course/i })
    expect(viewCourseButtons[0].getAttribute("href")).toBe("/trainee/courses/course-101")
    expect(viewCourseButtons[1].getAttribute("href")).toBe("/trainee/courses/course-102")

    // Enrolled course continue button points to learning viewer
    const continueButton = screen.getByRole("link", { name: /continue/i })
    expect(continueButton.getAttribute("href")).toBe("/courses/course-102/learn")
  })

  it("renders contextual breadcrumbs linking to /trainee/courses on Trainee Course Detail view", async () => {
    useAuthStore.getState().setSession("mock-token", "mock-refresh", mockTraineeUser)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/trainee/courses/course-101"]}>
          <Routes>
            <Route
              path="/trainee"
              element={
                <ProtectedRoute allowedRoles={["TRAINEE"]}>
                  <TraineeLayout />
                </ProtectedRoute>
              }
            >
              <Route path="courses/:courseId" element={<CourseDetailPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Shell check
    expect(await screen.findByText("IMD · Trainee Portal")).toBeDefined()

    // Breadcrumb check
    const catalogueBreadcrumb = await screen.findByRole("link", { name: "Course Catalogue" })
    expect(catalogueBreadcrumb.getAttribute("href")).toBe("/trainee/courses")
  })

  it("blocks unauthenticated users from directly accessing /trainee/courses", async () => {
    useAuthStore.setState({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null, isLoading: false })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/trainee/courses"]}>
          <Routes>
            <Route
              path="/trainee"
              element={
                <ProtectedRoute allowedRoles={["TRAINEE"]}>
                  <TraineeLayout />
                </ProtectedRoute>
              }
            >
              <Route path="courses" element={<TraineeCoursesPage />} />
            </Route>
            <Route path="/login" element={<div>Login Page Redirected</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Must be redirected to login
    expect(await screen.findByText("Login Page Redirected")).toBeDefined()
    expect(screen.queryByText("IMD · Trainee Portal")).toBeNull()
  })

  it("blocks non-trainee users (e.g. TRAINER) from accessing /trainee/courses via RBAC", async () => {
    useAuthStore.getState().setSession("mock-trainer-token", "mock-trainer-refresh", mockTrainerUser)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/trainee/courses"]}>
          <Routes>
            <Route
              path="/trainee"
              element={
                <ProtectedRoute allowedRoles={["TRAINEE"]}>
                  <TraineeLayout />
                </ProtectedRoute>
              }
            >
              <Route path="courses" element={<TraineeCoursesPage />} />
            </Route>
            <Route path="/trainer/dashboard" element={<div>Trainer Dashboard Redirected</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Must be redirected by RoleDashboardRedirect to trainer dashboard
    expect(await screen.findByText("Trainer Dashboard Redirected")).toBeDefined()
    expect(screen.queryByText("IMD · Trainee Portal")).toBeNull()
  })
})
