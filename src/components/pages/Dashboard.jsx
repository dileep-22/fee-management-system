import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { StatCard, Card, CardHeader, Chips, Trend, Avatar, Pill, Progress } from '@/components/ui'
import { collectionTrend, fmtCurrency } from '@/data/mockData'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

const recentTx = [
  { initials: 'AS', color: 'gold', name: 'Ananya Singh', id: 'ST-2094', type: 'Tuition · Q3', date: '08 Mar', method: 'UPI', amount: 14500, status: 'paid' },
  { initials: 'VK', color: 'blue', name: 'Vikas Kumar', id: 'ST-1873', type: 'Transport · Mar', date: '07 Mar', method: 'Bank', amount: 2800, status: 'paid' },
  { initials: 'MP', color: 'red', name: 'Meera Patel', id: 'ST-2211', type: 'Hostel · Q3', date: '05 Mar', method: '—', amount: -18000, status: 'overdue' },
  { initials: 'RJ', color: 'green', name: 'Rohan Joshi', id: 'ST-1560', type: 'Tuition · Q3', date: '04 Mar', method: '—', amount: 14500, status: 'pending' },
  { initials: 'ST', color: 'purple', name: 'Simran Tomar', id: 'ST-2005', type: 'Lab Fees', date: '03 Mar', method: 'Cash', amount: 3600, status: 'paid' },
]

const feeBreakdown = [
  { label: 'Tuition Fee', amount: '₹9.2L', pct: 78, color: '#c9a84c' },
  { label: 'Transport', amount: '₹3.4L', pct: 55, color: '#5b9cf6' },
  { label: 'Hostel', amount: '₹4.1L', pct: 66, color: '#3ecf8e' },
  { label: 'Lab / Activities', amount: '₹1.7L', pct: 38, color: '#a78bfa' },
]

export default function Dashboard() {
  const { openModal, upcomingDues, payments, students } = useApp()
  const navigate = useNavigate()
  const [period, setPeriod] = useState('Monthly')

  // Compute live KPIs
  const totalCollected = payments.reduce((sum, p) => p.status === 'paid' ? sum + Number(p.amount) : sum, 0)
  const totalOverdue = payments.reduce((sum, p) => p.status === 'overdue' ? sum + Number(p.amount) : sum, 0)
  const fullyPaidStudents = students.filter(s => s.status === 'paid' || s.status === 'scholarship').length
  const recentTx = payments.slice(0, 5) // Get latest 5 payments

  return (
    <div className="p-8 animate-fade-in">
      {/* KPI Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Collected" value={fmtCurrency(totalCollected)} accent="gold"
          sub={<><Trend value="12.3%" /> vs last month</>}
          icon={<span className="text-lg font-bold">₹</span>}
          delay={50} />
        <StatCard label="Paid Students" value={fullyPaidStudents} accent="green"
          sub={<><Trend value="8.1%" /> this term</>}
          icon={<CheckIcon />} delay={100} />
        <StatCard label="Overdue" value="₹2.1L" accent="red"
          sub={<><Trend value="3" up={false} /> students this week</>}
          icon={<AlertIcon />} delay={150} />
        <StatCard label="Total Students" value="1,204" accent="blue"
          sub={<><Trend value="24" /> enrolled this month</>}
          icon={<UsersIcon />} delay={200} />
      </div>

      {/* Chart + Side widgets */}
      <div className="grid grid-cols-[1fr_340px] gap-5 mb-6">
        {/* Collection Chart */}
        <Card animate delay={250}>
          <CardHeader title="Collection Overview">
            <Chips options={['Monthly', 'Quarterly', 'Yearly']} value={period} onChange={setPeriod} />
          </CardHeader>
          <div className="p-5">
            <div className="flex gap-5 mb-4">
              {[['#c9a84c', 'Collected'], ['#5b9cf6', 'Expected']].map(([c, l]) => (
                <div key={l} className="flex items-center gap-2 text-xs text-felo-text2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                  {l}
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={collectionTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5b9cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#5b9cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e2530" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4e5a6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#4e5a6e' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ background: '#111418', border: '1px solid #252d3a', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#8a94a6' }}
                  itemStyle={{ color: '#e8eaf0' }}
                  formatter={v => [`₹${(v / 1000).toFixed(0)}K`]}
                />
                <Area type="monotone" dataKey="expected" stroke="#5b9cf6" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#gBlue)" />
                <Area type="monotone" dataKey="collected" stroke="#c9a84c" strokeWidth={2} fill="url(#gGold)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Upcoming dues */}
          <Card animate delay={300}>
            <CardHeader title="Upcoming Dues">
              <span className="text-xs text-gold cursor-pointer hover:text-gold-light" onClick={() => navigate('/payments')}>View all →</span>
            </CardHeader>
            <div>
              {upcomingDues.map((d, i) => (
                <div key={i}
                  className="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-0 hover:bg-surface2 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-center flex-shrink-0 ${d.urgency === 'high' ? 'bg-felo-red/10 text-felo-red' : 'text-gold-light'}`}
                    style={d.urgency !== 'high' ? { background: 'rgba(201,168,76,.1)' } : {}}>
                    <span className="text-[8px] font-bold uppercase leading-none">Mar</span>
                    <span className="text-base font-bold leading-tight">{d.dueDay}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-felo-text truncate">{d.name}</p>
                    <p className="text-xs text-felo-text3">{d.class} · {d.id}</p>
                  </div>
                  <span className="font-mono text-sm text-felo-text2">{fmtCurrency(d.amount)}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Fee Breakdown */}
          <Card animate delay={350}>
            <CardHeader title="Fee Breakdown">
              <span className="text-xs text-felo-text3">AY 2024–25</span>
            </CardHeader>
            <div className="p-5 flex flex-col gap-4">
              {feeBreakdown.map(fb => (
                <div key={fb.label}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-felo-text2">{fb.label}</span>
                    <span className="font-mono text-felo-text">{fb.amount}</span>
                  </div>
                  <Progress value={fb.pct} color={fb.color} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card animate delay={400}>
        <CardHeader title="Recent Transactions">
          <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => navigate('/payments')}>View all →</button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr><th>Student</th><th>Fee Type</th><th>Date</th><th>Method</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recentTx.map((tx, i) => (
                <tr key={i}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={tx.initials} color={tx.color} />
                      <div>
                        <p className="text-sm font-medium text-felo-text">{tx.name}</p>
                        <p className="text-xs text-felo-text3">{tx.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>{tx.type}</td>
                  <td>{tx.date}</td>
                  <td>{tx.method}</td>
                  <td className={`font-mono text-sm font-medium ${tx.status === 'paid' ? 'text-felo-green' : tx.status === 'overdue' ? 'text-felo-red' : 'text-felo-text'}`}>
                    {tx.amount > 0 ? '+' : ''}{fmtCurrency(Math.abs(tx.amount))}
                  </td>
                  <td><Pill status={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function CheckIcon() {
  return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
}
function AlertIcon() {
  return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
}
function UsersIcon() {
  return <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
}
