import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiArrowRight, FiHeart, FiUsers, FiFolderPlus, FiCalendar } from 'react-icons/fi'
import { projectsApi } from '../services/api'
import { eventsApi } from '../services/api'
import { formatDate, truncate } from '../utils/format'
import StatusBadge from '../components/common/StatusBadge'
import LoadingSpinner from '../components/common/LoadingSpinner'

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="card text-center">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

export default function HomePage() {
  const { data: projectsRes, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
  })
  const { data: eventsRes, isLoading: loadingEvents } = useQuery({
    queryKey: ['events-upcoming'],
    queryFn: () => eventsApi.getUpcoming(),
  })

  const projects = projectsRes?.data?.slice(0, 3) || []
  const events = eventsRes?.data?.slice(0, 3) || []
  const allProjects = projectsRes?.data || []

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-700 bg-opacity-50 px-4 py-1.5 rounded-full text-sm mb-6">
            <FiHeart className="text-red-400" /> Making a Difference in Kenya
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Empowering Communities<br />Through Compassionate Action
          </h1>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Join us in transforming lives across Kenya. Together we can build sustainable communities, support the vulnerable, and create lasting change.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/donate" className="btn-primary px-8 py-3 text-base bg-red-600 hover:bg-red-700 focus:ring-red-500">
              Donate Now
            </Link>
            <Link to="/volunteers" className="btn px-8 py-3 text-base bg-white bg-opacity-20 text-white hover:bg-opacity-30 border border-white border-opacity-30">
              Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard icon={FiFolderPlus} value={allProjects.length || '50+'} label="Active Projects" color="bg-blue-600" />
          <StatCard icon={FiUsers} value="1,200+" label="Volunteers" color="bg-green-600" />
          <StatCard icon={FiHeart} value="KES 2M+" label="Donations Raised" color="bg-red-500" />
          <StatCard icon={FiCalendar} value={events.length || '30+'} label="Events Held" color="bg-purple-600" />
        </div>
      </section>

      {/* Projects */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Our Projects</h2>
              <p className="text-gray-500 mt-1">Making a real difference in communities</p>
            </div>
            <Link to="/projects" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All <FiArrowRight size={16} />
            </Link>
          </div>
          {loadingProjects ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.map((p) => (
                <div key={p.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{p.name}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{truncate(p.description, 120)}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{p.ward}</span>
                    <Link to={`/projects/${p.id}`} className="text-blue-600 hover:underline">Learn more</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
              <p className="text-gray-500 mt-1">Join us and make an impact</p>
            </div>
            <Link to="/events" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All <FiArrowRight size={16} />
            </Link>
          </div>
          {loadingEvents ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((e) => (
                <div key={e.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                    <FiCalendar size={14} /> {formatDate(e.startDate)}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{e.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{truncate(e.description, 100)}</p>
                  <p className="text-xs text-gray-500">{e.location}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-blue-200 mb-8">Your support helps us reach more communities. Every contribution counts.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/donate" className="btn-primary px-8 py-3 text-base bg-red-600 hover:bg-red-700 focus:ring-red-500">
              Donate Today
            </Link>
            <Link to="/register" className="btn px-8 py-3 text-base border border-white text-white hover:bg-white hover:text-blue-900">
              Join Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
