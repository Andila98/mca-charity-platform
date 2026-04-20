import { NavLink, useNavigate } from 'react-router-dom'
import {
  FiGrid, FiUsers, FiFolderPlus, FiDollarSign, FiCalendar,
  FiHeart, FiFileText, FiImage, FiActivity, FiSettings, FiLogOut, FiHelpCircle
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/projects', label: 'Projects', icon: FiFolderPlus },
  { to: '/admin/donations', label: 'Donations', icon: FiDollarSign },
  { to: '/admin/events', label: 'Events', icon: FiCalendar },
  { to: '/admin/volunteers', label: 'Volunteers', icon: FiHeart },
  { to: '/admin/content', label: 'Content', icon: FiFileText },
  { to: '/admin/images', label: 'Images', icon: FiImage },
  { to: '/admin/activity', label: 'Activity', icon: FiActivity },
  { to: '/admin/settings', label: 'Settings', icon: FiSettings },
]

export default function Sidebar() {
  const { admin, adminLogout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-700">
        <FiHelpCircle className="text-blue-400" size={22} />
        <span className="font-bold text-lg">Admin Panel</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Logged in as</p>
          <p className="text-sm font-medium text-gray-200">{admin?.username || admin?.name || 'Admin'}</p>
        </div>
        <button
          onClick={() => { adminLogout(); navigate('/admin/login') }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
