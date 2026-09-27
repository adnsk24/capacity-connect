import React, { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Layouts
import { AppShell } from "@/components/layout/AppShell"
import { TraineeLayout } from "@/components/layout/TraineeLayout"
import { TrainerLayout } from "@/components/layout/TrainerLayout"
import { AdminLayout } from "@/components/layout/AdminLayout"

// Public & Auth Pages
import { HomePage } from "@/pages/HomePage"
import { HealthPage } from "@/pages/HealthPage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { VerifyEmailPage } from "@/pages/VerifyEmailPage"
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage"
import { ResetPasswordPage } from "@/pages/ResetPasswordPage"

// Phase 3 Courses & Trainee Pages
import { CourseCataloguePage } from "@/pages/CourseCataloguePage"
import { CourseDetailPage } from "@/pages/CourseDetailPage"
import { TraineeDashboardPage } from "@/pages/TraineeDashboardPage"
import { TraineeProfilePage } from "@/pages/TraineeProfilePage"
import { MyLearningPage } from "@/pages/MyLearningPage"
import { LearningContentPage } from "@/pages/LearningContentPage"
import { CertificatesPage } from "@/pages/CertificatesPage"
import { NotificationsPage } from "@/pages/NotificationsPage"

// Phase 5 Competency Intelligence & 3D Universe Pages
import { TraineeCompetenciesPage } from "@/pages/TraineeCompetenciesPage"
import { TraineeSkillGapPage } from "@/pages/TraineeSkillGapPage"
import { AdminTrainerRecommendationsPage } from "@/pages/AdminTrainerRecommendationsPage"

// Phase 4 Assessment Engine Pages
import { TraineeAssessmentsPage } from "@/pages/TraineeAssessmentsPage"
import { AssessmentDetailPage } from "@/pages/AssessmentDetailPage"
import { AssessmentTakePage } from "@/pages/AssessmentTakePage"
import { AssessmentResultPage } from "@/pages/AssessmentResultPage"

// Phase 4 Trainer Portal Pages
import { TrainerDashboardPage } from "@/pages/TrainerDashboardPage"
import { TrainerCoursesPage } from "@/pages/TrainerCoursesPage"
import { TrainerCourseDetailPage } from "@/pages/TrainerCourseDetailPage"
import { TrainerAssessmentsPage } from "@/pages/TrainerAssessmentsPage"
import { TrainerAssessmentBuilderPage } from "@/pages/TrainerAssessmentBuilderPage"
import { TrainerPerformancePage } from "@/pages/TrainerPerformancePage"

// Phase 4 Admin Portal Pages
import { AdminDashboardPage } from "@/pages/AdminDashboardPage"
import { AdminUsersPage } from "@/pages/AdminUsersPage"
import { AdminCoursesPage } from "@/pages/AdminCoursesPage"
import { AdminAssessmentsPage } from "@/pages/AdminAssessmentsPage"

// Guards & State
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useAuthStore } from "@/store/useAuthStore"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
})

// Dynamic redirect component based on active user role
const RoleDashboardRedirect: React.FC = () => {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />
  if (user.role === "TRAINER") return <Navigate to="/trainer/dashboard" replace />
  return <Navigate to="/trainee/dashboard" replace />
}

export const App: React.FC = () => {
  const { restoreSession } = useAuthStore()

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public and Catalogue Routes in General Shell */}
          <Route path="/" element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="health" element={<HealthPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="courses" element={<CourseCataloguePage />} />
            <Route path="courses/:courseId" element={<CourseDetailPage />} />
          </Route>

          {/* Authenticated Trainee Portal */}
          <Route
            path="/trainee"
            element={
              <ProtectedRoute allowedRoles={["TRAINEE", "ADMIN"]}>
                <TraineeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/trainee/dashboard" replace />} />
            <Route path="dashboard" element={<TraineeDashboardPage />} />
            <Route path="profile" element={<TraineeProfilePage />} />
            <Route path="learning" element={<MyLearningPage />} />
            <Route path="assessments" element={<TraineeAssessmentsPage />} />
            <Route path="assessments/:assessmentId" element={<AssessmentDetailPage />} />
            <Route path="assessments/:assessmentId/take/:attemptId" element={<AssessmentTakePage />} />
            <Route path="assessments/:assessmentId/result/:attemptId" element={<AssessmentResultPage />} />
            <Route path="competencies" element={<TraineeCompetenciesPage />} />
            <Route path="skill-gap" element={<TraineeSkillGapPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* Direct Course Learning Viewer (Under Protected Trainee Layout) */}
          <Route
            path="/courses/:courseId/learn"
            element={
              <ProtectedRoute allowedRoles={["TRAINEE", "ADMIN"]}>
                <TraineeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LearningContentPage />} />
          </Route>

          {/* Authenticated Trainer Portal */}
          <Route
            path="/trainer"
            element={
              <ProtectedRoute allowedRoles={["TRAINER", "ADMIN"]}>
                <TrainerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/trainer/dashboard" replace />} />
            <Route path="dashboard" element={<TrainerDashboardPage />} />
            <Route path="courses" element={<TrainerCoursesPage />} />
            <Route path="courses/:courseId" element={<TrainerCourseDetailPage />} />
            <Route path="assessments" element={<TrainerAssessmentsPage />} />
            <Route path="assessments/:assessmentId" element={<TrainerAssessmentBuilderPage />} />
            <Route path="performance" element={<TrainerPerformancePage />} />
          </Route>

          {/* Authenticated Admin Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="assessments" element={<AdminAssessmentsPage />} />
            <Route path="trainer-recommendations" element={<AdminTrainerRecommendationsPage />} />
          </Route>

          {/* Convenience redirect for /dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleDashboardRedirect />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
