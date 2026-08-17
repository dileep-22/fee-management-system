import { format, parseISO, isValid } from 'date-fns'

export const formatCurrency = (v, currency = '₹') => {
  if (v == null) return `${currency}0.00`
  return `${currency}${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatDate = (d) => {
  if (!d) return '—'
  try {
    const date = typeof d === 'string' ? parseISO(d) : d
    return isValid(date) ? format(date, 'dd MMM yyyy') : '—'
  } catch { return '—' }
}

export const formatDateTime = (d) => {
  if (!d) return '—'
  try {
    const date = typeof d === 'string' ? parseISO(d) : d
    return isValid(date) ? format(date, 'dd MMM yyyy, hh:mm a') : '—'
  } catch { return '—' }
}

export const statusBadgeClass = (status) => ({
  PAID:    'badge-green',
  PARTIAL: 'badge-yellow',
  PENDING: 'badge-blue',
  OVERDUE: 'badge-red',
  WAIVED:  'badge-gray',
}[status] ?? 'badge-gray')

export const studentStatusBadge = (status) => ({
  ACTIVE:    'badge-green',
  INACTIVE:  'badge-gray',
  GRADUATED: 'badge-blue',
  SUSPENDED: 'badge-red',
}[status] ?? 'badge-gray')

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export const currentAcademicYear = () => {
  const now = new Date()
  const y   = now.getFullYear()
  return now.getMonth() >= 5 ? `${y}-${y + 1}` : `${y - 1}-${y}`
}

export const PAYMENT_METHODS = ['CASH', 'ONLINE', 'BANK_TRANSFER', 'CHEQUE', 'RAZORPAY', 'STRIPE']
export const FEE_TYPES        = ['ONE_TIME', 'MONTHLY', 'SEMESTER', 'ANNUAL']
export const STUDENT_STATUSES = ['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED']
export const FEE_STATUSES     = ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'WAIVED']
