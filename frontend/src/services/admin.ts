import { fetchJson } from "./api"

export interface AdminDashboardStats {
  total_users: number
  pending_users: number
  active_trainees: number
  active_trainers: number
  total_courses: number
  published_courses: number
  total_enrollments: number
  assessment_attempts: number
  certifications_count: number
  overall_completion_rate: number
  users_by_role: Record<string, number>
  category_distribution: Array<{ category: string; count: number }>
  recent_activity: Array<{ type: string; title: string; timestamp: string | null }>
}

export interface AdminUserItem {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  phone_number?: string | null
  avatar_url?: string | null
  role: string
  account_status: string
  is_active: boolean
  is_verified: boolean
  organization_id?: string | null
  department_id?: string | null
  created_at: string
  updated_at: string
}

export interface AdminCourseItem {
  id: string
  title: string
  code: string
  category_name: string
  trainer_name?: string | null
  status: string
  difficulty_level: string
  enrollments_count: number
  completion_rate: number
  created_at: string
}

export interface AdminAssessmentItem {
  id: string
  title: string
  course_title: string
  trainer_name?: string | null
  assessment_type: string
  duration_minutes?: number | null
  passing_percentage: number
  status: string
  attempts_count: number
  average_score: number
  pass_rate: number
}

export const adminService = {
  getDashboard: () => fetchJson<AdminDashboardStats>("/admin/dashboard"),

  listUsers: (params?: { role?: string; status?: string; search?: string; page?: number; page_size?: number }) => {
    const q = new URLSearchParams()
    if (params?.role) q.set("role", params.role)
    if (params?.status) q.set("status", params.status)
    if (params?.search) q.set("search", params.search)
    if (params?.page) q.set("page", params.page.toString())
    if (params?.page_size) q.set("page_size", params.page_size.toString())
    return fetchJson<AdminUserItem[]>(`/admin/users?${q.toString()}`)
  },

  updateUserStatus: (userId: string, status: string) =>
    fetchJson<AdminUserItem>(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  updateUserRole: (userId: string, role: string) =>
    fetchJson<AdminUserItem>(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  listCourses: () => fetchJson<AdminCourseItem[]>("/admin/courses"),

  updateCourseStatus: (courseId: string, status: string) =>
    fetchJson<AdminCourseItem>(`/admin/courses/${courseId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  listAssessments: () => fetchJson<AdminAssessmentItem[]>("/admin/assessments"),
}
