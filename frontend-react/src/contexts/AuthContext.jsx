import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedAdmin = localStorage.getItem('admin_user')
    if (savedUser) setUser(JSON.parse(savedUser))
    if (savedAdmin) setAdmin(JSON.parse(savedAdmin))
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials)
    const { token, user: userData } = res.data
    localStorage.setItem('auth_token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const adminLogin = useCallback(async (credentials) => {
    const res = await authApi.adminLogin(credentials)
    const { token, admin: adminData } = res.data
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_user', JSON.stringify(adminData))
    setAdmin(adminData)
    return adminData
  }, [])

  const register = useCallback(async (data) => {
    const res = await authApi.register(data)
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const adminLogout = useCallback(() => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setAdmin(null)
  }, [])

  const isAdmin = admin?.role === 'ADMIN' || admin?.role === 'SUPER_ADMIN'
  const isEditor = admin?.role === 'EDITOR' || isAdmin
  const isAuthenticated = !!user
  const isAdminAuthenticated = !!admin

  return (
    <AuthContext.Provider value={{
      user, admin, loading,
      login, adminLogin, register, logout, adminLogout,
      isAdmin, isEditor, isAuthenticated, isAdminAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
