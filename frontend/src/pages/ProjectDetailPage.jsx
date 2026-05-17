import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiArrowLeft, FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi'
import { projectsApi, donationsApi, eventsApi } from '../services/api'
import { formatDate, formatCurrency } from '../utils/format'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function ProjectDetailPage() {
  const { id } = useParams()

  const { data: projectRes, isLoading } = useQuery({ queryKey: ['project', id], queryFn: () => projectsApi.getById(id) })
  const { data: donationsRes } = useQuery({ queryKey: ['project-donations', id], queryFn: () => donationsApi.getByProject(id) })
  const { data: eventsRes } = useQuery({ queryKey: ['project-events', id], queryFn: () => eventsApi.getByProject(id) })

  if (isLoading) return <LoadingSpinner fullPage />
  const project = projectRes?.data
  if (!project) return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Project not found.</div>

  const donations = donationsRes?.data?.content || donationsRes?.data || []
  const events = eventsRes?.data?.content || eventsRes?.data || []
  const totalRaised = donations.reduce((s, d) => s + (d.amount || 0), 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6">
        <FiArrowLeft size={14} /> Back to Projects
      </Link>

      <div className="card mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{project.name}</h1>
          <StatusBadge status={project.status} />
        </div>
        <p className="text-gray-600 mb-6">{project.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{project.targetBeneficiaries || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Target Beneficiaries</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{project.actualBeneficiaries || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Actual Beneficiaries</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-700">{donations.length}</p>
            <p className="text-xs text-gray-500 mt-1">Donations</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-xl font-bold text-orange-700">{formatCurrency(totalRaised)}</p>
            <p className="text-xs text-gray-500 mt-1">Total Raised</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1"><FiMapPin size={14} /> {project.ward}</span>
          {project.startDate && <span className="flex items-center gap-1"><FiCalendar size={14} /> {formatDate(project.startDate)}</span>}
          {project.category && <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">{project.category}</span>}
        </div>

        {project.impactSummary && (
          <div className="mt-6 bg-green-50 border border-green-100 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Impact Summary</h3>
            <p className="text-sm text-green-700">{project.impactSummary}</p>
          </div>
        )}
      </div>

      {events.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiCalendar size={16} /> Related Events</h2>
          <div className="space-y-3">
            {events.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{e.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(e.startDate)} · {e.location}</p>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Link to="/donate" className="btn-primary px-6">Support This Project</Link>
        <Link to="/volunteers" className="btn-secondary px-6">Volunteer</Link>
      </div>
    </div>
  )
}
