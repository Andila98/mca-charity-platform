import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../services/api'
import { tokenStore } from '../services/tokenStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedAdmin = localStorage.getItem('admin_user')

    const rehydrate = async () => {
      const tasks = []
      if (savedAdmin) {
        tasks.push(
          authApi.adminRefresh()
            .then(({ data }) => {
              tokenStore.setAdminToken(data.accessToken)
              setAdmin(JSON.parse(savedAdmin))
            })
            .catch(() => localStorage.removeItem('admin_user'))
        )
      }
      if (savedUser) {
        tasks.push(
          authApi.refresh()
            .then(({ data }) => {
              tokenStore.setAuthToken(data.accessToken)
              setUser(JSON.parse(savedUser))
            })
            .catch(() => localStorage.removeItem('user'))
        )
      }
      await Promise.allSettled(tasks)
      setLoading(false)
    }

    if (savedAdmin || savedUser) {
      rehydrate()
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials)
    // Refresh token is delivered as an httpOnly cookie — not stored in localStorage
    const { token, email, fullName, role } = res.data

    tokenStore.setAuthToken(token)

    const userData = { email, fullName, role }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const adminLogin = useCallback(async (credentials) => {
    const res = await authApi.adminLogin(credentials)
    // Refresh token is delivered as an httpOnly cookie — not stored in localStorage
    const { token, username, role } = res.data

    tokenStore.setAdminToken(token)

    const adminData = { username, role }
    localStorage.setItem('admin_user', JSON.stringify(adminData))
    setAdmin(adminData)
    return adminData
  }, [])

  const register = useCallback(async (data) => {
    const res = await authApi.register(data)
    return res.data
  }, [])

  const logout = useCallback(async () => {
    try {
      // Backend revokes the refresh token and clears the httpOnly cookie
      await authApi.logout()
    } catch {
      // Token already invalid — still clear local state
    }
    tokenStore.clearAuthToken()
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const adminLogout = useCallback(async () => {
    try {
      await authApi.adminLogout()
    } catch {
      // Token already invalid — still clear local state
    }
    tokenStore.clearAdminToken()
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
