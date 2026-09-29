import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TraineeAiNotebookPage } from "../pages/TraineeAiNotebookPage"
import { TrainerAiQuizGeneratorPage } from "../pages/TrainerAiQuizGeneratorPage"
import { TraineeStudyGuidePage } from "../pages/TraineeStudyGuidePage"
import { TrainerAiKnowledgePage } from "../pages/TrainerAiKnowledgePage"
import { aiService, AIQuizDraftItem, AIKnowledgeItem, AIStudyGuideResponse } from "../services/aiService"
import { coursesService } from "../services/courses"
import { trainerService } from "../services/trainer"

// Mock services
vi.mock("../services/aiService", () => ({
  aiService: {
    getNotebookResources: vi.fn(),
    askNotebook: vi.fn(),
    generateQuizQuestions: vi.fn(),
    getQuizDrafts: vi.fn(),
    updateQuizDraft: vi.fn(),
    approveQuizDraft: vi.fn(),
    rejectQuizDraft: vi.fn(),
    deleteQuizDraft: vi.fn(),
    generateStudyGuide: vi.fn(),
    generateFaqs: vi.fn(),
    generateGlossary: vi.fn(),
    getKnowledgeDrafts: vi.fn(),
    updateKnowledgeDraft: vi.fn(),
    reviewKnowledgeDraft: vi.fn(),
    generateCompetencyDiagnostic: vi.fn(),
    explainTrainerMatch: vi.fn(),
  },
}))

vi.mock("../services/courses", async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    coursesService: {
      ...actual.coursesService,
      getCatalogue: vi.fn(),
      getCourseDetails: vi.fn(),
    },
  }
})

vi.mock("../services/trainer", async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    trainerService: {
      ...actual.trainerService,
      listCourses: vi.fn(),
      getCourseDetail: vi.fn(),
      listAssessments: vi.fn(),
    },
  }
})

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })

describe("Phase 7: Grounded AI Intelligence Layer - Frontend Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(coursesService.getCatalogue).mockResolvedValue({
      items: [
        {
          id: "c-101",
          code: "DWR-01",
          title: "Doppler Weather Radar Operations",
          description: "Radar theory and severe weather tracking",
          difficulty_level: "INTERMEDIATE",
          duration_hours: 40,
          category_id: "cat-1",
          category_name: "Radar Meteorology",
          category_code: "RM",
          total_modules: 4,
          total_lessons: 12,
          competencies: [],
          is_enrolled: true,
          enrollment_count: 24,
        },
      ],
      total: 1,
      page: 1,
      page_size: 50,
      total_pages: 1,
      categories: [],
    })

    vi.mocked(coursesService.getCourseDetails).mockResolvedValue({
      id: "c-101",
      code: "DWR-01",
      title: "Doppler Weather Radar Operations",
      status: "PUBLISHED",
      difficulty_level: "INTERMEDIATE",
      duration_hours: 40,
      category: { id: "cat-1", name: "Radar Meteorology", code: "RM" },
      modules: [
        {
          id: "mod-1",
          course_id: "c-101",
          title: "Radar Echo Interpretation",
          order_index: 1,
          lessons: [],
        },
      ],
      resources: [],
      competencies: [],
      is_enrolled: true,
      completed_lessons_count: 2,
      total_lessons_count: 10,
    })

    vi.mocked(trainerService.listCourses).mockResolvedValue([
      {
        id: "c-101",
        title: "Doppler Weather Radar Operations",
        code: "DWR-01",
        category_id: "cat-1",
        category_name: "Radar Meteorology",
        difficulty_level: "INTERMEDIATE",
        duration_hours: 40,
        status: "PUBLISHED",
        enrolled_count: 24,
        modules_count: 4,
      },
    ])

    vi.mocked(trainerService.getCourseDetail).mockResolvedValue({
      id: "c-101",
      title: "Doppler Weather Radar Operations",
      code: "DWR-01",
      category_id: "cat-1",
      category_name: "Radar Meteorology",
      difficulty_level: "INTERMEDIATE",
      duration_hours: 40,
      status: "PUBLISHED",
      enrolled_count: 24,
      modules_count: 4,
      modules: [
        {
          id: "mod-1",
          title: "Radar Echo Interpretation",
          order_index: 1,
          lessons: [],
        },
      ],
      resources: [],
    })

    vi.mocked(trainerService.listAssessments).mockResolvedValue([
      {
        id: "asm-1",
        course_id: "c-101",
        course_title: "Doppler Weather Radar Operations",
        title: "Mid-Term Radar Analysis",
        assessment_type: "EXAM",
        passing_percentage: 70,
        total_marks: 50,
        status: "ACTIVE",
        max_attempts: 3,
        questions_count: 10,
        user_attempts_count: 5,
        user_attempts_remaining: 1,
      },
    ])

    vi.mocked(aiService.getNotebookResources).mockResolvedValue([
      {
        id: "res-1",
        title: "DWR Operational Manual 2024",
        resource_type: "DOCUMENT",
        module_id: "mod-1",
        ai_enabled: true,
        ai_approved: true,
      },
    ])

    vi.mocked(aiService.getQuizDrafts).mockResolvedValue([])
    vi.mocked(aiService.getKnowledgeDrafts).mockResolvedValue([])
  })

  // TEST 1: Trainee AI Notebook Q&A with Citation Display
  it("FLOW 1: Trainee AI Notebook submits question, retrieves grounded answer, and displays citations", async () => {
    vi.mocked(aiService.askNotebook).mockResolvedValue({
      answer: "A hook echo indicates strong cyclonic rotation within a supercell storm. [[Source: DWR Operational Manual 2024, Page: 42, Section: \"Supercell Echo Signatures\"]]",
      citations: ["[[Source: DWR Operational Manual 2024, Page: 42, Section: \"Supercell Echo Signatures\"]]"],
      retrieved_chunk_count: 2,
      evidence_found: true,
    })

    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TraineeAiNotebookPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Verify Grounded banner & source presence
    expect(screen.getByText(/AI Capacity Notebook/i)).toBeTruthy()
    expect(screen.getByText(/Grounded in Selected Training Materials/i)).toBeTruthy()

    await waitFor(() => {
      expect(screen.getByText("DWR Operational Manual 2024")).toBeTruthy()
    })

    // Input question and submit
    const input = screen.getByPlaceholderText(/Ask about Doppler thresholds/i)
    fireEvent.change(input, { target: { value: "What does a hook echo indicate?" } })
    fireEvent.submit(input.closest("form")!)

    // Verify response
    await waitFor(() => {
      expect(screen.getByText(/A hook echo indicates strong cyclonic rotation/i)).toBeTruthy()
    })
  })

  // TEST 2: Trainee AI Notebook Insufficient Evidence Refusal
  it("FLOW 1 Refusal: Trainee AI Notebook displays refusal banner when evidence is insufficient", async () => {
    vi.mocked(aiService.askNotebook).mockResolvedValueOnce({
      answer: "I couldn't find sufficient evidence in the selected training materials to answer this question.",
      citations: [],
      retrieved_chunk_count: 0,
      evidence_found: false,
    })

    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TraineeAiNotebookPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("DWR Operational Manual 2024")).toBeTruthy()
    })

    const input = screen.getByPlaceholderText(/Ask about Doppler thresholds/i)
    fireEvent.change(input, { target: { value: "What is the capital of Mars?" } })
    fireEvent.submit(input.closest("form")!)

    await waitFor(() => {
      expect(screen.getByText(/Insufficient evidence in selected training materials/i)).toBeTruthy()
      expect(
        screen.getByText(/I couldn't find sufficient evidence in the selected training materials to answer this question/i)
      ).toBeTruthy()
    })
  })

  // TEST 3: Trainer AI Quiz Studio Bloom Generation & Human Approval
  it("FLOW 2: Trainer AI Quiz Studio displays Bloom L3/L4 questions with PENDING REVIEW and approves to bank", async () => {
    const mockDraft: AIQuizDraftItem = {
      id: "draft-q-1",
      content_type: "QUIZ_QUESTION",
      course_id: "c-101",
      module_id: "mod-1",
      created_by: "trainer-1",
      status: "PENDING_REVIEW",
      review_status: "AI GENERATED — PENDING REVIEW",
      question: "Which operational action is required when a hook echo is detected?",
      options: [
        { option_text: "Issue severe weather warning immediately", is_correct: true },
        { option_text: "Ignore echo as clutter", is_correct: false },
        { option_text: "Power down radar", is_correct: false },
        { option_text: "Calibrate frequency", is_correct: false },
      ],
      correct_answer: "A",
      explanation: "A hook echo signifies strong cyclonic rotation warranting a warning.",
      difficulty: "INTERMEDIATE",
      bloom_level: "Bloom Level 4 — Analyze",
      marks: 1,
      source_citation: "[[Source: DWR Operational Manual 2024, Page: 42, Section: \"Supercell Echo Signatures\"]]",
    }

    vi.mocked(aiService.getQuizDrafts).mockResolvedValue([mockDraft])
    vi.mocked(aiService.approveQuizDraft).mockResolvedValue({
      ...mockDraft,
      status: "APPROVED",
      review_status: "APPROVED",
    })

    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TrainerAiQuizGeneratorPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getAllByText("AI GENERATED — PENDING REVIEW").length).toBeGreaterThan(0)
      expect(screen.getByText("Bloom Level 4 — Analyze")).toBeTruthy()
      expect(screen.getByText(/Which operational action is required when a hook echo is detected\?/i)).toBeTruthy()
    })

    // Click Approve button
    const approveBtn = screen.getByRole("button", { name: /Approve/i })
    fireEvent.click(approveBtn)

    await waitFor(() => {
      expect(aiService.approveQuizDraft).toHaveBeenCalledWith("draft-q-1", "asm-1")
    })
  })

  // TEST 4: Trainee AI Study Guide 6-Part Structure
  it("FLOW 5: Trainee AI Study Guide generates 6-part grounded revision document", async () => {
    const mockGuide: AIStudyGuideResponse = {
      id: "sg-101",
      course_id: "c-101",
      course_title: "Doppler Weather Radar Operations",
      guide: {
        topic_overview: "Radar echo interpretation focusing on reflectivity and Doppler velocity fields.",
        key_concepts: [
          "Base Reflectivity (Z)",
          "Radial Velocity (V)",
          "Spectrum Width (SW)",
        ],
        important_terminology: [
          {
            term: "Hook Echo",
            definition: "A pendant curved reflectivity pattern associated with mesocyclones.",
          },
        ],
        concept_explanations: [
          {
            title: "Velocity Aliasing",
            explanation: "Ambiguity occurring when radial velocity exceeds the maximum unambiguous Nyquist velocity.",
          },
        ],
        revision_points: [
          "Always cross-reference reflectivity cores with storm-relative velocity.",
          "Verify Nyquist interval before interpreting high-speed outflow boundaries.",
        ],
        self_check_questions: [
          {
            question: "How do you distinguish ground clutter from true precipitation echoes?",
            hint: "Check spectrum width and near-zero radial velocity characteristics.",
          },
        ],
        source_citation: "[[Source: DWR Operational Manual 2024, Page: 42, Section: \"Supercell Echo Signatures\"]]",
      },
      created_at: new Date().toISOString(),
    }

    vi.mocked(aiService.generateStudyGuide).mockResolvedValueOnce(mockGuide)

    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TraineeStudyGuidePage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText("DWR Operational Manual 2024")).toBeTruthy()
    })

    const generateBtn = screen.getByRole("button", { name: /Generate Study Guide/i })
    fireEvent.click(generateBtn)

    await waitFor(() => {
      expect(screen.getByText(/Operational Topic Overview/i)).toBeTruthy()
      expect(screen.getByText(/Base Reflectivity \(Z\)/i)).toBeTruthy()
      expect(screen.getByText(/Hook Echo/i)).toBeTruthy()
      expect(screen.getByText(/Velocity Aliasing/i)).toBeTruthy()
      expect(screen.getByText(/Always cross-reference reflectivity cores/i)).toBeTruthy()
      expect(screen.getByText(/How do you distinguish ground clutter from true precipitation echoes\?/i)).toBeTruthy()
    })
  })

  // TEST 5: Trainer AI Knowledge Base FAQ & Glossary
  it("FLOW 6: Trainer AI Knowledge Base handles FAQ and Glossary review workflow", async () => {
    const mockFaqDraft: AIKnowledgeItem = {
      id: "faq-1",
      content_type: "FAQ",
      course_id: "c-101",
      status: "PENDING_REVIEW",
      review_status: "AI GENERATED — PENDING REVIEW",
      question: "What is the Nyquist Velocity limit?",
      answer: "The maximum unambiguous velocity measurable by a pulsed Doppler radar without velocity folding.",
      source_citation: "[[Source: DWR Operational Manual 2024, Page: 45, Section: \"Doppler Ambiguity\"]]",
      created_at: new Date().toISOString(),
    }

    vi.mocked(aiService.getKnowledgeDrafts).mockResolvedValue([mockFaqDraft])

    const queryClient = createTestQueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TrainerAiKnowledgePage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/What is the Nyquist Velocity limit\?/i)).toBeTruthy()
      expect(screen.getByText("AI GENERATED — PENDING REVIEW")).toBeTruthy()
    })
  })
})
