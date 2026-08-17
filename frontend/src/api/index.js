import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401; show error toasts
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('fm_refresh')
        if (refresh) {
          const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken: refresh })
          localStorage.setItem('fm_token',   data.data.accessToken)
          localStorage.setItem('fm_refresh', data.data.refreshToken)
          original.headers.Authorization = `Bearer ${data.data.accessToken}`
          return api(original)
        }
      } catch {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(err)
      }
    }
    if (err.response?.status === 403) {
      toast.error('Access denied: insufficient permissions')
    } else if (err.response?.status !== 401) {
      const msg = err.response?.data?.message || 'Something went wrong'
      toast.error(msg)
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (data) => api.post('/auth/login',           data).then(r => r.data.data),
  signup:         (data) => api.post('/auth/signup',          data).then(r => r.data.data),
  register:       (data) => api.post('/auth/register',        data).then(r => r.data.data),
  refresh:        (data) => api.post('/auth/refresh',         data).then(r => r.data.data),
  changePassword: (data) => api.post('/auth/change-password', data).then(r => r.data),
  me:             ()     => api.get('/auth/me').then(r => r.data.data),
}

// ── Students ──────────────────────────────────────────────────────────────────
export const studentApi = {
  getAll:    (params) => api.get('/students',             { params }).then(r => r.data.data),
  getDropdown: ()     => api.get('/students/dropdown').then(r => r.data.data),
  getById:   (id)     => api.get(`/students/${id}`).then(r => r.data.data),
  getByCode: (code)   => api.get(`/students/code/${code}`).then(r => r.data.data),
  getCourses: ()      => api.get('/students/courses').then(r => r.data.data),
  getAcYears: ()      => api.get('/students/academic-years').then(r => r.data.data),
  create:    (data)   => api.post('/students',            data).then(r => r.data.data),
  update:    (id, d)  => api.put(`/students/${id}`,       d   ).then(r => r.data.data),
  delete:    (id)     => api.delete(`/students/${id}`).then(r => r.data),
  exportCsv: ()       => api.get('/students/export/csv',  { responseType: 'blob' }),
}

// ── Fee Categories ────────────────────────────────────────────────────────────
export const categoryApi = {
  getAll:    (params) => api.get('/fee-categories',          { params }).then(r => r.data.data),
  getActive: ()       => api.get('/fee-categories/active').then(r => r.data.data),
  getById:   (id)     => api.get(`/fee-categories/${id}`).then(r => r.data.data),
  create:    (data)   => api.post('/fee-categories',         data).then(r => r.data.data),
  update:    (id, d)  => api.put(`/fee-categories/${id}`,    d   ).then(r => r.data.data),
  toggle:    (id)     => api.patch(`/fee-categories/${id}/toggle`).then(r => r.data),
  delete:    (id)     => api.delete(`/fee-categories/${id}`).then(r => r.data),
}

// ── Fee Records ───────────────────────────────────────────────────────────────
export const feeApi = {
  getAll:        (params) => api.get('/fee-records',                  { params }).then(r => r.data.data),
  getById:       (id)     => api.get(`/fee-records/${id}`).then(r => r.data.data),
  getByStudent:  (sid)    => api.get(`/fee-records/student/${sid}`).then(r => r.data.data),
  getDashboard:  (params) => api.get('/fee-records/dashboard',        { params }).then(r => r.data.data),
  getDueSoon:    (days)   => api.get('/fee-records/due-soon',         { params: { days } }).then(r => r.data.data),
  create:        (data)   => api.post('/fee-records',                 data).then(r => r.data.data),
  update:        (id, d)  => api.put(`/fee-records/${id}`,            d   ).then(r => r.data.data),
  makePayment:   (id, d)  => api.post(`/fee-records/${id}/payment`,   d   ).then(r => r.data.data),
  delete:        (id)     => api.delete(`/fee-records/${id}`).then(r => r.data),
  getReceiptUrl: (id)     => `/api/v1/fee-records/${id}/receipt`,
  exportCsv:     (params) => api.get('/fee-records/export/csv',       { params, responseType: 'blob' }),
  createOrder:   (data)   => api.post('/fee-records/gateway/create-order', data).then(r => r.data.data),
  verifyPayment: (data)   => api.post('/fee-records/gateway/verify',  data).then(r => r.data.data),
  markOverdue:   ()       => api.post('/fee-records/mark-overdue').then(r => r.data),
}

export default api
