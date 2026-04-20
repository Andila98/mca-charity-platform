import { useAuth } from '../../contexts/AuthContext'
import { FiSettings, FiUser, FiShield } from 'react-icons/fi'

export default function SettingsPage() {
  const { admin } = useAuth()

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage admin account and platform settings</p>
      </div>

      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <FiUser className="text-blue-600" size={20} />
            <h2 className="font-semibold text-gray-900">Admin Profile</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-500">Username</span>
              <span className="font-medium">{admin?.username || '—'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-500">Role</span>
              <span className="font-medium">{admin?.role || '—'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500">Email</span>
              <span className="font-medium">{admin?.email || '—'}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <FiShield className="text-green-600" size={20} />
            <h2 className="font-semibold text-gray-900">Platform Configuration</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-500">API Base URL</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">http://localhost:8080/api/v1</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-gray-500">Frontend Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500">Environment</span>
              <span className="font-medium capitalize">{import.meta.env.MODE}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
