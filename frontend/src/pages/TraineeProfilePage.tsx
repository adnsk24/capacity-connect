import React, { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  User,
  Building,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Tabs } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/ui/status-badge"
import { ErrorState } from "@/components/ui/error-state"
import { Skeleton } from "@/components/ui/loading-skeleton"
import {
  traineeService,
  TraineeProfile,
  Qualification,
  Experience,
  Skill,
} from "@/services/trainee"

export const TraineeProfilePage: React.FC = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("general")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<{
    first_name: string
    last_name: string
    phone_number: string
    designation: string
    cadre: string
    posting_location: string
    bio: string
    interests: string
    qualifications: Qualification[]
    experiences: Experience[]
    skills: Skill[]
  }>({
    first_name: "",
    last_name: "",
    phone_number: "",
    designation: "",
    cadre: "",
    posting_location: "",
    bio: "",
    interests: "",
    qualifications: [],
    experiences: [],
    skills: [],
  })

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ["trainee-profile"],
    queryFn: () => traineeService.getProfile(),
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone_number: profile.phone_number || "",
        designation: profile.designation || "",
        cadre: profile.cadre || "",
        posting_location: profile.posting_location || "",
        bio: profile.bio || "",
        interests: profile.interests || "",
        qualifications: profile.qualifications || [],
        experiences: profile.experiences || [],
        skills: profile.skills || [],
      })
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: (data: Partial<TraineeProfile>) => traineeService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["trainee-profile"], updatedProfile)
      queryClient.invalidateQueries({ queryKey: ["trainee-dashboard"] })
      setSaveSuccess(true)
      setSaveError(null)
      setTimeout(() => setSaveSuccess(false), 3000)
    },
    onError: (err: Error) => {
      setSaveError(err.message || "Failed to update profile.")
      setSaveSuccess(false)
    },
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  // Qualification helpers
  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        { degree: "", institution: "", year_of_passing: new Date().getFullYear(), field_of_study: "" },
      ],
    }))
  }

  const removeQualification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }))
  }

  // Experience helpers
  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          title: "",
          organization_name: "India Meteorological Department",
          start_date: new Date().toISOString().split("T")[0],
          is_current: true,
        },
      ],
    }))
  }

  const removeExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }))
  }

  // Skill helpers
  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [
        ...prev.skills,
        { name: "", proficiency_level: "INTERMEDIATE", years_of_experience: 1 },
      ],
    }))
  }

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <ErrorState
        title="Profile Load Error"
        message={error instanceof Error ? error.message : "Could not retrieve profile."}
        onRetry={() => refetch()}
      />
    )
  }

  const tabs = [
    { id: "general", label: "General & Identity", icon: <User className="h-3.5 w-3.5" /> },
    { id: "professional", label: "Professional & Posting", icon: <Briefcase className="h-3.5 w-3.5" /> },
    {
      id: "qualifications",
      label: "Qualifications",
      count: formData.qualifications.length,
      icon: <GraduationCap className="h-3.5 w-3.5" />,
    },
    {
      id: "experience",
      label: "Experience",
      count: formData.experiences.length,
      icon: <Building className="h-3.5 w-3.5" />,
    },
    {
      id: "skills",
      label: "Skills & Proficiencies",
      count: formData.skills.length,
      icon: <Sparkles className="h-3.5 w-3.5" />,
    },
  ]

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-lg bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-[#1557A6] text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {profile.first_name?.[0]}
              {profile.last_name?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  {profile.first_name} {profile.last_name}
                </h1>
                <StatusBadge status={profile.account_status} />
              </div>
              <p className="text-[12px] text-slate-500 font-mono mt-0.5">
                {profile.email} · Employee ID: {profile.employee_id || "IMD-TRN-PENDING"}
              </p>
              <div className="flex items-center gap-2 text-[12px] text-slate-600 mt-1">
                <span className="font-medium text-slate-800">{profile.designation || "Operational Trainee"}</span>
                <span className="text-slate-300">·</span>
                <span>{profile.organization_name || "India Meteorological Department"}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Completion Widget */}
          <div className="sm:text-right bg-slate-50 p-3.5 rounded-md border border-slate-200 min-w-[200px]">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">
              Profile Dossier Completion
            </span>
            <div className="text-2xl font-bold text-[#1557A6]">
              {profile.profile_completion_percentage}%
            </div>
            <div className="mt-1.5 w-full">
              <ProgressBar value={profile.profile_completion_percentage} size="sm" variant="primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Save Notification */}
      {saveSuccess && (
        <div className="p-3 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Profile changes saved successfully. Personnel records updated.</span>
        </div>
      )}

      {saveError && (
        <div className="p-3 rounded-lg bg-red-50 text-red-800 border border-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: General & Identity */}
        {activeTab === "general" && (
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-slate-100">
              <CardTitle className="text-[15px] font-semibold text-slate-900">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-slate-700">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-slate-700">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-slate-700">Official Email (Locked)</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-md bg-slate-50 text-slate-500 cursor-not-allowed font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-slate-700">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Professional & Posting */}
        {activeTab === "professional" && (
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-slate-100">
              <CardTitle className="text-[15px] font-semibold text-slate-900">Operational Posting & Bio</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-slate-700">Designation</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Scientific Assistant, Meteorologist-A"
                    className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-slate-700">Cadre / Division</label>
                  <input
                    type="text"
                    value={formData.cadre}
                    onChange={(e) => setFormData({ ...formData, cadre: e.target.value })}
                    placeholder="e.g. Operational Meteorology Cadre"
                    className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-700">Posting Location / Meteorological Centre</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.posting_location}
                    onChange={(e) => setFormData({ ...formData, posting_location: e.target.value })}
                    placeholder="e.g. Regional Meteorological Centre (RMC) New Delhi"
                    className="w-full h-9 pl-9 pr-3 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-700">Professional Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Summary of experience, operational duties, and atmospheric scientific background..."
                  className="w-full p-3 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-700">Scientific Interests</label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="e.g. Doppler radar nowcasting, tropical cyclones, Python for NWP"
                  className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6] focus:border-[#1557A6]"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Qualifications */}
        {activeTab === "qualifications" && (
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[15px] font-semibold text-slate-900">Academic & Professional Degrees</CardTitle>
                <p className="text-[12px] text-slate-500">Degree credentials and academic background</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addQualification} className="text-xs flex items-center gap-1.5 border-slate-200">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Degree</span>
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {formData.qualifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-[12px]">No qualifications listed yet. Click "Add Degree" to add academic credentials.</p>
                </div>
              ) : (
                formData.qualifications.map((q, idx) => (
                  <div key={idx} className="p-4 rounded-md border border-slate-200 bg-slate-50/60 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeQualification(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                      <div>
                        <label className="font-medium text-[12px] text-slate-700 block mb-1">Degree / Diploma</label>
                        <input
                          type="text"
                          value={q.degree}
                          onChange={(e) => {
                            const newQ = [...formData.qualifications]
                            newQ[idx].degree = e.target.value
                            setFormData({ ...formData, qualifications: newQ })
                          }}
                          placeholder="e.g. M.Sc. Atmospheric Sciences"
                          required
                          className="w-full h-8 px-2.5 text-[12px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-[12px] text-slate-700 block mb-1">Institution / University</label>
                        <input
                          type="text"
                          value={q.institution}
                          onChange={(e) => {
                            const newQ = [...formData.qualifications]
                            newQ[idx].institution = e.target.value
                            setFormData({ ...formData, qualifications: newQ })
                          }}
                          placeholder="e.g. IIT Delhi"
                          required
                          className="w-full h-8 px-2.5 text-[12px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-[12px] text-slate-700 block mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={q.field_of_study || ""}
                          onChange={(e) => {
                            const newQ = [...formData.qualifications]
                            newQ[idx].field_of_study = e.target.value
                            setFormData({ ...formData, qualifications: newQ })
                          }}
                          placeholder="e.g. Physics / Meteorology"
                          className="w-full h-8 px-2.5 text-[12px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-[12px] text-slate-700 block mb-1">Year of Passing</label>
                        <input
                          type="number"
                          value={q.year_of_passing || ""}
                          onChange={(e) => {
                            const newQ = [...formData.qualifications]
                            newQ[idx].year_of_passing = parseInt(e.target.value) || undefined
                            setFormData({ ...formData, qualifications: newQ })
                          }}
                          className="w-full h-8 px-2.5 text-[12px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Experience */}
        {activeTab === "experience" && (
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[15px] font-semibold text-slate-900">Operational Experience History</CardTitle>
                <p className="text-[12px] text-slate-500">Past and present meteorological postings</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addExperience} className="text-xs flex items-center gap-1.5 border-slate-200">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Position</span>
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {formData.experiences.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-[12px]">No operational experience listed. Click "Add Position" to document work history.</p>
                </div>
              ) : (
                formData.experiences.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-md border border-slate-200 bg-slate-50/60 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-6">
                      <div>
                        <label className="font-medium text-[12px] text-slate-700 block mb-1">Job Title / Role</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const newExp = [...formData.experiences]
                            newExp[idx].title = e.target.value
                            setFormData({ ...formData, experiences: newExp })
                          }}
                          placeholder="e.g. Scientific Assistant"
                          required
                          className="w-full h-8 px-2.5 text-[12px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-[12px] text-slate-700 block mb-1">Organization</label>
                        <input
                          type="text"
                          value={exp.organization_name}
                          onChange={(e) => {
                            const newExp = [...formData.experiences]
                            newExp[idx].organization_name = e.target.value
                            setFormData({ ...formData, experiences: newExp })
                          }}
                          required
                          className="w-full h-8 px-2.5 text-[12px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-[12px] text-slate-700 block mb-1">Start Date</label>
                        <input
                          type="date"
                          value={exp.start_date}
                          onChange={(e) => {
                            const newExp = [...formData.experiences]
                            newExp[idx].start_date = e.target.value
                            setFormData({ ...formData, experiences: newExp })
                          }}
                          required
                          className="w-full h-8 px-2.5 text-[12px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id={`current-${idx}`}
                          checked={exp.is_current}
                          onChange={(e) => {
                            const newExp = [...formData.experiences]
                            newExp[idx].is_current = e.target.checked
                            setFormData({ ...formData, experiences: newExp })
                          }}
                          className="rounded text-[#1557A6] focus:ring-[#1557A6]"
                        />
                        <label htmlFor={`current-${idx}`} className="font-medium text-[12px] text-slate-700 cursor-pointer">
                          Currently active in this role
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="font-medium text-[12px] text-slate-700 block mb-1">Description / Key Responsibilities</label>
                      <textarea
                        rows={2}
                        value={exp.description || ""}
                        onChange={(e) => {
                          const newExp = [...formData.experiences]
                          newExp[idx].description = e.target.value
                          setFormData({ ...formData, experiences: newExp })
                        }}
                        placeholder="Details of weather station operations, chart analysis, or telemetry..."
                        className="w-full p-2.5 text-[12px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 5: Skills */}
        {activeTab === "skills" && (
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[15px] font-semibold text-slate-900">Skills & Proficiencies</CardTitle>
                <p className="text-[12px] text-slate-500">Technical, observational, and computational abilities</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={addSkill} className="text-xs flex items-center gap-1.5 border-slate-200">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Skill</span>
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {formData.skills.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-[12px]">No skills specified yet. Click "Add Skill" to record technical competencies.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.skills.map((s, idx) => (
                    <div key={idx} className="p-3.5 rounded-md border border-slate-200 bg-slate-50/60 space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => removeSkill(idx)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div>
                        <label className="font-medium text-[12px] text-slate-700 block mb-1">Skill Name</label>
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) => {
                            const newSkills = [...formData.skills]
                            newSkills[idx].name = e.target.value
                            setFormData({ ...formData, skills: newSkills })
                          }}
                          placeholder="e.g. Radar Reflectivity Analysis"
                          required
                          className="w-full h-8 px-2.5 text-[12px] border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="font-medium text-[12px] text-slate-700 block mb-1">Proficiency</label>
                          <select
                            value={s.proficiency_level}
                            onChange={(e) => {
                              const newSkills = [...formData.skills]
                              newSkills[idx].proficiency_level = e.target.value as Skill["proficiency_level"]
                              setFormData({ ...formData, skills: newSkills })
                            }}
                            className="w-full h-8 px-2 border border-slate-200 rounded-md bg-white text-[12px] focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                          >
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                            <option value="EXPERT">Expert</option>
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="font-medium text-[12px] text-slate-700 block mb-1">Years</label>
                          <input
                            type="number"
                            step="0.5"
                            value={s.years_of_experience || ""}
                            onChange={(e) => {
                              const newSkills = [...formData.skills]
                              newSkills[idx].years_of_experience = parseFloat(e.target.value) || 0
                              setFormData({ ...formData, skills: newSkills })
                            }}
                            className="w-full h-8 px-2 border border-slate-200 rounded-md bg-white text-[12px] focus:outline-none focus:ring-1 focus:ring-[#1557A6]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Global Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-[#1557A6] hover:bg-[#0f4282] text-white font-medium text-[13px] h-9 px-6 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>{updateMutation.isPending ? "Updating Dossier..." : "Save Profile Changes"}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
