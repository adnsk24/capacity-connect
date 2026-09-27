import { fetchJson } from "./api"
import type { AuthUser } from "@/store/useAuthStore"

export interface RegisterPayload {
  email: string
  username: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  role: "TRAINEE" | "TRAINER"
}

export interface LoginPayload {
  username_or_email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: AuthUser
}

export interface MessageResponse {
  message: string
  detail?: string
}

export interface UserProfileResponse extends AuthUser {
  phone_number?: string
  avatar_url?: string
  organization_id?: string
  department_id?: string
  created_at: string
  updated_at: string
}

export const authService = {
  async register(data: RegisterPayload): Promise<AuthUser> {
    return fetchJson<AuthUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async login(data: LoginPayload): Promise<TokenResponse> {
    return fetchJson<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async verifyEmail(token: string): Promise<MessageResponse> {
    return fetchJson<MessageResponse>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    })
  },

  async refresh(refreshToken: string): Promise<TokenResponse> {
    return fetchJson<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  },

  async logout(refreshToken: string): Promise<MessageResponse> {
    return fetchJson<MessageResponse>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
  },

  async logoutAll(): Promise<MessageResponse> {
    return fetchJson<MessageResponse>("/auth/logout-all", {
      method: "POST",
    })
  },

  async getMe(): Promise<UserProfileResponse> {
    return fetchJson<UserProfileResponse>("/auth/me")
  },

  async forgotPassword(email: string): Promise<MessageResponse> {
    return fetchJson<MessageResponse>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },

  async resetPassword(token: string, new_password: string, new_password_confirm: string): Promise<MessageResponse> {
    return fetchJson<MessageResponse>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password, new_password_confirm }),
    })
  },
}
