import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CourseCataloguePage } from "../pages/CourseCataloguePage"
import { CourseDetailPage } from "../pages/CourseDetailPage"
import { AppShell } from "../components/layout/AppShell"
import { TraineeLayout } from "../components/layout/TraineeLayout"
import { TraineeCoursesPage } from "../pages/TraineeCoursesPage"
import { coursesService } from "../services/courses"
import { useAuthStore, type AuthUser } from "../store/useAuthStore"
import { ProtectedRoute } from "../components/auth/ProtectedRoute"

// Mock courses service
vi.mock("../services/courses", () => ({
  coursesService: {
    getCatalogue: vi.fn(),
    getCategories: vi.fn(),
    getCourseDetails: vi.fn(),
    enrollInCourse: vi.fn(),
    getLearningContent: vi.fn(),
  },
}))

const mockCourses = {
  items: [
    {
      id: "course-101",
      code: "MET-101",
      title: "Introduction to Operational Meteorology",
      description: "Atmospheric thermodynamics, cloud physics, and observation techniques.",
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
        id: "tr-1",
        first_name: "Dr. Rajesh",
        last_name: "Patel",
      },
      assessment_types: ["MCQ Exam"],
    },
    {
      id: "course-102",
      code: "RAD-201",
      title: "Doppler Weather Radar Interpretation and Severe Storm Warning",
      description: "Advanced principles of dual-polarization radar operations and storm warning.",
      category_id: "cat-2",
      category_code: "RADAR",
      category_name: "Radar Meteorology",
      difficulty_level: "ADVANCED",
      duration_hours: 45,
      total_modules: 5,
      total_lessons: 20,
      passing_marks: "75% Pass Mark",
      is_enrolled: false,
      progress_percentage: 0,
      trainer: {
        id: "tr-2",
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

describe("Public Course Catalogue Responsive Redesign Suite", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    ;(coursesService.getCatalogue as any).mockResolvedValue(mockCourses)
  })

  it("renders public Course Catalogue inside Container with max-w-[1360px] and responsive padding", async () => {
    const { container } = render(
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

    // Heading exists
    expect(await screen.findByText("Course Catalogue")).toBeDefined()

    // Container alignment check: contains max-w-[1360px] and responsive padding
    const containerDiv = container.querySelector(".max-w-\\[1360px\\]")
    expect(containerDiv).toBeDefined()
    expect(containerDiv?.className).toContain("px-4")
    expect(containerDiv?.className).toContain("sm:px-6")
    expect(containerDiv?.className).toContain("md:px-10")
    expect(containerDiv?.className).toContain("xl:px-[60px]")
  })

  it("renders responsive grid with 1-col mobile, 2-col tablet, 3-col desktop, 4-col large desktop", async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/courses"]}>
          <Routes>
            <Route path="/courses" element={<CourseCataloguePage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await screen.findByText("Introduction to Operational Meteorology")

    // Check grid element classes
    const grid = container.querySelector(".grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4")
    expect(grid).toBeDefined()
    expect(grid?.className).toContain("gap-4")
    expect(grid?.className).toContain("sm:gap-5")
    expect(grid?.className).toContain("lg:gap-6")
  })

  it("renders course cards with aspect-[16/10] responsive images and structured buttons", async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/courses"]}>
          <Routes>
            <Route path="/courses" element={<CourseCataloguePage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await screen.findByText("Introduction to Operational Meteorology")

    // Image aspect ratio
    const imgContainers = container.querySelectorAll(".aspect-\\[16\\/10\\]")
    expect(imgContainers.length).toBe(2)

    // View Course links point to public /courses/:id
    const viewCourseLinks = screen.getAllByRole("link", { name: /view course/i })
    expect(viewCourseLinks[0].getAttribute("href")).toBe("/courses/course-101")
    expect(viewCourseLinks[1].getAttribute("href")).toBe("/courses/course-102")
  })

  it("handles search input filtering and displays clear button", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/courses"]}>
          <Routes>
            <Route path="/courses" element={<CourseCataloguePage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    const searchInput = (await screen.findByPlaceholderText(/search by title/i)) as HTMLInputElement
    expect(searchInput).toBeDefined()

    // Type search
    fireEvent.change(searchInput, { target: { value: "Radar" } })
    expect(searchInput.value).toBe("Radar")

    // Clear button appears
    const clearBtn = screen.getByTitle(/clear search input/i)
    expect(clearBtn).toBeDefined()

    // Click clear button
    fireEvent.click(clearBtn)
    expect(searchInput.value).toBe("")
  })

  it("handles level filter buttons and resets filters cleanly", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/courses"]}>
          <Routes>
            <Route path="/courses" element={<CourseCataloguePage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await screen.findByText("Introduction to Operational Meteorology")

    // Click 'Advanced' level
    const advancedBtn = screen.getByRole("button", { name: "Advanced" })
    fireEvent.click(advancedBtn)

    // Reset Filters button appears
    const resetBtn = await screen.findByRole("button", { name: /reset filters/i })
    expect(resetBtn).toBeDefined()

    // Click Reset
    fireEvent.click(resetBtn)
    expect(screen.queryByRole("button", { name: /reset filters/i })).toBeNull()
  })

  it("handles category discipline tabs selection", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/courses"]}>
          <Routes>
            <Route path="/courses" element={<CourseCataloguePage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    await screen.findByText("Introduction to Operational Meteorology")

    const radarCategoryBtn = screen.getByRole("button", { name: /radar meteorology/i })
    expect(radarCategoryBtn).toBeDefined()

    fireEvent.click(radarCategoryBtn)

    // Reset Filters button appears when category selected
    const resetBtn = await screen.findByRole("button", { name: /reset filters/i })
    expect(resetBtn).toBeDefined()
  })

  it("confirms that Trainee Course Catalogue is independent and retains trainee layout", async () => {
    const mockTrainee: AuthUser = {
      id: "tr-1",
      email: "trainee@imd.gov.in",
      username: "trainee",
      first_name: "Amit",
      last_name: "Sharma",
      role: "TRAINEE",
      account_status: "ACTIVE",
      is_active: true,
      is_verified: true,
    }
    useAuthStore.getState().setSession("tok", "ref", mockTrainee)

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

    // Trainee portal shell is preserved
    expect(await screen.findByText("IMD · Trainee Portal")).toBeDefined()
    expect(screen.getByText("Navigation")).toBeDefined()

    // Wait for courses to render
    await screen.findByText("Introduction to Operational Meteorology")

    // Course cards link to /trainee/courses/:id
    const viewCourseLinks = screen.getAllByRole("link", { name: /view course/i })
    expect(viewCourseLinks[0].getAttribute("href")).toBe("/trainee/courses/course-101")
  })

  it("renders public course details under AppShell with mobile container padding and wrapping breadcrumbs", async () => {
    const mockDetail = {
      id: "course-102",
      code: "RAD-201",
      title: "Doppler Weather Radar Interpretation and Severe Storm Warning",
      description: "Advanced principles of dual-polarization radar operations and storm warning.",
      objectives: "Operate radar workstations with high accuracy.",
      prerequisites: "General meteorology foundations.",
      status: "PUBLISHED",
      difficulty_level: "ADVANCED" as const,
      duration_hours: 45,
      category: { id: "cat-2", name: "Radar Meteorology", code: "RADAR" },
      trainer: {
        id: "tr-2",
        first_name: "Sunita",
        last_name: "Rao",
        email: "sunita.rao@imd.gov.in",
        designation: "Senior Radar Specialist",
      },
      modules: [
        {
          id: "m-1",
          course_id: "course-102",
          title: "Radar Calibration Fundamentals",
          order_index: 1,
          lessons: [
            {
              id: "l-1",
              module_id: "m-1",
              title: "Beam Propagation & Refraction",
              order_index: 1,
              duration_minutes: 40,
              content_type: "TEXT",
              is_mandatory: true,
              is_completed: false,
              resources: [],
            },
          ],
        },
      ],
      resources: [],
      competencies: [
        {
          id: "comp-1",
          name: "Dual-Pol Interpretation",
          code: "COMP-DUAL-POL",
          category: "Radar",
          target_level: 4,
          contribution_weight: 0.8,
        },
      ],
      is_enrolled: false,
      completed_lessons_count: 0,
      total_lessons_count: 1,
    }

    vi.mocked(coursesService.getCourseDetails).mockResolvedValue(mockDetail)
    useAuthStore.getState().clearSession()

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/courses/course-102"]}>
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route path="courses/:courseId" element={<CourseDetailPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for title to appear
    expect(await screen.findByRole("heading", { name: /Doppler Weather Radar Interpretation/i, level: 1 })).toBeDefined()

    // 1. Mobile & guest container padding exists (not flush with 0px viewport)
    const guestWrapper = container.querySelector("main .bg-\\[\\#F7F9FC\\]")
    expect(guestWrapper).not.toBeNull()
    expect(guestWrapper?.className).toContain("px-4")
    expect(guestWrapper?.className).toContain("sm:px-6")

    // 2. Breadcrumbs have wrapping class preventing blowout
    const breadcrumbNav = container.querySelector("main nav")
    expect(breadcrumbNav?.className).toContain("flex-wrap")
    expect(breadcrumbNav?.className).toContain("min-w-0")

    // 3. Grid ordering: Course Access is order-1 on mobile, Curriculum is order-2
    const rightCol = container.querySelector(".order-1.lg\\:order-2")
    const leftCol = container.querySelector(".order-2.lg\\:order-1")
    expect(rightCol).not.toBeNull()
    expect(leftCol).not.toBeNull()

    // 4. For guest (not logged in), single Course Access card provides "Sign in to Enroll"
    const signInButton = screen.getByRole("link", { name: /sign in to enroll/i })
    expect(signInButton).toBeDefined()
    expect(signInButton.getAttribute("href")).toBe("/login")
  })
})

