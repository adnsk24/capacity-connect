import React, { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Layouts
import { AppShell } from "@/components/layout/AppShell"
import { TraineeLayout } from "@/components/layout/TraineeLayout"

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
import { AssessmentsPlaceholderPage } from "@/pages/AssessmentsPlaceholderPage"
import { CompetenciesPlaceholderPage } from "@/pages/CompetenciesPlaceholderPage"
import { CertificatesPage } from "@/pages/CertificatesPage"
import { NotificationsPage } from "@/pages/NotificationsPage"

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

          {/* Authenticated Trainee Experience with Institutional Sidebar & TopBar */}
          <Route
            path="/trainee"
            element={
              <ProtectedRoute>
                <TraineeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/trainee/dashboard" replace />} />
            <Route path="dashboard" element={<TraineeDashboardPage />} />
            <Route path="profile" element={<TraineeProfilePage />} />
            <Route path="learning" element={<MyLearningPage />} />
            <Route path="assessments" element={<AssessmentsPlaceholderPage />} />
            <Route path="competencies" element={<CompetenciesPlaceholderPage />} />
            <Route path="certificates" element={<CertificatesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* Direct Course Learning Viewer (Under Protected Trainee Layout) */}
          <Route
            path="/courses/:courseId/learn"
            element={
              <ProtectedRoute>
                <TraineeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<LearningContentPage />} />
          </Route>

          {/* Convenience redirect for /dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navigate to="/trainee/dashboard" replace />
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
