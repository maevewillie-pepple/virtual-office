import React, { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react'

export interface ToastData {
  id: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  duration?: number
}

interface ToastProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}

const ICON = {
  success: <CheckCircle size={14} strokeWidth={1.75} />,
  info:    <Info size={14} strokeWidth={1.75} />,
  warning: <AlertTriangle size={14} strokeWidth={1.75} />,
  error:   <XCircle size={14} strokeWidth={1.75} />,
}

const STYLES = {
  success: 'bg-surface border-border text-success',
  info:    'bg-surface border-border text-ink-2',
  warning: 'bg-surface border-border text-warning',
  error:   'bg-surface border-border text-error',
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  const latest = toasts[toasts.length - 1]
  if (!latest) return null
  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
      <Toast key={latest.id} toast={latest} onDismiss={onDismiss} />
    </div>
  )
}

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const fadeAt = Math.max(0, (toast.duration ?? 3000) - 200)
    const timer = window.setTimeout(() => setVisible(false), fadeAt)
    return () => window.clearTimeout(timer)
  }, [toast.id, toast.duration])

  return (
    <div
      className={`
        pointer-events-auto pl-3 pr-2 py-2 rounded-lg border text-[13px]
        flex items-center gap-2 shadow-md
        transition-all duration-200
        ${STYLES[toast.type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'}
      `}
    >
      <span className="flex-shrink-0">{ICON[toast.type]}</span>
      <span className="text-ink leading-none">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-1 text-ink-3 hover:text-ink transition-colors"
        aria-label="Dismiss"
      >
        <X size={12} strokeWidth={1.75} />
      </button>
    </div>
  )
}

let toastCounter = 0
export function createToast(
  message: string,
  type: ToastData['type'] = 'info',
  duration?: number
): ToastData {
  return { id: `toast_${++toastCounter}`, message, type, duration }
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const timers = useRef<Record<string, number>>({})

  const dismiss = useCallback((id: string) => {
    const timer = timers.current[id]
    if (timer) {
      window.clearTimeout(timer)
      delete timers.current[id]
    }
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastData['type'] = 'info', duration = 3000) => {
    const toast = createToast(message, type, duration)
    setToasts(prev => {
      for (const existing of prev) {
        const timer = timers.current[existing.id]
        if (timer) window.clearTimeout(timer)
        delete timers.current[existing.id]
      }
      return [toast]
    })
    timers.current[toast.id] = window.setTimeout(() => dismiss(toast.id), duration)
  }, [dismiss])

  return { toasts, addToast, dismiss }
}
