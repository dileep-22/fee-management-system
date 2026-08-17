import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts'
import { Download, FileText, TrendingUp, Users, IndianRupee, BarChart2 } from 'lucide-react'
import { feeApi } from '../api'
import { PageLoader, EmptyState, Select } from '../components/shared'
import { formatCurrency, downloadBlob, currentAcademicYear } from '../utils'
import toast from 'react-hot-toast'

const YEARS = ['2023-2024', '2024-2025', '2025-2026', '2026-2027']
const BAR_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6', '#06b6d4']

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-card-lg px-4 py-3 text-sm">
      <p className="text-slate-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.name.toLowerCase().includes('amount')
            ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function Reports() {
  const [academicYear, setAcademicYear] = useState(currentAcademicYear())
  const [exporting, setExporting]       = useState(false)

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-reports', academicYear],
    queryFn: () => feeApi.getDashboard({ academicYear }),
  })

  const exportFeesCsv = async () => {
    setExporting(true)
    try {
      const r = await feeApi.exportCsv({ academicYear })
      downloadBlob(r.data, `fee-records-${academicYear}.csv`)
      toast.success('CSV exported')
    } catch {} finally { setExporting(false) }
  }

  if (isLoading) return <PageLoader />

  const s = stats ?? {}
  const monthlyData = (s.monthlyCollections ?? []).map(m => ({
    month: m.monthName,
    collected: Number(m.amount ?? 0),
  }))
  const categoryData = (s.categoryStats ?? []).map(c => ({
    name: c.category?.length > 14 ? c.category.slice(0, 14) + '…' : c.category,
    collected: Number(c.collected ?? 0),
    total: Number(c.total ?? 0),
  }))

  const totalFees     = Number(s.totalFees      ?? 0)
  const collectedFees = Number(s.collectedFees  ?? 0)
  const pendingFees   = Number(s.pendingFees    ?? 0)
  const rate          = Math.round(s.collectionRate ?? 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Financial insights and exports</p>
        </div>
        <div className="flex gap-2">
          <select value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="input w-auto text-sm">
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={exportFeesCsv} disabled={exporting} className="btn-secondary btn-sm">
            <Download size={15} /> {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { icon: IndianRupee, label: 'Total Fees', value: formatCurrency(totalFees),     sub: academicYear,                    color: 'bg-brand-50 text-brand-600' },
          { icon: TrendingUp,  label: 'Collected',  value: formatCurrency(collectedFees), sub: `${rate}% collection rate`,      color: 'bg-success-50 text-success-600' },
          { icon: FileText,    label: 'Pending',    value: formatCurrency(pendingFees),   sub: `${s.pendingCount ?? 0} records`, color: 'bg-warning-50 text-warning-600' },
          { icon: Users,       label: 'Students',   value: s.totalStudents ?? 0,          sub: `${s.activeStudents ?? 0} active`, color: 'bg-brand-50 text-brand-600' },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-xs text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Collection rate bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0">Collection Rate</h3>
          <span className="text-lg font-bold text-brand-700">{rate}%</span>
        </div>
        <div className="h-4 bg-surface-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-700"
            style={{ width: `${rate}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>₹0</span>
          <span>{formatCurrency(totalFees)}</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Monthly bar chart */}
        <div className="card">
          <h3 className="section-title mb-4">Monthly Collection — {new Date().getFullYear()}</h3>
          {monthlyData.some(d => d.collected > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="collected" name="Amount Collected" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No collection data" message="Payments will chart here once recorded" />
          )}
        </div>

        {/* Category comparison */}
        <div className="card">
          <h3 className="section-title mb-4">Collected vs. Total by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={80}
                  axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-slate-600">{v}</span>} />
                <Bar dataKey="collected" name="Collected" fill="#16a34a" radius={[0, 3, 3, 0]} />
                <Bar dataKey="total"     name="Total"     fill="#dbeafe" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No category data" message="Select an academic year with fee records" />
          )}
        </div>
      </div>

      {/* Status breakdown table */}
      <div className="card">
        <h3 className="section-title mb-4">Fee Status Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {[
                { status: 'PAID',    count: s.paidCount    ?? 0, cls: 'badge-green'  },
                { status: 'PARTIAL', count: s.partialCount ?? 0, cls: 'badge-yellow' },
                { status: 'PENDING', count: s.pendingCount ?? 0, cls: 'badge-blue'   },
                { status: 'OVERDUE', count: s.overdueCount ?? 0, cls: 'badge-red'    },
              ].map(({ status, count, cls }) => {
                const total = (s.paidCount ?? 0) + (s.partialCount ?? 0) + (s.pendingCount ?? 0) + (s.overdueCount ?? 0)
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <tr key={status}>
                    <td><span className={cls}>{status}</span></td>
                    <td className="font-semibold">{count}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden max-w-32">
                          <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
