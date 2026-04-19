import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'
import { FiHeart, FiUsers } from 'react-icons/fi'
import { volunteersApi } from '../services/api'
import { volunteerSchema } from '../utils/validators'
import { KENYA_WARDS, VOLUNTEER_INTERESTS } from '../utils/constants'
import { FormField, Input, Select, Textarea } from '../components/common/FormField'

export default function VolunteersPage() {
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(volunteerSchema),
    defaultValues: { interests: [] },
  })

  const selectedInterests = watch('interests') || []

  const toggleInterest = (interest) => {
    const current = selectedInterests
    setValue('interests', current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest]
    )
  }

  const onSubmit = async (data) => {
    try {
      await volunteersApi.register(data)
      toast.success('You have successfully registered as a volunteer!')
      setSubmitted(true)
      reset()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <div className="bg-green-100 p-3 rounded-full">
            <FiUsers className="text-green-600" size={28} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Become a Volunteer</h1>
        <p className="text-gray-500 mt-2">Join hundreds of volunteers changing lives across Kenya</p>
      </div>

      {submitted ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your volunteer registration has been submitted. We'll be in touch soon.</p>
          <button onClick={() => setSubmitted(false)} className="btn-primary px-6">Register Another</button>
        </div>
      ) : (
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Full Name" error={errors.name?.message} required>
                <Input placeholder="Jane Doe" error={errors.name?.message} {...register('name')} />
              </FormField>
              <FormField label="Phone" error={errors.phone?.message}>
                <Input placeholder="+254 7XX XXX XXX" {...register('phone')} />
              </FormField>
            </div>

            <FormField label="Email" error={errors.email?.message} required>
              <Input type="email" placeholder="jane@example.com" error={errors.email?.message} {...register('email')} />
            </FormField>

            <FormField label="Ward" error={errors.ward?.message} required>
              <Select error={errors.ward?.message} {...register('ward')}>
                <option value="">Select your ward</option>
                {KENYA_WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
              </Select>
            </FormField>

            <FormField label="Areas of Interest" error={errors.interests?.message} required>
              <div className="flex flex-wrap gap-2 mt-1">
                {VOLUNTEER_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedInterests.includes(interest)
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              {errors.interests && <p className="text-xs text-red-600 mt-1">{errors.interests.message}</p>}
            </FormField>

            <FormField label="Tell us about yourself">
              <Textarea placeholder="Your background, skills, and motivation…" rows={3} {...register('bio')} />
            </FormField>

            <button type="submit" disabled={isSubmitting} className="btn-success w-full py-3 text-base">
              {isSubmitting ? 'Submitting…' : '🌟 Register as Volunteer'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
