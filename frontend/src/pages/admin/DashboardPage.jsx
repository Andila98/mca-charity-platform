import { useQuery } from '@tanstack/react-query'
import { FiUsers, FiFolderPlus, FiDollarSign, FiCalendar, FiHeart, FiTrendingUp } from 'react-icons/fi'
import { projectsApi, donationsApi, eventsApi, volunteersApi, usersApi } from '../../services/api'
import { formatCurrency, formatRelative } from '../../utils/format'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function MetricCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const { data: usersRes, isLoading: lu } = useQuery({ queryKey: ['admin-users'], queryFn: () => usersApi.list() })
  const { data: projectsRes, isLoading: lp } = useQuery({ queryKey: ['admin-projects'], queryFn: () => projectsApi.list() })
  const { data: donationsRes, isLoading: ld } = useQuery({ queryKey: ['admin-donations'], queryFn: () => donationsApi.list() })
  const { data: eventsRes, isLoading: le } = useQuery({ queryKey: ['admin-events'], queryFn: () => eventsApi.list() })
  const { data: volunteersRes, isLoading: lv } = useQuery({ queryKey: ['admin-volunteers'], queryFn: () => volunteersApi.list() })

  const isLoading = lu || lp || ld || le || lv
  if (isLoading) return <LoadingSpinner />

  const users = usersRes?.data || []
  const projects = projectsRes?.data || []
  const donations = donationsRes?.data || []
  const events = eventsRes?.data || []
  const volunteers = volunteersRes?.data || []

  const totalRaised = donations.reduce((s, d) => s + (d.amount || 0), 0)
  const pendingDonations = donations.filter((d) => d.status === 'PENDING')
  const activeProjects = projects.filter((p) => p.status === 'ONGOING' || p.status === 'PLANNED')
  const recentDonations = [...donations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const recentProjects = [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview and recent activity</p>
      </div>

      {pendingDonations.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <FiTrendingUp className="text-orange-500 flex-shrink-0" size={20} />
          <p className="text-sm text-orange-700">
            <strong>{pendingDonations.length}</strong> pending donations awaiting review.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <MetricCard icon={FiUsers} label="Total Users" value={users.length} color="bg-blue-500" />
        <MetricCard icon={FiFolderPlus} label="Active Projects" value={activeProjects.length} sub={`${projects.length} total`} color="bg-purple-500" />
        <MetricCard icon={FiDollarSign} label="Total Raised" value={formatCurrency(totalRaised)} sub={`${donations.length} donations`} color="bg-green-500" />
        <MetricCard icon={FiCalendar} label="Events" value={events.length} color="bg-orange-500" />
        <MetricCard icon={FiHeart} label="Volunteers" value={volunteers.length} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Donations</h2>
          {recentDonations.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No donations yet</p>
          ) : (
            <div className="space-y-3">
              {recentDonations.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{d.isAnonymous ? 'Anonymous' : d.donorName}</p>
                    <p className="text-xs text-gray-400">{formatRelative(d.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-700">{d.type === 'CASH' ? formatCurrency(d.amount) : d.type}</p>
                    <StatusBadge status={d.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Projects</h2>
          {recentProjects.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No projects yet</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.ward}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
