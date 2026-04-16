import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../api/client'

/**
 * Auth store — manages user session, role, and token.
 *
 * Shape:
 *   user          → { id, email, name, role: 'RESEARCHER' | 'PARTICIPANT', ... }
 *   token         → Supabase JWT access token
 *   isAuthenticated → boolean
 *   isLoading     → boolean (for initial session check)
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      // -------------------------------------------------------
      // Initialize: restore session from Supabase on app load
      // -------------------------------------------------------
      initialize: async () => {
        set({ isLoading: true })
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            set({
              token: session.access_token,
              isAuthenticated: true,
              isLoading: false,
            })
            // Fetch backend user profile to get role
            const { fetchMe } = await import('../api/users')
            const profile = await fetchMe()
            set({ user: profile })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ isLoading: false })
        }

        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            set({ token: session.access_token, isAuthenticated: true })
          } else if (event === 'SIGNED_OUT') {
            get().logout()
          } else if (event === 'TOKEN_REFRESHED' && session) {
            set({ token: session.access_token })
          }
        })
      },

      // -------------------------------------------------------
      // Set user after login / profile fetch
      // -------------------------------------------------------
      setUser: (user) => set({ user, isAuthenticated: true }),

      setToken: (token) => set({ token }),

      // -------------------------------------------------------
      // Logout
      // -------------------------------------------------------
      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, token: null, isAuthenticated: false })
      },
    }),
    {
      name: 'empiria-auth',
      // Only persist minimal data — token will be re-fetched from Supabase
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
