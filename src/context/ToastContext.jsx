import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

export const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [messages, setMessages] = useState([])

  const removeToast = useCallback((id) => {
    setMessages((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback(
    ({ message, type = 'info', duration = 3500 }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      setMessages((prev) => [...prev, { id, message, type }])
      window.setTimeout(() => removeToast(id), duration)
    },
    [removeToast],
  )

  const value = useMemo(() => ({ messages, notify, removeToast }), [messages, notify, removeToast])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function ToastStack() {
  const context = useContext(ToastContext)
  if (!context) return null
  const { messages, removeToast } = context

  const variants = {
    success: {
      wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-900 shadow-card',
      icon: CheckCircle2,
      iconClass: 'text-emerald-600',
      dot: 'bg-emerald-600',
    },
    error: {
      wrapper: 'border-red-200 bg-red-50 text-red-900 shadow-card',
      icon: XCircle,
      iconClass: 'text-red-600',
      dot: 'bg-red-600',
    },
    info: {
      wrapper: 'border-secondary-200 bg-secondary-50 text-secondary-900 shadow-card',
      icon: Info,
      iconClass: 'text-primary-600',
      dot: 'bg-primary-600',
    },
  }

  if (!messages.length) return null

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-3 w-96">
      {messages.map((toast) => {
        const v = variants[toast.type] ?? variants.info
        const Icon = v.icon
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3.5 text-sm font-medium animate-slide-up ${v.wrapper}`}
          >
            <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${v.iconClass}`} />
            <p className="flex-1 leading-relaxed">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-1 rounded-md p-0.5 text-current opacity-50 transition hover:opacity-75"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function useToastContext() {
  return useContext(ToastContext)
}
