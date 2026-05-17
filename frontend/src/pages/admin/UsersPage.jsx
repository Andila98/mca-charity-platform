import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { FiUserCheck, FiTrash2, FiUsers } from 'react-icons/fi'
import { useRequireAdmin } from '../../hooks/useRequireRole'
import { usersApi } from '../../services/api'
import { formatDate } from '../../utils/format'
import StatusBadge from '../../components/common/StatusBadge'
import SearchBar from '../../components/common/SearchBar'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'

const PAGE_SIZE = 10

export default function UsersPage() {
  useRequireAdmin()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('approved')
  const [page, setPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data: approvedRes, isLoading: la } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list() })
  const { data: pendingRes, isLoading: lp } = useQuery({ queryKey: ['users-unapproved'], queryFn: () => usersApi.getUnapproved() })

  const approveMut = useMutation({
    mutationFn: (id) => usersApi.approve(id),
    onSuccess: () => { toast.success('User approved'); qc.invalidateQueries({ queryKey: ['users'] }); qc.invalidateQueries({ queryKey: ['users-unapproved'] }) },
    onError: () => toast.error('Failed to approve user'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries({ queryKey: ['users'] }); qc.invalidateQueries({ queryKey: ['users-unapproved'] }) },
    onError: () => toast.error('Failed to delete user'),
  })

  const rawUsers = tab === 'approved'
    ? (approvedRes?.data?.content || approvedRes?.data || [])
    : (pendingRes?.data?.content || pendingRes?.data || [])
  const users = rawUsers.filter((u) => !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
  const totalPages = Math.ceil(users.length / PAGE_SIZE)
  const paginated = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage platform users and approvals</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[['approved', 'Approved'], ['pending', 'Pending Approval']].map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setPage(1) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === key ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {label} {key === 'pending' && (pendingRes?.data?.content || pendingRes?.data || []).length ? `(${(pendingRes?.data?.content || pendingRes?.data || []).length})` : ''}
          </button>
        ))}
      </div>

      <SearchBar onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Search users…" className="mb-4 max-w-sm" />

      {(la || lp) ? <LoadingSpinner /> : paginated.length === 0 ? (
        <EmptyState icon={<FiUsers />} title="No users found" />
      ) : (
        <>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  {['Name', 'Email', 'Phone', 'Ward', 'Role', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{u.fullName}</td>
                    <td className="table-cell text-gray-500">{u.email}</td>
                    <td className="table-cell text-gray-500">{u.phone || '—'}</td>
                    <td className="table-cell">{u.ward || '—'}</td>
                    <td className="table-cell"><StatusBadge status={u.role} /></td>
                    <td className="table-cell text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        {tab === 'pending' && (
                          <button onClick={() => approveMut.mutate(u.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve">
                            <FiUserCheck size={16} />
                          </button>
                        )}
                        <button onClick={() => setConfirmDelete(u)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMut.mutate(confirmDelete?.id)}
        title="Delete User"
        message={`Are you sure you want to delete ${confirmDelete?.fullName}? This action cannot be undone.`}
        danger
      />
    </div>
  )
}
