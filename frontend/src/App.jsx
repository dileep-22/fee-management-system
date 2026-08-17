import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import StudentDetail from './pages/StudentDetail'
import FeeRecords from './pages/FeeRecords'
import FeeCategories from './pages/FeeCategories'
import Reports from './pages/Reports'

function RootRedirect() {
  const { user } = useAuth()
  return <Navigate to={user ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Login />} />  {/* /signup opens Login with signup tab */}
        <Route path="/"       element={<RootRedirect />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/students"       element={<Students />} />
          <Route path="/students/:id"   element={<StudentDetail />} />
          <Route path="/fee-records"    element={<FeeRecords />} />
          <Route path="/fee-categories" element={<FeeCategories />} />
          <Route path="/reports"        element={<Reports />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
