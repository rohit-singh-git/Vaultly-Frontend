import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { auth } from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    auth.getCurrentUser().then((u) => {
      setUser(u)
      setInitializing(false)
    })
  }, [])

  const login = useCallback(async (email, password) => {
    const session = await auth.login(email, password)
    setUser(session.user)
    return session.user
  }, [])

  const signup = useCallback(async (name, email, password) => {
    return auth.signup(name, email, password)
  }, [])

  const verifyOtp = useCallback(async (email, code) => {
    const session = await auth.verifyOtp(email, code)
    setUser(session.user)
    return session.user
  }, [])

  const logout = useCallback(async () => {
    await auth.logout()
    setUser(null)
  }, [])

  const value = { user, initializing, login, signup, verifyOtp, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
