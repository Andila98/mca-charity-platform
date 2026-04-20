import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FiMenu, FiX, FiHeart, FiUser, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext'

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/projects', label: 'Projects' },
    { to: '/events', label: 'Events' },
    { to: '/donate', label: 'Donate' },
    { to: '/volunteers', label: 'Volunteer' },
    { to: '/about', label: 'About' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-blue-700 text-lg">
            <FiHeart className="text-red-500" size={22} />
            MCA Charity
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user?.fullName || user?.email}</span>
                <button onClick={() => { logout(); navigate('/') }} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                  <FiLogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                  <FiUser size={14} /> Login
                </Link>
                <Link to="/register" className="btn-primary text-xs px-3 py-1.5">Register</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t py-3 space-y-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                {l.label}
              </Link>
            ))}
            <div className="pt-2 border-t flex gap-2 px-3">
              {isAuthenticated ? (
                <button onClick={() => { logout(); navigate('/'); setMenuOpen(false) }} className="btn-secondary text-xs w-full">Logout</button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary text-xs flex-1 text-center" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="btn-primary text-xs flex-1 text-center" onClick={() => setMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
