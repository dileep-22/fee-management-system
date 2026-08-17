import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail, Phone, BookOpen, Calendar, User2 } from 'lucide-react'
import { studentApi, feeApi } from '../api'
import { PageLoader, EmptyState } from '../components/shared'
import { formatCurrency, formatDate, studentStatusBadge, statusBadgeClass } from '../utils'

function InfoItem({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  )
}

export default function StudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: student, isLoading: sLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentApi.getById(id),
  })

  const { data: feeRecords = [], isLoading: fLoading } = useQuery({
    queryKey: ['student-fees', id],
    queryFn: () => feeApi.getByStudent(id),
  })

  if (sLoading) return <PageLoader />
  if (!student) return <EmptyState title="Student not found" />

  const totalDue  = student.totalFeesDue  ?? 0
  const totalPaid = student.totalFeesPaid ?? 0
  const balance   = student.outstandingBalance ?? 0

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <button onClick={() => navigate(-1)} className="btn-ghost btn-sm mb-3 -ml-1">
          <ArrowLeft size={16} /> Back to Students
        </button>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {student.firstName?.[0]}{student.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="page-title">{student.fullName}</h1>
              <span className={studentStatusBadge(student.status)}>{student.status}</span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5 font-mono">{student.studentId} · {student.course}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="card space-y-4">
          <h3 className="section-title">Student Information</h3>
          <InfoItem icon={Mail}     label="Email"         value={student.email} />
          <InfoItem icon={Phone}    label="Phone"         value={student.phone} />
          <InfoItem icon={BookOpen} label="Course"        value={student.course} />
          <InfoItem icon={Calendar} label="Academic Year" value={student.academicYear} />
          <InfoItem icon={Calendar} label="Semester"      value={student.semester} />
          <InfoItem icon={Calendar} label="Date of Birth" value={formatDate(student.dateOfBirth)} />
          <InfoItem icon={User2}    label="Guardian"      value={student.guardianName} />
          <InfoItem icon={Phone}    label="Guardian Phone" value={student.guardianPhone} />
          {student.address && (
            <div className="pt-2 border-t border-surface-100">
              <p className="text-xs text-slate-400 mb-1">Address</p>
              <p className="text-sm text-slate-600">{student.address}</p>
            </div>
          )}
          <p className="text-xs text-slate-400 pt-2 border-t border-surface-100">
            Joined {formatDate(student.createdAt)}
          </p>
        </div>

        {/* Fee summary + records */}
        <div className="lg:col-span-2 space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totalDue)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Fees</p>
            </div>
            <div className="card text-center">
              <p className="text-xl font-bold text-success-700">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Paid</p>
            </div>
            <div className="card text-center">
              <p className={`text-xl font-bold ${balance > 0 ? 'text-danger-700' : 'text-success-700'}`}>
                {formatCurrency(balance)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Balance</p>
            </div>
          </div>

          {/* Fee records */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100">
              <h3 className="section-title mb-0">Fee Records ({feeRecords.length})</h3>
            </div>
            {fLoading ? <PageLoader /> : feeRecords.length === 0 ? (
              <EmptyState title="No fee records" message="No fees assigned to this student yet" />
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Receipt</th>
                      <th>Category</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Balance</th>
                      <th>Status</th>
                      <th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeRecords.map(r => (
                      <tr key={r.id}>
                        <td><span className="font-mono text-xs text-brand-700">{r.receiptNumber}</span></td>
                        <td className="text-slate-600 text-xs">{r.feeCategoryName}</td>
                        <td className="font-medium">{formatCurrency(r.totalAmount)}</td>
                        <td className="text-success-700">{formatCurrency(r.paidAmount)}</td>
                        <td className={r.balanceAmount > 0 ? 'text-danger-700 font-medium' : 'text-success-700'}>
                          {formatCurrency(r.balanceAmount)}
                        </td>
                        <td><span className={statusBadgeClass(r.paymentStatus)}>{r.paymentStatus}</span></td>
                        <td className="text-slate-500 text-xs">{formatDate(r.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
