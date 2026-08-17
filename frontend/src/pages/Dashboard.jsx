import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts'
import { Users, IndianRupee, Clock, CheckCircle, AlertCircle, TrendingUp, Calendar, Activity } from 'lucide-react'
import { feeApi } from '../api'
import { formatCurrency, currentAcademicYear } from '../utils'
import { PageLoader, EmptyState } from '../components/shared'

const COLORS = ['#16a34a', '#2563eb', '#f59e0b', '#dc2626', '#64748b']

function StatCard({ icon: Icon, label, value, sub, colorClass, trend }) {
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon size={20} />
        </div>
        {trend != null && (
          <span className="flex items-center gap-1 text-xs font-medium text-success-700 bg-success-50 px-2 py-0.5 rounded-full">
            <TrendingUp size={11} />{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-card-lg px-4 py-3">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export default function Dashboard() {
  const [academicYear, setAcademicYear] = useState(currentAcademicYear())

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', academicYear],
    queryFn: () => feeApi.getDashboard({ academicYear }),
  })

  const { data: dueSoon = [] } = useQuery({
    queryKey: ['due-soon'],
    queryFn: () => feeApi.getDueSoon(7),
  })

  if (isLoading) return <PageLoader />

  const s = stats ?? {}
  const chartData = (s.monthlyCollections ?? []).map(m => ({
    name: m.monthName,
    amount: Number(m.amount ?? 0),
  }))
  const pieData = [
    { name: 'Paid',    value: s.paidCount    ?? 0 },
    { name: 'Partial', value: s.partialCount  ?? 0 },
    { name: 'Pending', value: s.pendingCount  ?? 0 },
    { name: 'Overdue', value: s.overdueCount  ?? 0 },
  ].filter(d => d.value > 0)

  const collectionRate = Math.round(s.collectionRate ?? 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Overview of fee collection and students</p>
        </div>
        <select
          value={academicYear}
          onChange={e => setAcademicYear(e.target.value)}
          className="input w-auto text-sm"
        >
          {['2024-2025', '2025-2026', '2026-2027'].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users}       label="Total Students"   value={s.totalStudents ?? 0}
          sub={`${s.activeStudents ?? 0} active`} colorClass="bg-brand-50 text-brand-600" />
        <StatCard icon={IndianRupee} label="Total Fees"        value={formatCurrency(s.totalFees)}
          sub={`AY ${academicYear}`}              colorClass="bg-success-50 text-success-600" />
        <StatCard icon={CheckCircle} label="Collected"         value={formatCurrency(s.collectedFees)}
          sub={`${collectionRate}% collection rate`} colorClass="bg-success-50 text-success-600" trend={collectionRate} />
        <StatCard icon={Clock}       label="Pending"           value={formatCurrency(s.pendingFees)}
          sub={`${(s.pendingCount ?? 0) + (s.partialCount ?? 0)} records`} colorClass="bg-warning-50 text-warning-600" />
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Paid',    value: s.paidCount    ?? 0, cls: 'text-success-700 bg-success-50' },
          { label: 'Partial', value: s.partialCount ?? 0, cls: 'text-warning-700 bg-warning-50' },
          { label: 'Pending', value: s.pendingCount ?? 0, cls: 'text-brand-700   bg-brand-50'   },
          { label: 'Overdue', value: s.overdueCount ?? 0, cls: 'text-danger-700  bg-danger-50'  },
        ].map(({ label, value, cls }) => (
          <div key={label} className="card text-center">
            <p className={`text-3xl font-bold ${cls.split(' ')[0]}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label} Records</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly collection area chart */}
        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Monthly Collection {new Date().getFullYear()}</h3>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Activity size={13} /> Live
            </div>
          </div>
          {chartData.some(d => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2.5}
                  fill="url(#grad)" dot={false} activeDot={{ r: 5, fill: '#2563eb' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No collection data" message="Payments will appear here once recorded" />
          )}
        </div>

        {/* Payment status pie chart */}
        <div className="card">
          <h3 className="section-title mb-4">Payment Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={v => (
                  <span className="text-xs text-slate-600">{v}</span>
                )} />
                <Tooltip formatter={(v) => [v, 'Records']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No data yet" />
          )}
        </div>
      </div>

      {/* Category stats + Due soon */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="card">
          <h3 className="section-title mb-4">Collection by Category</h3>
          {(s.categoryStats ?? []).length > 0 ? (
            <div className="space-y-3">
              {s.categoryStats.map((c, i) => {
                const pct = c.total > 0 ? Math.round((c.collected / c.total) * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700 truncate">{c.category}</span>
                      <span className="text-slate-500 shrink-0 ml-2">{formatCurrency(c.collected)} / {formatCurrency(c.total)}</span>
                    </div>
                    <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState title="No category data" message="Select an academic year with fee records" />
          )}
        </div>

        {/* Due soon */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-warning-600" />
            <h3 className="section-title mb-0">Due in Next 7 Days</h3>
            {dueSoon.length > 0 && (
              <span className="ml-auto badge bg-warning-100 text-warning-700">{dueSoon.length}</span>
            )}
          </div>
          {dueSoon.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dueSoon.slice(0, 8).map(r => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{r.studentName}</p>
                    <p className="text-xs text-slate-500">{r.feeCategoryName} · Due {r.dueDate}</p>
                  </div>
                  <span className="text-sm font-semibold text-warning-700 shrink-0 ml-2">
                    {formatCurrency(r.balanceAmount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No upcoming dues" message="All fees are up to date" />
          )}
        </div>
      </div>
    </div>
  )
}
