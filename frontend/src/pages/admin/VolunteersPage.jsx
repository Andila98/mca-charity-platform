import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { FiHeart, FiTrash2, FiEdit2 } from 'react-icons/fi'
import { volunteersApi } from '../../services/api'
import { formatDate } from '../../utils/format'
import { VOLUNTEER_STATUS } from '../../utils/constants'
import StatusBadge from '../../components/common/StatusBadge'
import SearchBar from '../../components/common/SearchBar'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'

const PAGE_SIZE = 10

export default function VolunteersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['admin-volunteers'], queryFn: () => volunteersApi.list() })

  const deleteMut = useMutation({
    mutationFn: (id) => volunteersApi.delete(id),
    onSuccess: () => { toast.success('Volunteer suspended'); qc.invalidateQueries({ queryKey: ['admin-volunteers'] }) },
    onError: () => toast.error('Failed to remove volunteer'),
  })

  const volunteers = (data?.data || [])
    .filter((v) => {
      const matchSearch = !search || v.name?.toLowerCase().includes(search.toLowerCase()) || v.email?.toLowerCase().includes(search.toLowerCase())
      return matchSearch && (!statusFilter || v.status === statusFilter)
    })

  const totalPages = Math.ceil(volunteers.length / PAGE_SIZE)
  const paginated = volunteers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteers</h1>
          <p className="text-gray-500 text-sm mt-1">{data?.data?.length || 0} registered volunteers</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <SearchBar onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Search volunteers…" className="flex-1 min-w-60" />
        <select className="input w-48" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          {Object.values(VOLUNTEER_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : paginated.length === 0 ? (
        <EmptyState icon={<FiHeart />} title="No volunteers found" />
      ) : (
        <>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>{['Name', 'Email', 'Phone', 'Ward', 'Status', 'Interests', 'Registered', 'Actions'].map((h) => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{v.name}</td>
                    <td className="table-cell text-gray-500">{v.email}</td>
                    <td className="table-cell text-gray-500">{v.phone || '—'}</td>
                    <td className="table-cell">{v.ward}</td>
                    <td className="table-cell"><StatusBadge status={v.status} /></td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(v.interests || []).slice(0, 2).map((i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{i}</span>
                        ))}
                        {(v.interests || []).length > 2 && <span className="text-xs text-gray-400">+{v.interests.length - 2}</span>}
                      </div>
                    </td>
                    <td className="table-cell text-gray-500">{formatDate(v.registeredAt || v.createdAt)}</td>
                    <td className="table-cell">
                      <button onClick={() => setConfirmDelete(v)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMut.mutate(confirmDelete?.id)}
        title="Suspend Volunteer" message={`Suspend volunteer "${confirmDelete?.name}"?`} danger />
    </div>
  )
}
