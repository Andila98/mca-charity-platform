import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function useRequireEditor() {
  const { isEditor, isAdminAuthenticated } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (isAdminAuthenticated && !isEditor) navigate('/admin', { replace: true })
  }, [isAdminAuthenticated, isEditor, navigate])
}

export function useRequireAdmin() {
  const { isAdmin, isAdminAuthenticated } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    if (isAdminAuthenticated && !isAdmin) navigate('/admin', { replace: true })
  }, [isAdminAuthenticated, isAdmin, navigate])
}
