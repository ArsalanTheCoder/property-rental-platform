import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import authService from '../services/authService.js'
import { sessionStore } from '../utils/sessionStore.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => sessionStore.getSession())
  const [error, setError] = useState(null)

  const login = useCallback(async (identifier, password) => {
    setError(null)
    const nextSession = await authService.login(identifier, password)
    sessionStore.setSession(nextSession)
    setSession(nextSession)
    return nextSession
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // best-effort: session ends locally regardless
    }
    sessionStore.clearSession()
    setSession(null)
  }, [])

  useEffect(() => {
    const handleExpired = () => {
      sessionStore.clearSession()
      setSession(null)
    }
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [])

  const value = useMemo(
    () => ({
      user: session?.admin ?? null,
      token: session?.token ?? null,
      isAuthenticated: Boolean(session?.token),
      login,
      logout,
      error,
    }),
    [session, login, logout, error]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
