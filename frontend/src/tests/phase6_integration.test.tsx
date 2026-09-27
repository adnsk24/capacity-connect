import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAuthStore, type AuthUser } from "../store/useAuthStore"

import { HomePage } from "../pages/HomePage"
import { LoginPage } from "../pages/LoginPage"
import { CourseDetailPage } from "../pages/CourseDetailPage"
import { coursesService } from "../services/courses"
import { feedbackService } from "../services/feedback"

// Mock services
vi.mock("../services/courses", () => ({
  coursesService: {
    getCourseDetails: vi.fn(),
    enrollInCourse: vi.fn(),
  },
}))

vi.mock("../services/feedback", () => ({
  feedbackService: {
    getCourseFeedback: vi.fn(),
    submitCourseFeedback: vi.fn(),
    getTrainerFeedback: vi.fn(),
    getAdminFeedback: vi.fn(),
  },
}))

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })

const mockTrainee: AuthUser = {
  id: "trainee-123",
  email: "trainee.demo@imd.gov.in",
  username: "trainee_demo",
  first_name: "Amit",
  last_name: "Kumar",
  role: "TRAINEE",
  account_status: "ACTIVE",
  is_active: true,
  is_verified: true,
}

const mockCourse = {
  id: "c-101",
  code: "MET-RADAR-01",
  title: "Doppler Weather Radar Operations",
  description: "Comprehensive radar interpretation for severe storms.",
  category: { id: "cat-1", name: "Radar Meteorology" },
  category_name: "Radar Meteorology",
  difficulty_level: "INTERMEDIATE",
  estimated_hours: 30,
  is_enrolled: true,
  progress_percentage: 60,
  completed_lessons_count: 6,
  total_lessons_count: 10,
  modules: [],
  resources: [],
  competencies: [],
}

const mockFeedbackData = {
  course_id: "c-101",
  course_title: "Doppler Weather Radar Operations",
  average_course_rating: 4.8,
  average_trainer_rating: 4.9,
  feedback_count: 12,
  feedbacks: [
    {
      id: "f-1",
      user_id: "u-1",
      user_name: "Pooja Verma",
      course_id: "c-101",
      course_rating: 5,
      trainer_rating: 5,
      content_rating: 5,
      comments: "Outstanding radar analysis case studies with practical echo examples.",
      created_at: "2026-09-25T10:00:00Z",
    },
  ],
}

describe("Phase 6: Final Integration, Hardening & Demo Readiness", () => {
  // 1. Landing Page renders value proposition
  it("renders polished landing page with meteorological identity and core pillars", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByText(/Capacity Connect • IMD Digital Capacity Building Portal/i)).toBeDefined()
    expect(screen.getByText(/Competency Intelligence/i)).toBeDefined()
    expect(screen.getByText("Explainable Competency Engine")).toBeDefined()
    expect(screen.getByText("3D Competency Universe")).toBeDefined()
    expect(screen.getByText("The Capacity Building Lifecycle")).toBeDefined()
  })

  // 2. Evaluator Quick-Fill buttons on LoginPage
  it("autofills synthetic demo credentials when quick-fill buttons are clicked", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    const traineeBtn = screen.getByText("Trainee")
    fireEvent.click(traineeBtn)

    const identifierInput = screen.getByPlaceholderText("trainee@imd.gov.in") as HTMLInputElement
    expect(identifierInput.value).toBe("trainee.demo@imd.gov.in")

    const trainerBtn = screen.getByText("Trainer")
    fireEvent.click(trainerBtn)
    expect(identifierInput.value).toBe("trainer.demo@imd.gov.in")

    const adminBtn = screen.getByText("Admin")
    fireEvent.click(adminBtn)
    expect(identifierInput.value).toBe("admin.demo@imd.gov.in")
  })

  // 3. CourseDetailPage renders feedback and evaluation section
  it("renders course feedback metrics and evaluation section for enrolled trainee", async () => {
    useAuthStore.setState({ user: mockTrainee, isAuthenticated: true, isLoading: false })
    vi.mocked(coursesService.getCourseDetails).mockResolvedValue(mockCourse as any)
    vi.mocked(feedbackService.getCourseFeedback).mockResolvedValue(mockFeedbackData)

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={["/courses/c-101"]}>
          <Routes>
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText("Course & Instructor Evaluations")).toBeDefined()
    expect(await screen.findByText("Submit Your Evaluation")).toBeDefined()
    expect(await screen.findByText("Pooja Verma")).toBeDefined()
    expect(await screen.findByText(/Outstanding radar analysis case studies/i)).toBeDefined()
  })
})
