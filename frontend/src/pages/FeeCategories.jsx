import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Tag } from 'lucide-react'
import { categoryApi } from '../api'
import {
  PageLoader, Modal, ConfirmDialog, EmptyState,
  FormField, Select
} from '../components/shared'
import { formatCurrency, formatDate, FEE_TYPES } from '../utils'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const DEFAULT = {
  name: '', description: '', defaultAmount: '', feeType: 'ONE_TIME',
  isActive: true, lateFeePercentage: '0', gracePeriodDays: '0', academicYear: '',
}

export default function FeeCategories() {
  const qc = useQueryClient()
  const { isAdmin, isStaff } = useAuth()
  const [modal, setModal]     = useState(null)
  const [editId, setEditId]   = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filterActive, setFilterActive] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: DEFAULT })

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', filterActive],
    queryFn: () => categoryApi.getAll({ isActive: filterActive !== '' ? filterActive === 'true' : undefined }),
  })

  const createMut = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => { toast.success('Category created'); qc.invalidateQueries(['categories']); closeModal() },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => categoryApi.update(id, data),
    onSuccess: () => { toast.success('Category updated'); qc.invalidateQueries(['categories']); closeModal() },
  })
  const deleteMut = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => { toast.success('Category deleted'); qc.invalidateQueries(['categories']); setDeleteId(null) },
  })
  const toggleMut = useMutation({
    mutationFn: categoryApi.toggle,
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries(['categories']) },
  })

  const openAdd  = () => { reset(DEFAULT); setModal('add') }
  const openEdit = (c) => {
    setEditId(c.id)
    reset({ ...c, defaultAmount: c.defaultAmount, lateFeePercentage: c.lateFeePercentage ?? '0', gracePeriodDays: c.gracePeriodDays ?? '0' })
    setModal('edit')
  }
  const closeModal = () => { setModal(null); setEditId(null); reset(DEFAULT) }

  const onSubmit = (data) => {
    const payload = {
      ...data,
      defaultAmount: parseFloat(data.defaultAmount),
      lateFeePercentage: parseFloat(data.lateFeePercentage || 0),
      gracePeriodDays: parseInt(data.gracePeriodDays || 0),
      isActive: data.isActive === 'true' || data.isActive === true,
    }
    if (modal === 'add') createMut.mutate(payload)
    else updateMut.mutate({ id: editId, data: payload })
  }

  const pending = createMut.isLoading || updateMut.isLoading

  const feeTypeBadge = (t) => ({
    ONE_TIME: 'badge-blue', MONTHLY: 'badge-green',
    SEMESTER: 'badge-yellow', ANNUAL: 'badge-gray',
  }[t] ?? 'badge-gray')

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Categories</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage fee types and amounts</p>
        </div>
        {isStaff && (
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Add Category
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="card p-4 flex gap-3">
        <Select value={filterActive} onChange={e => setFilterActive(e.target.value)} className="w-40">
          <option value="">All Status</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive</option>
        </Select>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.length === 0 ? (
            <div className="col-span-full">
              <EmptyState icon={Tag} title="No categories yet"
                message="Create fee categories like Tuition, Transport, etc."
                action={isStaff && <button onClick={openAdd} className="btn-primary btn-sm mt-2"><Plus size={14} />Add Category</button>}
              />
            </div>
          ) : categories.map(c => (
            <div key={c.id} className="card hover:shadow-card-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
                    <Tag size={16} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{c.name}</p>
                    <span className={feeTypeBadge(c.feeType)}>{c.feeType?.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isStaff && (
                    <button onClick={() => toggleMut.mutate(c.id)}
                      className="btn-ghost btn-sm p-1.5" title="Toggle active">
                      {c.isActive
                        ? <ToggleRight size={18} className="text-success-600" />
                        : <ToggleLeft size={18} className="text-slate-400" />}
                    </button>
                  )}
                  {isStaff && (
                    <button onClick={() => openEdit(c)} className="btn-ghost btn-sm p-1.5">
                      <Edit2 size={15} className="text-brand-600" />
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => setDeleteId(c.id)} className="btn-ghost btn-sm p-1.5">
                      <Trash2 size={15} className="text-danger-600" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Default Amount</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(c.defaultAmount)}</span>
                </div>
                {c.lateFeePercentage > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Late Fee</span>
                    <span className="text-warning-700">{c.lateFeePercentage}% /day</span>
                  </div>
                )}
                {c.gracePeriodDays > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Grace Period</span>
                    <span className="text-slate-600">{c.gracePeriodDays} days</span>
                  </div>
                )}
                {c.academicYear && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Academic Year</span>
                    <span className="text-slate-600">{c.academicYear}</span>
                  </div>
                )}
              </div>

              {!c.isActive && (
                <div className="mt-3 px-2 py-1 bg-surface-100 rounded text-xs text-slate-500 text-center">
                  Inactive
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={!!modal} onClose={closeModal}
        title={modal === 'add' ? 'New Fee Category' : 'Edit Category'} size="md"
        footer={<>
          <button onClick={closeModal} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit(onSubmit)} disabled={pending} className="btn-primary gap-1">
            {pending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {modal === 'add' ? 'Create' : 'Save'}
          </button>
        </>}
      >
        <form className="space-y-4">
          <FormField label="Category Name" required error={errors.name?.message}>
            <input {...register('name', { required: 'Required' })} className={`input ${errors.name ? 'input-error' : ''}`} placeholder="e.g. Tuition Fee" />
          </FormField>
          <div className="form-grid">
            <FormField label="Default Amount (₹)" required error={errors.defaultAmount?.message}>
              <input {...register('defaultAmount', { required: 'Required', min: { value: 0, message: 'Must be ≥ 0' } })}
                type="number" step="0.01" className={`input ${errors.defaultAmount ? 'input-error' : ''}`} />
            </FormField>
            <FormField label="Fee Type" required>
              <Select {...register('feeType')}>
                {FEE_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </Select>
            </FormField>
            <FormField label="Late Fee % (per day)">
              <input {...register('lateFeePercentage')} type="number" step="0.01" min="0" max="100" className="input" placeholder="0" />
            </FormField>
            <FormField label="Grace Period (days)">
              <input {...register('gracePeriodDays')} type="number" min="0" className="input" placeholder="0" />
            </FormField>
            <FormField label="Academic Year">
              <input {...register('academicYear')} className="input" placeholder="e.g. 2024-2025" />
            </FormField>
            <FormField label="Status">
              <Select {...register('isActive')}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </FormField>
          </div>
          <FormField label="Description">
            <textarea {...register('description')} rows={2} className="input resize-none" placeholder="Optional description…" />
          </FormField>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)} loading={deleteMut.isLoading}
        title="Delete Category" danger
        message="Delete this fee category? This will fail if fee records are attached to it." />
    </div>
  )
}
