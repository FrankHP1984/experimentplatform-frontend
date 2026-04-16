import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../api/client'
import { fetchMe } from '../api/users'
import { useAuthStore } from '../store/authStore'

/**
 * useAuth — wraps Supabase auth flows with backend profile fetch.
 *
 * Usage:
 *   const { login, register, logout, loading, error } = useAuth()
 */
export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const navigate              = useNavigate()
  const { setUser, logout: storeLogout } = useAuthStore()

  const clearError = () => setError(null)

  // ---------------------------------------------------------------
  // Register (researcher only — participants are invited)
  // ---------------------------------------------------------------
  const register = async ({ email, password, name }) => {
    setLoading(true)
    setError(null)
    try {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) throw signUpError

      // Backend registers the researcher on its side; fetch profile
      const profile = await fetchMe()
      setUser(profile)
      navigate('/onboarding')
    } catch (err) {
      setError(err.message || 'Error al registrar la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------
  const login = async ({ email, password }) => {
    setLoading(true)
    setError(null)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError

      const profile = await fetchMe()
      setUser(profile)

      const dest = profile.role === 'PARTICIPANT' ? '/participant/dashboard' : '/dashboard'
      navigate(dest)
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas.')
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------
  const logout = async () => {
    await storeLogout()
    navigate('/')
  }

  return { login, register, logout, loading, error, clearError }
}
