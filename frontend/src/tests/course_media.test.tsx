import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TrainerCourseDetailPage } from "../pages/TrainerCourseDetailPage"
import { LearningContentPage } from "../pages/LearningContentPage"
import { ResourceCard } from "../components/ui/ResourceCard"
import { VideoPlayerModal } from "../components/ui/VideoPlayerModal"
import { AudioPlayerModal } from "../components/ui/AudioPlayerModal"
import { trainerService } from "../services/trainer"
import { coursesService, ResourceItem } from "../services/courses"

vi.mock("../services/trainer", () => ({
  trainerService: {
    getCourseDetail: vi.fn(),
    addModule: vi.fn(),
    addLesson: vi.fn(),
    updateCourse: vi.fn(),
    createResource: vi.fn(),
    uploadResource: vi.fn(),
    updateResource: vi.fn(),
    deleteResource: vi.fn(),
    publishResource: vi.fn(),
  },
}))

vi.mock("../services/courses", () => ({
  coursesService: {
    getLearningContent: vi.fn(),
    getCourseResources: vi.fn(),
    completeResource: vi.fn(),
    completeLesson: vi.fn(),
  },
}))

const mockTrainerCourse = {
  id: "course-204",
  code: "MET-204",
  title: "Doppler Weather Radar Operations",
  description: "Comprehensive training on operational radar workstations.",
  status: "PUBLISHED",
  difficulty_level: "INTERMEDIATE",
  duration_hours: 40,
  modules: [
    {
      id: "mod-1",
      course_id: "course-204",
      title: "Radar Principles & Hardware",
      order_index: 1,
      description: "",
      lessons: [
        {
          id: "les-1",
          module_id: "mod-1",
          title: "Radar Equation and Doppler Dilemma",
          duration_minutes: 45,
          content_type: "TEXT",
          order_index: 1,
          resources: [],
        },
      ],
    },
  ],
}

const mockMediaResources: ResourceItem[] = [
  {
    id: "res-video-1",
    course_id: "course-204",
    module_id: "mod-1",
    lesson_id: "les-1",
    title: "Introduction to Doppler Radar Operations",
    description: "Official IMD Radar hardware overview and signal processing.",
    resource_type: "VIDEO",
    storage_url: "/uploads/course-media/videos/radar_intro.mp4",
    media_url: "/uploads/course-media/videos/radar_intro.mp4",
    thumbnail_url: "https://mausam.imd.gov.in/assets/images/radar-thumb.jpg",
    file_size_bytes: 45000000,
    duration_seconds: 765, // 12:45
    display_order: 1,
    is_published: true,
    is_downloadable: true,
  },
  {
    id: "res-audio-1",
    course_id: "course-204",
    module_id: "mod-1",
    lesson_id: "les-1",
    title: "Radar Meteorology Acoustic Lecture",
    description: "Detailed acoustic walkthrough of velocity dealiasing.",
    resource_type: "AUDIO",
    storage_url: "/uploads/course-media/audio/radar_lecture.mp3",
    media_url: "/uploads/course-media/audio/radar_lecture.mp3",
    file_size_bytes: 12000000,
    duration_seconds: 632, // 10:32
    display_order: 2,
    is_published: true,
    is_downloadable: true,
  },
  {
    id: "res-yt-1",
    course_id: "course-204",
    module_id: "mod-1",
    lesson_id: "les-1",
    title: "IMD Official Doppler Radar Broadcast",
    description: "Severe thunderstorm surveillance demo.",
    resource_type: "EXTERNAL_VIDEO",
    storage_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    media_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail_url: "https://mausam.imd.gov.in/assets/images/radar-thumb.jpg",
    duration_seconds: 900,
    display_order: 3,
    is_published: true,
    is_downloadable: false,
  },
  {
    id: "res-doc-1",
    course_id: "course-204",
    module_id: "mod-1",
    lesson_id: "les-1",
    title: "Radar Operations Protocol Manual",
    description: "Standard operating procedures for DWR network.",
    resource_type: "DOCUMENT",
    storage_url: "/uploads/course-media/documents/radar_sop.pdf",
    media_url: "/uploads/course-media/documents/radar_sop.pdf",
    file_size_bytes: 5200000,
    display_order: 4,
    is_published: true,
    is_downloadable: true,
  },
  {
    id: "res-ppt-1",
    course_id: "course-204",
    module_id: "mod-1",
    lesson_id: "les-1",
    title: "DWR Products and Echo Interpretation Slides",
    description: "Reflectivity, Radial Velocity, and Spectrum Width.",
    resource_type: "PRESENTATION",
    storage_url: "/uploads/course-media/documents/radar_slides.pptx",
    media_url: "/uploads/course-media/documents/radar_slides.pptx",
    file_size_bytes: 8400000,
    display_order: 5,
    is_published: false, // Draft
    is_downloadable: true,
  },
]

const publishedResources = mockMediaResources.filter((r) => r.is_published)

const mockTraineeLearningContent = {
  ...mockTrainerCourse,
  completed_lessons_count: 0,
  total_lessons_count: 1,
  progress_percentage: 0,
  resources: publishedResources,
  modules: [
    {
      ...mockTrainerCourse.modules[0],
      lessons: [
        {
          ...mockTrainerCourse.modules[0].lessons[0],
          is_completed: false,
          resources: publishedResources,
        },
      ],
    },
  ],
}

const renderWithClient = (ui: React.ReactElement, initialRoute = "/") => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe("Course Video & Audio Learning Resources Feature Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 1. Trainer Resource List — verify heading and all 5 action buttons
  it("renders trainer LEARNING RESOURCES section with 5 add buttons", async () => {
    vi.mocked(trainerService.getCourseDetail).mockResolvedValue(mockTrainerCourse as any)
    vi.mocked(coursesService.getCourseResources).mockResolvedValue(mockMediaResources)

    renderWithClient(
      <Routes>
        <Route path="/trainer/courses/:courseId" element={<TrainerCourseDetailPage />} />
      </Routes>,
      "/trainer/courses/course-204"
    )

    // The section heading containing "LEARNING RESOURCES"
    const headings = await screen.findAllByText(/LEARNING RESOURCES/i)
    expect(headings.length).toBeGreaterThanOrEqual(1)

    // All 5 required add buttons
    expect(screen.getByRole("button", { name: /\+ Add Video/i })).toBeDefined()
    expect(screen.getByRole("button", { name: /\+ Add Audio/i })).toBeDefined()
    expect(screen.getByRole("button", { name: /\+ Add Document/i })).toBeDefined()
    expect(screen.getByRole("button", { name: /\+ Add Presentation/i })).toBeDefined()
    expect(screen.getByRole("button", { name: /\+ Add External Video/i })).toBeDefined()

    // Rendered resource cards (resource titles visible)
    expect(screen.getByText("Introduction to Doppler Radar Operations")).toBeDefined()
    expect(screen.getByText("Radar Meteorology Acoustic Lecture")).toBeDefined()
    expect(screen.getByText("IMD Official Doppler Radar Broadcast")).toBeDefined()
  })

  // 2. Add Video Modal
  it("opens add video modal when + Add Video is clicked", async () => {
    vi.mocked(trainerService.getCourseDetail).mockResolvedValue(mockTrainerCourse as any)
    vi.mocked(coursesService.getCourseResources).mockResolvedValue([])

    renderWithClient(
      <Routes>
        <Route path="/trainer/courses/:courseId" element={<TrainerCourseDetailPage />} />
      </Routes>,
      "/trainer/courses/course-204"
    )

    const addVideoBtn = await screen.findByRole("button", { name: /\+ Add Video/i })
    fireEvent.click(addVideoBtn)

    // Modal opens: type badge and save button
    expect(screen.getByText("VIDEO")).toBeDefined()
    expect(screen.getByRole("button", { name: /Save Resource/i })).toBeDefined()
  })

  // 3. Add Audio Modal
  it("opens add audio modal showing audio file size info", async () => {
    vi.mocked(trainerService.getCourseDetail).mockResolvedValue(mockTrainerCourse as any)
    vi.mocked(coursesService.getCourseResources).mockResolvedValue([])

    renderWithClient(
      <Routes>
        <Route path="/trainer/courses/:courseId" element={<TrainerCourseDetailPage />} />
      </Routes>,
      "/trainer/courses/course-204"
    )

    const addAudioBtn = await screen.findByRole("button", { name: /\+ Add Audio/i })
    fireEvent.click(addAudioBtn)

    expect(screen.getByText("AUDIO")).toBeDefined()
    // The file spec label for audio
    expect(screen.getByText(/MP3, WAV, M4A, AAC/i)).toBeDefined()
  })

  // 4. Add External Video — title input + URL input + save calls createResource
  it("accepts external video URL and calls createResource on save", async () => {
    vi.mocked(trainerService.getCourseDetail).mockResolvedValue(mockTrainerCourse as any)
    vi.mocked(coursesService.getCourseResources).mockResolvedValue([])
    vi.mocked(trainerService.createResource).mockResolvedValue({ id: "res-new", message: "Created" } as any)

    renderWithClient(
      <Routes>
        <Route path="/trainer/courses/:courseId" element={<TrainerCourseDetailPage />} />
      </Routes>,
      "/trainer/courses/course-204"
    )

    const addExtVideoBtn = await screen.findByRole("button", { name: /\+ Add External Video/i })
    fireEvent.click(addExtVideoBtn)

    expect(screen.getByText("EXTERNAL_VIDEO")).toBeDefined()

    const titleInput = screen.getByPlaceholderText(/e\.g\. IMD Official Weather Briefing/i)
    fireEvent.change(titleInput, { target: { value: "IMD Cyclone Alert Video" } })

    const urlInput = screen.getByPlaceholderText(/https:\/\/www\.youtube\.com/i)
    fireEvent.change(urlInput, { target: { value: "https://www.youtube.com/watch?v=verified123" } })

    const saveBtn = screen.getByRole("button", { name: /Save Resource/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(trainerService.createResource).toHaveBeenCalledWith(
        "course-204",
        expect.objectContaining({
          title: "IMD Cyclone Alert Video",
          resource_type: "EXTERNAL_VIDEO",
          media_url: "https://www.youtube.com/watch?v=verified123",
        })
      )
    })
  })

  // 5. Edit Modal — pre-fills title
  it("opens edit modal with pre-filled title for existing resource", async () => {
    vi.mocked(trainerService.getCourseDetail).mockResolvedValue(mockTrainerCourse as any)
    vi.mocked(coursesService.getCourseResources).mockResolvedValue(mockMediaResources)

    renderWithClient(
      <Routes>
        <Route path="/trainer/courses/:courseId" element={<TrainerCourseDetailPage />} />
      </Routes>,
      "/trainer/courses/course-204"
    )

    await screen.findByText("Introduction to Doppler Radar Operations")

    // Click the first "Edit Resource" button (by title attribute)
    const editBtns = screen.getAllByTitle("Edit Resource")
    fireEvent.click(editBtns[0])

    // Modal opens and heading changes to "Edit Resource"
    expect(screen.getByText("Edit Resource")).toBeDefined()
    // Input should have pre-filled title
    const input = screen.getByDisplayValue("Introduction to Doppler Radar Operations")
    expect(input).toBeDefined()
  })

  // 6. Publish toggle calls publishResource with correct args
  it("toggles publish status by calling publishResource", async () => {
    vi.mocked(trainerService.getCourseDetail).mockResolvedValue(mockTrainerCourse as any)
    vi.mocked(coursesService.getCourseResources).mockResolvedValue(mockMediaResources)
    vi.mocked(trainerService.publishResource).mockResolvedValue({ message: "Updated" } as any)

    renderWithClient(
      <Routes>
        <Route path="/trainer/courses/:courseId" element={<TrainerCourseDetailPage />} />
      </Routes>,
      "/trainer/courses/course-204"
    )

    await screen.findByText("Introduction to Doppler Radar Operations")

    // "Set to Draft" for a published resource
    const unpublishBtns = screen.getAllByTitle("Set to Draft")
    fireEvent.click(unpublishBtns[0])

    await waitFor(() => {
      expect(trainerService.publishResource).toHaveBeenCalledWith("res-video-1", false)
    })
  })

  // 7. Trainee view: published resources visible, draft hidden
  it("displays only published resources for trainee in learning content", async () => {
    vi.mocked(coursesService.getLearningContent).mockResolvedValue(mockTraineeLearningContent as any)

    renderWithClient(
      <Routes>
        <Route path="/courses/:courseId/learn" element={<LearningContentPage />} />
      </Routes>,
      "/courses/course-204/learn"
    )

    // Published resources appear
    expect(await screen.findByText("Learning Resources")).toBeDefined()
    expect(screen.getByText("Introduction to Doppler Radar Operations")).toBeDefined()
    expect(screen.getByText("Radar Meteorology Acoustic Lecture")).toBeDefined()

    // Draft resource (is_published: false) should NOT appear in trainee view
    expect(screen.queryByText("DWR Products and Echo Interpretation Slides")).toBeNull()
  })

  // 8. Video Player Modal — renders title and mark complete button
  it("renders VideoPlayerModal with title and Mark as Completed button", () => {
    const onComplete = vi.fn()
    const onClose = vi.fn()

    render(
      <VideoPlayerModal
        resource={mockMediaResources[0]}
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
      />
    )

    expect(screen.getByText("Introduction to Doppler Radar Operations")).toBeDefined()
    // Footer mark-complete button
    const markCompleteBtn = screen.getByRole("button", { name: /Mark as Completed/i })
    fireEvent.click(markCompleteBtn)
    expect(onComplete).toHaveBeenCalledWith(mockMediaResources[0])
  })

  // 9. Audio Player Modal — renders title, Playback Control section, and complete button
  it("renders AudioPlayerModal with title and Mark as Completed button", () => {
    const onComplete = vi.fn()
    const onClose = vi.fn()

    render(
      <AudioPlayerModal
        resource={mockMediaResources[1]}
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
      />
    )

    expect(screen.getByText("Radar Meteorology Acoustic Lecture")).toBeDefined()
    expect(screen.getByText("Playback Control")).toBeDefined()

    const markCompleteBtn = screen.getByRole("button", { name: /Mark as Completed/i })
    fireEvent.click(markCompleteBtn)
    expect(onComplete).toHaveBeenCalledWith(mockMediaResources[1])
  })

  // 10. Resource filter tabs — Videos hides Audio, Audio hides Videos
  it("filters resource list between Videos and Audio tabs", async () => {
    vi.mocked(coursesService.getLearningContent).mockResolvedValue(mockTraineeLearningContent as any)

    renderWithClient(
      <Routes>
        <Route path="/courses/:courseId/learn" element={<LearningContentPage />} />
      </Routes>,
      "/courses/course-204/learn"
    )

    expect(await screen.findByText("Learning Resources")).toBeDefined()

    // Click "Videos" filter tab
    const videosFilterBtn = screen.getByRole("button", { name: /Videos \(/i })
    fireEvent.click(videosFilterBtn)

    expect(screen.getByText("Introduction to Doppler Radar Operations")).toBeDefined()
    expect(screen.queryByText("Radar Meteorology Acoustic Lecture")).toBeNull()

    // Click "Audio" filter tab
    const audioFilterBtn = screen.getByRole("button", { name: /Audio \(/i })
    fireEvent.click(audioFilterBtn)

    expect(screen.getByText("Radar Meteorology Acoustic Lecture")).toBeDefined()
    expect(screen.queryByText("Introduction to Doppler Radar Operations")).toBeNull()
  })

  // 11. ResourceCard responsive layout
  it("ResourceCard root element has mobile-first flex-col and sm:flex-row classes", () => {
    const { container } = render(<ResourceCard resource={mockMediaResources[0]} />)
    const cardEl = container.firstChild as HTMLElement
    expect(cardEl.className).toContain("flex-col")
    expect(cardEl.className).toContain("sm:flex-row")
  })
})
