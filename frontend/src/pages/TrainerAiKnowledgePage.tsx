import React, { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Sparkles,
  BookMarked,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Edit2,
  ShieldCheck,
} from "lucide-react"
import { trainerService, TrainerCourseItem } from "@/services/trainer"
import { aiService, AIKnowledgeItem, AIResourceItem } from "@/services/aiService"

export const TrainerAiKnowledgePage: React.FC = () => {
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<"FAQ" | "GLOSSARY">("FAQ")
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [selectedModuleId, setSelectedModuleId] = useState<string>("")
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([])
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<AIKnowledgeItem>>({})

  // Fetch Trainer Courses
  const { data: rawCourses } = useQuery({
    queryKey: ["trainer-courses"],
    queryFn: () => trainerService.listCourses(),
  })
  const courses: TrainerCourseItem[] = rawCourses || []

  useEffect(() => {
    if (rawCourses && rawCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(rawCourses[0].id)
    }
  }, [rawCourses, selectedCourseId])

  // Fetch Course Detail for modules
  const { data: courseDetail } = useQuery({
    queryKey: ["trainer-course-detail", selectedCourseId],
    queryFn: () => trainerService.getCourseDetail(selectedCourseId),
    enabled: !!selectedCourseId,
  })
  const modules = courseDetail?.modules || []

  // Fetch Resources
  const { data: rawResources } = useQuery({
    queryKey: ["ai-notebook-resources", selectedCourseId, selectedModuleId],
    queryFn: () => aiService.getNotebookResources(selectedCourseId, selectedModuleId || undefined),
    enabled: !!selectedCourseId,
  })
  const resources: AIResourceItem[] = rawResources || []

  useEffect(() => {
    if (rawResources && rawResources.length > 0) {
      setSelectedResourceIds(rawResources.map((r) => r.id))
    }
  }, [rawResources])

  const toggleResource = (id: string) => {
    setSelectedResourceIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    )
  }

  // Fetch Drafts for this tab
  const { data: drafts = [], isLoading: isLoadingDrafts } = useQuery({
    queryKey: ["ai-knowledge-drafts", activeTab, selectedCourseId],
    queryFn: () => aiService.getKnowledgeDrafts(activeTab, selectedCourseId),
    enabled: !!selectedCourseId,
  })

  // Mutations
  const generateMutation = useMutation({
    mutationFn: () => {
      const payload = {
        course_id: selectedCourseId,
        module_id: selectedModuleId || undefined,
        resource_ids: selectedResourceIds.length > 0 ? selectedResourceIds : undefined,
      }
      return activeTab === "FAQ"
        ? aiService.generateFaqs(payload)
        : aiService.generateGlossary(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-knowledge-drafts", activeTab, selectedCourseId] })
    },
    onError: (err: any) => {
      alert(err?.message || "Failed to generate knowledge content.")
    },
  })

  const approveMutation = useMutation({
    mutationFn: (draftId: string) => aiService.approveKnowledgeDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-knowledge-drafts", activeTab, selectedCourseId] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (draftId: string) => aiService.rejectKnowledgeDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-knowledge-drafts", activeTab, selectedCourseId] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ draftId, data }: { draftId: string; data: Partial<AIKnowledgeItem> }) =>
      aiService.updateKnowledgeDraft(draftId, data),
    onSuccess: () => {
      setEditingItemId(null)
      queryClient.invalidateQueries({ queryKey: ["ai-knowledge-drafts", activeTab, selectedCourseId] })
    },
  })

  const startEdit = (item: AIKnowledgeItem) => {
    setEditingItemId(item.id)
    setEditFormData({
      question: item.question,
      answer: item.answer,
      term: item.term,
      definition: item.definition,
    })
  }

  const handleSaveEdit = (draftId: string) => {
    updateMutation.mutate({ draftId, data: editFormData })
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-50 text-[#1557A6] rounded-md">
              <BookMarked className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI FAQ & Glossary Studio</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Human Review & Publication
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Synthesize grounded FAQs and technical operational glossaries from approved course materials. Content must be approved before publication to trainees.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("FAQ")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "FAQ"
              ? "bg-[#1557A6] text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          Course FAQs Generator
        </button>
        <button
          onClick={() => setActiveTab("GLOSSARY")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "GLOSSARY"
              ? "bg-[#1557A6] text-white shadow-2xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <BookMarked className="h-4 w-4" />
          Technical Glossary Generator
        </button>
      </div>

      {/* Generation Control Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value)
                setSelectedModuleId("")
              }}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800"
            >
              {courses.map((c: TrainerCourseItem) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Module Scope
            </label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800"
            >
              <option value="">All Course Modules</option>
              {modules.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resource chips */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Selected Grounding Resources ({selectedResourceIds.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {resources.map((res: AIResourceItem) => {
              const isChecked = selectedResourceIds.includes(res.id)
              return (
                <button
                  type="button"
                  key={res.id}
                  onClick={() => toggleResource(res.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    isChecked
                      ? "bg-blue-50 border-blue-300 text-[#1557A6]"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {res.title}
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending || !selectedCourseId}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1557A6] hover:bg-[#114380] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <Sparkles className={`h-4 w-4 ${generateMutation.isPending ? "animate-spin" : ""}`} />
            {generateMutation.isPending
              ? `Synthesizing ${activeTab}...`
              : `Generate ${activeTab === "FAQ" ? "FAQs" : "Glossary Terms"}`}
          </button>
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {activeTab === "FAQ" ? "Grounded FAQ Items" : "Glossary Definitions"} ({drafts.length})
          </h2>
          <span className="text-xs text-slate-500">
            Approved items are automatically published to trainees.
          </span>
        </div>

        {isLoadingDrafts ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-400">
            Loading items...
          </div>
        ) : drafts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-2">
            <BookMarked className="h-8 w-8 text-slate-300 mx-auto" />
            <div className="font-medium text-sm text-slate-700">No {activeTab} items generated yet</div>
            <p className="text-xs text-slate-400">Select course resources and click Generate above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((item) => {
              const isEditing = editingItemId === item.id
              const isApproved = item.status === "APPROVED"
              const isRejected = item.status === "REJECTED"

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-xl p-5 shadow-sm space-y-3 ${
                    isApproved
                      ? "border-emerald-200 bg-emerald-50/20"
                      : isRejected
                      ? "border-rose-200 bg-rose-50/20 opacity-70"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isApproved
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isRejected
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.review_status}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {!isApproved && !isRejected && (
                        <>
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(item.id)}
                                className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-medium"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingItemId(null)}
                                className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs font-medium"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(item)}
                                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => approveMutation.mutate(item.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve & Publish
                              </button>
                              <button
                                onClick={() => rejectMutation.mutate(item.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-medium"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {activeTab === "FAQ" ? (
                    isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editFormData.question || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, question: e.target.value })
                          }
                          className="w-full text-xs rounded border border-slate-300 p-2 font-semibold"
                        />
                        <textarea
                          value={editFormData.answer || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, answer: e.target.value })
                          }
                          rows={3}
                          className="w-full text-xs rounded border border-slate-300 p-2"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="font-bold text-slate-900 text-sm flex items-start gap-2">
                          <HelpCircle className="h-4 w-4 text-[#1557A6] flex-shrink-0 mt-0.5" />
                          <span>{item.question}</span>
                        </div>
                        <p className="text-xs text-slate-700 pl-6 leading-relaxed">{item.answer}</p>
                      </div>
                    )
                  ) : isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editFormData.term || ""}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, term: e.target.value })
                        }
                        className="w-full text-xs rounded border border-slate-300 p-2 font-bold"
                      />
                      <textarea
                        value={editFormData.definition || ""}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, definition: e.target.value })
                        }
                        rows={3}
                        className="w-full text-xs rounded border border-slate-300 p-2"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-sm">{item.term}</div>
                      <p className="text-xs text-slate-700 leading-relaxed">{item.definition}</p>
                    </div>
                  )}

                  {item.source_citation && (
                    <div className="text-[11px] text-[#1557A6] font-medium pt-1">
                      Grounded Citation: {item.source_citation}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default TrainerAiKnowledgePage
