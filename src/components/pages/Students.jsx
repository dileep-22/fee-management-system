// src/components/pages/Students.jsx
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { StatCard, Card, CardHeader, Avatar, Pill, Trend, EmptyState } from '@/components/ui'
import { fmtCurrency } from '@/data/mockData'

export default function Students() {
  const { openModal, students } = useApp()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filters = ['All', 'Paid', 'Pending', 'Overdue', 'Scholarship']

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All' || s.status === filter.toLowerCase()
    return matchSearch && matchFilter
  })

  return (
    <div className="p-8 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Students" value={students.length} accent="blue"
          sub={<><Trend value="2.5%" /> this month</>} icon={<UsersIcon />} delay={50} />
        <StatCard label="Fee Cleared" value={students.filter(s => s.status === 'paid' || s.status === 'scholarship').length} accent="green"
          sub={`${Math.round((students.filter(s => s.status === 'paid' || s.status === 'scholarship').length / Math.max(1, students.length)) * 100)}% of students`} icon={<CheckIcon />} delay={100} />
        <StatCard label="Dues Pending" value={students.filter(s => s.status === 'pending' || s.status === 'partial').length} accent="red"
          sub="with outstanding fees" icon={<AlertIcon />} delay={150} />
      </div>

      {/* Table */}
      <Card animate delay={200}>
        <CardHeader title="Student Directory">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 bg-surface2 border border-border rounded-sm px-3 py-2 w-48 focus-within:border-gold transition-colors">
              <svg className="text-felo-text3 flex-shrink-0" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="bg-transparent border-none outline-none text-xs text-felo-text placeholder-felo-text3 w-full font-sans"
                placeholder="Search students…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Filter chips */}
            <div className="flex gap-1">
              {filters.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border-none cursor-pointer transition-all ${filter === f ? 'text-gold-light' : 'bg-surface2 text-felo-text3 hover:text-felo-text2'}`}
                  style={filter === f ? { background: 'rgba(201,168,76,.12)' } : {}}>
                  {f}
                </button>
              ))}
            </div>
            <button className="btn-primary text-xs py-2 px-3" onClick={() => openModal('student')}>
              + Add Student
            </button>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState icon="👤" title="No students found" desc="Try adjusting your search or filter." />
          ) : (
            <table className="w-full data-table">
              <thead>
                <tr><th>Student</th><th>Class</th><th>Contact</th><th>Fee Plan</th><th>Paid</th><th>Balance</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={s.initials} color={s.color} />
                        <div>
                          <p className="text-sm font-medium text-felo-text">{s.name}</p>
                          <p className="text-xs text-felo-text3 font-mono">{s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>{s.class}-{s.section}</td>
                    <td className="text-xs">{s.phone}</td>
                    <td>{s.plan}</td>
                    <td className="font-mono">{fmtCurrency(s.paid)}</td>
                    <td className={`font-mono ${s.balance > 0 ? 'text-felo-red' : 'text-felo-green'}`}>
                      {s.balance > 0 ? fmtCurrency(s.balance) : '—'}
                    </td>
                    <td><Pill status={s.status} /></td>
                    <td>
                      {s.balance > 0
                        ? <button className="btn-primary text-xs py-1.5 px-3" onClick={() => openModal('payment', { selectedStudent: s })}>Pay Now</button>
                        : <button className="btn-ghost text-xs py-1.5 px-3">Edit</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <span className="text-xs text-felo-text3">Showing {filtered.length} of 1,204 students</span>
          <div className="flex gap-1.5">
            {['← Prev', '1', '2', '3', 'Next →'].map((p, i) => (
              <button key={p} className={`text-xs px-3 py-1.5 rounded-sm border-none cursor-pointer transition-all ${i === 1 ? 'text-gold-light' : 'bg-surface2 text-felo-text3 hover:text-felo-text2'}`}
                style={i === 1 ? { background: 'rgba(201,168,76,.12)' } : {}}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

function UsersIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> }
function CheckIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> }
function AlertIcon() { return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg> }
