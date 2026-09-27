import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAuthStore, type AuthUser } from "../store/useAuthStore"

import { TraineeCompetenciesPage } from "../pages/TraineeCompetenciesPage"
import { TraineeSkillGapPage } from "../pages/TraineeSkillGapPage"
import { AdminTrainerRecommendationsPage } from "../pages/AdminTrainerRecommendationsPage"
import { competenciesService } from "../services/competencies"

// Mock Recharts
vi.mock("recharts", async () => {
  const original = await vi.importActual("recharts")
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  }
})

// Mock CompetencyUniverse3D lazy component to simplify in JSDOM environment
vi.mock("../components/competencies/CompetencyUniverse3D", () => ({
  default: () => <div data-testid="mock-3d-universe">3D Universe Canvas Rendered</div>,
}))

// Mock competenciesService
vi.mock("../services/competencies", () => ({
  competenciesService: {
    listCompetencies: vi.fn(),
    getLevels: vi.fn(),
    getMyCompetencies: vi.fn(),
    getMySkillGaps: vi.fn(),
    getMyReadiness: vi.fn(),
    getMyRecommendations: vi.fn(),
    getMyGrowth: vi.fn(),
    listSubjects: vi.fn(),
    getTrainerRecommendations: vi.fn(),
    getUserCompetencies: vi.fn(),
  },
}))

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

const mockAdmin: AuthUser = {
  id: "admin-123",
  email: "admin.demo@imd.gov.in",
  username: "admin_demo",
  first_name: "Dr. Suresh",
  last_name: "Verma",
  role: "ADMIN",
  account_status: "ACTIVE",
  is_active: true,
  is_verified: true,
}

const mockCompetenciesData = [
  {
    competency_id: "comp-1",
    code: "COMP-SYNOPTIC",
    name: "Synoptic Weather Analysis & Charting",
    category: "Operational Forecasting",
    current_level: 3.8,
    integer_level: 4,
    level_name: "Advanced",
    badge_color: "violet",
    target_level: 4,
    confidence_score: 0.85,
    evidence: [
      {
        type: "COURSE",
        title: "Curriculum & Syllabus Completion",
        score: 100.0,
        contribution: 1.0,
        detail: "Completed Introduction to Meteorology with 100% syllabus progress.",
      },
      {
        type: "ASSESSMENT",
        title: "Examination Performance",
        score: 88.0,
        contribution: 1.32,
        detail: "Passed Meteorological Fundamentals Assessment with 88.0%.",
      },
      {
        type: "SKILL",
        title: "Operational & Technical Skills",
        score: 80.0,
        contribution: 0.8,
        detail: "Verified ADVANCED rating in Synoptic Chart Analysis.",
      },
    ],
    summary_explanation: "Synoptic Weather Analysis is assessed at Level 3.8 (Advanced) driven by high examination score and verified practical skills.",
  },
  {
    competency_id: "comp-2",
    code: "COMP-DOPPLER",
    name: "Doppler Weather Radar Interpretation",
    category: "Radar Meteorology",
    current_level: 2.8,
    integer_level: 3,
    level_name: "Intermediate",
    badge_color: "emerald",
    target_level: 4,
    confidence_score: 0.75,
    evidence: [],
    summary_explanation: "Developing capability at Level 2.8 with practical radar foundations.",
  },
]

const mockReadinessData = {
  overall_readiness_percentage: 68.5,
  target_role_or_subject: "Operational Meteorological Baseline",
  required_competencies_count: 7,
  met_competencies_count: 2,
  gaps_count: 5,
  competency_breakdown: [
    {
      competency_id: "comp-1",
      code: "COMP-SYNOPTIC",
      name: "Synoptic Weather Analysis & Charting",
      current_level: 3.8,
      required_level: 4.0,
      gap: 0.2,
      is_met: true,
      weight: 1.0,
    },
    {
      competency_id: "comp-2",
      code: "COMP-DOPPLER",
      name: "Doppler Weather Radar Interpretation",
      current_level: 2.8,
      required_level: 4.0,
      gap: 1.2,
      is_met: false,
      weight: 1.0,
    },
  ],
  formula_explanation: "Readiness Score = Sum(min(1.0, Demonstrated / Required) * Weight) / Sum(Weights) * 100",
}

const mockSkillGapsData = [
  {
    competency_id: "comp-2",
    code: "COMP-DOPPLER",
    name: "Doppler Weather Radar Interpretation",
    category: "Radar Meteorology",
    current_level: 2.8,
    required_level: 4.0,
    gap: 1.2,
    priority: "HIGH" as const,
    weight: 1.0,
    evidence_summary: "Developing capability at Level 2.8 with practical radar foundations.",
  },
  {
    competency_id: "comp-1",
    code: "COMP-SYNOPTIC",
    name: "Synoptic Weather Analysis & Charting",
    category: "Operational Forecasting",
    current_level: 3.8,
    required_level: 4.0,
    gap: 0.2,
    priority: "LOW" as const,
    weight: 1.0,
    evidence_summary: "Synoptic Weather Analysis is assessed at Level 3.8.",
  },
]

const mockRecommendationsData = [
  {
    course_id: "c-101",
    code: "MET-204",
    title: "Doppler Weather Radar Operations",
    difficulty_level: "INTERMEDIATE",
    duration_hours: 50,
    match_score: 94.0,
    addressed_gaps: ["Doppler Weather Radar Interpretation (Gap: 1.2)"],
    why_recommended: "Directly addresses 1 operational gap: Doppler Weather Radar Interpretation. Curriculum provides +50h structured learning.",
    covered_competencies: ["Doppler Weather Radar Interpretation"],
  },
]

const mockSubjectsData = [
  {
    id: "subj-1",
    name: "Doppler Weather Radar Operations & Severe Convection",
    code: "SUBJ-DWR-OPS",
    domain: "Radar Meteorology",
    description: "Operational radar scanning protocols and dual-polarization interpretation.",
    is_active: true,
    requirements: [
      {
        competency_id: "comp-2",
        competency_code: "COMP-DOPPLER",
        competency_name: "Doppler Weather Radar Interpretation",
        category: "Radar Meteorology",
        required_level: 4,
        weight: 1.0,
      },
    ],
  },
]

const mockTrainerRecommendationsData = {
  subject_id: "subj-1",
  subject_name: "Doppler Weather Radar Operations & Severe Convection",
  subject_code: "SUBJ-DWR-OPS",
  domain: "Radar Meteorology",
  candidate_count: 2,
  candidates: [
    {
      trainer_id: "tr-1",
      name: "Dr. Rajesh Kumar",
      email: "trainer.demo@imd.gov.in",
      designation: "Head of Radar Meteorology",
      department: "National Weather Forecasting Centre",
      overall_match_score: 89.5,
      competency_match: 92.0,
      experience_score: 88.0,
      qualification_score: 100.0,
      certification_score: 75.0,
      assessment_score: 85.0,
      feedback_score: 94.0,
      matched_competencies: ["Doppler Weather Radar Interpretation (L4.2/L4)"],
      missing_competencies: [],
      explanation: "Candidate exhibits 92.0% subject competency alignment supported by 10 years operational meteorological background.",
    },
  ],
}

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity },
    },
  })

describe("Phase 5: Competency Intelligence & 3D Universe", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 1. Trainee Competency Dashboard renders with readiness and radar
  it("renders trainee competency dashboard with readiness gauge and 2D radar", async () => {
    useAuthStore.setState({ user: mockTrainee, isAuthenticated: true, isLoading: false })
    vi.mocked(competenciesService.getMyCompetencies).mockResolvedValue(mockCompetenciesData)
    vi.mocked(competenciesService.getMyReadiness).mockResolvedValue(mockReadinessData)
    vi.mocked(competenciesService.getMySkillGaps).mockResolvedValue(mockSkillGapsData)
    vi.mocked(competenciesService.getMyRecommendations).mockResolvedValue(mockRecommendationsData)

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <TraineeCompetenciesPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText("Operational Meteorological Competencies")).toBeDefined()
    expect(await screen.findByText("68.5%")).toBeDefined()
    expect(screen.getByText("Training Readiness Score")).toBeDefined()
    expect(screen.getByText("Synoptic Weather Analysis & Charting")).toBeDefined()
    expect(screen.getByText("Doppler Weather Radar Interpretation")).toBeDefined()
    expect(screen.getByTestId("radar-chart")).toBeDefined()
  })

  // 2. View toggle switches to 3D Competency Universe
  it("allows switching between 2D Analytical View and 3D Competency Universe", async () => {
    useAuthStore.setState({ user: mockTrainee, isAuthenticated: true, isLoading: false })
    vi.mocked(competenciesService.getMyCompetencies).mockResolvedValue(mockCompetenciesData)
    vi.mocked(competenciesService.getMyReadiness).mockResolvedValue(mockReadinessData)
    vi.mocked(competenciesService.getMySkillGaps).mockResolvedValue(mockSkillGapsData)
    vi.mocked(competenciesService.getMyRecommendations).mockResolvedValue(mockRecommendationsData)

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <TraineeCompetenciesPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    const switch3DBtn = await screen.findByText("3D Competency Universe")
    expect(switch3DBtn).toBeDefined()

    fireEvent.click(switch3DBtn)

    await waitFor(() => {
      expect(screen.getByTestId("mock-3d-universe")).toBeDefined()
    })
  })

const mockGrowthData = {
  competency_id: "comp-1",
  code: "COMP-SYNOPTIC",
  name: "Synoptic Weather Analysis & Charting",
  current_level: 3.8,
  growth_points: [
    {
      date: "2026-06-01T00:00:00Z",
      event_type: "COURSE",
      level: 1.0,
      description: "Initial foundation course completed",
    },
    {
      date: "2026-09-27T00:00:00Z",
      event_type: "ASSESSMENT",
      level: 3.8,
      description: "Assessment score: 88.0%",
    },
  ],
}

  // 3. Inspecting a competency opens Evidence Dossier with multi-source contributions
  it("opens multi-source evidence dossier when a competency card is selected", async () => {
    useAuthStore.setState({ user: mockTrainee, isAuthenticated: true, isLoading: false })
    vi.mocked(competenciesService.getMyCompetencies).mockResolvedValue(mockCompetenciesData)
    vi.mocked(competenciesService.getMyReadiness).mockResolvedValue(mockReadinessData)
    vi.mocked(competenciesService.getMySkillGaps).mockResolvedValue(mockSkillGapsData)
    vi.mocked(competenciesService.getMyRecommendations).mockResolvedValue(mockRecommendationsData)
    vi.mocked(competenciesService.getMyGrowth).mockResolvedValue(mockGrowthData)

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <TraineeCompetenciesPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    const compCard = await screen.findByText("Synoptic Weather Analysis & Charting")
    fireEvent.click(compCard)

    expect(await screen.findByText("Synoptic Weather Analysis & Charting — Evidence Dossier")).toBeDefined()
    expect(screen.getAllByText("Curriculum & Syllabus Completion").length).toBeGreaterThan(0)
    expect(screen.getByText("Examination Performance")).toBeDefined()
    expect(screen.getByText("Operational & Technical Skills")).toBeDefined()
    expect(screen.getByText("+1.32 pts")).toBeDefined()
  })

  // 4. Trainee Skill Gap Page renders gaps and priority badges
  it("renders trainee skill gap analysis page with priority classifications", async () => {
    useAuthStore.setState({ user: mockTrainee, isAuthenticated: true, isLoading: false })
    vi.mocked(competenciesService.listSubjects).mockResolvedValue(mockSubjectsData)
    vi.mocked(competenciesService.getMySkillGaps).mockResolvedValue(mockSkillGapsData)
    vi.mocked(competenciesService.getMyReadiness).mockResolvedValue(mockReadinessData)

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <TraineeSkillGapPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText("Skill Gap & Capability Deficiency Analysis")).toBeDefined()
    expect(await screen.findByText("HIGH PRIORITY")).toBeDefined()
    expect(await screen.findByText("-1.2 Levels")).toBeDefined()
    expect(await screen.findByText("Doppler Weather Radar Interpretation")).toBeDefined()
    expect(await screen.findByText("Baseline: General Operational Meteorology (All 7)")).toBeDefined()
  })

  // 5. Admin Trainer Recommendation Page displays candidate match rankings and 6-dimension breakdown
  it("renders admin trainer recommendations with 6-dimension candidate breakdown", async () => {
    useAuthStore.setState({ user: mockAdmin, isAuthenticated: true, isLoading: false })
    vi.mocked(competenciesService.listSubjects).mockResolvedValue(mockSubjectsData)
    vi.mocked(competenciesService.getTrainerRecommendations).mockResolvedValue(mockTrainerRecommendationsData)

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <AdminTrainerRecommendationsPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText("Trainer Competency Matching & Recommendations")).toBeDefined()
    expect(await screen.findByText("Dr. Rajesh Kumar")).toBeDefined()
    expect(await screen.findByText("89.5%")).toBeDefined()
    expect(await screen.findByText("Top Match Alignment")).toBeDefined()
    expect(await screen.findByText("Nominate Faculty")).toBeDefined()
  })

  // 6. Expanding candidate rationale in Admin view reveals explainable evidence dossier
  it("expands algorithmic recommendation explanation when why recommended is clicked", async () => {
    useAuthStore.setState({ user: mockAdmin, isAuthenticated: true, isLoading: false })
    vi.mocked(competenciesService.listSubjects).mockResolvedValue(mockSubjectsData)
    vi.mocked(competenciesService.getTrainerRecommendations).mockResolvedValue(mockTrainerRecommendationsData)

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <AdminTrainerRecommendationsPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    const whyBtn = await screen.findByText(/Why Recommended\? \(Explainability\)/i)
    fireEvent.click(whyBtn)

    expect(
      await screen.findByText(/Candidate exhibits 92.0% subject competency alignment/i)
    ).toBeDefined()
  })
})
