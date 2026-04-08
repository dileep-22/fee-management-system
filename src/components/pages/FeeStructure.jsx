// src/components/pages/FeeStructure.jsx
import { useApp } from '@/context/AppContext'
import { StatCard, Card, CardHeader, Pill, Progress } from '@/components/ui'
import { fmtCurrency } from '@/data/mockData'

export default function FeeStructure() {
  const { openModal, feePlans } = useApp()
  return (
    <div className="p-8 animate-fade-in">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Fee Plans" value={feePlans.length} accent="gold" sub="Across all classes" delay={50} />
        <StatCard label="Avg Annual Fee" value="₹52,400" accent="blue" sub="Per student" delay={100} />
        <StatCard label="Fee Categories" value="7" accent="green" sub="Tuition, Transport, Hostel…" delay={150} />
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-5">
        {/* Plans Table */}
        <Card animate delay={200}>
          <CardHeader title="Fee Plans">
            <button className="btn-primary text-xs py-2 px-3" onClick={() => openModal('fee-plan')}>+ New Plan</button>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead><tr><th>Plan Name</th><th>Classes</th><th>Annual</th><th>Quarterly</th><th>Students</th><th>Status</th></tr></thead>
              <tbody>
                {feePlans.map(p => (
                  <tr key={p.id}>
                    <td className="text-sm font-medium text-felo-text">{p.name}</td>
                    <td>{p.classes}</td>
                    <td className="font-mono">{fmtCurrency(p.annual)}</td>
                    <td className="font-mono">{fmtCurrency(p.quarterly)}</td>
                    <td>{p.students}</td>
                    <td><Pill status={p.status === 'scholarship' ? 'scholarship' : p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <Card animate delay={250}>
            <CardHeader title="Fee Components">
              <button className="btn-ghost text-xs py-1.5 px-3">Edit</button>
            </CardHeader>
            <div className="px-5 py-4">
              {[['Tuition Fee', 'Core academic fee', 28000], ['Development Fund', 'Infrastructure & labs', 4000], ['Exam Fee', 'Per term', 2500], ['Library Fee', 'Annual subscription', 1200]].map(([name, desc, amt]) => (
                <div key={name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-felo-text">{name}</p>
                    <p className="text-xs text-felo-text3">{desc}</p>
                  </div>
                  <span className="font-mono text-sm text-felo-text">{fmtCurrency(amt)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 mt-1">
                <span className="text-sm font-medium" style={{ color: '#c9a84c' }}>Annual Total</span>
                <span className="font-mono text-lg font-bold" style={{ color: '#c9a84c' }}>₹35,700</span>
              </div>
            </div>
          </Card>

          <Card animate delay={300}>
            <CardHeader title="Payment Schedule" />
            <div className="p-5 flex flex-col gap-3">
              {[
                { q: 'Q1 — April', due: '15 Apr 2025', status: 'paid', active: false },
                { q: 'Q2 — July', due: '15 Jul 2025', status: 'paid', active: false },
                { q: 'Q3 — October', due: '15 Oct 2025', status: 'pending', active: true },
                { q: 'Q4 — January', due: '15 Jan 2026', status: 'inactive', active: false },
              ].map(s => (
                <div key={s.q} className={`flex justify-between items-center p-3 rounded-sm ${s.active ? 'border' : 'bg-surface2'} ${s.status === 'inactive' ? 'opacity-50' : ''}`}
                  style={s.active ? { background: 'rgba(201,168,76,.08)', borderColor: 'rgba(201,168,76,.2)' } : {}}>
                  <div>
                    <p className={`text-sm font-medium ${s.active ? '' : 'text-felo-text'}`} style={s.active ? { color: '#e8c96a' } : {}}>
                      {s.q}
                    </p>
                    <p className="text-xs text-felo-text3 mt-0.5">Due: {s.due}</p>
                  </div>
                  <Pill status={s.status === 'inactive' ? 'inactive' : s.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
