import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FiFolderPlus } from 'react-icons/fi'
import { projectsApi } from '../services/api'
import { formatDate, truncate } from '../utils/format'
import { PROJECT_STATUS } from '../utils/constants'
import StatusBadge from '../components/common/StatusBadge'
import SearchBar from '../components/common/SearchBar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Pagination from '../components/common/Pagination'

const PAGE_SIZE = 9

export default function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
  })

  const projects = (data?.data?.content || data?.data || [])
    .filter((p) => {
      const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || p.status === statusFilter
      return matchSearch && matchStatus
    })

  const totalPages = Math.ceil(projects.length / PAGE_SIZE)
  const paginated = projects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Our Projects</h1>
        <p className="text-gray-500 mt-1">Discover the initiatives transforming communities</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <SearchBar onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Search projects…" className="flex-1 min-w-60" />
        <select className="input w-48" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          {Object.values(PROJECT_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : paginated.length === 0 ? (
        <EmptyState icon={<FiFolderPlus />} title="No projects found" description="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((p) => (
              <div key={p.id} className="card hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 flex-1">{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm text-gray-600 flex-1 mb-4">{truncate(p.description, 130)}</p>
                <div className="border-t pt-3 flex items-center justify-between text-sm text-gray-500">
                  <div>
                    <span className="font-medium text-gray-700">{p.ward}</span>
                    {p.targetBeneficiaries && (
                      <span className="ml-3 text-xs">🎯 {p.targetBeneficiaries} beneficiaries</span>
                    )}
                  </div>
                  <Link to={`/projects/${p.id}`} className="text-blue-600 hover:underline text-xs font-medium">Details →</Link>
                </div>
                {p.startDate && (
                  <p className="text-xs text-gray-400 mt-2">Started {formatDate(p.startDate)}</p>
                )}
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
