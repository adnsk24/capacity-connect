import { fetchJson } from "./api"

export interface FeedbackSubmission {
  course_rating: number
  trainer_rating?: number
  content_rating?: number
  comments?: string
  suggestions?: string
}

export interface FeedbackRecord {
  id: string
  user_id: string
  user_name?: string
  course_id?: string
  course_title?: string
  trainer_id?: string
  course_rating?: number
  trainer_rating?: number
  content_rating?: number
  comments?: string
  suggestions?: string
  created_at: string
}

export interface CourseFeedbackSummary {
  course_id: string
  course_title: string
  average_course_rating: number
  average_trainer_rating: number
  feedback_count: number
  feedbacks: FeedbackRecord[]
}

export interface TrainerFeedbackSummary {
  trainer_id: string
  trainer_name: string
  average_trainer_rating: number
  feedback_count: number
  feedbacks: FeedbackRecord[]
}

export const feedbackService = {
  submitCourseFeedback: (courseId: string, payload: FeedbackSubmission) =>
    fetchJson<FeedbackRecord>(`/courses/${courseId}/feedback`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getCourseFeedback: (courseId: string) =>
    fetchJson<CourseFeedbackSummary>(`/courses/${courseId}/feedback`),

  getTrainerFeedback: () =>
    fetchJson<TrainerFeedbackSummary>("/trainer/feedback"),

  getAdminFeedback: () =>
    fetchJson<FeedbackRecord[]>("/admin/feedback"),
}
