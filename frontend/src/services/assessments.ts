import { fetchJson } from "./api"

export interface QuestionOption {
  id: string
  question_id: string
  option_text: string
  order_index: number
  is_correct?: boolean | null
}

export interface Question {
  id: string
  assessment_id: string
  question_text: string
  question_type: string
  marks: number
  explanation?: string | null
  order_index: number
  options: QuestionOption[]
}

export interface AssessmentListItem {
  id: string
  course_id: string
  course_title: string
  module_id?: string | null
  title: string
  description?: string | null
  assessment_type: string
  passing_percentage: number
  total_marks: number
  duration_minutes?: number | null
  max_attempts: number
  status: string
  due_at?: string | null
  questions_count: number
  user_attempts_count: number
  user_attempts_remaining: number
  best_score?: number | null
  is_passed?: boolean | null
}

export interface AssessmentDetail extends AssessmentListItem {
  questions: Question[]
}

export interface AssessmentAttemptStartResponse {
  attempt_id: string
  assessment_id: string
  assessment_title: string
  attempt_number: number
  status: string
  started_at: string
  duration_minutes?: number | null
  remaining_seconds?: number | null
  total_questions: number
  total_marks: number
  passing_percentage: number
  questions: Question[]
}

export interface QuestionReviewItem {
  question_id: string
  question_text: string
  marks: number
  marks_awarded: number
  selected_option_id?: string | null
  is_correct: boolean
  explanation?: string | null
  options: QuestionOption[]
}

export interface AssessmentResultResponse {
  attempt_id: string
  assessment_id: string
  assessment_title: string
  course_title: string
  attempt_number: number
  status: string
  total_marks: number
  score_obtained: number
  percentage: number
  is_passed: boolean
  started_at: string
  submitted_at?: string | null
  questions: QuestionReviewItem[]
}

export interface AssessmentAttemptHistoryItem {
  attempt_id: string
  assessment_id: string
  assessment_title: string
  course_title: string
  attempt_number: number
  status: string
  total_marks: number
  score_obtained?: number | null
  percentage?: number | null
  is_passed?: boolean | null
  started_at: string
  submitted_at?: string | null
}

export const assessmentsService = {
  listAssessments: () => fetchJson<AssessmentListItem[]>("/assessments"),

  getAssessment: (assessmentId: string) =>
    fetchJson<AssessmentDetail>(`/assessments/${assessmentId}`),

  startAttempt: (assessmentId: string) =>
    fetchJson<AssessmentAttemptStartResponse>(`/assessments/${assessmentId}/attempts`, {
      method: "POST",
    }),

  getAttemptState: (attemptId: string) =>
    fetchJson<AssessmentAttemptStartResponse | AssessmentResultResponse>(
      `/assessments/attempts/${attemptId}`
    ),

  submitAttempt: (
    attemptId: string,
    answers: Array<{ question_id: string; selected_option_id?: string | null; text_response?: string | null }>
  ) =>
    fetchJson<AssessmentResultResponse>(`/assessments/attempts/${attemptId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),

  getHistory: () => fetchJson<AssessmentAttemptHistoryItem[]>("/trainee/assessments/history"),
}
