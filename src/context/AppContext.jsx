// src/context/AppContext.jsx
import { createContext, useContext, useState, useCallback } from 'react'
import {
  students as initStudents,
  payments as initPayments,
  feePlans as initFeePlans,
  scholarships as initScholarships,
  scholarshipApplications as initApplications,
  systemUsers as initUsers,
  collectionTrend as initCollectionTrend, // We'll keep trend static for now or calculate it later
  paymentMethods,
  classCollection,
  upcomingDues as initUpcomingDues
} from '@/data/mockData'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [modal, setModal] = useState(null)   // { id, data }

  const [students, setStudents] = useState(initStudents)
  const [payments, setPayments] = useState(initPayments)
  const [feePlans, setFeePlans] = useState(initFeePlans)
  const [scholarships, setScholarships] = useState(initScholarships)
  const [applications, setApplications] = useState(initApplications)
  const [systemUsers, setSystemUsers] = useState(initUsers)
  const [upcomingDues, setUpcomingDues] = useState(initUpcomingDues)

  const toast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])

  // CRUD Actions
  const addPayment = useCallback((paymentData) => {
    // Generate a receipt ID
    const rcpId = `RCP-0${Math.floor(Math.random() * 1000) + 800}`

    const newPayment = {
      ...paymentData,
      id: rcpId,
      status: 'paid', // newly recorded payments are always paid
      date: new Date().toISOString().split('T')[0],
      dueDate: paymentData.date // fallback
    }

    setPayments(prev => [newPayment, ...prev])

    // Update student balance
    setStudents(prev => prev.map(s => {
      if (s.id === newPayment.studentId || (newPayment.id && s.id === newPayment.id)) {
        const newBalance = Math.max(0, s.balance - Number(newPayment.amount))
        return {
          ...s,
          paid: s.paid + Number(newPayment.amount),
          balance: newBalance,
          status: newBalance <= 0 ? (s.plan.includes('Scholarship') ? 'scholarship' : 'paid') : (newBalance < s.balance ? 'partial' : s.status)
        }
      }
      return s
    }))
  }, [])

  const addStudent = useCallback((studentData) => {
    const stId = `ST-${Math.floor(Math.random() * 1000) + 2000}`
    const initials = studentData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

    // Random color
    const colors = ['gold', 'blue', 'red', 'green', 'purple', 'orange']
    const color = colors[Math.floor(Math.random() * colors.length)]

    const newStudent = {
      ...studentData,
      id: stId,
      initials,
      color,
      paid: 0,
      balance: 10000, // mock initial balance based on plan
      status: 'pending' // starts as pending
    }
    setStudents(prev => [newStudent, ...prev])
  }, [])

  const createFeePlan = useCallback((planData) => {
    setFeePlans(prev => [
      ...prev,
      { ...planData, id: Date.now(), students: 0, status: 'active' }
    ])
  }, [])

  const createScholarship = useCallback((scholData) => {
    setScholarships(prev => [
      ...prev,
      { ...scholData, id: Date.now(), beneficiaries: 0, disbursed: 0, status: 'active', emoji: '🌟', color: 'purple' }
    ])
  }, [])

  const addUser = useCallback((userData) => {
    const initials = userData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    const colors = ['gold', 'blue', 'green', 'purple']
    const color = colors[Math.floor(Math.random() * colors.length)]

    setSystemUsers(prev => [
      ...prev,
      { ...userData, id: Date.now(), initials, color, lastLogin: 'Never', status: 'active' }
    ])
  }, [])

  const updateApplicationStatus = useCallback((appId, status) => {
    setApplications(prev => prev.map(a =>
      a.id === appId ? { ...a, status } : a
    ))
  }, [])

  const openModal = useCallback((id, data = {}) => setModal({ id, data }), [])
  const closeModal = useCallback(() => setModal(null), [])

  return (
    <AppContext.Provider value={{
      toast, toasts, modal, openModal, closeModal,

      // State
      students, payments, feePlans, scholarships, applications, systemUsers, upcomingDues,

      // Actions
      addPayment, addStudent, createFeePlan, createScholarship, addUser, updateApplicationStatus
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
