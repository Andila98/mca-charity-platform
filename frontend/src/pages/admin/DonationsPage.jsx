import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { FiDollarSign, FiTrash2, FiEdit2 } from 'react-icons/fi'
import { donationsApi } from '../../services/api'
import { formatDate, formatCurrency } from '../../utils/format'
import { DONATION_STATUS, DONATION_TYPE } from '../../utils/constants'
import StatusBadge from '../../components/common/StatusBadge'
import SearchBar from '../../components/common/SearchBar'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import { FormField, Select } from '../../components/common/FormField'

const PAGE_SIZE = 10

export default function DonationsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [editDonation, setEditDonation] = useState(null)
  const [newStatus, setNewStatus] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['admin-donations'], queryFn: () => donationsApi.list() })

  const deleteMut = useMutation({
    mutationFn: (id) => donationsApi.delete(id),
    onSuccess: () => { toast.success('Donation deleted'); qc.invalidateQueries({ queryKey: ['admin-donations'] }) },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, status }) => donationsApi.update(id, { status }),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({ queryKey: ['admin-donations'] }); setEditDonation(null) },
  })

  const donations = (data?.data || [])
    .filter((d) => {
      const matchSearch = !search || d.donorName?.toLowerCase().includes(search.toLowerCase()) || d.donorEmail?.toLowerCase().includes(search.toLowerCase())
      return matchSearch && (!statusFilter || d.status === statusFilter)
    })

  const totalRaised = (data?.data || []).filter(d => d.type === 'CASH').reduce((s, d) => s + (d.amount || 0), 0)
  const totalPages = Math.ceil(donations.length / PAGE_SIZE)
  const paginated = donations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
          <p className="text-gray-500 text-sm mt-1">Total raised: <strong className="text-green-700">{formatCurrency(totalRaised)}</strong></p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <SearchBar onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Search by donor…" className="flex-1 min-w-60" />
        <select className="input w-48" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          {Object.values(DONATION_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : paginated.length === 0 ? (
        <EmptyState icon={<FiDollarSign />} title="No donations found" />
      ) : (
        <>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>{['Donor', 'Amount/Type', 'Status', 'Project', 'Date', 'Actions'].map((h) => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <p className="font-medium">{d.isAnonymous ? 'Anonymous' : d.donorName}</p>
                      <p className="text-xs text-gray-400">{d.donorEmail}</p>
                    </td>
                    <td className="table-cell">
                      {d.type === 'CASH' ? <span className="font-semibold text-green-700">{formatCurrency(d.amount)}</span> : <StatusBadge status={d.type} />}
                    </td>
                    <td className="table-cell"><StatusBadge status={d.status} /></td>
                    <td className="table-cell text-gray-500 text-xs">{d.projectId ? `Project #${d.projectId}` : 'General'}</td>
                    <td className="table-cell text-gray-500">{formatDate(d.createdAt)}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditDonation(d); setNewStatus(d.status) }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><FiEdit2 size={15} /></button>
                        <button onClick={() => setConfirmDelete(d)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 size={15} /></button>
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

      <Modal isOpen={!!editDonation} onClose={() => setEditDonation(null)} title="Update Donation Status" size="sm">
        <FormField label="Status">
          <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            {Object.values(DONATION_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </FormField>
        <div className="flex gap-3 justify-end mt-4">
          <button className="btn-secondary" onClick={() => setEditDonation(null)}>Cancel</button>
          <button className="btn-primary" onClick={() => updateMut.mutate({ id: editDonation.id, status: newStatus })}>Update</button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMut.mutate(confirmDelete?.id)}
        title="Delete Donation" message="Delete this donation record? This cannot be undone." danger />
    </div>
  )
}
