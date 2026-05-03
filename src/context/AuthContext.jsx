import { createContext, useContext, useState, useCallback } from 'react'
import { setCredentials } from '@/api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = sessionStorage.getItem('auth')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = useCallback((credentials) => {
    setAuth(credentials)
    setCredentials(credentials)
    sessionStorage.setItem('auth', JSON.stringify(credentials))
  }, [])

  const logout = useCallback(() => {
    setAuth(null)
    setCredentials(null)
    sessionStorage.removeItem('auth')
  }, [])

  // Restore credentials on mount (e.g. page refresh)
  if (auth) setCredentials(auth)

  return (
    <AuthContext.Provider value={{ auth, isAdmin: !!auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
