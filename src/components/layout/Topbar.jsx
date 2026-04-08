// src/components/layout/Topbar.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'

const pageConfig = {
  '/': { title: 'Dashboard', action: 'Record Payment', modal: 'payment' },
  '/students': { title: 'Students', action: 'Add Student', modal: 'student' },
  '/payments': { title: 'Payments', action: 'Record Payment', modal: 'payment' },
  '/fee-structure': { title: 'Fee Structure', action: 'New Fee Plan', modal: 'fee-plan' },
  '/scholarships': { title: 'Scholarships', action: 'New Scholarship', modal: 'scholarship' },
  '/analytics': { title: 'Analytics', action: 'Export Report', modal: null },
  '/statements': { title: 'Statements', action: 'Generate', modal: null },
  '/settings': { title: 'Settings', action: null, modal: null },
}

export function Topbar() {
  const { pathname } = useLocation()
  const { openModal, toast } = useApp()
  const navigate = useNavigate()
  const cfg = pageConfig[pathname] || { title: pathname.slice(1), action: null, modal: null }

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center px-8 gap-3.5 sticky top-0 z-40">
      <h1 className="font-display text-xl font-semibold flex-1">{cfg.title}</h1>

      {/* Search */}
      <div className="flex items-center gap-2 bg-surface2 border border-border rounded-sm px-3.5 py-2 w-52 focus-within:border-gold transition-colors">
        <svg className="text-felo-text3 flex-shrink-0" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input className="bg-transparent border-none outline-none text-xs text-felo-text placeholder-felo-text3 w-full font-sans"
          placeholder="Search student, ID…" />
      </div>

      {/* Notification bell */}
      <button className="w-9 h-9 bg-surface2 border border-border rounded-sm flex items-center justify-center relative text-felo-text2 hover:border-border2 hover:text-felo-text transition-all" onClick={() => navigate('/payments')}>
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-felo-red rounded-full border-2 border-surface" />
      </button>

      {/* Export */}
      <button className="btn-ghost text-xs py-2 px-3" onClick={() => toast('Export started!', 'success')}>
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </button>

      {/* Primary action */}
      {cfg.action && (
        <button
          className="btn-primary text-xs py-2 px-3"
          onClick={() => cfg.modal ? openModal(cfg.modal) : toast('Action triggered!', 'success')}
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {cfg.action}
        </button>
      )}
    </header>
  )
}
