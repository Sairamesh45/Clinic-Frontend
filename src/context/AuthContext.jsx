import { createContext, useCallback, useMemo, useState } from 'react'
import axiosClient from '../api/axiosClient'

const ROLE_STORAGE_KEY = 'clinic_role'
const TOKEN_STORAGE_KEY = 'clinic_token'
const USER_STORAGE_KEY = 'clinic_user'

// Helper: detect fake/legacy tokens that were created before the real backend was set up
const isRealJwt = (t) => {
  if (!t) return false
  const parts = t.split('.')
  return parts.length === 3 // real JWTs have header.payload.signature
}

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ROLE_STORAGE_KEY)
  })
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
    // Discard any legacy fake tokens (e.g. "user-jwt-patient-1234567")
    if (!isRealJwt(stored)) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem(ROLE_STORAGE_KEY)
      localStorage.removeItem(USER_STORAGE_KEY)
      return null
    }
    return stored
  })
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null
    try {
      return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null')
    } catch {
      return null
    }
  })

  const login = useCallback(async ({ identifier, password }) => {
    // Always authenticate against the real backend — no local fallback
    const response = await axiosClient.post('/auth/login', { identifier, password })
    const data = response.data?.data || response.data

    const nextRole = data.role
    const nextToken = data.token
    const account = data.user || data.account || data

    localStorage.setItem(ROLE_STORAGE_KEY, nextRole)
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
    if (account) {
      try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(account)) } catch {}
      setUser(account)
    }
    setRole(nextRole)
    setToken(nextToken)
    return nextRole
  }, [])

  const register = useCallback(async ({ name, identifier, password, role: userRole }) => {
    // Always register against the real backend — no local fallback
    await axiosClient.post('/auth/register', { name, identifier, password, role: userRole })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(ROLE_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    // Also clear any legacy localStorage user lists
    localStorage.removeItem('clinic_users')
    setRole(null)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ role, token, user, login, register, logout, isAuthenticated: Boolean(token) }),
    [role, token, user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
