import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify'
import { FiUpload, FiTrash2, FiImage } from 'react-icons/fi'
import { imagesApi } from '../../services/api'
import { formatDate } from '../../utils/format'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Modal from '../../components/common/Modal'
import { FormField, Input, Textarea } from '../../components/common/FormField'

const PAGES = ['home', 'about', 'donate', 'events', 'volunteers', 'impact']

export default function ImagesPage() {
  const qc = useQueryClient()
  const [selectedPage, setSelectedPage] = useState('home')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [uploadForm, setUploadForm] = useState({ imageKey: '', altText: '', description: '', file: null })

  const { data: statsRes } = useQuery({ queryKey: ['storage-stats'], queryFn: () => imagesApi.getStorageStats() })
  const { data, isLoading } = useQuery({
    queryKey: ['images', selectedPage],
    queryFn: () => imagesApi.getByPage(selectedPage),
  })

  const uploadMut = useMutation({
    mutationFn: ({ file, imageKey, altText, description }) => {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('imageKey', imageKey)
      fd.append('pageName', selectedPage)
      if (altText) fd.append('altText', altText)
      if (description) fd.append('description', description)
      return imagesApi.upload(fd)
    },
    onSuccess: () => {
      toast.success('Image uploaded')
      qc.invalidateQueries({ queryKey: ['images', selectedPage] })
      qc.invalidateQueries({ queryKey: ['storage-stats'] })
      setUploadOpen(false)
      setUploadForm({ imageKey: '', altText: '', description: '', file: null })
    },
    onError: () => toast.error('Upload failed'),
  })

  const deleteMut = useMutation({
    mutationFn: (key) => imagesApi.delete(key),
    onSuccess: () => { toast.success('Image deleted'); qc.invalidateQueries({ queryKey: ['images', selectedPage] }) },
  })

  const onDrop = useCallback((files) => {
    if (files[0]) setUploadForm((f) => ({ ...f, file: files[0] }))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, maxFiles: 1 })
  const images = data?.data || []
  const stats = statsRes?.data

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Image Library</h1>
          {stats && <p className="text-gray-500 text-sm mt-1">{stats.usedMB}MB / {stats.totalMB}MB used</p>}
        </div>
        <button onClick={() => setUploadOpen(true)} className="btn-primary flex items-center gap-2">
          <FiUpload size={16} /> Upload Image
        </button>
      </div>

      {stats && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Storage Usage</p>
            <p className="text-sm text-gray-500">{stats.usagePercent}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${Math.min(stats.usagePercent, 100)}%` }} />
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {PAGES.map((p) => (
          <button key={p} onClick={() => setSelectedPage(p)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize ${selectedPage === p ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {p}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner /> : images.length === 0 ? (
        <EmptyState icon={<FiImage />} title="No images for this page"
          action={<button onClick={() => setUploadOpen(true)} className="btn-primary">Upload Image</button>} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.imageKey} className="bg-white border rounded-xl overflow-hidden group">
              <div className="relative h-40 bg-gray-100">
                <img src={img.url || img.imagePath} alt={img.altText} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                <button onClick={() => setConfirmDelete(img)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiTrash2 size={14} />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-mono font-medium text-blue-700 truncate">{img.imageKey}</p>
                {img.altText && <p className="text-xs text-gray-500 mt-1 truncate">{img.altText}</p>}
                <p className="text-xs text-gray-400 mt-1">{formatDate(img.uploadedAt || img.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Image" size="md">
        <div className="space-y-4">
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
            <input {...getInputProps()} />
            {uploadForm.file ? (
              <p className="text-sm text-green-700 font-medium">✓ {uploadForm.file.name}</p>
            ) : (
              <>
                <FiUpload className="mx-auto mb-2 text-gray-400" size={28} />
                <p className="text-sm text-gray-600">{isDragActive ? 'Drop the image here' : 'Drag & drop or click to select'}</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WebP supported</p>
              </>
            )}
          </div>
          <FormField label="Image Key" required>
            <Input value={uploadForm.imageKey} onChange={(e) => setUploadForm((f) => ({ ...f, imageKey: e.target.value }))}
              placeholder="e.g. hero_banner" />
          </FormField>
          <FormField label="Alt Text">
            <Input value={uploadForm.altText} onChange={(e) => setUploadForm((f) => ({ ...f, altText: e.target.value }))}
              placeholder="Describe the image for accessibility" />
          </FormField>
          <FormField label="Description">
            <Textarea value={uploadForm.description} onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))}
              rows={2} placeholder="Optional description" />
          </FormField>
          <div className="flex gap-3 justify-end">
            <button className="btn-secondary" onClick={() => setUploadOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={() => uploadMut.mutate(uploadForm)}
              disabled={!uploadForm.file || !uploadForm.imageKey || uploadMut.isPending}>
              {uploadMut.isPending ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)}
        onConfirm={() => deleteMut.mutate(confirmDelete?.imageKey)}
        title="Delete Image" message={`Delete image "${confirmDelete?.imageKey}"? This cannot be undone.`} danger />
    </div>
  )
}
