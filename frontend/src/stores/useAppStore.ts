import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppState {
  // App state
  theme: 'light' | 'dark'
  isLoading: boolean

  // Actions
  setTheme: (theme: 'light' | 'dark') => void
  setLoading: (loading: boolean) => void
  toggleTheme: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        theme: 'light',
        isLoading: false,

        // Actions
        setTheme: (theme) => set({ theme }),
        setLoading: (loading) => set({ isLoading: loading }),
        toggleTheme: () => set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        })),
      }),
      {
        name: 'app-storage',
      }
    )
  )
)