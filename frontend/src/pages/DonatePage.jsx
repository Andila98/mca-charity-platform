import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { FiHeart } from 'react-icons/fi'
import { donationsApi, projectsApi } from '../services/api'
import { donationSchema } from '../utils/validators'
import { DONATION_TYPE } from '../utils/constants'
import { FormField, Input, Select, Textarea } from '../components/common/FormField'

export default function DonatePage() {
  const { data: projectsRes } = useQuery({ queryKey: ['projects'], queryFn: () => projectsApi.list() })
  const projects = projectsRes?.data?.content || projectsRes?.data || []

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(donationSchema),
    defaultValues: { type: 'CASH', isAnonymous: false },
  })

  const donationType = watch('type')

  const onSubmit = async (data) => {
    try {
      await donationsApi.create(data)
      toast.success('Thank you for your donation!')
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit donation.')
    }
  }

  const amounts = [500, 1000, 2500, 5000, 10000]

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <div className="bg-red-100 p-3 rounded-full">
            <FiHeart className="text-red-600" size={28} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Make a Donation</h1>
        <p className="text-gray-500 mt-2">Your generosity transforms lives across Kenya</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Your Name" error={errors.donorName?.message} required>
              <Input placeholder="Jane Doe" error={errors.donorName?.message} {...register('donorName')} />
            </FormField>
            <FormField label="Email" error={errors.donorEmail?.message} required>
              <Input type="email" placeholder="jane@example.com" error={errors.donorEmail?.message} {...register('donorEmail')} />
            </FormField>
          </div>

          <FormField label="Phone (optional)" error={errors.donorPhone?.message}>
            <Input placeholder="+254 7XX XXX XXX" {...register('donorPhone')} />
          </FormField>

          <FormField label="Donation Type" error={errors.type?.message} required>
            <Select error={errors.type?.message} {...register('type')}>
              {Object.values(DONATION_TYPE).map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </FormField>

          {donationType === 'CASH' && (
            <FormField label="Amount (KES)" error={errors.amount?.message} required>
              <div className="flex flex-wrap gap-2 mb-2">
                {amounts.map((a) => (
                  <button key={a} type="button" className="btn-secondary text-xs px-3 py-1.5">
                    {a.toLocaleString()}
                  </button>
                ))}
              </div>
              <Input type="number" min="1" placeholder="Enter amount" error={errors.amount?.message} {...register('amount')} />
            </FormField>
          )}

          {donationType !== 'CASH' && (
            <FormField label="Item/Service Description" error={errors.itemDescription?.message}>
              <Textarea placeholder="Describe what you're donating…" {...register('itemDescription')} />
            </FormField>
          )}

          <FormField label="Project (optional)" error={errors.projectId?.message}>
            <Select {...register('projectId')}>
              <option value="">General Donation</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </FormField>

          <FormField label="Notes (optional)">
            <Textarea placeholder="Any message…" rows={2} {...register('notes')} />
          </FormField>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" className="rounded" {...register('isAnonymous')} />
            Make this donation anonymous
          </label>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base bg-red-600 hover:bg-red-700 focus:ring-red-500">
            {isSubmitting ? 'Submitting…' : '❤️ Donate Now'}
          </button>
        </form>
      </div>
    </div>
  )
}
