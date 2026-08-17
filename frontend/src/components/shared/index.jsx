import { useEffect, useRef } from 'react'
import { X, AlertTriangle, Loader2, SearchX, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={clsx('animate-spin text-brand-600', className)} />
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={32} />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md', footer }) {
  const overlayRef = useRef()
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className={clsx(
        'relative bg-white rounded-2xl shadow-2xl w-full animate-slide-up flex flex-col max-h-[90vh]',
        sizes[size]
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="btn-ghost btn-sm rounded-lg p-1.5">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-surface-200 flex justify-end gap-2 shrink-0 bg-surface-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ── ConfirmDialog ─────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = false, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={clsx('btn btn-sm gap-1', danger ? 'btn-danger' : 'btn-primary')}
        >
          {loading && <Spinner size={14} className="text-white" />}
          Confirm
        </button>
      </>}
    >
      <div className="flex gap-3">
        {danger && (
          <div className="shrink-0 w-10 h-10 rounded-full bg-danger-50 flex items-center justify-center">
            <AlertTriangle size={20} className="text-danger-600" />
          </div>
        )}
        <p className="text-sm text-slate-600 leading-relaxed pt-1">{message}</p>
      </div>
    </Modal>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon = SearchX, title = 'No results', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center">
        <Icon size={26} className="text-slate-400" />
      </div>
      <div>
        <p className="font-semibold text-slate-700">{title}</p>
        {message && <p className="text-sm text-slate-500 mt-1">{message}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ data, onPageChange }) {
  if (!data || data.totalPages <= 1) return null
  const { page, totalPages, totalElements, size } = data
  const from = page * size + 1
  const to   = Math.min((page + 1) * size, totalElements)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 bg-surface-50 rounded-b-xl">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{from}–{to}</span> of{' '}
        <span className="font-medium text-slate-700">{totalElements}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={data.first}
          className="btn-ghost btn-sm px-2 py-1 rounded-lg disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p = i
          if (totalPages > 5) {
            if (page <= 2) p = i
            else if (page >= totalPages - 3) p = totalPages - 5 + i
            else p = page - 2 + i
          }
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={clsx('btn btn-sm w-8 h-8 justify-center rounded-lg font-medium',
                p === page ? 'bg-brand-600 text-white' : 'btn-ghost text-slate-600')}
            >
              {p + 1}
            </button>
          )
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={data.last}
          className="btn-ghost btn-sm px-2 py-1 rounded-lg disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ── SearchInput ───────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={clsx('relative', className)}>
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9"
      />
    </div>
  )
}

// ── FormField ─────────────────────────────────────────────────────────────────
export function FormField({ label, error, required, children }) {
  return (
    <div>
      {label && (
        <label className="label">
          {label}{required && <span className="text-danger-600 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-danger-600 mt-1">{error}</p>}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ children, error, ...props }) {
  return (
    <select className={clsx('input', error && 'input-error')} {...props}>
      {children}
    </select>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'gray' }) {
  const classes = {
    green:  'badge-green',
    yellow: 'badge-yellow',
    red:    'badge-red',
    blue:   'badge-blue',
    gray:   'badge-gray',
  }
  return <span className={classes[variant] || 'badge-gray'}>{children}</span>
}
