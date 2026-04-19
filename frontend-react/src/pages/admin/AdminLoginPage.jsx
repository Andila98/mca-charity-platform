import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiShield } from 'react-icons/fi'
import { adminLoginSchema } from '../../utils/validators'
import { useAuth } from '../../contexts/AuthContext'
import { FormField, Input } from '../../components/common/FormField'

export default function AdminLoginPage() {
  const { adminLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/admin'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(adminLoginSchema),
  })

  const onSubmit = async (data) => {
    try {
      await adminLogin(data)
      toast.success('Admin login successful')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid admin credentials')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="bg-yellow-100 p-3 rounded-full">
              <FiShield className="text-yellow-600" size={28} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-xs text-red-600 font-medium mt-1 uppercase tracking-wide">Restricted Access</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Username" error={errors.username?.message} required>
            <Input placeholder="admin" error={errors.username?.message} {...register('username')} />
          </FormField>

          <FormField label="Password" error={errors.password?.message} required>
            <Input type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          </FormField>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400">
            {isSubmitting ? 'Signing in…' : 'Admin Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
