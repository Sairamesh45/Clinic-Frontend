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
      wrapper: 'border-green-100 bg-white text-green-900 shadow-green-100/50',
      icon: CheckCircle2,
      iconClass: 'text-green-500',
      dot: 'bg-green-500',
    },
    error: {
      wrapper: 'border-red-100 bg-white text-red-900 shadow-red-100/50',
      icon: XCircle,
      iconClass: 'text-red-500',
      dot: 'bg-red-500',
    },
    info: {
      wrapper: 'border-slate-200 bg-white text-slate-900 shadow-slate-100/50',
      icon: Info,
      iconClass: 'text-primary',
      dot: 'bg-primary',
    },
  }

  if (!messages.length) return null

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2 w-80">
      {messages.map((toast) => {
        const v = variants[toast.type] ?? variants.info
        const Icon = v.icon
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm shadow-lg ${v.wrapper}`}
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${v.iconClass}`} />
            <p className="flex-1 leading-relaxed">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-1 rounded-lg p-0.5 text-current opacity-40 transition hover:opacity-70"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
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
