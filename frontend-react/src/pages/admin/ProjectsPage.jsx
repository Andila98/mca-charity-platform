import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { FiPlus, FiEdit2, FiTrash2, FiFolderPlus } from 'react-icons/fi'
import { projectsApi } from '../../services/api'
import { projectSchema } from '../../utils/validators'
import { PROJECT_STATUS, KENYA_WARDS } from '../../utils/constants'
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

export default function ProjectsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data, isLoading } = useQuery({ queryKey: ['admin-projects'], queryFn: () => projectsApi.list() })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(projectSchema),
  })

  const saveMut = useMutation({
    mutationFn: (data) => editProject ? projectsApi.update(editProject.id, data) : projectsApi.create(data),
    onSuccess: () => {
      toast.success(editProject ? 'Project updated' : 'Project created')
      qc.invalidateQueries({ queryKey: ['admin-projects'] })
      setModalOpen(false); setEditProject(null); reset()
    },
    onError: () => toast.error('Failed to save project'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => projectsApi.delete(id),
    onSuccess: () => { toast.success('Project deleted'); qc.invalidateQueries({ queryKey: ['admin-projects'] }) },
    onError: () => toast.error('Failed to delete project'),
  })

  const openEdit = (p) => {
    setEditProject(p)
    reset({ ...p, startDate: p.startDate?.split('T')[0], endDate: p.endDate?.split('T')[0] })
    setModalOpen(true)
  }

  const openCreate = () => { setEditProject(null); reset(); setModalOpen(true) }

  const projects = (data?.data || [])
    .filter((p) => (!search || p.name?.toLowerCase().includes(search.toLowerCase())) && (!statusFilter || p.status === statusFilter))
  const totalPages = Math.ceil(projects.length / PAGE_SIZE)
  const paginated = projects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Manage charity projects</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> New Project
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <SearchBar onSearch={(v) => { setSearch(v); setPage(1) }} placeholder="Search projects…" className="flex-1 min-w-60" />
        <select className="input w-48" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          {Object.values(PROJECT_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? <LoadingSpinner /> : paginated.length === 0 ? (
        <EmptyState icon={<FiFolderPlus />} title="No projects found" action={<button onClick={openCreate} className="btn-primary">Create Project</button>} />
      ) : (
        <>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>{['Name', 'Ward', 'Status', 'Beneficiaries', 'Start Date', 'Actions'].map((h) => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{p.name}</td>
                    <td className="table-cell text-gray-500">{p.ward}</td>
                    <td className="table-cell"><StatusBadge status={p.status} /></td>
                    <td className="table-cell">{p.targetBeneficiaries || '—'}</td>
                    <td className="table-cell text-gray-500">{formatDate(p.startDate)}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><FiEdit2 size={15} /></button>
                        <button onClick={() => setConfirmDelete(p)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 size={15} /></button>
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

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditProject(null) }} title={editProject ? 'Edit Project' : 'New Project'} size="lg">
        <form onSubmit={handleSubmit((d) => saveMut.mutate(d))} className="space-y-4">
          <FormField label="Project Name" error={errors.name?.message} required>
            <Input error={errors.name?.message} {...register('name')} />
          </FormField>
          <FormField label="Description" error={errors.description?.message} required>
            <Textarea error={errors.description?.message} {...register('description')} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Ward" error={errors.ward?.message} required>
              <Select error={errors.ward?.message} {...register('ward')}>
                <option value="">Select Ward</option>
                {KENYA_WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
              </Select>
            </FormField>
            <FormField label="Category" error={errors.category?.message} required>
              <Input placeholder="e.g. Healthcare" error={errors.category?.message} {...register('category')} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Status" error={errors.status?.message} required>
              <Select error={errors.status?.message} {...register('status')}>
                {Object.values(PROJECT_STATUS).map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </FormField>
            <FormField label="Target Beneficiaries" error={errors.targetBeneficiaries?.message} required>
              <Input type="number" min="1" error={errors.targetBeneficiaries?.message} {...register('targetBeneficiaries')} />
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
          <FormField label="Impact Summary">
            <Textarea placeholder="Describe the expected impact…" {...register('impactSummary')} />
          </FormField>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving…' : editProject ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMut.mutate(confirmDelete?.id)}
        title="Delete Project" message={`Delete "${confirmDelete?.name}"? This cannot be undone.`} danger />
    </div>
  )
}
