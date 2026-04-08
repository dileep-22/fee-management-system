# Felo FMS — React

A fully restructured React version of the Felo Fee Management System.

## Tech Stack

| Layer          | Library                  |
|----------------|--------------------------|
| Framework      | React 18 + Vite          |
| Routing        | React Router v6          |
| Styling        | Tailwind CSS v3          |
| State          | React Context + useState |
| Server State   | TanStack Query v5        |
| Charts         | Recharts                 |
| Forms          | React Hook Form + Zod    |
| Icons          | Lucide React             |

## Project Structure

```
src/
├── main.jsx                    ← Entry point
├── App.jsx                     ← Router, providers, layout
├── index.css                   ← Tailwind + global styles
│
├── context/
│   └── AppContext.jsx          ← Toast, modal state
│
├── data/
│   └── mockData.js             ← All sample data (replace with API)
│
├── components/
│   ├── ui/
│   │   ├── index.jsx           ← Avatar, Pill, StatCard, Card, Chips…
│   │   └── Toast.jsx           ← Toast notification system
│   │
│   ├── layout/
│   │   ├── Sidebar.jsx         ← Navigation sidebar
│   │   └── Topbar.jsx          ← Top bar with context-aware action
│   │
│   ├── modals/
│   │   └── index.jsx           ← All modal dialogs + ModalManager
│   │
│   └── pages/
│       ├── Dashboard.jsx
│       ├── Students.jsx
│       ├── Payments.jsx
│       ├── FeeStructure.jsx
│       ├── Scholarships.jsx
│       ├── Analytics.jsx
│       ├── Statements.jsx
│       └── Settings.jsx
```

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Key Improvements over vanilla HTML version

- ✅ Real URL-based routing (browser back/forward works)
- ✅ Component-based architecture — no duplicate HTML
- ✅ Centralised modal state via Context
- ✅ Toast notification system
- ✅ Search & filter with live state
- ✅ Toggle switches with real state
- ✅ Recharts for interactive, data-driven charts
- ✅ TanStack Query ready for API integration
- ✅ Tailwind CSS — no inline styles
- ✅ Empty states and loading skeleton components included

## Connecting to a Real API

Replace mock data in `src/data/mockData.js` with TanStack Query hooks:

```js
// Example
import { useQuery } from '@tanstack/react-query'

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => fetch('/api/students').then(r => r.json()),
  })
}
```
