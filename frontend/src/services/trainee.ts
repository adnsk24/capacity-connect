import { fetchJson } from "./api"

export interface Qualification {
  id?: string
  degree: string
  field_of_study?: string
  institution: string
  year_of_passing?: number
  grade_or_percentage?: string
}

export interface Experience {
  id?: string
  title: string
  organization_name: string
  location?: string
  start_date: string
  end_date?: string
  is_current: boolean
  description?: string
}

export interface Skill {
  id?: string
  skill_id?: string
  name: string
  category?: string
  proficiency_level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"
  years_of_experience?: number
  is_verified?: boolean
}

export interface TraineeProfile {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  phone_number?: string
  avatar_url?: string
  role: string
  account_status: string
  is_active: boolean
  is_verified: boolean
  organization_id?: string
  organization_name?: string
  department_id?: string
  department_name?: string
  employee_id?: string
  designation?: string
  cadre?: string
  posting_location?: string
  bio?: string
  interests?: string
  target_competency_level?: string
  readiness_score: number
  qualifications: Qualification[]
  experiences: Experience[]
  skills: Skill[]
  profile_completion_percentage: number
  completion_breakdown: Record<string, boolean>
}

export interface EnrolledCourseItem {
  course_id: string
  enrollment_id: string
  title: string
  code: string
  thumbnail_url?: string
  category_name: string
  difficulty_level: string
  duration_hours: number
  status: string
  enrolled_at: string
  last_accessed_at?: string
  progress_percentage: number
  completed_lessons_count: number
  total_lessons_count: number
  next_lesson_id?: string
  next_lesson_title?: string
  certificate_id?: string
  certificate_number?: string
  certificate_pdf_url?: string
  certificate_issue_date?: string
  certificate_status?: string
  has_pending_assessment?: boolean
  pending_assessment_id?: string
  pending_assessment_title?: string
}

export interface CompetencyOverview {
  id: string
  competency_id: string
  name: string
  code: string
  category: string
  current_level: number
  target_level: number
  confidence_score: number
}

export interface CertificateItem {
  id: string
  title: string
  course_id?: string
  course_title?: string
  issuing_organization: string
  credential_id?: string
  issue_date: string
  verification_status: string
}

export interface TraineeDashboardData {
  welcome_message: string
  user_summary: {
    id: string
    first_name: string
    last_name: string
    email: string
    role: string
    account_status: string
    organization: string
    department: string
  }
  profile_completion_percentage: number
  courses_enrolled_count: number
  courses_completed_count: number
  average_progress_percentage: number
  recent_learning: EnrolledCourseItem[]
  upcoming_assessments: Array<Record<string, unknown>>
  competencies: CompetencyOverview[]
  certificates: CertificateItem[]
  notifications: Array<Record<string, unknown>>
}

export const traineeService = {
  async getDashboard(): Promise<TraineeDashboardData> {
    return fetchJson<TraineeDashboardData>("/trainee/dashboard")
  },

  async getProfile(): Promise<TraineeProfile> {
    return fetchJson<TraineeProfile>("/trainee/profile")
  },

  async updateProfile(data: Partial<TraineeProfile>): Promise<TraineeProfile> {
    return fetchJson<TraineeProfile>("/trainee/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  async getMyLearning(): Promise<EnrolledCourseItem[]> {
    return fetchJson<EnrolledCourseItem[]>("/trainee/learning")
  },
}
