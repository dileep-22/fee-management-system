// src/components/ui/Toast.jsx
import { useApp } from '@/context/AppContext'
import { clsx } from 'clsx'

export function ToastContainer() {
  const { toasts } = useApp()
  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={clsx(
            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl animate-fade-up pointer-events-auto',
            t.type === 'success' ? 'bg-felo-green/15 border border-felo-green/30 text-felo-green' :
            t.type === 'error'   ? 'bg-felo-red/15 border border-felo-red/30 text-felo-red' :
                                   'bg-surface border border-border text-felo-text2'
          )}
        >
          {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          {t.message}
        </div>
      ))}
    </div>
  )
}
