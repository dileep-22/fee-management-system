import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Receipt, Eye, EyeOff, Lock, User, Mail, UserPlus, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/shared'

export default function Login() {
  const { login, signup, loading } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/dashboard'
  const [tab, setTab]         = useState('login')   // 'login' | 'signup'
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const loginForm  = useForm()
  const signupForm = useForm()

  const onLogin = async (data) => {
    try { await login(data); navigate(from, { replace: true }) } catch {}
  }

  const onSignup = async (data) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', { message: 'Passwords do not match' })
      return
    }
    try {
      await signup({ username: data.username, email: data.email, password: data.password, fullName: data.fullName })
      navigate('/dashboard', { replace: true })
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">

          {/* Logo header */}
          <div className="flex flex-col items-center pt-8 pb-5 px-8 bg-gradient-to-b from-brand-50 to-white">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-3 shadow-lg shadow-brand-200">
              <Receipt size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">FeeManage Pro</h1>
            <p className="text-sm text-slate-500 mt-1">School Fee Management System</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-surface-200 mx-0">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
                tab === 'login'
                  ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
                tab === 'signup'
                  ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserPlus size={15} /> Create Account
            </button>
          </div>

          <div className="px-8 py-6">

            {/* ── LOGIN TAB ── */}
            {tab === 'login' && (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="label">Username</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...loginForm.register('username', { required: 'Username is required' })}
                      type="text"
                      autoComplete="username"
                      placeholder="Enter your username"
                      className={`input pl-9 ${loginForm.formState.errors.username ? 'input-error' : ''}`}
                    />
                  </div>
                  {loginForm.formState.errors.username && (
                    <p className="text-xs text-danger-600 mt-1">{loginForm.formState.errors.username.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...loginForm.register('password', { required: 'Password is required' })}
                      type={showPwd ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={`input pl-9 pr-10 ${loginForm.formState.errors.password ? 'input-error' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-danger-600 mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-2.5"
                >
                  {loading ? <Spinner size={16} className="text-white" /> : (
                    <><LogIn size={16} /> Sign In</>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setTab('signup')} className="text-brand-600 font-semibold hover:underline">
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* ── SIGNUP TAB ── */}
            {tab === 'signup' && (
              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...signupForm.register('fullName', { required: 'Full name is required' })}
                      type="text"
                      autoComplete="name"
                      placeholder="Your full name"
                      className={`input pl-9 ${signupForm.formState.errors.fullName ? 'input-error' : ''}`}
                    />
                  </div>
                  {signupForm.formState.errors.fullName && (
                    <p className="text-xs text-danger-600 mt-1">{signupForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="label">Username</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...signupForm.register('username', {
                        required: 'Username is required',
                        minLength: { value: 3, message: 'At least 3 characters' },
                        maxLength: { value: 50, message: 'At most 50 characters' },
                        pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers and _ only' },
                      })}
                      type="text"
                      autoComplete="username"
                      placeholder="Choose a username"
                      className={`input pl-9 ${signupForm.formState.errors.username ? 'input-error' : ''}`}
                    />
                  </div>
                  {signupForm.formState.errors.username && (
                    <p className="text-xs text-danger-600 mt-1">{signupForm.formState.errors.username.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...signupForm.register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                      })}
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={`input pl-9 ${signupForm.formState.errors.email ? 'input-error' : ''}`}
                    />
                  </div>
                  {signupForm.formState.errors.email && (
                    <p className="text-xs text-danger-600 mt-1">{signupForm.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...signupForm.register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'At least 6 characters' },
                      })}
                      type={showPwd ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Choose a password"
                      className={`input pl-9 pr-10 ${signupForm.formState.errors.password ? 'input-error' : ''}`}
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-xs text-danger-600 mt-1">{signupForm.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...signupForm.register('confirmPassword', { required: 'Please confirm your password' })}
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repeat password"
                      className={`input pl-9 pr-10 ${signupForm.formState.errors.confirmPassword ? 'input-error' : ''}`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-danger-600 mt-1">{signupForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Role note */}
                <p className="text-xs text-slate-400 bg-surface-50 rounded-lg p-2.5 border border-surface-200">
                  ℹ️ New accounts are created with <strong>Staff</strong> role. Contact your admin to get elevated access.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-2.5"
                >
                  {loading ? <Spinner size={16} className="text-white" /> : (
                    <><UserPlus size={16} /> Create Account</>
                  )}
                </button>

                <p className="text-center text-xs text-slate-500">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setTab('login')} className="text-brand-600 font-semibold hover:underline">
                    Sign in
                  </button>
                </p>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
