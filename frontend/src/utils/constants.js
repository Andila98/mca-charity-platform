export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const USER_ROLES = { ADMIN: 'ADMIN', EDITOR: 'EDITOR', VIEWER: 'VIEWER' }
export const PROJECT_STATUS = { PLANNED: 'PLANNED', ONGOING: 'ONGOING', COMPLETED: 'COMPLETED', CANCELLED: 'CANCELLED' }
export const DONATION_STATUS = { PENDING: 'PENDING', RECEIVED: 'RECEIVED', USED: 'USED' }
export const DONATION_TYPE = { CASH: 'CASH', ITEM: 'ITEM', SERVICE: 'SERVICE' }
export const EVENT_STATUS = { PLANNED: 'PLANNED', ONGOING: 'ONGOING', COMPLETED: 'COMPLETED', CANCELLED: 'CANCELLED' }
export const VOLUNTEER_STATUS = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE', SUSPENDED: 'SUSPENDED' }

export const KENYA_WARDS = [
  'Westlands', 'Dagoretti North', 'Dagoretti South', 'Langata', 'Kibra',
  'Roysambu', 'Kasarani', 'Ruaraka', 'Embakasi South', 'Embakasi North',
  'Embakasi Central', 'Embakasi East', 'Embakasi West', 'Makadara',
  'Kamukunji', 'Starehe', 'Mathare',
]

export const VOLUNTEER_INTERESTS = [
  'Education', 'Healthcare', 'Environment', 'Food Security', 'Youth Empowerment',
  'Women Empowerment', 'Disability Support', 'Community Development',
  'Disaster Response', 'Arts & Culture',
]

export const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  ONGOING: 'bg-yellow-100 text-yellow-800',
  PLANNED: 'bg-purple-100 text-purple-800',
  PENDING: 'bg-orange-100 text-orange-800',
  RECEIVED: 'bg-green-100 text-green-800',
  USED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  CASH: 'bg-green-100 text-green-800',
  ITEM: 'bg-blue-100 text-blue-800',
  SERVICE: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-red-100 text-red-800',
  EDITOR: 'bg-blue-100 text-blue-800',
  VIEWER: 'bg-gray-100 text-gray-800',
}
