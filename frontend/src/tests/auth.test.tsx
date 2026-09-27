import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuthStore, type AuthUser } from '../store/useAuthStore'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { RoleGuard } from '../components/auth/RoleGuard'

const mockTraineeUser: AuthUser = {
  id: 'user-trainee-123',
  email: 'trainee@imd.gov.in',
  username: 'trainee_officer',
  first_name: 'Amit',
  last_name: 'Kumar',
  role: 'TRAINEE',
  account_status: 'ACTIVE',
  is_active: true,
  is_verified: true,
}

const mockAdminUser: AuthUser = {
  id: 'user-admin-456',
  email: 'admin@imd.gov.in',
  username: 'admin_officer',
  first_name: 'Dr. Suresh',
  last_name: 'Verma',
  role: 'ADMIN',
  account_status: 'ACTIVE',
  is_active: true,
  is_verified: true,
}

describe('Auth Store (Zustand)', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  it('initializes with unauthenticated default state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('stores session tokens and updates authenticated state', () => {
    useAuthStore.getState().setSession('mock-access-jwt', 'mock-refresh-token', mockTraineeUser)
    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('mock-access-jwt')
    expect(state.refreshToken).toBe('mock-refresh-token')
    expect(state.user?.email).toBe('trainee@imd.gov.in')
    expect(state.isAuthenticated).toBe(true)
    expect(localStorage.getItem('cc_access_token')).toBe('mock-access-jwt')
    expect(localStorage.getItem('cc_refresh_token')).toBe('mock-refresh-token')
  })

  it('restores session from localStorage', () => {
    localStorage.setItem('cc_access_token', 'stored-access-token')
    localStorage.setItem('cc_refresh_token', 'stored-refresh-token')
    localStorage.setItem('cc_auth_user', JSON.stringify(mockAdminUser))

    useAuthStore.getState().restoreSession()
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user?.role).toBe('ADMIN')
  })

  it('clears session on logout', () => {
    useAuthStore.getState().setSession('access-1', 'refresh-1', mockTraineeUser)
    useAuthStore.getState().clearSession()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(localStorage.getItem('cc_access_token')).toBeNull()
  })
})

describe('Route Protection Components', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession()
  })

  it('ProtectedRoute redirects unauthenticated visitors to login', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page Target</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Private Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page Target')).toBeDefined()
    expect(screen.queryByText('Private Content')).toBeNull()
  })

  it('ProtectedRoute renders children when authenticated', () => {
    useAuthStore.getState().setSession('valid-token', 'valid-refresh', mockTraineeUser)

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Private Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Private Protected Content')).toBeDefined()
  })

  it('RoleGuard allows access when user role matches', () => {
    useAuthStore.getState().setSession('valid-token', 'valid-refresh', mockAdminUser)

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <div>Admin Secret Portal</div>
              </RoleGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Admin Secret Portal')).toBeDefined()
  })

  it('RoleGuard redirects to unauthorized when role does not match', () => {
    useAuthStore.getState().setSession('valid-token', 'valid-refresh', mockTraineeUser)

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/unauthorized" element={<div>Access Denied 403</div>} />
          <Route
            path="/admin"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <div>Admin Secret Portal</div>
              </RoleGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('Access Restricted')).toBeDefined()
    expect(screen.queryByText('Admin Secret Portal')).toBeNull()
  })
})
