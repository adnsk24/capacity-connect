import React, { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  BookOpen,
  Send,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  FileText,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Layers,
  Info,
} from "lucide-react"
import { coursesService, CourseCard } from "@/services/courses"
import { aiService, AIResourceItem } from "@/services/aiService"

interface Message {
  id: string
  role: "user" | "assistant"
  text: string
  citations?: any[]
  evidenceFound?: boolean
  timestamp: string
}

export const TraineeAiNotebookPage: React.FC = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [selectedModuleId, setSelectedModuleId] = useState<string>("")
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([])
  const [questionInput, setQuestionInput] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null)

  // Fetch available courses
  const { data: catalogue } = useQuery({
    queryKey: ["trainee-catalogue-courses"],
    queryFn: () => coursesService.getCatalogue({ pageSize: 50 }),
  })
  const courses: CourseCard[] = catalogue?.items || []

  // Select first course automatically
  useEffect(() => {
    if (catalogue?.items && catalogue.items.length > 0 && !selectedCourseId) {
      setSelectedCourseId(catalogue.items[0].id)
    }
  }, [catalogue, selectedCourseId])

  // Fetch modules for selected course
  const { data: courseDetail } = useQuery({
    queryKey: ["course-detail-modules", selectedCourseId],
    queryFn: () => coursesService.getCourseDetails(selectedCourseId),
    enabled: !!selectedCourseId,
  })
  const modules = courseDetail?.modules || []

  // Fetch AI approved resources
  const { data: rawResources, isLoading: isLoadingResources } = useQuery({
    queryKey: ["ai-notebook-resources", selectedCourseId, selectedModuleId],
    queryFn: () => aiService.getNotebookResources(selectedCourseId, selectedModuleId || undefined),
    enabled: !!selectedCourseId,
  })
  const resources: AIResourceItem[] = rawResources || []

  // Auto-select all resources initially
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

  const handleSelectAllResources = () => {
    if (selectedResourceIds.length === resources.length) {
      setSelectedResourceIds([])
    } else {
      setSelectedResourceIds(resources.map((r) => r.id))
    }
  }

  const handleSubmitQuestion = async (promptText?: string) => {
    const q = (promptText || questionInput).trim()
    if (!q || !selectedCourseId || isSubmitting) return

    const generateMsgId = () =>
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    const userMsg: Message = {
      id: generateMsgId(),
      role: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMsg])
    setQuestionInput("")
    setIsSubmitting(true)

    try {
      const res = await aiService.askNotebook({
        course_id: selectedCourseId,
        question: q,
        module_id: selectedModuleId || undefined,
        resource_ids: selectedResourceIds.length > 0 ? selectedResourceIds : undefined,
      })

      const assistantMsg: Message = {
        id: generateMsgId(),
        role: "assistant",
        text: res.answer,
        citations: res.citations,
        evidenceFound: res.evidence_found,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: any) {
      const errorMsg: Message = {
        id: generateMsgId(),
        role: "assistant",
        text: err?.message || "Failed to retrieve grounded answer. Please try again.",
        evidenceFound: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClearConversation = () => {
    setMessages([])
    setExpandedCitation(null)
  }

  const suggestedPrompts = [
    "What are the thermal infrared cloud-top temperature thresholds for deep convection?",
    "Explain the Doppler radar velocity couplet interpretation for cyclonic storm signatures.",
    "What are the official Standard Operating Procedure warning thresholds for Depression stage?",
    "How does numerical weather prediction ensemble spread correlate with forecast confidence?",
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-blue-50 text-[#1557A6] rounded-md">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">AI Capacity Notebook</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Grounded in selected training materials
            </span>
          </div>
          <p className="text-sm text-slate-600">
            Ask targeted questions against authorized IMD curriculum manuals and resources. The intelligence assistant strictly adheres to factual source evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearConversation}
            disabled={messages.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear Session
          </button>
        </div>
      </div>

      {/* Grid: Left Source Controls + Right Chat Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Source Filter Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Layers className="h-4 w-4 text-[#1557A6]" />
              Authorized Knowledge Sources
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {selectedResourceIds.length} Selected
            </span>
          </div>

          {/* Course Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Course Offering
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value)
                setSelectedModuleId("")
              }}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-[#1557A6] focus:ring-1 focus:ring-[#1557A6] bg-white text-slate-800"
            >
              {courses.map((c: CourseCard) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Module Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Module Scope (Optional)
            </label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:border-[#1557A6] focus:ring-1 focus:ring-[#1557A6] bg-white text-slate-800"
            >
              <option value="">All Curriculum Modules</option>
              {modules.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Approved Resource Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Approved Materials
              </label>
              <button
                type="button"
                onClick={handleSelectAllResources}
                className="text-[11px] text-[#1557A6] hover:underline font-medium"
              >
                {selectedResourceIds.length === resources.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            {isLoadingResources ? (
              <div className="text-center py-6 text-xs text-slate-400">Loading resources...</div>
            ) : resources.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                <Info className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" />
                <span>No AI-approved documents found for this curriculum module.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {resources.map((res: AIResourceItem) => {
                  const isChecked = selectedResourceIds.includes(res.id)
                  return (
                    <label
                      key={res.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-blue-50/50 border-blue-200 text-slate-900"
                          : "bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100/70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleResource(res.id)}
                        className="mt-0.5 rounded border-slate-300 text-[#1557A6] focus:ring-[#1557A6]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{res.title}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                          <FileText className="h-3 w-3" />
                          <span className="uppercase">{res.resource_type}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-medium">AI Approved</span>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700">Strict Grounding Rule:</span> The AI assistant only retrieves text from the checked documents above. Gaps in evidence are reported immediately without unsupported conjecture.
          </div>
        </div>

        {/* Main Conversation Stream Panel (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm min-h-[640px]">
          {/* Conversation History Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.length === 0 ? (
              <div className="py-12 px-4 text-center max-w-lg mx-auto">
                <div className="h-12 w-12 bg-blue-50 text-[#1557A6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Grounded Training Assistance</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Select your approved course documents from the panel and ask operational or conceptual meteorological questions.
                </p>

                {/* Prompt Suggestions */}
                <div className="text-left">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Sample Inquiry Prompts
                  </div>
                  <div className="space-y-2">
                    {suggestedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSubmitQuestion(prompt)}
                        className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50 hover:text-[#1557A6] border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors flex items-center justify-between group"
                      >
                        <span className="truncate pr-2">{prompt}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#1557A6] flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {msg.role === "user" ? "You" : "Capacity Connect Assistant"}
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-xl p-4 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#1557A6] text-white"
                        : "bg-slate-50 border border-slate-200 text-slate-800"
                    }`}
                  >
                    {msg.role === "assistant" && msg.evidenceFound === false ? (
                      <div className="flex items-start gap-2.5 text-amber-900">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-xs text-amber-800 uppercase tracking-wider mb-1">
                            Insufficient evidence in selected training materials
                          </div>
                          <div className="text-xs leading-relaxed text-slate-700">{msg.text}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    )}

                    {/* Expandable Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-200/80">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Source Evidence Citations ({msg.citations.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.citations.map((cItem: any, cIdx: number) => {
                            const label =
                              typeof cItem === "string"
                                ? cItem
                                : cItem.source
                                ? `${cItem.source}${cItem.page ? ` (p. ${cItem.page})` : ""}`
                                : cItem.raw_citation || "Source Evidence"
                            const detail =
                              typeof cItem === "string"
                                ? cItem
                                : cItem.raw_citation ||
                                  `${cItem.source}, Page: ${cItem.page || "N/A"}, Section: "${
                                    cItem.section || "N/A"
                                  }"`
                            return (
                              <button
                                key={cIdx}
                                onClick={() =>
                                  setExpandedCitation(expandedCitation === detail ? null : detail)
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-300 rounded-md text-[11px] font-medium text-slate-700 transition-colors shadow-2xs"
                              >
                                <span>{label}</span>
                                <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                              </button>
                            )
                          })}
                        </div>
                        {expandedCitation && (
                          <div className="mt-2.5 p-2.5 bg-blue-50/70 border border-blue-200 rounded-md text-xs text-blue-950">
                            <span className="font-semibold">Verified Source Citation:</span> {expandedCitation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isSubmitting && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 w-fit">
                <Sparkles className="h-4 w-4 text-[#1557A6] animate-spin" />
                <span>Searching authorized training materials and generating grounded response...</span>
              </div>
            )}
          </div>

          {/* Question Input Form */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 rounded-b-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmitQuestion()
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                placeholder="Ask about Doppler thresholds, radar velocity signatures, or SOP rules..."
                disabled={isSubmitting}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-[#1557A6] focus:ring-1 focus:ring-[#1557A6] bg-white text-slate-900"
              />
              <button
                type="submit"
                disabled={!questionInput.trim() || isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#1557A6] hover:bg-[#114380] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                Ask Assistant
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TraineeAiNotebookPage
