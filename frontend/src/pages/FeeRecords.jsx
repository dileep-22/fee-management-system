import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import {
  Plus, Edit2, Trash2, CreditCard, Download, FileText,
  RefreshCw, Zap, CheckCircle, X, IndianRupee
} from 'lucide-react'
import { feeApi, categoryApi, studentApi } from '../api'
import {
  PageLoader, Modal, ConfirmDialog, EmptyState, Pagination,
  SearchInput, FormField, Spinner
} from '../components/shared'
import {
  formatCurrency, formatDate, statusBadgeClass,
  downloadBlob, FEE_STATUSES, PAYMENT_METHODS
} from '../utils'
import { useAuth } from '../context/AuthContext'
import { useRazorpay } from '../hooks/useRazorpay'
import toast from 'react-hot-toast'

const REC_DEFAULT = {
  studentId: '', feeCategoryId: '', totalAmount: '', paidAmount: '0',
  discountAmount: '0', fineAmount: '0', dueDate: '', academicYear: '',
  semester: '', paymentMethod: '', transactionId: '', remarks: '',
}
const PAY_DEFAULT = { amount: '', paymentMethod: 'CASH', transactionId: '', remarks: '' }

export default function FeeRecords() {
  const qc = useQueryClient()
  const { isAdmin, isStaff } = useAuth()
  const { openCheckout } = useRazorpay()

  const [params, setParams]       = useState({ page: 0, size: 10, sortBy: 'createdAt', sortDir: 'desc' })
  const [search, setSearch]       = useState('')
  const [statusF, setStatusF]     = useState('')
  const [yearF, setYearF]         = useState('')
  const [modal, setModal]         = useState(null)
  const [editId, setEditId]       = useState(null)
  const [payRecord, setPayRecord] = useState(null)
  const [deleteId, setDeleteId]   = useState(null)
  // Razorpay state
  const [gwRecord, setGwRecord]   = useState(null)   // record being paid via Razorpay
  const [gwLoading, setGwLoading] = useState(false)  // creating order
  const [gwSuccess, setGwSuccess] = useState(false)  // payment complete

  const {
    register: rr, handleSubmit: rhs, reset: rreset,
    setValue: rsv, formState: { errors: rerr },
  } = useForm({ defaultValues: REC_DEFAULT })

  const {
    register: pr, handleSubmit: phs, reset: preset,
    formState: { errors: perr },
  } = useForm({ defaultValues: PAY_DEFAULT })

  // ── Queries ──────────────────────────────────────────────────────────────────
  const qParams = {
    ...params,
    studentSearch: search  || undefined,
    status:        statusF || undefined,
    academicYear:  yearF   || undefined,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['fee-records', qParams],
    queryFn:  () => feeApi.getAll(qParams),
    placeholderData: (prev) => prev,
  })

  const { data: students   = [] } = useQuery({ queryKey: ['students-dropdown'],  queryFn: studentApi.getDropdown })
  const { data: categories = [] } = useQuery({ queryKey: ['categories-active'],  queryFn: categoryApi.getActive })

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const createMut = useMutation({
    mutationFn: feeApi.create,
    onSuccess: () => { toast.success('Fee record created'); qc.invalidateQueries({ queryKey: ['fee-records'] }); closeModal() },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => feeApi.update(id, data),
    onSuccess: () => { toast.success('Fee record updated'); qc.invalidateQueries({ queryKey: ['fee-records'] }); closeModal() },
  })
  const payMut = useMutation({
    mutationFn: ({ id, data }) => feeApi.makePayment(id, data),
    onSuccess: () => {
      toast.success('Payment recorded!')
      qc.invalidateQueries({ queryKey: ['fee-records'] })
      setPayRecord(null); preset(PAY_DEFAULT)
    },
  })
  const deleteMut = useMutation({
    mutationFn: feeApi.delete,
    onSuccess: () => { toast.success('Record deleted'); qc.invalidateQueries({ queryKey: ['fee-records'] }); setDeleteId(null) },
  })
  const verifyMut = useMutation({
    mutationFn: feeApi.verifyPayment,
    onSuccess: () => {
      toast.success('🎉 Payment verified and recorded!')
      qc.invalidateQueries({ queryKey: ['fee-records'] })
      setGwSuccess(true)
      setGwLoading(false)
    },
    onError: () => setGwLoading(false),
  })

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const openAdd  = () => { rreset(REC_DEFAULT); setModal('add') }
  const openEdit = (r) => {
    setEditId(r.id)
    rreset({
      studentId:      String(r.studentId      ?? ''),
      feeCategoryId:  String(r.feeCategoryId  ?? ''),
      totalAmount:    r.totalAmount            ?? '',
      paidAmount:     r.paidAmount             ?? '0',
      discountAmount: r.discountAmount         ?? '0',
      fineAmount:     r.fineAmount             ?? '0',
      dueDate:        r.dueDate               ?? '',
      academicYear:   r.academicYear          ?? '',
      semester:       r.semester              ?? '',
      paymentMethod:  r.paymentMethod         ?? '',
      transactionId:  r.transactionId         ?? '',
      remarks:        r.remarks               ?? '',
    })
    setModal('edit')
  }
  const closeModal = () => { setModal(null); setEditId(null) }

  const onRecordSubmit = (formData) => {
    const payload = {
      studentId:      formData.studentId     ? Number(formData.studentId)     : null,
      feeCategoryId:  formData.feeCategoryId ? Number(formData.feeCategoryId) : null,
      totalAmount:    formData.totalAmount   ? Number(formData.totalAmount)   : null,
      paidAmount:     formData.paidAmount    ? Number(formData.paidAmount)    : 0,
      discountAmount: formData.discountAmount ? Number(formData.discountAmount) : 0,
      fineAmount:     formData.fineAmount    ? Number(formData.fineAmount)    : 0,
      dueDate:        formData.dueDate       || null,
      academicYear:   formData.academicYear  || null,
      semester:       formData.semester      || null,
      paymentMethod:  formData.paymentMethod || null,
      transactionId:  formData.transactionId || null,
      remarks:        formData.remarks       || null,
    }
    if (modal === 'add') createMut.mutate(payload)
    else updateMut.mutate({ id: editId, data: payload })
  }

  const onPaySubmit = (formData) => {
    payMut.mutate({
      id: payRecord.id,
      data: {
        amount:        parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId || null,
        remarks:       formData.remarks       || null,
      },
    })
  }

  const handleCategoryChange = (e) => {
    const val = e.target.value
    rsv('feeCategoryId', val)
    const cat = categories.find((c) => String(c.id) === val)
    if (cat) rsv('totalAmount', String(cat.defaultAmount))
  }

  const downloadReceipt = (id) => {
    const token = localStorage.getItem('fm_token')
    fetch(`/api/v1/fee-records/${id}/receipt`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.blob() })
      .then((blob) => downloadBlob(blob, `receipt-${id}.pdf`))
      .catch(() => toast.error('Could not download receipt'))
  }

  const exportCsv = async () => {
    try {
      const r = await feeApi.exportCsv({ academicYear: yearF || undefined, status: statusF || undefined })
      downloadBlob(r.data, 'fee-records.csv')
      toast.success('CSV exported')
    } catch {}
  }

  // ── Real Razorpay flow ────────────────────────────────────────────────────────
  const startRazorpayPayment = async (record) => {
    setGwRecord(record)
    setGwSuccess(false)
    setGwLoading(true)

    let orderData
    try {
      // Step 1: create a real order on the Razorpay server via our backend
      orderData = await feeApi.createOrder({
        feeRecordId: record.id,
        amount:      record.balanceAmount,
        currency:    'INR',
        gateway:     'RAZORPAY',
      })
    } catch (err) {
      setGwLoading(false)
      setGwRecord(null)
      return
    }

    setGwLoading(false)

    // Step 2: open the real Razorpay checkout popup
    openCheckout({
      orderData,
      studentName: record.studentName,
      email:       '',   // fill if you store student email in the response
      phone:       '',
      onSuccess: (response) => {
        // Step 3: send razorpay_signature to backend for HMAC-SHA256 verification
        verifyMut.mutate({
          feeRecordId: record.id,
          orderId:     response.razorpay_order_id,
          paymentId:   response.razorpay_payment_id,
          signature:   response.razorpay_signature,
          amount:      record.balanceAmount,
          gateway:     'RAZORPAY',
        })
      },
      onFailure: () => {
        setGwRecord(null)
      },
    })
  }

  const closeGwModal = () => { setGwRecord(null); setGwSuccess(false); setGwLoading(false) }

  const pending = createMut.isPending || updateMut.isPending

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Records</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track payments, dues, and receipts</p>
        </div>
        <div className="flex gap-2">
          {isStaff && (
            <button onClick={exportCsv} className="btn-secondary btn-sm">
              <Download size={15} /> CSV
            </button>
          )}
          {isStaff && (
            <button onClick={openAdd} className="btn-primary">
              <Plus size={16} /> New Record
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <SearchInput value={search}
          onChange={(v) => { setSearch(v); setParams((p) => ({ ...p, page: 0 })) }}
          placeholder="Search student name or ID…" className="flex-1 min-w-48" />
        <select value={statusF}
          onChange={(e) => { setStatusF(e.target.value); setParams((p) => ({ ...p, page: 0 })) }}
          className="input w-36">
          <option value="">All Status</option>
          {FEE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input value={yearF}
          onChange={(e) => { setYearF(e.target.value); setParams((p) => ({ ...p, page: 0 })) }}
          placeholder="Academic Year" className="input w-36" />
        {(search || statusF || yearF) && (
          <button onClick={() => { setSearch(''); setStatusF(''); setYearF('') }}
            className="btn-ghost btn-sm text-slate-500">
            <RefreshCw size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrap">
        {isLoading ? <PageLoader /> : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Receipt</th><th>Student</th>
                  <th className="hidden md:table-cell">Category</th>
                  <th>Total</th><th>Paid</th><th>Balance</th><th>Status</th>
                  <th className="hidden lg:table-cell">Due Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.content ?? []).length === 0 ? (
                  <tr><td colSpan={9}>
                    <EmptyState title="No fee records found"
                      action={isStaff && (
                        <button onClick={openAdd} className="btn-primary btn-sm mt-2">
                          <Plus size={14} /> New Record
                        </button>
                      )} />
                  </td></tr>
                ) : (data?.content ?? []).map((r) => (
                  <tr key={r.id}>
                    <td><span className="font-mono text-xs text-brand-700">{r.receiptNumber}</span></td>
                    <td>
                      <p className="font-medium text-slate-800">{r.studentName}</p>
                      <p className="text-xs text-slate-400 font-mono">{r.studentCode}</p>
                    </td>
                    <td className="hidden md:table-cell text-slate-600 text-xs">{r.feeCategoryName}</td>
                    <td className="font-medium">{formatCurrency(r.totalAmount)}</td>
                    <td className="text-success-700">{formatCurrency(r.paidAmount)}</td>
                    <td className={Number(r.balanceAmount) > 0 ? 'text-danger-700 font-semibold' : 'text-success-700'}>
                      {formatCurrency(r.balanceAmount)}
                    </td>
                    <td><span className={statusBadgeClass(r.paymentStatus)}>{r.paymentStatus}</span></td>
                    <td className="hidden lg:table-cell text-slate-500 text-xs">{formatDate(r.dueDate)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => downloadReceipt(r.id)}
                          className="btn-ghost btn-sm p-1.5" title="Download Receipt">
                          <FileText size={14} className="text-slate-500" />
                        </button>
                        {isStaff && r.paymentStatus !== 'PAID' && r.paymentStatus !== 'WAIVED' && (
                          <>
                            <button onClick={() => { setPayRecord(r); preset(PAY_DEFAULT) }}
                              className="btn-ghost btn-sm p-1.5" title="Record cash payment">
                              <CreditCard size={14} className="text-success-600" />
                            </button>
                            {/* ✅ Real Razorpay button */}
                            <button onClick={() => startRazorpayPayment(r)}
                              className="btn-ghost btn-sm p-1.5" title="Pay via Razorpay">
                              <Zap size={14} className="text-brand-600" />
                            </button>
                          </>
                        )}
                        {isStaff && (
                          <button onClick={() => openEdit(r)} className="btn-ghost btn-sm p-1.5" title="Edit">
                            <Edit2 size={14} className="text-brand-600" />
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => setDeleteId(r.id)} className="btn-ghost btn-sm p-1.5" title="Delete">
                            <Trash2 size={14} className="text-danger-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination data={data} onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))} />
          </>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={closeModal}
        title={modal === 'add' ? 'New Fee Record' : 'Edit Fee Record'} size="lg"
        footer={<>
          <button onClick={closeModal} className="btn-secondary">Cancel</button>
          <button onClick={() => rhs(onRecordSubmit)()} disabled={pending} className="btn-primary gap-1">
            {pending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {modal === 'add' ? 'Create Record' : 'Save Changes'}
          </button>
        </>}>
        <form className="space-y-4" onSubmit={rhs(onRecordSubmit)}>
          <div className="form-grid">
            <FormField label="Student" required error={rerr.studentId?.message}>
              <select {...rr('studentId', { required: 'Student is required' })}
                className={`input ${rerr.studentId ? 'input-error' : ''}`}>
                <option value="">Select student…</option>
                {students.map((s) => (
                  <option key={s.id} value={String(s.id)}>{s.fullName} ({s.studentId})</option>
                ))}
              </select>
            </FormField>

            <FormField label="Fee Category" required error={rerr.feeCategoryId?.message}>
              <select {...rr('feeCategoryId', { required: 'Category is required' })}
                onChange={handleCategoryChange}
                className={`input ${rerr.feeCategoryId ? 'input-error' : ''}`}>
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name} — {formatCurrency(c.defaultAmount)}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Total Amount (₹)" required error={rerr.totalAmount?.message}>
              <input {...rr('totalAmount', { required: 'Required', min: { value: 0.01, message: 'Must be > 0' } })}
                type="number" step="0.01" min="0"
                className={`input ${rerr.totalAmount ? 'input-error' : ''}`} />
            </FormField>

            <FormField label="Paid Amount (₹)">
              <input {...rr('paidAmount')} type="number" step="0.01" min="0" className="input" />
            </FormField>

            <FormField label="Discount (₹)">
              <input {...rr('discountAmount')} type="number" step="0.01" min="0" className="input" />
            </FormField>

            <FormField label="Fine (₹)">
              <input {...rr('fineAmount')} type="number" step="0.01" min="0" className="input" />
            </FormField>

            <FormField label="Due Date">
              <input {...rr('dueDate')} type="date" className="input" />
            </FormField>

            <FormField label="Academic Year">
              <input {...rr('academicYear')} className="input" placeholder="e.g. 2024-2025" />
            </FormField>

            <FormField label="Semester">
              <input {...rr('semester')} className="input" placeholder="e.g. Sem 3" />
            </FormField>

            <FormField label="Payment Method">
              <select {...rr('paymentMethod')} className="input">
                <option value="">— Optional —</option>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Remarks">
            <textarea {...rr('remarks')} rows={2} className="input resize-none" />
          </FormField>
        </form>
      </Modal>

      {/* ── Cash / Manual Payment Modal ── */}
      <Modal open={!!payRecord} onClose={() => { setPayRecord(null); preset(PAY_DEFAULT) }}
        title="Record Payment" size="sm"
        footer={<>
          <button onClick={() => { setPayRecord(null); preset(PAY_DEFAULT) }} className="btn-secondary">Cancel</button>
          <button onClick={() => phs(onPaySubmit)()} disabled={payMut.isPending} className="btn-success gap-1">
            {payMut.isPending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Record Payment
          </button>
        </>}>
        {payRecord && (
          <div className="space-y-4">
            {/* Balance summary */}
            <div className="p-3 bg-surface-50 rounded-xl text-sm space-y-1.5 border border-surface-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Student</span>
                <span className="font-medium">{payRecord.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category</span>
                <span className="text-slate-600 text-xs">{payRecord.feeCategoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Fee</span>
                <span className="font-medium">{formatCurrency(payRecord.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Already Paid</span>
                <span className="text-success-700">{formatCurrency(payRecord.paidAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-surface-200 pt-1.5">
                <span className="font-semibold">Balance Due</span>
                <span className="font-bold text-danger-700">{formatCurrency(payRecord.balanceAmount)}</span>
              </div>
            </div>

            <FormField label="Payment Amount (₹)" required error={perr.amount?.message}>
              <input
                {...pr('amount', {
                  required: 'Amount is required',
                  min:  { value: 0.01, message: 'Must be greater than 0' },
                  max:  { value: Number(payRecord.balanceAmount), message: `Cannot exceed balance of ${formatCurrency(payRecord.balanceAmount)}` },
                })}
                type="number" step="0.01" min="0.01" max={Number(payRecord.balanceAmount)}
                className={`input ${perr.amount ? 'input-error' : ''}`} placeholder="0.00" />
            </FormField>

            <FormField label="Payment Method" required error={perr.paymentMethod?.message}>
              <select {...pr('paymentMethod', { required: 'Method is required' })}
                className={`input ${perr.paymentMethod ? 'input-error' : ''}`}>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormField>

            <FormField label="Transaction ID">
              <input {...pr('transactionId')} className="input" placeholder="Optional" />
            </FormField>

            <FormField label="Remarks">
              <textarea {...pr('remarks')} rows={2} className="input resize-none" />
            </FormField>
          </div>
        )}
      </Modal>

      {/* ── Razorpay Gateway Modal ─────────────────────────────────────────────── */}
      {/* This only shows a loading/success state.
          The actual checkout popup is rendered by Razorpay's SDK outside React. */}
      {(gwLoading || verifyMut.isPending || gwSuccess) && gwRecord && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-slide-up text-center">

            {!gwSuccess && (
              <>
                {/* Razorpay brand header */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                    <IndianRupee size={18} className="text-white" />
                  </div>
                  <span className="font-bold text-slate-800 text-lg">Razorpay</span>
                </div>

                <div className="p-3 bg-surface-50 rounded-xl text-sm space-y-1 border border-surface-100 mb-4 text-left">
                  <p className="font-semibold text-slate-700">{gwRecord.studentName}</p>
                  <p className="text-slate-500 text-xs">{gwRecord.feeCategoryName}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(gwRecord.balanceAmount)}</p>
                </div>

                {gwLoading && (
                  <div className="flex items-center justify-center gap-2 text-slate-500 py-3">
                    <Spinner size={18} />
                    <span className="text-sm">Creating secure payment order…</span>
                  </div>
                )}

                {verifyMut.isPending && (
                  <div className="flex items-center justify-center gap-2 text-slate-500 py-3">
                    <Spinner size={18} />
                    <span className="text-sm">Verifying payment…</span>
                  </div>
                )}

                {!gwLoading && !verifyMut.isPending && (
                  <p className="text-xs text-slate-400 py-2">
                    Razorpay checkout is opening… Complete the payment in the popup.
                  </p>
                )}

                <button onClick={closeGwModal} className="btn-ghost btn-sm text-slate-400 mt-2">
                  <X size={14} /> Cancel
                </button>
              </>
            )}

            {/* Success state */}
            {gwSuccess && (
              <>
                <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={36} className="text-success-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Payment Successful!</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Your payment has been verified and recorded via Razorpay.
                </p>
                <div className="bg-success-50 border border-success-200 rounded-xl p-3 text-xs text-success-700 text-left mb-4">
                  <p className="font-semibold mb-1">✓ Payment Details</p>
                  <p>Student: {gwRecord.studentName}</p>
                  <p>Amount: {formatCurrency(gwRecord.balanceAmount)}</p>
                  <p>Gateway: Razorpay</p>
                </div>
                <button onClick={closeGwModal} className="btn-primary w-full justify-center">
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)} loading={deleteMut.isPending}
        title="Delete Fee Record" danger
        message="Delete this fee record? This cannot be undone. Paid records cannot be deleted." />
    </div>
  )
}
