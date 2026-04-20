import { format, formatDistanceToNow } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return '—'
  try { return format(new Date(date), 'MMM d, yyyy') } catch { return '—' }
}

export const formatDateTime = (date) => {
  if (!date) return '—'
  try { return format(new Date(date), 'MMM d, yyyy h:mm a') } catch { return '—' }
}

export const formatRelative = (date) => {
  if (!date) return '—'
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }) } catch { return '—' }
}

export const formatCurrency = (amount, currency = 'KES') =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency }).format(amount ?? 0)

export const formatNumber = (n) =>
  new Intl.NumberFormat('en-KE').format(n ?? 0)

export const truncate = (str, len = 100) =>
  str && str.length > len ? str.slice(0, len) + '…' : str ?? ''
