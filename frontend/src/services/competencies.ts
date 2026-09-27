import { fetchJson } from "./api"

export interface CompetencyLevelInfo {
  level: number
  name: string
  descriptor: string
  badge_color: string
}

export interface CompetencyEvidenceItem {
  type: string
  title: string
  score: number
  contribution: number
  detail: string
}

export interface UserCompetency {
  competency_id: string
  code: string
  name: string
  category: string
  description?: string
  current_level: number
  integer_level: number
  level_name: string
  badge_color: string
  target_level: number
  confidence_score: number
  evidence: CompetencyEvidenceItem[]
  summary_explanation: string
}

export interface SkillGapItem {
  competency_id: string
  code: string
  name: string
  category: string
  current_level: number
  required_level: number
  gap: number
  priority: "HIGH" | "MEDIUM" | "LOW"
  weight: number
  evidence_summary: string
}

export interface TrainingReadinessBreakdownItem {
  competency_id: string
  code: string
  name: string
  current_level: number
  required_level: number
  gap: number
  is_met: boolean
  weight: number
}

export interface TrainingReadinessResponse {
  overall_readiness_percentage: number
  target_role_or_subject: string
  required_competencies_count: number
  met_competencies_count: number
  gaps_count: number
  competency_breakdown: TrainingReadinessBreakdownItem[]
  formula_explanation: string
}

export interface PersonalizedCourseRecommendation {
  course_id: string
  code: string
  title: string
  difficulty_level: string
  duration_hours: number
  match_score: number
  addressed_gaps: string[]
  why_recommended: string
  covered_competencies: string[]
}

export interface CompetencyGrowthPoint {
  date: string
  level: number
  event_type: string
  description: string
}

export interface CompetencyGrowthResponse {
  competency_id: string
  code: string
  name: string
  growth_points: CompetencyGrowthPoint[]
}

export interface TrainerRecommendationCandidate {
  trainer_id: string
  name: string
  email: string
  designation?: string
  department?: string
  overall_match_score: number
  competency_match: number
  experience_score: number
  qualification_score: number
  certification_score: number
  assessment_score: number
  feedback_score: number
  matched_competencies: string[]
  missing_competencies: string[]
  explanation: string
}

export interface TrainerRecommendationResponse {
  subject_id: string
  subject_name: string
  subject_code: string
  domain?: string
  candidate_count: number
  candidates: TrainerRecommendationCandidate[]
}

export interface SubjectRequirementItem {
  competency_id: string
  competency_code: string
  competency_name: string
  category: string
  required_level: number
  weight: number
}

export interface SubjectDetail {
  id: string
  name: string
  code: string
  description?: string
  domain?: string
  is_active: boolean
  requirements: SubjectRequirementItem[]
}

export interface CompetencyCatalogueItem {
  id: string
  code: string
  name: string
  category: string
  description?: string
  level_descriptions?: string
}

export const competenciesService = {
  listCompetencies: () => fetchJson<CompetencyCatalogueItem[]>("/competencies"),

  getLevels: () => fetchJson<CompetencyLevelInfo[]>("/competencies/levels"),

  getMyCompetencies: () => fetchJson<UserCompetency[]>("/competencies/me"),

  getMySkillGaps: (subjectId?: string) => {
    const query = subjectId ? `?subject_id=${subjectId}` : ""
    return fetchJson<SkillGapItem[]>(`/competencies/me/gaps${query}`)
  },

  getMyReadiness: (subjectId?: string) => {
    const query = subjectId ? `?subject_id=${subjectId}` : ""
    return fetchJson<TrainingReadinessResponse>(`/competencies/me/readiness${query}`)
  },

  getMyRecommendations: () =>
    fetchJson<PersonalizedCourseRecommendation[]>("/competencies/me/recommendations"),

  getMyGrowth: (competencyId: string) =>
    fetchJson<CompetencyGrowthResponse>(`/competencies/me/growth/${competencyId}`),

  listSubjects: () => fetchJson<SubjectDetail[]>("/competencies/subjects"),

  getTrainerRecommendations: (subjectId: string) =>
    fetchJson<TrainerRecommendationResponse>(
      `/competencies/trainer-recommendations?subject_id=${subjectId}`
    ),

  getUserCompetencies: (userId: string) =>
    fetchJson<UserCompetency[]>(`/competencies/user/${userId}`),
}
