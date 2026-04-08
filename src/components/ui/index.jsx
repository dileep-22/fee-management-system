// src/components/ui/index.jsx — shared UI primitives

import { clsx } from 'clsx'

/* ── Avatar ──────────────────────────────────────── */
const colorMap = {
  gold:   'bg-gold/15 text-gold',
  blue:   'bg-felo-blue/15 text-felo-blue',
  red:    'bg-felo-red/15 text-felo-red',
  green:  'bg-felo-green/15 text-felo-green',
  purple: 'bg-felo-purple/15 text-felo-purple',
  orange: 'bg-felo-orange/15 text-felo-orange',
}

export function Avatar({ initials, color = 'gold', size = 'sm' }) {
  const sz = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'md' ? 'w-9 h-9 text-sm' : 'w-8 h-8 text-xs'
  return (
    <div className={clsx('rounded-full flex items-center justify-center font-semibold flex-shrink-0', sz, colorMap[color])}>
      {initials}
    </div>
  )
}

/* ── Pill / Status Badge ─────────────────────────── */
export function Pill({ status }) {
  const map = {
    paid:        'pill pill-paid',
    pending:     'pill pill-pending',
    overdue:     'pill pill-overdue',
    partial:     'pill pill-partial',
    active:      'pill pill-active',
    inactive:    'pill pill-inactive',
    scholarship: 'pill pill-scholarship',
    review:      'pill pill-pending',
  }
  const label = {
    paid: 'Paid', pending: 'Pending', overdue: 'Overdue',
    partial: 'Partial', active: 'Active', inactive: 'Inactive',
    scholarship: 'Scholarship', review: 'Under Review',
  }
  return <span className={map[status] || 'pill pill-inactive'}>{label[status] ?? status}</span>
}

/* ── Trend badge ─────────────────────────────────── */
export function Trend({ value, label, up }) {
  const dir = up !== false && !String(value).startsWith('-')
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full',
      dir ? 'text-felo-green bg-felo-green/10' : 'text-felo-red bg-felo-red/10'
    )}>
      {dir ? '↑' : '↓'} {value}{label ? ` ${label}` : ''}
    </span>
  )
}

/* ── Card ────────────────────────────────────────── */
export function Card({ children, className = '', animate, delay = 0 }) {
  return (
    <div
      className={clsx('card', animate && 'animate-fade-up', className)}
      style={animate && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, children }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2 px-6 py-4 border-b border-border">
      <h3 className="font-display text-base font-semibold text-felo-text">{title}</h3>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

/* ── Stat Card ───────────────────────────────────── */
export function StatCard({ label, value, sub, icon, accent = 'gold', delay = 0 }) {
  return (
    <div className={clsx('stat-card animate-fade-up', `stat-${accent}`)} style={{ animationDelay: `${delay}ms` }}>
      {icon && (
        <div className={clsx(
          'absolute right-5 top-5 w-9 h-9 rounded-xl flex items-center justify-center',
          accent === 'gold'   ? 'bg-gold/10 text-gold'          :
          accent === 'green'  ? 'bg-felo-green/10 text-felo-green' :
          accent === 'red'    ? 'bg-felo-red/10 text-felo-red'     :
          accent === 'blue'   ? 'bg-felo-blue/10 text-felo-blue'   :
          accent === 'purple' ? 'bg-felo-purple/10 text-felo-purple' :
                                'bg-felo-orange/10 text-felo-orange'
        )}>
          {icon}
        </div>
      )}
      <div className="text-xs font-semibold uppercase tracking-widest text-felo-text3 mb-2.5">{label}</div>
      <div className="font-display text-3xl font-bold text-felo-text leading-none mb-2.5">{value}</div>
      <div className="text-xs text-felo-text2 flex items-center gap-1.5">{sub}</div>
    </div>
  )
}

/* ── Progress Bar ────────────────────────────────── */
export function Progress({ value, color = '#c9a84c' }) {
  return (
    <div className="h-1 bg-surface2 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${value}%`, background: color }} />
    </div>
  )
}

/* ── Chips / Tab selector ────────────────────────── */
export function Chips({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={clsx(
            'text-xs font-medium px-3 py-1.5 rounded-full border-none cursor-pointer transition-all duration-150',
            value === o
              ? 'bg-gold/12 text-gold-light'
              : 'bg-surface2 text-felo-text3 hover:text-felo-text2'
          )}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

/* ── Empty State ─────────────────────────────────── */
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-4 opacity-30">{icon}</div>
      <p className="text-sm font-medium text-felo-text2 mb-1">{title}</p>
      <p className="text-xs text-felo-text3 mb-4">{desc}</p>
      {action}
    </div>
  )
}

/* ── Skeleton loader ─────────────────────────────── */
export function Skeleton({ className = '' }) {
  return (
    <div className={clsx('bg-surface2 rounded animate-pulse', className)} />
  )
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ── Toggle ──────────────────────────────────────── */
export function Toggle({ value, onChange }) {
  return (
    <div
      className={clsx('toggle-switch', value && 'on')}
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
    />
  )
}

/* ── Form field ──────────────────────────────────── */
export function Field({ label, children, error }) {
  return (
    <div className="form-field">
      {label && <label className="form-label">{label}</label>}
      {children}
      {error && <p className="text-xs text-felo-red mt-0.5">{error}</p>}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={clsx('form-input', className)} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={clsx('form-input cursor-pointer', className)} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={clsx('form-input resize-y min-h-20', className)} {...props} />
}
