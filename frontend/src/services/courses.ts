import { fetchJson } from "./api"

export interface CourseCategory {
  id: string
  name: string
  code: string
  description?: string
  parent_id?: string
  course_count?: number
}

export interface TrainerSummary {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar_url?: string
  designation?: string
  specialization?: string
}

export interface CompetencyTag {
  id: string
  name: string
  code: string
  category: string
  target_level: number
  contribution_weight: number
}

export interface ResourceItem {
  id: string
  course_id: string
  lesson_id?: string
  title: string
  description?: string
  resource_type: string
  storage_url: string
  file_name?: string
  file_size_bytes?: number
  mime_type?: string
  is_downloadable: boolean
}

export interface LessonItem {
  id: string
  module_id: string
  title: string
  description?: string
  content_type: string
  content_body?: string
  order_index: number
  duration_minutes: number
  is_mandatory: boolean
  is_completed: boolean
  resources: ResourceItem[]
}

export interface CourseModuleItem {
  id: string
  course_id: string
  title: string
  description?: string
  order_index: number
  lessons: LessonItem[]
}

export interface CourseCard {
  id: string
  code: string
  title: string
  description?: string
  category_id: string
  category_name: string
  category_code: string
  difficulty_level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  duration_hours: number
  thumbnail_url?: string
  trainer?: TrainerSummary
  total_modules: number
  total_lessons: number
  competencies: string[]
  is_enrolled: boolean
  enrollment_status?: string
  progress_percentage?: number
  module_names?: string[]
  assessment_types?: string[]
  passing_marks?: string
  enrollment_count?: number
}

export interface CourseCatalogueResponse {
  items: CourseCard[]
  total: number
  page: number
  page_size: number
  total_pages: number
  categories: CourseCategory[]
}

export interface CourseDetail {
  id: string
  code: string
  title: string
  description?: string
  objectives?: string
  prerequisites?: string
  status: string
  difficulty_level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  duration_hours: number
  thumbnail_url?: string
  published_at?: string
  category: CourseCategory
  trainer?: TrainerSummary
  modules: CourseModuleItem[]
  resources: ResourceItem[]
  competencies: CompetencyTag[]
  is_enrolled: boolean
  enrollment_id?: string
  enrollment_status?: string
  progress_percentage?: number
  completed_lessons_count: number
  total_lessons_count: number
}

export interface CourseProgressResponse {
  id: string
  enrollment_id: string
  completion_percentage: number
  completed_lessons_count: number
  total_lessons_count: number
  last_accessed_lesson_id?: string
  last_accessed_at?: string
  is_completed: boolean
  completed_at?: string
}

export interface EnrollmentResponse {
  id: string
  user_id: string
  course_id: string
  status: string
  enrolled_at: string
  started_at?: string
  completed_at?: string
  final_grade?: string
  progress?: CourseProgressResponse
}

export interface LessonCompletionResponse {
  id: string
  enrollment_id: string
  lesson_id: string
  completed_at: string
  progress: CourseProgressResponse
}

export const coursesService = {
  async getCatalogue(params?: {
    search?: string
    categoryId?: string
    difficulty?: string
    page?: number
    pageSize?: number
  }): Promise<CourseCatalogueResponse> {
    const query = new URLSearchParams()
    if (params?.search) query.set("search", params.search)
    if (params?.categoryId) query.set("category_id", params.categoryId)
    if (params?.difficulty) query.set("difficulty", params.difficulty)
    if (params?.page) query.set("page", params.page.toString())
    if (params?.pageSize) query.set("page_size", params.pageSize.toString())

    const qs = query.toString()
    return fetchJson<CourseCatalogueResponse>(`/courses${qs ? `?${qs}` : ""}`)
  },

  async getCategories(): Promise<CourseCategory[]> {
    return fetchJson<CourseCategory[]>("/courses/categories")
  },

  async getCourseDetails(courseId: string): Promise<CourseDetail> {
    return fetchJson<CourseDetail>(`/courses/${courseId}`)
  },

  async enrollInCourse(courseId: string): Promise<EnrollmentResponse> {
    return fetchJson<EnrollmentResponse>(`/courses/${courseId}/enroll`, {
      method: "POST",
    })
  },

  async getLearningContent(courseId: string): Promise<CourseDetail> {
    return fetchJson<CourseDetail>(`/courses/${courseId}/learn`)
  },

  async completeLesson(courseId: string, lessonId: string): Promise<LessonCompletionResponse> {
    return fetchJson<LessonCompletionResponse>(`/courses/${courseId}/lessons/${lessonId}/complete`, {
      method: "POST",
    })
  },
}
