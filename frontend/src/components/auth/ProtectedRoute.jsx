import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { loading, isAuthenticated, isAdminAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner fullPage />

  if (requireAdmin && !isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (!requireAdmin && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export function AdminRoute({ children, requireEditor = false }) {
  const { loading, isAdminAuthenticated, isEditor } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner fullPage />

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (requireEditor && !isEditor) {
    return <Navigate to="/admin" replace />
  }

  return children
}
