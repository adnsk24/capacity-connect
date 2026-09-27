export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"

interface ApiErrorResponse {
  detail?: string | Array<{ msg: string }>
  message?: string
}

export async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  }

  // Attach token from storage if not already provided
  const token = localStorage.getItem("cc_access_token")
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`
  }

  let response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 401 token expiration and automatic refresh
  if (response.status === 401 && !endpoint.includes("/auth/refresh") && !endpoint.includes("/auth/login")) {
    const refreshToken = localStorage.getItem("cc_refresh_token")
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          localStorage.setItem("cc_access_token", refreshData.access_token)
          localStorage.setItem("cc_refresh_token", refreshData.refresh_token)
          headers["Authorization"] = `Bearer ${refreshData.access_token}`
          response = await fetch(url, { ...options, headers })
        } else {
          localStorage.removeItem("cc_access_token")
          localStorage.removeItem("cc_refresh_token")
          localStorage.removeItem("cc_auth_user")
        }
      } catch {
        // Fall through to error
      }
    }
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`
    try {
      const errorJson: ApiErrorResponse = await response.json()
      if (typeof errorJson.detail === "string") {
        errorMessage = errorJson.detail
      } else if (Array.isArray(errorJson.detail) && errorJson.detail.length > 0) {
        errorMessage = errorJson.detail.map((d) => d.msg).join(", ")
      } else if (errorJson.message) {
        errorMessage = errorJson.message
      }
    } catch {
      // Fallback
    }
    throw new Error(errorMessage)
  }

  return response.json()
}
