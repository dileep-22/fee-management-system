// src/components/pages/Statements.jsx
import { useApp } from '@/context/AppContext'
import { Card, CardHeader, Field, Input, Select } from '@/components/ui'

const recentDocs = [
  { name: 'Q3 Collection Summary', date: '08 Mar 2026', period: 'Oct–Mar',   fmt: 'PDF', color: '#f26969' },
  { name: 'Class 10 Ledger',        date: '01 Mar 2026', period: 'AY 2025–26', fmt: 'XLS', color: '#3ecf8e' },
  { name: 'Defaulter List',         date: '25 Feb 2026', period: 'Q3 2025',    fmt: 'PDF', color: '#f26969' },
]

export default function Statements() {
  const { toast } = useApp()
  return (
    <div className="p-8 animate-fade-in">
      <div className="grid grid-cols-[1fr_360px] gap-5">
        <div className="flex flex-col gap-5">
          {/* Generator */}
          <Card animate delay={50}>
            <CardHeader title="Generate Statement" />
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Field label="Statement Type">
                  <Select><option>Student Fee Ledger</option><option>Class-wise Summary</option><option>Default Report</option><option>Collection Summary</option><option>Annual Statement</option></Select>
                </Field>
                <Field label="Period">
                  <Select><option>Current Term (Q3)</option><option>Academic Year 2025–26</option><option>Custom Range</option></Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Field label="From Date"><Input type="date" defaultValue="2025-10-01" /></Field>
                <Field label="To Date"><Input type="date" defaultValue="2026-03-08" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Field label="Class / Section">
                  <Select><option>All Classes</option><option>Class 10-A</option><option>Class 11-A</option><option>Class 12-B</option></Select>
                </Field>
                <Field label="Status Filter">
                  <Select><option>All</option><option>Paid Only</option><option>Pending / Overdue</option></Select>
                </Field>
              </div>
              <div className="flex gap-3">
                <button className="btn-primary text-xs py-2 px-4" onClick={() => toast('Generating PDF…', 'success')}>
                  📄 Generate PDF
                </button>
                <button className="btn-ghost text-xs py-2 px-4" onClick={() => toast('Exporting Excel…', 'success')}>
                  ⬇ Export Excel
                </button>
              </div>
            </div>
          </Card>

          {/* Recent statements */}
          <Card animate delay={100}>
            <CardHeader title="Recent Statements" />
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead><tr><th>Statement</th><th>Generated</th><th>Period</th><th>Format</th><th></th></tr></thead>
                <tbody>
                  {recentDocs.map(d => (
                    <tr key={d.name}>
                      <td className="text-sm font-medium text-felo-text">{d.name}</td>
                      <td className="text-xs">{d.date}</td>
                      <td className="text-xs">{d.period}</td>
                      <td>
                        <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: `${d.color}1a`, color: d.color }}>
                          {d.fmt}
                        </span>
                      </td>
                      <td>
                        <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => toast('Downloading…', 'success')}>
                          ↓ Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Receipt Preview */}
        <Card animate delay={150}>
          <CardHeader title="Receipt Preview" />
          <div className="p-5">
            <div className="bg-surface2 border border-border rounded-card p-5">
              <div className="text-center mb-4 pb-4 border-b border-dashed border-border2">
                <p className="font-display text-xl gold-text">Felo</p>
                <p className="text-xs text-felo-text3 mt-0.5">Greenfield International School</p>
                <p className="font-mono text-xs text-felo-text3 mt-1">RCP-0841 · 08 Mar 2026</p>
              </div>
              {[['Student','Ananya Singh'],['Student ID','ST-2094'],['Class','10-A'],['Fee Type','Tuition Fee · Q3'],['Period','Oct 2025 – Mar 2026'],['Method','UPI']].map(([k,v]) => (
                <div key={k} className="flex justify-between py-1.5 text-xs border-b border-border last:border-0">
                  <span className="text-felo-text3">{k}</span><span className="font-mono">{v}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 mt-2 text-sm font-bold" style={{ color: '#e8c96a' }}>
                <span>Amount Paid</span><span>₹14,500</span>
              </div>
              <div className="text-center mt-4">
                <span className="inline-block border-2 border-felo-green text-felo-green text-xs font-semibold px-4 py-1 rounded" style={{ transform: 'rotate(-3deg)' }}>✓ PAID</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
