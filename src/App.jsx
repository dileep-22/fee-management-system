// src/App.jsx
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppProvider } from '@/context/AppContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { ModalManager } from '@/components/modals'
import { ToastContainer } from '@/components/ui/Toast'

import Dashboard from '@/components/pages/Dashboard'
import Students from '@/components/pages/Students'
import Payments from '@/components/pages/Payments'
import FeeStructure from '@/components/pages/FeeStructure'
import Scholarships from '@/components/pages/Scholarships'
import Analytics from '@/components/pages/Analytics'
import Statements from '@/components/pages/Statements'
import Settings from '@/components/pages/Settings'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } }
})

function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-60 flex-1 flex flex-col min-h-screen">
        <Topbar />
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
      <ModalManager />
      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/fee-structure" element={<FeeStructure />} />
              <Route path="/scholarships" element={<Scholarships />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/statements" element={<Statements />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </QueryClientProvider>
  )
}
