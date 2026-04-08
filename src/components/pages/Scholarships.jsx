// src/components/pages/Scholarships.jsx
import { useApp } from '@/context/AppContext'
import { StatCard, Card, CardHeader, Pill, Progress } from '@/components/ui'
import { fmtCurrency } from '@/data/mockData'
import { clsx } from 'clsx'

const colorAccent = {
  gold: { bg: 'rgba(201,168,76,.15)', text: '#c9a84c', bar: '#c9a84c' },
  green: { bg: 'rgba(62,207,142,.15)', text: '#3ecf8e', bar: '#3ecf8e' },
  blue: { bg: 'rgba(91,156,246,.15)', text: '#5b9cf6', bar: '#5b9cf6' },
  purple: { bg: 'rgba(167,139,250,.15)', text: '#a78bfa', bar: '#a78bfa' },
}

export default function Scholarships() {
  const { openModal, toast, scholarships, applications, updateApplicationStatus } = useApp()

  const pendingApps = applications.filter(a => a.status === 'review')
  const totalBeneficiaries = scholarships.reduce((sum, s) => sum + s.beneficiaries, 0)

  const handleApprove = (id) => {
    updateApplicationStatus(id, 'paid')
    toast('Application approved!', 'success')
  }

  const handleReject = (id) => {
    updateApplicationStatus(id, 'rejected')
    toast('Application rejected.', 'error')
  }
  return (
    <div className="p-8 animate-fade-in">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Scholarships" value={scholarships.length} accent="purple" sub="Programs running" delay={50} />
        <StatCard label="Total Disbursed" value="₹8.6L" accent="gold" sub="This academic year" delay={100} />
        <StatCard label="Beneficiaries" value={totalBeneficiaries} accent="blue" sub="Students on scholarship" delay={150} />
        <StatCard label="Applications" value={pendingApps.length} accent="green" sub="Pending review" delay={200} />
      </div>

      {/* Scholarship cards */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        {scholarships.map((s, i) => {
          const a = colorAccent[s.color]
          const pct = Math.round((s.disbursed / s.budget) * 100)
          return (
            <div key={s.id}
              className="bg-surface border border-border rounded-card p-5 cursor-pointer hover:border-border2 hover:-translate-y-0.5 transition-all animate-fade-up"
              style={{ animationDelay: `${i * 60 + 50}ms` }}>
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: a.bg }}>
                  {s.emoji}
                </div>
                <Pill status="active" />
              </div>
              <h3 className="font-display text-base font-semibold mb-1.5">{s.name}</h3>
              <p className="text-xs text-felo-text3 leading-relaxed mb-4">{s.desc}</p>
              <div className="flex justify-between text-xs text-felo-text3 mb-3">
                <span>{s.beneficiaries} beneficiaries</span>
                <span style={{ color: a.text }}>{fmtCurrency(s.disbursed)} disbursed</span>
              </div>
              <Progress value={pct} color={a.bar} />
              <p className="text-xs text-felo-text3 mt-1.5">{pct}% of annual budget used</p>
            </div>
          )
        })}

        {/* Add new card */}
        <div
          onClick={() => openModal('scholarship')}
          className="bg-surface border border-dashed border-border rounded-card p-5 flex flex-col items-center justify-center cursor-pointer hover:border-border2 transition-all opacity-60 hover:opacity-80 min-h-48 animate-fade-up"
          style={{ animationDelay: '290ms' }}>
          <span className="text-4xl mb-3">+</span>
          <p className="text-sm font-medium text-felo-text2">Create New Scholarship</p>
          <p className="text-xs text-felo-text3 mt-1">Add a new program</p>
        </div>
      </div>

      {/* Pending Applications */}
      <Card animate delay={350}>
        <CardHeader title="Pending Applications">
          <span className="bg-gold text-bg text-xs font-semibold px-2 py-0.5 rounded-full">{pendingApps.length}</span>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr><th>Student</th><th>Scholarship Type</th><th>Applied</th><th>Documents</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {applications.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-${a.color}/15 text-felo-${a.color}`}
                        style={{ background: colorAccent[a.color]?.bg, color: colorAccent[a.color]?.text }}>
                        {a.initials}
                      </div>
                      <span className="text-sm font-medium text-felo-text">{a.name}</span>
                    </div>
                  </td>
                  <td>{a.type}</td>
                  <td className="text-xs">{new Date(a.applied).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <Pill status={a.docs === 'complete' ? 'paid' : 'pending'} />
                  </td>
                  <td><Pill status={a.status} /></td>
                  <td>
                    {a.status === 'review' ? (
                      <div className="flex gap-2">
                        <button className="btn-success" onClick={() => handleApprove(a.id)}>Approve</button>
                        <button className="btn-danger" onClick={() => handleReject(a.id)}>Reject</button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-felo-text3">{a.status === 'paid' ? 'Approved' : 'Rejected'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
