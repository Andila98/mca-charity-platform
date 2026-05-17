import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { FiPlus, FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi'
import { contentApi } from '../../services/api'
import { contentSchema } from '../../utils/validators'
import { useRequireEditor } from '../../hooks/useRequireRole'
import { formatRelative } from '../../utils/format'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { FormField, Input, Textarea } from '../../components/common/FormField'

const PAGES = ['home', 'about', 'donate', 'events', 'volunteers', 'impact']

export default function ContentPage() {
  useRequireEditor()
  const qc = useQueryClient()
  const [selectedPage, setSelectedPage] = useState('home')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(contentSchema),
    defaultValues: { contentKey: '', contentValue: '', description: '' },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['content', selectedPage],
    queryFn: () => contentApi.getByPage(selectedPage),
  })

  const saveMut = useMutation({
    mutationFn: (d) => contentApi.update({ ...d, pageName: selectedPage }),
    onSuccess: () => { toast.success('Content saved'); qc.invalidateQueries({ queryKey: ['content', selectedPage] }); setModalOpen(false) },
    onError: () => toast.error('Failed to save content'),
  })

  const deleteMut = useMutation({
    mutationFn: (key) => contentApi.delete(key),
    onSuccess: () => { toast.success('Content deleted'); qc.invalidateQueries({ queryKey: ['content', selectedPage] }) },
    onError: () => toast.error('Failed to delete content'),
  })

  const openEdit = (item) => {
    setEditItem(item)
    setValue('contentKey', item.contentKey)
    setValue('contentValue', item.contentValue)
    setValue('description', item.description || '')
    setModalOpen(true)
  }

  const openCreate = () => {
    setEditItem(null)
    reset()
    setModalOpen(true)
  }

  const contents = data?.data?.contents || data?.data || []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-500 text-sm mt-1">Edit page content dynamically</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Content
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {PAGES.map((p) => (
          <button key={p} onClick={() => setSelectedPage(p)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize ${selectedPage === p ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {p}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner /> : contents.length === 0 ? (
        <EmptyState icon={<FiFileText />} title="No content for this page"
          action={<button onClick={openCreate} className="btn-primary">Add Content</button>} />
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>{['Key', 'Value', 'Description', 'Updated', 'Actions'].map((h) => <th key={h} className="table-header">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contents.map((c) => (
                <tr key={c.id || c.contentKey} className="hover:bg-gray-50">
                  <td className="table-cell font-mono text-xs font-medium text-blue-700">{c.contentKey}</td>
                  <td className="table-cell max-w-xs">
                    <p className="text-sm text-gray-700 truncate">{c.contentValue}</p>
                  </td>
                  <td className="table-cell text-gray-500 text-sm">{c.description || '—'}</td>
                  <td className="table-cell text-gray-400 text-xs">{formatRelative(c.updatedAt)}</td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><FiEdit2 size={15} /></button>
                      <button onClick={() => setConfirmDelete(c)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Content' : 'Add Content'} size="md">
        <div className="space-y-4">
          <FormField label="Content Key" required error={errors.contentKey?.message}>
            <Input {...register('contentKey')} placeholder="e.g. hero_title" disabled={!!editItem}
              error={errors.contentKey?.message} />
          </FormField>
          <FormField label="Content Value" required error={errors.contentValue?.message}>
            <Textarea {...register('contentValue')} placeholder="Enter content…" rows={5}
              error={errors.contentValue?.message} />
          </FormField>
          <FormField label="Description" error={errors.description?.message}>
            <Input {...register('description')} placeholder="Brief description"
              error={errors.description?.message} />
          </FormField>
          <div className="flex gap-3 justify-end">
            <button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit((data) => saveMut.mutate(data))}
              disabled={saveMut.isPending || isSubmitting}>
              {saveMut.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMut.mutate(confirmDelete?.contentKey)}
        title="Delete Content" message={`Delete content key "${confirmDelete?.contentKey}"?`} danger />
    </div>
  )
}
