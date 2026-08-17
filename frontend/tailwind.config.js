/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand:   { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',900:'#1e3a8a' },
        success: { 50:'#f0fdf4',100:'#dcfce7',600:'#16a34a',700:'#15803d' },
        warning: { 50:'#fffbeb',100:'#fef3c7',600:'#d97706',700:'#b45309' },
        danger:  { 50:'#fef2f2',100:'#fee2e2',600:'#dc2626',700:'#b91c1c' },
        surface: { 50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1' },
      },
      boxShadow: {
        card:    '0 1px 3px 0 rgb(0 0 0/0.1), 0 1px 2px -1px rgb(0 0 0/0.1)',
        'card-lg':'0 4px 6px -1px rgb(0 0 0/0.1), 0 2px 4px -2px rgb(0 0 0/0.1)',
      },
      fontFamily: { sans: ['Inter','ui-sans-serif','system-ui','sans-serif'] },
    },
  },
  plugins: [],
}
