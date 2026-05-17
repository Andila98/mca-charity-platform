import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi'
import { eventsApi } from '../services/api'
import { formatDate, truncate } from '../utils/format'
import { EVENT_STATUS } from '../utils/constants'
import StatusBadge from '../components/common/StatusBadge'
import SearchBar from '../components/common/SearchBar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Pagination from '../components/common/Pagination'

const PAGE_SIZE = 9

export default function EventsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({ queryKey: ['events'], queryFn: () => eventsApi.list() })

  const events = (data?.data?.content || data?.data || [])
    .filter((e) => {
      const matchSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.location?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || e.status === statusFilter
      return matchSearch && matchStatus
    })

  const totalPages = Math.ceil(events.length / PAGE_SIZE)
  const paginated = events.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-500 mt-1">Join our events and help make a difference</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <SearchBar onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Search events…" className="flex-1 min-w-60" />
        <select className="input w-48" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          {Object.values(EVENT_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : paginated.length === 0 ? (
        <EmptyState icon={<FiCalendar />} title="No events found" description="Check back soon for upcoming events." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((e) => (
              <div key={e.id} className="card hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center gap-2 text-xs text-blue-600 mb-2">
                  <FiCalendar size={12} /> {formatDate(e.startDate)}
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{e.name}</h3>
                  <StatusBadge status={e.status} />
                </div>
                <p className="text-sm text-gray-600 flex-1 mb-4">{truncate(e.description, 110)}</p>
                <div className="border-t pt-3 text-sm text-gray-500 space-y-1">
                  <div className="flex items-center gap-1"><FiMapPin size={12} /> {e.location}</div>
                  {e.expectedAttendees && (
                    <div className="flex items-center gap-1"><FiUsers size={12} /> {e.expectedAttendees} expected</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
