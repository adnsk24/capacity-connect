import { fetchJson } from "./api"
import { AssessmentListItem, AssessmentDetail } from "./assessments"

export interface TrainerDashboardStats {
  courses_managed: number
  enrolled_trainees: number
  active_learners: number
  assessments_count: number
  average_assessment_score: number
  completion_rate: number
  recent_activity: Array<{ type: string; title: string; timestamp: string | null }>
  upcoming_deadlines: Array<{ id: string; title: string; course_title: string; due_at: string | null }>
}

export interface TrainerCourseItem {
  id: string
  title: string
  code: string
  description?: string | null
  category_id: string
  category_name: string
  difficulty_level: string
  duration_hours: number
  status: string
  thumbnail_url?: string | null
  enrolled_count: number
  modules_count: number
  published_at?: string | null
}

export interface TrainerCourseDetail extends TrainerCourseItem {
  objectives?: string | null
  prerequisites?: string | null
  trainer_name?: string | null
  modules: Array<{
    id: string
    title: string
    description?: string | null
    order_index: number
    lessons: Array<{
      id: string
      title: string
      description?: string | null
      content_type: string
      content_body?: string | null
      duration_minutes: number
      order_index: number
      is_mandatory: boolean
    }>
  }>
  resources: Array<{
    id: string
    title: string
    resource_type: string
    file_url?: string
    media_url?: string
    storage_url?: string
    thumbnail_url?: string | null
    description?: string | null
    module_id?: string | null
    lesson_id?: string | null
    duration_seconds?: number | null
    display_order: number
    is_published: boolean
  }>
}

export interface TraineePerformanceItem {
  trainee_id: string
  trainee_name: string
  trainee_email: string
  course_id: string
  course_title: string
  enrollment_status: string
  enrolled_at: string
  progress_percentage: number
  completed_lessons: number
  total_lessons: number
  assessment_attempts_count: number
  latest_score?: number | null
  is_passed?: boolean | null
}

export interface TraineePerformanceResponse {
  total_count: number
  page: number
  page_size: number
  items: TraineePerformanceItem[]
}

export const trainerService = {
  getDashboard: () => fetchJson<TrainerDashboardStats>("/trainer/dashboard"),

  listCourses: () => fetchJson<TrainerCourseItem[]>("/trainer/courses"),

  createCourse: (data: {
    category_id: string
    title: string
    code: string
    description?: string
    objectives?: string
    prerequisites?: string
    difficulty_level: string
    duration_hours: number
    status?: string
  }) =>
    fetchJson<TrainerCourseItem>("/trainer/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getCourseDetail: (courseId: string) =>
    fetchJson<TrainerCourseDetail>(`/trainer/courses/${courseId}`),

  updateCourse: (
    courseId: string,
    data: Partial<{
      title: string
      code: string
      description: string
      objectives: string
      prerequisites: string
      difficulty_level: string
      duration_hours: number
      status: string
    }>
  ) =>
    fetchJson<{ message: string; id: string; status: string }>(`/trainer/courses/${courseId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  addModule: (courseId: string, data: { title: string; description?: string; order_index?: number }) =>
    fetchJson<{ message: string; id: string }>(`/trainer/courses/${courseId}/modules`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  addLesson: (
    courseId: string,
    moduleId: string,
    data: {
      title: string
      description?: string
      content_type?: string
      content_body?: string
      duration_minutes?: number
      order_index?: number
      is_mandatory?: boolean
    }
  ) =>
    fetchJson<{ message: string; id: string }>(`/trainer/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  addResource: (
    courseId: string,
    data: { title: string; resource_type: string; url_or_path: string; description?: string }
  ) =>
    fetchJson<{ message: string; id: string }>(`/trainer/courses/${courseId}/resources`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createResource: (
    courseId: string,
    data: {
      title: string
      resource_type: string
      media_url?: string
      url_or_path?: string
      description?: string
      module_id?: string | null
      lesson_id?: string | null
      thumbnail_url?: string | null
      duration_seconds?: number | null
      display_order?: number
      is_published?: boolean
    }
  ) =>
    fetchJson<any>(`/courses/${courseId}/resources`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  uploadResource: (courseId: string, formData: FormData) => {
    const token = localStorage.getItem("token") || localStorage.getItem("access_token")
    return fetch(`/api/v1/courses/${courseId}/resources/upload`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }))
        throw new Error(err.detail || "Upload failed")
      }
      return res.json()
    })
  },

  updateResource: (
    resourceId: string,
    data: Partial<{
      title: string
      resource_type: string
      media_url: string
      thumbnail_url: string
      description: string
      module_id: string | null
      lesson_id: string | null
      duration_seconds: number | null
      display_order: number
      is_published: boolean
    }>
  ) =>
    fetchJson<any>(`/resources/${resourceId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteResource: (resourceId: string) =>
    fetchJson<any>(`/resources/${resourceId}`, {
      method: "DELETE",
    }),

  publishResource: (resourceId: string, isPublished: boolean) =>
    fetchJson<any>(`/resources/${resourceId}/publish`, {
      method: "POST",
      body: JSON.stringify({ is_published: isPublished }),
    }),

  listAssessments: () => fetchJson<AssessmentListItem[]>("/trainer/assessments"),

  createAssessment: (data: {
    course_id: string
    title: string
    description?: string
    assessment_type?: string
    passing_percentage?: number
    total_marks?: number
    duration_minutes?: number
    max_attempts?: number
    status?: string
    due_at?: string | null
  }) =>
    fetchJson<{ message: string; id: string }>("/trainer/assessments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAssessment: (assessmentId: string) =>
    fetchJson<AssessmentDetail>(`/trainer/assessments/${assessmentId}`),

  updateAssessment: (assessmentId: string, data: Record<string, any>) =>
    fetchJson<{ message: string; id: string }>(`/trainer/assessments/${assessmentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteAssessment: (assessmentId: string) =>
    fetchJson<{ message: string }>(`/trainer/assessments/${assessmentId}`, {
      method: "DELETE",
    }),

  addQuestion: (
    assessmentId: string,
    data: {
      question_text: string
      marks: number
      explanation?: string
      order_index?: number
      options: Array<{ option_text: string; is_correct: boolean; order_index?: number }>
    }
  ) =>
    fetchJson<{ message: string; id: string }>(`/trainer/assessments/${assessmentId}/questions`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteQuestion: (questionId: string) =>
    fetchJson<{ message: string }>(`/trainer/questions/${questionId}`, {
      method: "DELETE",
    }),

  getAssessmentResults: (assessmentId: string) =>
    fetchJson<any[]>(`/trainer/assessments/${assessmentId}/results`),

  getPerformance: (params?: { course_id?: string; search?: string; page?: number; page_size?: number }) => {
    const q = new URLSearchParams()
    if (params?.course_id) q.set("course_id", params.course_id)
    if (params?.search) q.set("search", params.search)
    if (params?.page) q.set("page", params.page.toString())
    if (params?.page_size) q.set("page_size", params.page_size.toString())
    return fetchJson<TraineePerformanceResponse>(`/trainer/performance?${q.toString()}`)
  },
}
