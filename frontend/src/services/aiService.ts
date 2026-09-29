import { fetchJson } from "./api"

export interface AIStatus {
  ai_enabled: boolean
  ai_provider: string
  ai_model: string
  grounding_enforced: boolean
  active_features: string[]
}

export interface AIResourceItem {
  id: string
  title: string
  description?: string
  resource_type: string
  module_id?: string
  ai_enabled: boolean
  ai_approved: boolean
}

export interface AINotebookAskResponse {
  answer: string
  evidence_found: boolean
  citations: string[]
  retrieved_chunk_count: number
}

export interface AIQuizOption {
  option_text: string
  is_correct: boolean
}

export interface AIQuizDraftItem {
  id: string
  content_type: string
  course_id: string
  module_id?: string
  assessment_id?: string
  created_by: string
  status: string
  review_status: string
  reviewed_by?: string
  reviewed_at?: string
  question: string
  options: AIQuizOption[]
  correct_answer: string
  explanation?: string
  difficulty: string
  bloom_level: string
  marks: number
  source_citation?: string
  created_at?: string
  injected_question_id?: string
}

export interface AICompetencyDiagnosticResponse {
  user_id: string
  user_name: string
  readiness_percentage: number
  target_role_or_subject: string
  met_competencies_count: number
  total_competencies_count: number
  gaps: Array<{
    competency_id: string
    code: string
    name: string
    current_level: number
    required_level: number
    gap: number
    priority: string
  }>
  top_recommended_course?: {
    course_id: string
    title: string
    code: string
    match_score: number
  }
  ai_diagnostic_explanation: string
  closed_loop_framework: Array<{
    stage: number
    title: string
    description: string
  }>
  authoritative_source: string
}

export interface AITrainerMatchExplainResponse {
  trainer_id: string
  trainer_name: string
  designation: string
  department: string
  subject_id: string
  subject_name: string
  overall_match_score: number
  evidence_subscores: {
    competency_match: number
    experience_score: number
    qualification_score: number
    certification_score: number
    assessment_score: number
    feedback_score: number
  }
  matched_competencies: string[]
  ai_explainable_rationale: string
  authoritative_source: string
}

export interface AIStudyGuideResponse {
  id: string
  course_id: string
  course_title: string
  module_id?: string
  guide: {
    topic_overview: string
    key_concepts: string[]
    important_terminology: Array<{ term: string; definition: string }>
    concept_explanations: Array<{ title: string; explanation: string }>
    revision_points: string[]
    self_check_questions: Array<{ question: string; hint: string }>
    source_citation: string
  }
  created_at: string
}

export interface AIKnowledgeItem {
  id: string
  content_type: "FAQ" | "GLOSSARY"
  course_id: string
  module_id?: string
  status: string
  review_status: string
  reviewed_by?: string
  reviewed_at?: string
  source_citation?: string
  created_at?: string
  question?: string
  answer?: string
  term?: string
  definition?: string
}

export const aiService = {
  // System Status
  getStatus: () => fetchJson<AIStatus>("/ai/status"),

  // 1. AI Capacity Notebook
  askNotebook: (data: {
    course_id: string
    question: string
    module_id?: string
    resource_ids?: string[]
  }) =>
    fetchJson<AINotebookAskResponse>("/ai/notebook/ask", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getNotebookResources: (courseId: string, moduleId?: string) => {
    let url = `/ai/notebook/resources?course_id=${courseId}`
    if (moduleId) url += `&module_id=${moduleId}`
    return fetchJson<AIResourceItem[]>(url)
  },

  // 2. AI Quiz Generator
  generateQuizQuestions: (data: {
    course_id: string
    question_count?: number
    difficulty?: string
    bloom_level?: string
    module_id?: string
    resource_ids?: string[]
    target_assessment_id?: string
  }) =>
    fetchJson<AIQuizDraftItem[]>("/ai/quiz/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getQuizDrafts: (params?: { course_id?: string; assessment_id?: string; status?: string }) => {
    const q = new URLSearchParams()
    if (params?.course_id) q.set("course_id", params.course_id)
    if (params?.assessment_id) q.set("assessment_id", params.assessment_id)
    if (params?.status) q.set("status", params.status)
    const qs = q.toString()
    return fetchJson<AIQuizDraftItem[]>(`/ai/quiz/drafts${qs ? `?${qs}` : ""}`)
  },

  updateQuizDraft: (draftId: string, data: Partial<AIQuizDraftItem>) =>
    fetchJson<AIQuizDraftItem>(`/ai/quiz/drafts/${draftId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  approveQuizDraft: (draftId: string, targetAssessmentId?: string) =>
    fetchJson<AIQuizDraftItem>(`/ai/quiz/drafts/${draftId}/approve`, {
      method: "POST",
      body: JSON.stringify({ target_assessment_id: targetAssessmentId }),
    }),

  rejectQuizDraft: (draftId: string) =>
    fetchJson<AIQuizDraftItem>(`/ai/quiz/drafts/${draftId}/reject`, {
      method: "POST",
    }),

  deleteQuizDraft: (draftId: string) =>
    fetchJson<void>(`/ai/quiz/drafts/${draftId}`, {
      method: "DELETE",
    }),

  // 3. AI Competency Diagnostic
  generateCompetencyDiagnostic: (data?: { target_user_id?: string; subject_id?: string }) =>
    fetchJson<AICompetencyDiagnosticResponse>("/ai/competency/diagnostic", {
      method: "POST",
      body: JSON.stringify(data || {}),
    }),

  // 4. Explainable Trainer Matching
  explainTrainerMatch: (data: { subject_id: string; trainer_id: string }) =>
    fetchJson<AITrainerMatchExplainResponse>("/ai/trainer-matching/explain", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // 5. AI Study Guide
  generateStudyGuide: (data: {
    course_id: string
    module_id?: string
    resource_ids?: string[]
  }) =>
    fetchJson<AIStudyGuideResponse>("/ai/study-guide/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // 6. AI FAQ & Glossary
  generateFaqs: (data: { course_id: string; module_id?: string; resource_ids?: string[] }) =>
    fetchJson<AIKnowledgeItem[]>("/ai/knowledge/generate-faq", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  generateGlossary: (data: { course_id: string; module_id?: string; resource_ids?: string[] }) =>
    fetchJson<AIKnowledgeItem[]>("/ai/knowledge/generate-glossary", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getKnowledgeDrafts: (contentType: "FAQ" | "GLOSSARY", courseId?: string, status?: string) => {
    const q = new URLSearchParams({ content_type: contentType })
    if (courseId) q.set("course_id", courseId)
    if (status) q.set("status", status)
    return fetchJson<AIKnowledgeItem[]>(`/ai/knowledge/drafts?${q.toString()}`)
  },

  updateKnowledgeDraft: (draftId: string, data: Partial<AIKnowledgeItem>) =>
    fetchJson<AIKnowledgeItem>(`/ai/knowledge/drafts/${draftId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  approveKnowledgeDraft: (draftId: string) =>
    fetchJson<AIKnowledgeItem>(`/ai/knowledge/drafts/${draftId}/approve`, {
      method: "POST",
    }),

  rejectKnowledgeDraft: (draftId: string) =>
    fetchJson<AIKnowledgeItem>(`/ai/knowledge/drafts/${draftId}/reject`, {
      method: "POST",
    }),

  getPublishedKnowledge: (courseId: string, contentType: "FAQ" | "GLOSSARY") =>
    fetchJson<AIKnowledgeItem[]>(`/ai/knowledge/published?course_id=${courseId}&content_type=${contentType}`),
}
