import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Field, Input, Select, Textarea } from '@/components/ui'

function ModalShell({ title, subtitle, children, onClose, onSubmit, submitLabel = 'Save' }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <h2 className="font-display text-2xl font-semibold mb-1">{title}</h2>
        {subtitle && <p className="text-xs text-felo-text3 mb-6">{subtitle}</p>}
        {children}
        <div className="flex gap-2.5 justify-end mt-6 pt-5 border-t border-border">
          <button className="btn-ghost text-xs py-2 px-4" onClick={onClose}>Cancel</button>
          <button className="btn-primary text-xs py-2 px-5" onClick={onSubmit}>{submitLabel}</button>
        </div>
      </div>
    </div>
  )
}

export function PaymentModal({ onClose, data }) {
  const { toast, addPayment } = useApp()
  const [formData, setFormData] = useState({
    studentId: data?.student?.id || '',
    name: data?.student?.name || '',
    feeType: 'Tuition Fee',
    amount: data?.student?.balance || '',
    method: 'UPI',
    date: new Date().toISOString().split('T')[0],
    remarks: ''
  })

  const handleSubmit = () => {
    if (!formData.studentId || !formData.amount) {
      toast('Please fill all required fields', 'error')
      return
    }
    addPayment(formData)
    toast('Payment recorded successfully!', 'success')
    onClose()
  }

  return (
    <ModalShell title="Record Payment" subtitle="Enter payment details to generate a receipt." onClose={onClose}
      onSubmit={handleSubmit} submitLabel="Save & Generate Receipt">
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <Field label="Student ID"><Input value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} placeholder="e.g. ST-2094" /></Field>
        <Field label="Student Name"><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <Field label="Fee Type">
          <Select value={formData.feeType} onChange={e => setFormData({ ...formData, feeType: e.target.value })}>
            <option>Tuition Fee</option><option>Transport</option><option>Hostel</option><option>Lab / Activities</option><option>Exam Fee</option>
          </Select>
        </Field>
        <Field label="Amount (₹)"><Input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <Field label="Payment Method">
          <Select value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })}>
            <option>UPI</option><option>Bank Transfer</option><option>Cash</option><option>Cheque</option><option>Card</option>
          </Select>
        </Field>
        <Field label="Date"><Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></Field>
      </div>
      <Field label="Transaction ID / Remarks"><Input value={formData.remarks} onChange={e => setFormData({ ...formData, remarks: e.target.value })} placeholder="Optional reference number or note" /></Field>
    </ModalShell>
  )
}

export function StudentModal({ onClose }) {
  const { toast, addStudent } = useApp()
  const [formData, setFormData] = useState({
    firstName: '', lastName: '',
    class: 'Class 6', section: 'A',
    dob: '', gender: 'Male',
    parent: '', phone: '',
    plan: 'Standard Plan', admissionDate: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName) {
      toast('Student name is required', 'error')
      return
    }
    addStudent({
      name: `${formData.firstName} ${formData.lastName}`,
      class: formData.class,
      section: formData.section,
      phone: formData.phone || '—',
      plan: formData.plan
    })
    toast('Student registered!', 'success')
    onClose()
  }

  return (
    <ModalShell title="Add New Student" subtitle="Register a new student and assign a fee plan." onClose={onClose}
      onSubmit={handleSubmit} submitLabel="Register Student">
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <Field label="First Name"><Input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} placeholder="First name" /></Field>
        <Field label="Last Name"><Input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} placeholder="Last name" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <Field label="Class">
          <Select value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })}>
            <option>Class 6</option><option>Class 7</option><option>Class 8</option><option>Class 9</option><option>Class 10</option><option>Class 11</option><option>Class 12</option>
          </Select>
        </Field>
        <Field label="Section">
          <Select value={formData.section} onChange={e => setFormData({ ...formData, section: e.target.value })}>
            <option>A</option><option>B</option><option>C</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <Field label="Date of Birth"><Input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} /></Field>
        <Field label="Gender">
          <Select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
            <option>Male</option><option>Female</option><option>Other</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <Field label="Parent / Guardian"><Input value={formData.parent} onChange={e => setFormData({ ...formData, parent: e.target.value })} placeholder="Guardian name" /></Field>
        <Field label="Contact"><Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Mobile number" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Fee Plan">
          <Select value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })}>
            <option>Standard Plan</option><option>Transport Plus</option><option>Hostel Plan</option><option>Merit Scholarship</option>
          </Select>
        </Field>
        <Field label="Admission Date"><Input type="date" value={formData.admissionDate} onChange={e => setFormData({ ...formData, admissionDate: e.target.value })} /></Field>
      </div>
    </ModalShell>
  )
}

export function FeePlanModal({ onClose }) {
  const { toast } = useApp()
  return (
    <ModalShell title="Create Fee Plan" subtitle="Define components and payment schedule." onClose={onClose}
      onSubmit={() => { toast('Fee plan created!', 'success'); onClose(); }} submitLabel="Create Plan">
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <Field label="Plan Name"><Input placeholder="e.g. Standard Plan 2026" /></Field>
        <Field label="Applicable Classes"><Select><option>All Classes</option><option>Class 6–8</option><option>Class 9–10</option><option>Class 11–12</option></Select></Field>
      </div>
      <div className="bg-surface2 rounded-sm p-4 mb-3.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-felo-text3 mb-3">Fee Components</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Field label="Tuition"><Input type="number" placeholder="₹" /></Field>
          <Field label="Development Fund"><Input type="number" placeholder="₹" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Exam Fee"><Input type="number" placeholder="₹" /></Field>
          <Field label="Activity Fee"><Input type="number" placeholder="₹" /></Field>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Payment Schedule"><Select><option>Quarterly</option><option>Monthly</option><option>Half-Yearly</option><option>Annual</option></Select></Field>
        <Field label="Late Fee (%)"><Input type="number" defaultValue="2" /></Field>
      </div>
    </ModalShell>
  )
}

export function ScholarshipModal({ onClose }) {
  const { toast, createScholarship } = useApp()
  const [formData, setFormData] = useState({
    name: '', type: 'Merit-Based', discount: '', budget: '', students: ''
  })

  const handleSubmit = () => {
    if (!formData.name) return toast('Scholarship name is required', 'error')
    createScholarship({
      name: formData.name,
      type: formData.type,
      budget: Number(formData.budget) || 0,
      studentsLabel: `${formData.students} students`
    })
    toast('Scholarship program created!', 'success')
    onClose()
  }

  return (
    <ModalShell title="New Scholarship Program" subtitle="Create a new scholarship for eligible students." onClose={onClose}
      onSubmit={handleSubmit} submitLabel="Create Scholarship">
      <Field label="Scholarship Name" className="mb-3.5"><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Merit Excellence Award" /></Field>
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <Field label="Type">
          <Select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
            <option>Merit-Based</option><option>Need-Based</option><option>Sports</option><option>Special Category</option>
          </Select>
        </Field>
        <Field label="Discount (%)"><Input type="number" value={formData.discount} onChange={e => setFormData({ ...formData, discount: e.target.value })} placeholder="e.g. 50" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <Field label="Annual Budget (₹)"><Input type="number" value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} placeholder="Total budget" /></Field>
        <Field label="Max Beneficiaries"><Input type="number" value={formData.students} onChange={e => setFormData({ ...formData, students: e.target.value })} placeholder="No. of students" /></Field>
      </div>
      <Field label="Eligibility Criteria"><Textarea placeholder="Describe eligibility requirements…" /></Field>
    </ModalShell>
  )
}

export function ReceiptModal({ onClose, data }) {
  const { toast } = useApp()
  // Default to placeholder data if none is provided
  const payment = data?.payment || {
    id: 'RCP-0841',
    name: 'Ananya Singh',
    studentId: 'ST-2094',
    feeType: 'Tuition Fee · Q3',
    amount: 14500,
    method: 'UPI',
    date: '2026-03-08',
    remarks: 'UPI202503081234'
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <h2 className="font-display text-2xl font-semibold mb-1">Payment Receipt</h2>
        <p className="text-xs text-felo-text3 mb-6">Official fee receipt — {payment.id}</p>
        <div className="bg-surface2 border border-border rounded-card p-6">
          <div className="text-center mb-5 pb-4 border-b border-dashed border-border2">
            <p className="font-display text-xl gold-text">Felo</p>
            <p className="text-xs text-felo-text3 mt-0.5">Greenfield International School</p>
            <p className="font-mono text-xs text-felo-text3 mt-1">Receipt #{payment.id} · {new Date(payment.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
          {[
            ['Student Name', payment.name],
            ['Student ID', payment.studentId],
            ['Fee Type', payment.feeType],
            ['Method', payment.method],
            ['Transaction Ref', payment.remarks || '—']
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1.5 text-xs border-b border-border last:border-0">
              <span className="text-felo-text3">{k}</span>
              <span className="font-mono text-felo-text">{v}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 mt-2 border-t border-border2 text-sm font-bold" style={{ color: '#e8c96a' }}>
            <span>Amount Paid</span><span>₹{Number(payment.amount).toLocaleString('en-IN')}</span>
          </div>
          <div className="text-center mt-4">
            <span className="inline-block border-2 border-felo-green text-felo-green text-xs font-semibold px-4 py-1 rounded" style={{ transform: 'rotate(-3deg)', display: 'inline-block' }}>✓ PAID</span>
          </div>
        </div>
        <div className="flex gap-2.5 justify-end mt-5 pt-4 border-t border-border">
          <button className="btn-ghost text-xs py-2 px-4" onClick={onClose}>Close</button>
          <button className="btn-primary text-xs py-2 px-5" onClick={() => { toast('Printing receipt...', 'success'); onClose(); }}>🖨 Print</button>
        </div>
      </div>
    </div>
  )
}

export function UserModal({ onClose }) {
  const { toast, addUser } = useApp()
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'Viewer', phone: ''
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.email) return toast('Name and email are required', 'error')
    addUser(formData)
    toast('Invite sent!', 'success')
    onClose()
  }

  return (
    <ModalShell title="Add System User" subtitle="Grant access to a new admin or staff member." onClose={onClose}
      onSubmit={handleSubmit} submitLabel="Send Invite">
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        <Field label="Full Name"><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Name" /></Field>
        <Field label="Email"><Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="email@school.edu" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="Role">
          <Select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
            <option>Super Admin</option><option>Accountant</option><option>Viewer</option><option>Class Teacher</option>
          </Select>
        </Field>
        <Field label="Phone (optional)"><Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 …" /></Field>
      </div>
    </ModalShell>
  )
}

/* ── Modal manager ───────────────────────────────── */
export function ModalManager() {
  const { modal, closeModal } = useApp()
  if (!modal) return null
  const map = {
    payment: PaymentModal,
    student: StudentModal,
    'fee-plan': FeePlanModal,
    scholarship: ScholarshipModal,
    receipt: ReceiptModal,
    user: UserModal,
  }
  const Comp = map[modal.id]
  return Comp ? <Comp onClose={closeModal} data={modal.data} /> : null
}
