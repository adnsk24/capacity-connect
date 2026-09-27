import { fetchJson } from "./api"

export interface DatabaseStatus {
  status: string
  database?: string
  error?: string
}

export interface HealthResponse {
  status: string
  app: string
  version: string
  environment: string
  timestamp: string
  database?: DatabaseStatus
}

export async function fetchHealth(): Promise<HealthResponse> {
  return fetchJson<HealthResponse>("/health")
}
