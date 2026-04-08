// src/components/pages/Payments.jsx
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { StatCard, Card, CardHeader, Avatar, Pill, Trend } from '@/components/ui'
import { payments, fmtCurrency } from '@/data/mockData'

const ITEMS_PER_PAGE = 4

export default function Payments() {
  const { openModal } = useApp()
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)
  const tabs = ['All', 'Paid', 'Pending', 'Overdue']

  const filtered = filter === 'All'
    ? payments
    : payments.filter(p => p.status === filter.toLowerCase())

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

  // Reset to page 1 when filter changes
  const handleFilterChange = (tab) => {
    setFilter(tab)
    setPage(1)
  }

  return (
    <div className="p-8 animate-fade-in">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="This Month" value="₹4.2L" accent="gold" sub={<><Trend value="9.4%" /></>} delay={50} />
        <StatCard label="Transactions" value="148" accent="green" sub={<><Trend value="12" /> vs last month</>} delay={100} />
        <StatCard label="Overdue Alerts" value={payments.filter(p => p.status === 'overdue').length} accent="red" sub="Require immediate follow-up" delay={150} />
        <StatCard label="Avg. Payment" value="₹2,835" accent="blue" sub={<><Trend value="₹120" /></>} delay={200} />
      </div>

      <Card animate delay={250}>
        <CardHeader title="All Payments">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {tabs.map(t => (
                <button key={t} onClick={() => handleFilterChange(t)}
                  className={`text-xs px-3 py-1.5 rounded-full border-none cursor-pointer transition-all ${filter === t ? 'text-gold-light' : 'bg-surface2 text-felo-text3 hover:text-felo-text2'}`}
                  style={filter === t ? { background: 'rgba(201,168,76,.12)' } : {}}>
                  {t}
                </button>
              ))}
            </div>
            <button className="btn-primary text-xs py-2 px-3" onClick={() => openModal('payment')}>
              + Record Payment
            </button>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr><th>Receipt #</th><th>Student</th><th>Fee Type</th><th>Date</th><th>Due Date</th><th>Method</th><th>Amount</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {paginated.map((p, i) => (
                <tr key={i} className={p.status === 'overdue' ? 'bg-felo-red/[0.02]' : ''}>
                  <td className="font-mono text-sm" style={{ color: p.id ? '#c9a84c' : '#4e5a6e' }}>
                    {p.id || '—'}
                  </td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={p.initials} color={p.color} />
                      <span className="text-sm font-medium text-felo-text">{p.name}</span>
                    </div>
                  </td>
                  <td>{p.feeType}</td>
                  <td className="text-xs">{p.date ? new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</td>
                  <td className={`text-xs ${p.status === 'overdue' ? 'text-felo-red font-medium' : ''}`}>
                    {new Date(p.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td>{p.method || '—'}</td>
                  <td className={`font-mono text-sm font-medium ${p.status === 'paid' ? 'text-felo-green' : p.status === 'overdue' ? 'text-felo-red' : 'text-felo-text'}`}>
                    {p.status === 'paid' ? '+' : ''}{fmtCurrency(p.amount)}
                  </td>
                  <td><Pill status={p.status} /></td>
                  <td>
                    {p.status === 'paid'
                      ? <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => openModal('receipt', { payment: p })}>Receipt</button>
                      : <button className="btn-primary text-xs py-1.5 px-3" onClick={() => openModal('payment', { student: { id: p.id, name: p.name, balance: p.amount } })}>Collect</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <span className="text-xs text-felo-text3">
            Showing {filtered.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} transactions
          </span>
          <div className="flex gap-1.5">
            {/* Prev */}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className={`text-xs px-3 py-1.5 rounded-sm border-none cursor-pointer transition-all bg-surface2 text-felo-text3 hover:text-felo-text2 disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              ← Prev
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`text-xs px-3 py-1.5 rounded-sm border-none cursor-pointer transition-all ${safePage === num ? 'text-gold-light' : 'bg-surface2 text-felo-text3 hover:text-felo-text2'}`}
                style={safePage === num ? { background: 'rgba(201,168,76,.12)' } : {}}
              >
                {num}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className={`text-xs px-3 py-1.5 rounded-sm border-none cursor-pointer transition-all bg-surface2 text-felo-text3 hover:text-felo-text2 disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Next →
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
