import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { FiPlus, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi'
import { eventsApi } from '../../services/api'
import { eventSchema } from '../../utils/validators'
import { EVENT_STATUS, KENYA_WARDS } from '../../utils/constants'
import { formatDate } from '../../utils/format'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import SearchBar from '../../components/common/SearchBar'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import { FormField, Input, Select, Textarea } from '../../components/common/FormField'

const PAGE_SIZE = 10

export default function EventsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['admin-events'], queryFn: () => eventsApi.list() })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: { status: 'PLANNED' },
  })

  const saveMut = useMutation({
    mutationFn: (d) => editEvent ? eventsApi.update(editEvent.id, d) : eventsApi.create(d),
    onSuccess: () => {
      toast.success(editEvent ? 'Event updated' : 'Event created')
      qc.invalidateQueries({ queryKey: ['admin-events'] })
      setModalOpen(false); setEditEvent(null); reset()
    },
    onError: () => toast.error('Failed to save event'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => eventsApi.delete(id),
    onSuccess: () => { toast.success('Event deleted'); qc.invalidateQueries({ queryKey: ['admin-events'] }) },
  })

  const openEdit = (e) => {
    setEditEvent(e)
    reset({ ...e, startDate: e.startDate?.split('T')[0], endDate: e.endDate?.split('T')[0] })
    setModalOpen(true)
  }

  const events = (data?.data || [])
    .filter((e) => (!search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.location?.toLowerCase().includes(search.toLowerCase())) && (!statusFilter || e.status === statusFilter))
  const totalPages = Math.ceil(events.length / PAGE_SIZE)
  const paginated = events.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 text-sm mt-1">Manage charity events</p>
        </div>
        <button onClick={() => { setEditEvent(null); reset({ status: 'PLANNED' }); setModalOpen(true) }} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> New Event
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <SearchBar onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Search events…" className="flex-1 min-w-60" />
        <select className="input w-48" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          {Object.values(EVENT_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : paginated.length === 0 ? (
        <EmptyState icon={<FiCalendar />} title="No events found" action={<button onClick={() => setModalOpen(true)} className="btn-primary">Create Event</button>} />
      ) : (
        <>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>{['Name', 'Location', 'Status', 'Date', 'Attendees', 'Actions'].map((h) => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{e.name}</td>
                    <td className="table-cell text-gray-500">{e.location}</td>
                    <td className="table-cell"><StatusBadge status={e.status} /></td>
                    <td className="table-cell text-gray-500">{formatDate(e.startDate)}</td>
                    <td className="table-cell">{e.expectedAttendees || '—'}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(e)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><FiEdit2 size={15} /></button>
                        <button onClick={() => setConfirmDelete(e)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 size={15} /></button>
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

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditEvent(null) }} title={editEvent ? 'Edit Event' : 'New Event'} size="lg">
        <form onSubmit={handleSubmit((d) => saveMut.mutate(d))} className="space-y-4">
          <FormField label="Event Name" error={errors.name?.message} required>
            <Input error={errors.name?.message} {...register('name')} />
          </FormField>
          <FormField label="Description" error={errors.description?.message} required>
            <Textarea error={errors.description?.message} {...register('description')} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Location" error={errors.location?.message} required>
              <Input error={errors.location?.message} {...register('location')} />
            </FormField>
            <FormField label="Ward">
              <Select {...register('ward')}>
                <option value="">Select Ward</option>
                {KENYA_WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
              </Select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" error={errors.startDate?.message} required>
              <Input type="date" error={errors.startDate?.message} {...register('startDate')} />
            </FormField>
            <FormField label="End Date">
              <Input type="date" {...register('endDate')} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Status" error={errors.status?.message} required>
              <Select error={errors.status?.message} {...register('status')}>
                {Object.values(EVENT_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </FormField>
            <FormField label="Expected Attendees">
              <Input type="number" min="1" {...register('expectedAttendees')} />
            </FormField>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving…' : editEvent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMut.mutate(confirmDelete?.id)}
        title="Delete Event" message={`Delete "${confirmDelete?.name}"?`} danger />
    </div>
  )
}
