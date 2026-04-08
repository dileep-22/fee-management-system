// src/components/pages/Analytics.jsx
import { useState } from 'react'
import { StatCard, Card, CardHeader, Chips, Trend, Progress } from '@/components/ui'
import { collectionTrend, paymentMethods, classCollection } from '@/data/mockData'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts'

export default function Analytics() {
  const [period, setPeriod] = useState('2025–26')

  return (
    <div className="p-8 animate-fade-in">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="YTD Collection" value="₹1.12Cr" accent="gold" sub={<><Trend value="18.5%" /> vs last year</>} delay={50} />
        <StatCard label="Collection Rate" value="82.4%" accent="green" sub={<><Trend value="4.2%" /> improvement</>} delay={100} />
        <StatCard label="Default Rate" value="3.2%" accent="red" sub={<><Trend value="1.1%" up={false} /> from last year</>} delay={150} />
        <StatCard label="Outstanding" value="₹14.8L" accent="blue" sub="Across 362 students" delay={200} />
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-5 mb-5">
        {/* Trend Chart */}
        <Card animate delay={250}>
          <CardHeader title="Monthly Collection Trend">
            <Chips options={['2025–26','2024–25']} value={period} onChange={setPeriod} />
          </CardHeader>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={collectionTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="aGold2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#c9a84c" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#c9a84c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e2530" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4e5a6e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#4e5a6e' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                <Tooltip
                  contentStyle={{ background: '#111418', border: '1px solid #252d3a', borderRadius: 8, fontSize: 12 }}
                  formatter={v => [`₹${(v/1000).toFixed(0)}K`]}
                  labelStyle={{ color: '#8a94a6' }}
                />
                <Area type="monotone" dataKey="collected" stroke="#c9a84c" strokeWidth={2} fill="url(#aGold2)" dot={{ fill: '#c9a84c', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Methods Donut */}
        <Card animate delay={300}>
          <CardHeader title="Payment Methods" />
          <div className="p-5">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={2} stroke="#111418">
                  {paymentMethods.map((m, i) => <Cell key={i} fill={m.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#111418', border: '1px solid #252d3a', borderRadius: 8, fontSize: 12 }}
                  formatter={v => [`${v}%`]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 mt-2">
              {paymentMethods.map(m => (
                <div key={m.name} className="flex justify-between text-xs">
                  <span className="flex items-center gap-2 text-felo-text2">
                    <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                    {m.name}
                  </span>
                  <span className="font-mono text-felo-text">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Class-wise collection */}
      <Card animate delay={350}>
        <CardHeader title="Class-wise Collection Rate" />
        <div className="p-6 grid grid-cols-5 gap-6">
          {classCollection.map(c => (
            <div key={c.cls} className="text-center">
              <div className="relative w-full h-32 flex items-end justify-center mb-2">
                <div className="w-10 rounded-t-sm transition-all duration-1000"
                  style={{ height: `${c.pct}%`, background: c.color, opacity: 0.85 }} />
              </div>
              <p className="text-xs text-felo-text2 font-medium">{c.cls}</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: c.color }}>{c.pct}%</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
