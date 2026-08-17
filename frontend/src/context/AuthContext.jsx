import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fm_user') || 'null') } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const _persist = (data) => {
    localStorage.setItem('fm_token',   data.accessToken)
    localStorage.setItem('fm_refresh', data.refreshToken)
    localStorage.setItem('fm_user',    JSON.stringify(data.user))
    setUser(data.user)
  }

  const login = useCallback(async (credentials) => {
    setLoading(true)
    try {
      const data = await authApi.login(credentials)
      _persist(data)
      toast.success(`Welcome back, ${data.user.fullName}!`)
      return data.user
    } finally { setLoading(false) }
  }, [])

  const signup = useCallback(async (form) => {
    setLoading(true)
    try {
      const data = await authApi.signup(form)
      _persist(data)
      toast.success(`Account created! Welcome, ${data.user.fullName}!`)
      return data.user
    } finally { setLoading(false) }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('fm_token')
    localStorage.removeItem('fm_refresh')
    localStorage.removeItem('fm_user')
    setUser(null)
    toast.success('Logged out')
  }, [])

  const isAdmin = user?.role === 'ADMIN'
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
