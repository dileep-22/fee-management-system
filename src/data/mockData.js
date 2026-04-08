// src/data/mockData.js — centralised mock data for all pages

export const students = [
  { id: 'ST-2094', name: 'Ananya Singh',  initials: 'AS', color: 'gold',   class: '10', section: 'A', phone: '9876543210', plan: 'Standard',    paid: 42000, balance: 0,     status: 'paid'        },
  { id: 'ST-1873', name: 'Vikas Kumar',   initials: 'VK', color: 'blue',   class: '9',  section: 'B', phone: '9812345678', plan: 'Transport+',  paid: 38500, balance: 0,     status: 'paid'        },
  { id: 'ST-2211', name: 'Meera Patel',   initials: 'MP', color: 'red',    class: '11', section: 'C', phone: '9756432198', plan: 'Hostel',      paid: 24000, balance: 18000, status: 'overdue'     },
  { id: 'ST-1560', name: 'Rohan Joshi',   initials: 'RJ', color: 'green',  class: '12', section: 'A', phone: '9998887776', plan: 'Standard',    paid: 28000, balance: 14500, status: 'pending'     },
  { id: 'ST-2005', name: 'Simran Tomar',  initials: 'ST', color: 'purple', class: '8',  section: 'B', phone: '9001122334', plan: 'Scholarship', paid: 18600, balance: 0,     status: 'scholarship' },
  { id: 'ST-1102', name: 'Neeraj Kapoor', initials: 'NK', color: 'orange', class: '7',  section: 'A', phone: '9122233445', plan: 'Standard',    paid: 32000, balance: 5000,  status: 'partial'     },
]

export const payments = [
  { id: 'RCP-0841', studentId: 'ST-2094', name: 'Ananya Singh',  initials: 'AS', color: 'gold',   feeType: 'Tuition · Q3',  date: '2026-03-08', dueDate: '2026-03-15', method: 'UPI',   amount: 14500, status: 'paid'    },
  { id: 'RCP-0840', studentId: 'ST-1873', name: 'Vikas Kumar',   initials: 'VK', color: 'blue',   feeType: 'Transport',     date: '2026-03-07', dueDate: '2026-03-10', method: 'Bank',  amount: 2800,  status: 'paid'    },
  { id: null,       studentId: 'ST-2211', name: 'Meera Patel',   initials: 'MP', color: 'red',    feeType: 'Hostel · Q3',   date: null,         dueDate: '2026-02-28', method: null,    amount: 18000, status: 'overdue' },
  { id: null,       studentId: 'ST-1560', name: 'Rohan Joshi',   initials: 'RJ', color: 'green',  feeType: 'Tuition · Q3',  date: null,         dueDate: '2026-03-15', method: null,    amount: 14500, status: 'pending' },
  { id: 'RCP-0839', studentId: 'ST-2005', name: 'Simran Tomar',  initials: 'ST', color: 'purple', feeType: 'Lab Fees',      date: '2026-03-03', dueDate: '2026-03-05', method: 'Cash',  amount: 3600,  status: 'paid'    },
  { id: 'RCP-0838', studentId: 'ST-1102', name: 'Neeraj Kapoor', initials: 'NK', color: 'orange', feeType: 'Tuition · Q3',  date: '2026-03-02', dueDate: '2026-03-15', method: 'Cash',  amount: 5000,  status: 'partial' },
]

export const feePlans = [
  { id: 1, name: 'Standard Plan',       classes: '6–10',          annual: 42000, quarterly: 10500, students: 680, status: 'active'      },
  { id: 2, name: 'Transport Plus',      classes: 'All',           annual: 52000, quarterly: 13000, students: 210, status: 'active'      },
  { id: 3, name: 'Hostel Plan',         classes: '9–12',          annual: 84000, quarterly: 21000, students: 180, status: 'active'      },
  { id: 4, name: 'Merit Scholarship',   classes: 'All',           annual: 28000, quarterly: 7000,  students: 74,  status: 'scholarship' },
  { id: 5, name: 'Day Scholar Premium', classes: '11–12',         annual: 56000, quarterly: 14000, students: 48,  status: 'active'      },
  { id: 6, name: 'Legacy Plan (2022)',  classes: 'Grandfathered', annual: 36000, quarterly: 9000,  students: 12,  status: 'inactive'    },
]

export const scholarships = [
  { id: 1, emoji: '🏅', name: 'Merit Excellence',   color: 'gold',   desc: 'Top 5% board performers. 100% tuition waiver for the year.',    beneficiaries: 24, disbursed: 280000, budget: 390000, status: 'active' },
  { id: 2, emoji: '🌱', name: 'Need-Based Aid',     color: 'green',  desc: '50–75% fee waiver for economically challenged families.',        beneficiaries: 30, disbursed: 340000, budget: 385000, status: 'active' },
  { id: 3, emoji: '⚽', name: 'Sports Excellence',  color: 'blue',   desc: '40% concession for state/national-level athletes.',             beneficiaries: 12, disbursed: 120000, budget: 267000, status: 'active' },
  { id: 4, emoji: '👨‍👩‍👧', name: 'Sibling Concession', color: 'purple', desc: '10–20% discount for siblings enrolled simultaneously.',       beneficiaries: 8,  disbursed: 120000, budget: 200000, status: 'active' },
]

export const scholarshipApplications = [
  { id: 1, name: 'Suresh Babu',  initials: 'SB', color: 'green', type: 'Need-Based Aid',  applied: '2026-03-02', docs: 'complete',   status: 'review' },
  { id: 2, name: 'Deepika Rao', initials: 'DP', color: 'gold',  type: 'Merit Excellence', applied: '2026-02-28', docs: 'incomplete', status: 'review' },
]

export const collectionTrend = [
  { month: 'Apr', collected: 520000, expected: 620000 },
  { month: 'May', collected: 380000, expected: 500000 },
  { month: 'Jun', collected: 610000, expected: 650000 },
  { month: 'Jul', collected: 890000, expected: 900000 },
  { month: 'Aug', collected: 420000, expected: 480000 },
  { month: 'Sep', collected: 730000, expected: 750000 },
  { month: 'Oct', collected: 680000, expected: 780000 },
  { month: 'Nov', collected: 950000, expected: 980000 },
  { month: 'Dec', collected: 420000, expected: 500000 },
  { month: 'Jan', collected: 810000, expected: 850000 },
  { month: 'Feb', collected: 640000, expected: 700000 },
  { month: 'Mar', collected: 480000, expected: 620000 },
]

export const paymentMethods = [
  { name: 'UPI',           value: 66, color: '#c9a84c' },
  { name: 'Bank Transfer', value: 33, color: '#5b9cf6' },
  { name: 'Cash',          value: 18, color: '#3ecf8e' },
]

export const classCollection = [
  { cls: 'Class 12', pct: 94, color: '#3ecf8e' },
  { cls: 'Class 11', pct: 88, color: '#5b9cf6' },
  { cls: 'Class 10', pct: 82, color: '#c9a84c' },
  { cls: 'Class 9',  pct: 76, color: '#fb923c' },
  { cls: 'Class 8',  pct: 71, color: '#a78bfa' },
]

export const systemUsers = [
  { id: 1, initials: 'AA', name: 'Admin Account', email: 'admin@greenfield.edu', role: 'Super Admin', lastLogin: 'Just now',  status: 'active', color: 'gold'   },
  { id: 2, initials: 'RG', name: 'Riya Gupta',    email: 'riya@greenfield.edu',  role: 'Accountant',  lastLogin: '07 Mar',    status: 'active', color: 'blue'   },
  { id: 3, initials: 'TM', name: 'Tarun Mathur',  email: 'tarun@greenfield.edu', role: 'Viewer',      lastLogin: '03 Mar',    status: 'active', color: 'green'  },
]

export const upcomingDues = [
  { name: 'Rahul Sharma', class: '10-A', id: 'ST-2094', amount: 8500,  dueDay: 10, urgency: 'high'   },
  { name: 'Priya Nair',   class: '9-B',  id: 'ST-1873', amount: 6200,  dueDay: 12, urgency: 'medium' },
  { name: 'Arjun Mehta',  class: '11-C', id: 'ST-2211', amount: 12000, dueDay: 15, urgency: 'medium' },
]

export const fmtCurrency = (n) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(1)}L`
    : `₹${n.toLocaleString('en-IN')}`
