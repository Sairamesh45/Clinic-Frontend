import { createContext, useCallback, useMemo, useState } from 'react'
import axiosClient from '../api/axiosClient'

const ROLE_STORAGE_KEY = 'clinic_role'
const TOKEN_STORAGE_KEY = 'clinic_token'
const USERS_STORAGE_KEY = 'clinic_users'

const DEMO_USERS = [
  { identifier: 'patient@demo.com', password: 'demo123', role: 'patient', name: 'Demo Patient' },
  { identifier: 'doctor@demo.com', password: 'demo123', role: 'doctor', name: 'Demo Doctor' },
  { identifier: 'reception@demo.com', password: 'demo123', role: 'reception', name: 'Demo Reception' },
]

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ROLE_STORAGE_KEY)
  })
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  })

  const login = useCallback(async ({ identifier, password }) => {
    let nextRole
    let nextToken

    try {
      const response = await axiosClient.post('/auth/login', { identifier, password })
      nextRole = response.data.role
      nextToken = response.data.token
    } catch {
      // Check demo users
      const demo = DEMO_USERS.find(
        (u) => u.identifier === identifier.toLowerCase().trim() && u.password === password,
      )
      if (demo) {
        nextRole = demo.role
        nextToken = `demo-jwt-${demo.role}`
      } else {
        // Check locally registered users
        const registeredUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
        const registeredUser = registeredUsers.find(
          (u) => u.identifier === identifier.toLowerCase().trim() && u.password === password,
        )
        if (registeredUser) {
          nextRole = registeredUser.role
          nextToken = `user-jwt-${registeredUser.role}-${Date.now()}`
        } else {
          throw new Error('Invalid email or password. Please try again.')
        }
      }
    }

    localStorage.setItem(ROLE_STORAGE_KEY, nextRole)
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
    setRole(nextRole)
    setToken(nextToken)
    return nextRole
  }, [])

  const register = useCallback(async ({ name, identifier, password, role: userRole }) => {
    try {
      await axiosClient.post('/auth/register', { name, identifier, password, role: userRole })
    } catch {
      // Store locally
      const registeredUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]')
      const exists = registeredUsers.find((u) => u.identifier === identifier.toLowerCase().trim())
      if (exists) throw new Error('An account with this email already exists.')
      registeredUsers.push({ name, identifier: identifier.toLowerCase().trim(), password, role: userRole || 'patient' })
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registeredUsers))
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(ROLE_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setRole(null)
    setToken(null)
  }, [])

  const value = useMemo(
    () => ({ role, token, login, register, logout, isAuthenticated: Boolean(token) }),
    [role, token, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
