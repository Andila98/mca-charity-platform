import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import { AdminRoute } from '../../components/auth/ProtectedRoute'

export default function AdminLayout() {
  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </AdminRoute>
  )
}
