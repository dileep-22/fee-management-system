// src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { payments } from '@/data/mockData'

// Live count: overdue + pending payments
const pendingCount = payments.filter(p => p.status === 'overdue' || p.status === 'pending').length

const navItems = [
  {
    group: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: <GridIcon /> },
      { to: '/students', label: 'Students', icon: <UserIcon /> },
    ],
  },
  {
    group: 'Finance',
    items: [
      { to: '/payments', label: 'Payments', icon: <CardIcon />, badge: pendingCount },
      { to: '/fee-structure', label: 'Fee Structure', icon: <CheckboxIcon /> },
      { to: '/scholarships', label: 'Scholarships', icon: <CurrencyIcon /> },
    ],
  },
  {
    group: 'Reports',
    items: [
      { to: '/analytics', label: 'Analytics', icon: <ChartIcon /> },
      { to: '/statements', label: 'Statements', icon: <FileIcon /> },
    ],
  },
  {
    group: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: <SettingsIcon /> },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-surface border-r border-border flex flex-col py-7 fixed left-0 top-0 bottom-0 z-50">
      {/* Logo */}
      <NavLink to="/" className="flex items-center gap-2.5 px-6 pb-8 no-underline">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display text-base font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#c9a84c,#8c6b1f)', boxShadow: '0 4px 20px rgba(201,168,76,.3)' }}>
          F
        </div>
        <span className="font-display text-xl font-semibold gold-text">Felo</span>
      </NavLink>

      {/* Nav */}
      <nav className="px-3 flex-1 overflow-y-auto space-y-0">
        {navItems.map(group => (
          <div key={group.group}>
            <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-felo-text3 px-3 mt-5 mb-1.5">
              {group.group}
            </p>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => clsx('nav-item', isActive && 'active')}
              >
                <span className="opacity-70 w-4.5 h-4.5 flex-shrink-0">{item.icon}</span>
                {item.label}
                {item.badge > 0 && (
                  <span className="ml-auto bg-felo-red text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User card */}
      <NavLink to="/settings" className="mx-6 pt-4 border-t border-border flex items-center gap-2.5 no-underline group">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-felo-blue border-2 border-border2"
          style={{ background: 'linear-gradient(135deg,#3a4f6e,#1e2d42)' }}>
          AA
        </div>
        <div>
          <p className="text-xs font-medium text-felo-text">Admin Account</p>
          <p className="text-[10px] text-felo-text3">Finance Manager</p>
        </div>
      </NavLink>
    </aside>
  )
}

/* ── Icon components ─────────────────────────────── */
function GridIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}
function CardIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
    </svg>
  )
}
function CheckboxIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M9 14l2 2 4-4" /><rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  )
}
function CurrencyIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M3 3v18h18" /><path d="M7 16l4-8 4 6 3-4" />
    </svg>
  )
}
function FileIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  )
}
function SettingsIcon() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M12 2v2m0 18v2m10-12h-2M4 12H2" />
    </svg>
  )
}
