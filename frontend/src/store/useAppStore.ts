import { create } from "zustand"

export type UserRole = "Trainee" | "Trainer" | "Admin"

interface AppState {
  currentRole: UserRole
  setRole: (role: UserRole) => void
  isInitialized: boolean
  setInitialized: (val: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentRole: "Trainee",
  setRole: (role) => set({ currentRole: role }),
  isInitialized: true,
  setInitialized: (val) => set({ isInitialized: val }),
}))
