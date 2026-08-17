import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Plus, Edit2, Trash2, Eye, Download, RefreshCw } from 'lucide-react'
import { studentApi } from '../api'
import {
  PageLoader, Modal, ConfirmDialog, EmptyState, Pagination,
  SearchInput, FormField, Select
} from '../components/shared'
import { formatDate, studentStatusBadge, downloadBlob, STUDENT_STATUSES } from '../utils'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const DEFAULT_VALUES = {
  studentId:'', firstName:'', lastName:'', email:'', phone:'',
  course:'', semester:'', academicYear:'', status:'ACTIVE',
  address:'', guardianName:'', guardianPhone:'', dateOfBirth:'',
}

export default function Students() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { isAdmin, isStaff } = useAuth()

  const [params, setParams]   = useState({ page: 0, size: 10, sortBy: 'createdAt', sortDir: 'desc' })
  const [search, setSearch]   = useState('')
  const [statusF, setStatusF] = useState('')
  const [courseF, setCourseF] = useState('')
  const [modal, setModal]     = useState(null)   // null | 'add' | 'edit'
  const [editId, setEditId]   = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: DEFAULT_VALUES })

  const qParams = { ...params, search: search || undefined, status: statusF || undefined, course: courseF || undefined }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['students', qParams],
    queryFn: () => studentApi.getAll(qParams),
    keepPreviousData: true,
  })

  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: studentApi.getCourses })

  const createMut = useMutation({
    mutationFn: studentApi.create,
    onSuccess: () => { toast.success('Student created'); qc.invalidateQueries(['students']); closeModal() },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => studentApi.update(id, data),
    onSuccess: () => { toast.success('Student updated'); qc.invalidateQueries(['students']); closeModal() },
  })
  const deleteMut = useMutation({
    mutationFn: studentApi.delete,
    onSuccess: () => { toast.success('Student deleted'); qc.invalidateQueries(['students']); setDeleteId(null) },
  })

  const openAdd  = () => { reset(DEFAULT_VALUES); setModal('add') }
  const openEdit = async (s) => {
    setEditId(s.id)
    reset({ ...s, dateOfBirth: s.dateOfBirth ?? '' })
    setModal('edit')
  }
  const closeModal = () => { setModal(null); setEditId(null); reset(DEFAULT_VALUES) }

  const onSubmit = (data) => {
    const payload = { ...data, dateOfBirth: data.dateOfBirth || null }
    if (modal === 'add') createMut.mutate(payload)
    else updateMut.mutate({ id: editId, data: payload })
  }

  const exportCsv = async () => {
    try {
      const r = await studentApi.exportCsv()
      downloadBlob(r.data, 'students.csv')
    } catch {}
  }

  const pending = createMut.isLoading || updateMut.isLoading

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage student records</p>
        </div>
        <div className="flex gap-2">
          {isStaff && (
            <button onClick={exportCsv} className="btn-secondary btn-sm">
              <Download size={15} /> Export CSV
            </button>
          )}
          {isStaff && (
            <button onClick={openAdd} className="btn-primary">
              <Plus size={16} /> Add Student
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <SearchInput value={search} onChange={v => { setSearch(v); setParams(p => ({ ...p, page: 0 })) }}
          placeholder="Search name, ID, email…" className="flex-1 min-w-48" />
        <Select value={statusF} onChange={e => { setStatusF(e.target.value); setParams(p => ({ ...p, page: 0 })) }}
          className="w-36">
          <option value="">All Status</option>
          {STUDENT_STATUSES.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Select value={courseF} onChange={e => { setCourseF(e.target.value); setParams(p => ({ ...p, page: 0 })) }}
          className="w-44">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c}>{c}</option>)}
        </Select>
        {(search || statusF || courseF) && (
          <button onClick={() => { setSearch(''); setStatusF(''); setCourseF('') }}
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
                  <th>Student ID</th>
                  <th>Name</th>
                  <th className="hidden md:table-cell">Course</th>
                  <th className="hidden lg:table-cell">Academic Year</th>
                  <th className="hidden md:table-cell">Contact</th>
                  <th>Status</th>
                  <th className="hidden lg:table-cell">Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.content ?? []).length === 0 ? (
                  <tr><td colSpan={8}>
                    <EmptyState title="No students found"
                      message={search ? 'Try a different search term' : 'Add your first student'}
                      action={isStaff && <button onClick={openAdd} className="btn-primary btn-sm mt-2"><Plus size={14} />Add Student</button>}
                    />
                  </td></tr>
                ) : (data?.content ?? []).map(s => (
                  <tr key={s.id}>
                    <td><span className="font-mono text-xs font-medium text-brand-700">{s.studentId}</span></td>
                    <td>
                      <div>
                        <p className="font-medium text-slate-800">{s.fullName}</p>
                        <p className="text-xs text-slate-400 md:hidden">{s.course}</p>
                      </div>
                    </td>
                    <td className="hidden md:table-cell text-slate-600">{s.course}</td>
                    <td className="hidden lg:table-cell text-slate-500 text-xs">{s.academicYear || '—'}</td>
                    <td className="hidden md:table-cell">
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <p>{s.email}</p>
                        <p>{s.phone || '—'}</p>
                      </div>
                    </td>
                    <td>
                      <span className={studentStatusBadge(s.status)}>{s.status}</span>
                    </td>
                    <td className="hidden lg:table-cell text-slate-500 text-xs">{formatDate(s.createdAt)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/students/${s.id}`)}
                          className="btn-ghost btn-sm p-1.5" title="View">
                          <Eye size={15} className="text-slate-500" />
                        </button>
                        {isStaff && (
                          <button onClick={() => openEdit(s)}
                            className="btn-ghost btn-sm p-1.5" title="Edit">
                            <Edit2 size={15} className="text-brand-600" />
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => setDeleteId(s.id)}
                            className="btn-ghost btn-sm p-1.5" title="Delete">
                            <Trash2 size={15} className="text-danger-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination data={data} onPageChange={page => setParams(p => ({ ...p, page }))} />
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modal === 'add' || modal === 'edit'}
        onClose={closeModal}
        title={modal === 'add' ? 'Add New Student' : 'Edit Student'}
        size="lg"
        footer={<>
          <button onClick={closeModal} className="btn-secondary">Cancel</button>
          <button onClick={handleSubmit(onSubmit)} disabled={pending} className="btn-primary gap-1">
            {pending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {modal === 'add' ? 'Create Student' : 'Save Changes'}
          </button>
        </>}
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <FormField label="Student ID" required error={errors.studentId?.message}>
              <input {...register('studentId', { required: 'Required' })} className={`input ${errors.studentId ? 'input-error' : ''}`} placeholder="e.g. STU001" />
            </FormField>
            <FormField label="Course" required error={errors.course?.message}>
              <input {...register('course', { required: 'Required' })} className={`input ${errors.course ? 'input-error' : ''}`} placeholder="e.g. B.Tech CSE" />
            </FormField>
            <FormField label="First Name" required error={errors.firstName?.message}>
              <input {...register('firstName', { required: 'Required' })} className={`input ${errors.firstName ? 'input-error' : ''}`} />
            </FormField>
            <FormField label="Last Name" required error={errors.lastName?.message}>
              <input {...register('lastName', { required: 'Required' })} className={`input ${errors.lastName ? 'input-error' : ''}`} />
            </FormField>
            <FormField label="Email" required error={errors.email?.message}>
              <input {...register('email', { required: 'Required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
                type="email" className={`input ${errors.email ? 'input-error' : ''}`} />
            </FormField>
            <FormField label="Phone">
              <input {...register('phone')} className="input" placeholder="+91 ..." />
            </FormField>
            <FormField label="Semester">
              <input {...register('semester')} className="input" placeholder="e.g. Sem 3" />
            </FormField>
            <FormField label="Academic Year">
              <input {...register('academicYear')} className="input" placeholder="e.g. 2024-2025" />
            </FormField>
            <FormField label="Date of Birth">
              <input {...register('dateOfBirth')} type="date" className="input" />
            </FormField>
            <FormField label="Status">
              <Select {...register('status')}>
                {STUDENT_STATUSES.map(s => <option key={s}>{s}</option>)}
              </Select>
            </FormField>
            <FormField label="Guardian Name">
              <input {...register('guardianName')} className="input" />
            </FormField>
            <FormField label="Guardian Phone">
              <input {...register('guardianPhone')} className="input" />
            </FormField>
          </div>
          <FormField label="Address">
            <textarea {...register('address')} rows={2} className="input resize-none" />
          </FormField>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMut.mutate(deleteId)}
        loading={deleteMut.isLoading}
        title="Delete Student" danger
        message="This will permanently delete the student and all associated fee records. This action cannot be undone."
      />
    </div>
  )
}
