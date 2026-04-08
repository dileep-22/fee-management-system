// src/components/pages/Settings.jsx
import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, Toggle, Field, Input, Select, Textarea } from '@/components/ui'
import { clsx } from 'clsx'

const tabs = ['General', 'Institution', 'Notifications', 'Users & Roles', 'Integrations', 'Security']

export default function Settings() {
  const { openModal, toast, systemUsers } = useApp()
  const [tab, setTab] = useState('General')

  const [notifs, setNotifs] = useState({
    sms: true, dueReminder: true, overdueAlert: true, monthlyReport: false, whatsapp: false
  })
  const [security, setSecurity] = useState({ twoFa: true, sessionTimeout: true, auditLog: true })

  return (
    <div className="p-8 animate-fade-in">
      <div className="grid grid-cols-[200px_1fr] gap-5">
        {/* Sidebar nav */}
        <Card>
          <div className="p-3 flex flex-col gap-0.5">
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={clsx(
                  'flex items-center gap-2.5 px-3.5 py-2.5 rounded-sm text-sm cursor-pointer border-none text-left transition-all w-full',
                  tab === t ? 'text-gold-light' : 'bg-transparent text-felo-text2 hover:bg-surface2 hover:text-felo-text'
                )}
                style={tab === t ? { background: 'rgba(201,168,76,.12)' } : {}}>
                {t}
              </button>
            ))}
          </div>
        </Card>

        {/* Content */}
        <div>
          {tab === 'General' && (
            <Card>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-display text-base font-semibold">General Settings</h3>
                <button className="btn-primary text-xs py-2 px-4" onClick={() => toast('Settings saved!', 'success')}>Save Changes</button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="System Name"><Input defaultValue="Felo FMS" /></Field>
                  <Field label="Academic Year"><Select><option>2025–2026</option><option>2024–2025</option></Select></Field>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="Currency"><Select><option>INR (₹)</option><option>USD ($)</option></Select></Field>
                  <Field label="Date Format"><Select><option>DD MMM YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></Select></Field>
                </div>
                <Field label="Late Fee (%)"><Input type="number" defaultValue="2" className="w-48" /></Field>
              </div>
            </Card>
          )}

          {tab === 'Institution' && (
            <Card>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-display text-base font-semibold">Institution Profile</h3>
                <button className="btn-primary text-xs py-2 px-4" onClick={() => toast('Profile saved!', 'success')}>Save Changes</button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="School Name"><Input defaultValue="Greenfield International School" /></Field>
                  <Field label="Affiliation"><Input defaultValue="CBSE — 2024-2025" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="Contact Email"><Input type="email" defaultValue="admin@greenfield.edu" /></Field>
                  <Field label="Phone"><Input defaultValue="+91 98765 43210" /></Field>
                </div>
                <Field label="Address"><Textarea defaultValue="42, Greenfield Lane, Sector 7, Noida, UP – 201301" /></Field>
              </div>
            </Card>
          )}

          {tab === 'Notifications' && (
            <Card>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-display text-base font-semibold">Notification Preferences</h3>
                <button className="btn-primary text-xs py-2 px-4" onClick={() => toast('Preferences saved!', 'success')}>Save</button>
              </div>
              <div className="px-6 py-4">
                {[
                  ['sms', 'Payment Confirmation SMS', 'Send SMS to parents upon receipt'],
                  ['dueReminder', 'Due Date Reminders', '3 days before due date'],
                  ['overdueAlert', 'Overdue Alerts', 'Notify admin when payment is overdue'],
                  ['monthlyReport', 'Monthly Collection Report', 'Email on 1st of each month'],
                  ['whatsapp', 'WhatsApp Notifications', 'Send receipts via WhatsApp'],
                ].map(([key, label, desc]) => (
                  <div key={key} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-felo-text">{label}</p>
                      <p className="text-xs text-felo-text3 mt-0.5">{desc}</p>
                    </div>
                    <Toggle value={notifs[key]} onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === 'Users & Roles' && (
            <Card>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-display text-base font-semibold">Users & Access Roles</h3>
                <button className="btn-primary text-xs py-2 px-4" onClick={() => openModal('user')}>+ Add User</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Last Login</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {systemUsers.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                              style={{
                                background: u.color === 'gold' ? 'rgba(201,168,76,.15)' : u.color === 'blue' ? 'rgba(91,156,246,.15)' : 'rgba(62,207,142,.15)',
                                color: u.color === 'gold' ? '#c9a84c' : u.color === 'blue' ? '#5b9cf6' : '#3ecf8e'
                              }}>
                              {u.initials}
                            </div>
                            <span className="text-sm font-medium text-felo-text">{u.name}</span>
                          </div>
                        </td>
                        <td className="text-xs">{u.email}</td>
                        <td>
                          <span className="text-xs px-2 py-0.5 rounded font-medium"
                            style={{ background: 'rgba(201,168,76,.1)', color: '#c9a84c' }}>
                            {u.role}
                          </span>
                        </td>
                        <td className="text-xs">{u.lastLogin}</td>
                        <td><span className="pill pill-active">Active</span></td>
                        <td><button className="btn-ghost text-xs py-1.5 px-3">Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {tab === 'Integrations' && (
            <Card>
              <div className="px-6 py-4 border-b border-border">
                <h3 className="font-display text-base font-semibold">Integrations</h3>
              </div>
              <div className="p-6 flex flex-col gap-4">
                {[
                  { name: 'Google Workspace', desc: 'Sync student data and send via Gmail', bg: '#1a73e8', emoji: '📧', connected: true },
                  { name: 'Razorpay', desc: 'Online fee collection gateway', bg: '#6772e5', emoji: '💳', connected: true },
                  { name: 'WhatsApp Business', desc: 'Send receipts and reminders', bg: '#4CAF50', emoji: '💬', connected: false },
                  { name: 'Tally ERP', desc: 'Sync accounting data', bg: '#e07c24', emoji: '📊', connected: false },
                ].map(s => (
                  <div key={s.name} className="flex items-center gap-4 p-4 bg-surface2 rounded-sm">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: s.bg }}>
                      {s.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-felo-text">{s.name}</p>
                      <p className="text-xs text-felo-text3">{s.desc}</p>
                    </div>
                    {s.connected
                      ? <span className="pill pill-active">Connected</span>
                      : <button className="btn-ghost text-xs py-1.5 px-3" onClick={() => toast(`Connecting to ${s.name}…`, 'success')}>Connect</button>
                    }
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === 'Security' && (
            <Card>
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="font-display text-base font-semibold">Security Settings</h3>
                <button className="btn-primary text-xs py-2 px-4" onClick={() => toast('Security settings saved!', 'success')}>Save</button>
              </div>
              <div className="px-6 py-4">
                {[
                  ['twoFa', 'Two-Factor Authentication', 'Require OTP on every login'],
                  ['sessionTimeout', 'Session Timeout', 'Auto-logout after 30 min inactivity'],
                  ['auditLog', 'Audit Log', 'Track all admin actions'],
                ].map(([key, label, desc]) => (
                  <div key={key} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-felo-text">{label}</p>
                      <p className="text-xs text-felo-text3 mt-0.5">{desc}</p>
                    </div>
                    <Toggle value={security[key]} onChange={v => setSecurity(s => ({ ...s, [key]: v }))} />
                  </div>
                ))}
                <div className="pt-4 mt-2 border-t border-border">
                  <p className="text-sm font-medium text-felo-text mb-4">Change Password</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Current Password"><Input type="password" placeholder="••••••••" /></Field>
                    <Field label="New Password"><Input type="password" placeholder="••••••••" /></Field>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
