import { create } from "zustand"

export interface AuthUser {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  role: "TRAINEE" | "TRAINER" | "ADMIN"
  account_status: string
  is_active: boolean
  is_verified: boolean
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setSession: (accessToken: string, refreshToken: string, user: AuthUser) => void
  clearSession: () => void
  setLoading: (loading: boolean) => void
  restoreSession: () => void
}

const STORAGE_ACCESS_KEY = "cc_access_token"
const STORAGE_REFRESH_KEY = "cc_refresh_token"
const STORAGE_USER_KEY = "cc_auth_user"

let onClearSessionCallback: (() => void) | null = null

export function registerAuthCleanup(cb: () => void) {
  onClearSessionCallback = cb
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (accessToken, refreshToken, user) => {
    try {
      localStorage.setItem(STORAGE_ACCESS_KEY, accessToken)
      localStorage.setItem(STORAGE_REFRESH_KEY, refreshToken)
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user))
    } catch {
      // Handle storage quotas or incognito restrictions
    }
    set({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: true,
      isLoading: false,
    })
  },

  clearSession: () => {
    try {
      localStorage.removeItem(STORAGE_ACCESS_KEY)
      localStorage.removeItem(STORAGE_REFRESH_KEY)
      localStorage.removeItem(STORAGE_USER_KEY)
      sessionStorage.clear()
    } catch {
      // Ignore errors
    }
    if (onClearSessionCallback) {
      try {
        onClearSessionCallback()
      } catch {
        // Ignore cache clear errors
      }
    }
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  setLoading: (isLoading) => set({ isLoading }),

  restoreSession: () => {
    try {
      const accessToken = localStorage.getItem(STORAGE_ACCESS_KEY)
      const refreshToken = localStorage.getItem(STORAGE_REFRESH_KEY)
      const userStr = localStorage.getItem(STORAGE_USER_KEY)

      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr) as AuthUser
        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          isLoading: false,
        })
        return
      }
    } catch {
      // Fallback
    }
    set({ isLoading: false })
  },
}))
