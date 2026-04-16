import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

// ----------------------------------------------------------------
// Supabase client
// Configure via .env:
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJ...
// ----------------------------------------------------------------
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ----------------------------------------------------------------
// Axios instance
// ----------------------------------------------------------------
const api = axios.create({
  baseURL: '/api',   // proxied to localhost:8080 via vite.config.js
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach Supabase JWT as Bearer token
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle common error codes
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status

    if (status === 401) {
      // Token expired — try to refresh, otherwise redirect
      const { data: { session } } = await supabase.auth.refreshSession()
      if (!session) {
        window.location.href = '/error/token-expired'
      }
    }

    if (status === 403) {
      window.location.href = '/error/access-denied'
    }

    if (status >= 500) {
      console.error('[API] Server error:', error.response?.data)
    }

    return Promise.reject(error)
  }
)

export default api
