import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(\+254|0)[7][0-9]{8}$/, 'Enter a valid Kenyan phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  ward: z.string().min(1, 'Ward is required'),
  role: z.string().optional(),
  agreeToTerms: z.boolean().refine(v => v, 'You must agree to the terms'),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description is required'),
  ward: z.string().min(1, 'Ward is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.string().min(1, 'Status is required'),
  targetBeneficiaries: z.coerce.number().min(1, 'Must have at least 1 beneficiary'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  impactSummary: z.string().optional(),
})

export const donationSchema = z.object({
  donorName: z.string().min(2, 'Name is required'),
  donorEmail: z.string().email('Invalid email'),
  donorPhone: z.string().optional(),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0').optional(),
  type: z.string().min(1, 'Donation type is required'),
  itemDescription: z.string().optional(),
  projectId: z.coerce.number().optional(),
  notes: z.string().optional(),
  isAnonymous: z.boolean().optional(),
})

export const eventSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  description: z.string().min(10, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  ward: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  expectedAttendees: z.coerce.number().min(1).optional(),
  projectId: z.coerce.number().optional(),
  status: z.string().min(1, 'Status is required'),
})

export const volunteerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  ward: z.string().min(1, 'Ward is required'),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  bio: z.string().optional(),
})
