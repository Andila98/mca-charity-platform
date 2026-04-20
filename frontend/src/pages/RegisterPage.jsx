import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiHeart } from 'react-icons/fi'
import { registerSchema } from '../utils/validators'
import { useAuth } from '../contexts/AuthContext'
import { FormField, Input, Select } from '../components/common/FormField'
import { KENYA_WARDS } from '../utils/constants'

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'VIEWER', agreeToTerms: false },
  })

  const onSubmit = async (data) => {
    try {
      await registerUser(data)
      toast.success('Account created! Please wait for approval.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <FiHeart className="text-blue-600" size={28} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join our charity community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" error={errors.fullName?.message} required>
              <Input placeholder="Jane Doe" error={errors.fullName?.message} {...register('fullName')} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message} required>
              <Input placeholder="+254 7XX XXX XXX" error={errors.phone?.message} {...register('phone')} />
            </FormField>
          </div>

          <FormField label="Email Address" error={errors.email?.message} required>
            <Input type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
          </FormField>

          <FormField label="Ward" error={errors.ward?.message} required>
            <Select error={errors.ward?.message} {...register('ward')}>
              <option value="">Select Ward</option>
              {KENYA_WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Password" error={errors.password?.message} required>
              <Input type="password" placeholder="Min 8 chars" error={errors.password?.message} {...register('password')} />
            </FormField>
            <FormField label="Confirm Password" error={errors.confirmPassword?.message} required>
              <Input type="password" placeholder="Repeat password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            </FormField>
          </div>

          <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" className="mt-0.5 rounded" {...register('agreeToTerms')} />
            I agree to the Terms of Service and Privacy Policy
          </label>
          {errors.agreeToTerms && <p className="text-xs text-red-600">{errors.agreeToTerms.message}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
